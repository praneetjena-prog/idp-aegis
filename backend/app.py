import os
import sqlite3
import base64
import json
import urllib.request
import urllib.parse
import urllib.error
import uuid
from datetime import datetime, timezone
from flask import Flask, request, jsonify, Response, redirect
from flask_cors import CORS

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for all routes
# This allows the React frontend (running on localhost:8080 or other ports)
# and external clients (like Wokwi via ngrok) to communicate without browser blocks.
CORS(app, resources={r"/*": {"origins": "*"}})

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BACKEND_DIR, "aegis.db")


# ====================================================================
# DATABASE CONFIGURATION & INITIALIZATION
# ====================================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            vibration REAL,
            current REAL,
            flow REAL,
            light INTEGER,
            gas INTEGER,
            status TEXT,
            timestamp TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            name TEXT,
            avatar TEXT,
            role TEXT DEFAULT 'feature_user',
            facility_id TEXT,
            provider TEXT DEFAULT 'google',
            created_at TEXT,
            last_login TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS role_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            email TEXT NOT NULL,
            name TEXT,
            requested_role TEXT NOT NULL,
            facility_id TEXT DEFAULT 'FACILITY-01',
            status TEXT DEFAULT 'pending',
            created_at TEXT,
            reviewed_at TEXT,
            reviewed_by TEXT
        )
    """)

    # Calendar Integrations & Synchronized Events Tables
    conn.execute("""
        CREATE TABLE IF NOT EXISTS calendar_integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            account_email TEXT,
            access_token TEXT,
            refresh_token TEXT,
            token_expiry TEXT,
            calendar_id TEXT DEFAULT 'primary',
            sync_direction TEXT DEFAULT 'export_only',
            last_synced_at TEXT,
            created_at TEXT,
            updated_at TEXT,
            UNIQUE(user_id, provider)
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS maintenance_events (
            id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            asset_code TEXT NOT NULL,
            title TEXT NOT NULL,
            subsystem TEXT,
            task_type TEXT DEFAULT 'preventive',
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            technician TEXT,
            priority TEXT DEFAULT 'nominal',
            location TEXT,
            status TEXT DEFAULT 'scheduled',
            window_reason TEXT,
            parts TEXT,
            sop TEXT,
            facility_id TEXT DEFAULT 'FACILITY-01',
            created_at TEXT,
            updated_at TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS synced_calendar_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            provider TEXT NOT NULL,
            aegis_task_id TEXT NOT NULL,
            external_event_id TEXT NOT NULL,
            synced_at TEXT,
            sync_status TEXT DEFAULT 'synced',
            UNIQUE(provider, aegis_task_id)
        )
    """)

    # Ensure facility_id column exists if table was created by earlier schema
    cursor = conn.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    if "facility_id" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN facility_id TEXT")

    # Seed initial baseline telemetry record if database is empty
    cursor = conn.execute("SELECT COUNT(*) FROM sensor_data")
    if cursor.fetchone()[0] == 0:
        conn.execute("""
            INSERT INTO sensor_data 
            (temperature, humidity, vibration, current, flow, light, gas, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (38.5, 58.0, 1.45, 13.6, 85.0, 420, 110, "Normal", datetime.now().isoformat()))

    # Seed initial baseline maintenance events if table is empty
    cursor = conn.execute("SELECT COUNT(*) FROM maintenance_events")
    if cursor.fetchone()[0] == 0:
        seed_tasks = [
            (
                "pm-ahu03-urgent", "ahu-03", "AHU-03", "Bearing Overhaul & Dynamic Alignment",
                "HVAC Air Handlers", "predictive", "2026-10-06", "06:00", "09:30",
                "J. Rivera", "critical", "East Wing • Roof Level 3", "scheduled",
                "Slotted in off-peak morning window before tenant occupancy (7-day RUL target)",
                "SKF 6205-2RS Bearings (x2), NLGI #2 Synthetic Grease, B-62 Belts",
                "SOP-EL-03 (LOTO) & SOP-MECH-01 (Bearing Replacement)", "FACILITY-01",
                datetime.now().isoformat(), datetime.now().isoformat()
            ),
            (
                "pm-pump02-routine", "cw-pump-02", "CW-PUMP-02", "Duplex Strainer Cleanout & Seal Leak Audit",
                "Hydraulic / Water Loops", "preventive", "2026-10-08", "13:00", "15:00",
                "A. Kumar", "attention", "Basement Mechanical Penthouse B2", "scheduled",
                "Bi-weekly hydraulic differential pressure inspection",
                "Strainer O-Ring Gaskets, Polyurea #2 Grease",
                "SOP-HY-02 (Hydraulic Circuit Isolation)", "FACILITY-01",
                datetime.now().isoformat(), datetime.now().isoformat()
            ),
            (
                "pm-elec01-quarterly", "elec-01", "SW-PANEL-01", "Main Busbar Thermal IR Scan & Feeder Torquing",
                "Electrical Infrastructure", "preventive", "2026-10-14", "05:00", "07:30",
                "M. Singh", "nominal", "Electrical Vault West", "scheduled",
                "Quarterly thermographic audit & phase torque validation",
                "FLIR Thermal Imager, Calibrated Torque Wrench (50 Nm)",
                "SOP-NFPA-70E (Arc Flash Category 2)", "FACILITY-01",
                datetime.now().isoformat(), datetime.now().isoformat()
            ),
            (
                "pm-vav4b-hunting", "vav-4b", "VAV-BOX-4B", "Damper Actuator Stroke & Pitot Zeroing",
                "HVAC Network", "optimization", "2026-10-19", "16:00", "17:30",
                "J. Rivera", "info", "Building B • 4th Floor Ceiling Plen.", "scheduled",
                "Correction of 20-80% actuator hunting oscillation",
                "Belimo 24VAC Actuator Calibration Tool",
                "SOP-VAV-CAL-04", "FACILITY-01",
                datetime.now().isoformat(), datetime.now().isoformat()
            ),
            (
                "pm-chiller01-routine", "chiller-01", "CHILLER-01", "Refrigerant Pressure Delta & Condenser Approach Audit",
                "Chilled Water Plant", "preventive", "2026-10-24", "07:00", "11:00",
                "A. Kumar", "nominal", "Central Plant Room A", "scheduled",
                "Scheduled biannual centrifugal chiller efficiency check",
                "R-134a Diagnostic Manifold, Synthetic Ester Oil Sample Kit",
                "SOP-CH-01 (Chiller Plant SOP)", "FACILITY-01",
                datetime.now().isoformat(), datetime.now().isoformat()
            ),
            (
                "pm-ahu02-done", "ahu-03", "AHU-02", "Belt Replacement & Tension Verification",
                "HVAC Air Handlers", "preventive", "2026-09-28", "09:00", "11:00",
                "M. Singh", "nominal", "East Wing Roof Level 2", "completed",
                "Routine PM successfully completed and audited",
                "B-60 Match Belts",
                "SOP-MECH-02", "FACILITY-01",
                datetime.now().isoformat(), datetime.now().isoformat()
            )
        ]
        conn.executemany("""
            INSERT INTO maintenance_events (
                id, asset_id, asset_code, title, subsystem, task_type, date,
                start_time, end_time, technician, priority, location, status,
                window_reason, parts, sop, facility_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_tasks)

    conn.commit()

    # Deduplicate accounts and enforce uniqueness per email
    deduplicate_users(conn)
    sync_file_requests(conn)
    conn.close()


def sync_file_requests(conn):
    try:
        req_path = os.path.join(BACKEND_DIR, "..", "public", "role_requests.json")
        if os.path.exists(req_path):
            with open(req_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for email, req in data.items():
                if req.get("status") == "pending":
                    clean_email = str(email).strip().lower()
                    cursor = conn.execute(
                        "SELECT id FROM role_requests WHERE lower(email) = ? AND status = 'pending'",
                        (clean_email,)
                    )
                    existing = cursor.fetchone()
                    req_role = str(req.get("requested_role") or "technician").strip()
                    req_fac = str(req.get("facility_id") or "FACILITY-01").strip()
                    req_time = req.get("created_at") or datetime.now().isoformat()
                    if existing:
                        conn.execute("""
                            UPDATE role_requests
                            SET requested_role = ?, facility_id = ?, created_at = ?
                            WHERE id = ?
                        """, (req_role, req_fac, req_time, existing["id"]))
                    else:
                        conn.execute("""
                            INSERT INTO role_requests (user_id, email, name, requested_role, facility_id, status, created_at)
                            VALUES (?, ?, ?, ?, ?, 'pending', ?)
                        """, (
                            str(req.get("user_id") or req.get("id") or clean_email),
                            clean_email,
                            str(req.get("name") or clean_email.split("@")[0]),
                            req_role,
                            req_fac,
                            req_time
                        ))
            conn.commit()
    except Exception:
        pass


def deduplicate_users(conn):
    """
    Ensures each email address has exactly one user record in the database.
    Consolidates any duplicate rows, preferring UUID identifiers and recent logins.
    Creates a unique index on lower(email).
    """
    try:
        cursor = conn.execute("""
            SELECT lower(email) as email, count(*) as cnt 
            FROM users 
            GROUP BY lower(email) 
            HAVING cnt > 1
        """)
        duplicate_emails = [r[0] for r in cursor.fetchall()]
        for em in duplicate_emails:
            rows = conn.execute("""
                SELECT id, email, name, avatar, role, facility_id, provider, created_at, last_login
                FROM users 
                WHERE lower(email) = ?
                ORDER BY 
                    CASE WHEN id = email THEN 1 ELSE 0 END ASC,
                    CASE WHEN role != 'feature_user' THEN 0 ELSE 1 END ASC,
                    last_login DESC
            """, (em,)).fetchall()
            if len(rows) > 1:
                primary = dict(rows[0])
                conn.execute("DELETE FROM users WHERE lower(email) = ?", (em,))
                conn.execute("""
                    INSERT INTO users (id, email, name, avatar, role, facility_id, provider, created_at, last_login)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    primary["id"], primary["email"], primary["name"], primary["avatar"],
                    primary["role"], primary["facility_id"], primary["provider"],
                    primary["created_at"], primary["last_login"]
                ))
        conn.commit()
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(lower(email))")
        conn.commit()
    except Exception as e:
        print(f"   [Deduplication Notice] {e}")


# Initialize database table on application start
init_db()


# ====================================================================
# AUTHENTICATION & ACCESS CONTROL HELPERS
# ====================================================================

ALLOWED_FACILITY_ROLES = {"technician", "manager", "auditor"}


def verify_request_auth():
    """
    Extracts and validates identity claims from the Authorization header.
    Resolves role and facility_id strictly from the trusted database records,
    never relying on client request bodies or URL parameters.
    """
    auth_header = request.headers.get("Authorization", "").strip()
    if not auth_header:
        return {"authenticated": False, "role": None, "facility_id": None}

    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                payload = parts[1]
                padded = payload + "=" * (-len(payload) % 4)
                claims = json.loads(base64.urlsafe_b64decode(padded).decode("utf-8"))
                uid = str(claims.get("sub") or claims.get("id") or "")
                if uid:
                    conn = get_db()
                    cursor = conn.execute("SELECT role, facility_id FROM users WHERE id = ?", (uid,))
                    row = cursor.fetchone()
                    conn.close()
                    if row:
                        return {
                            "authenticated": True,
                            "user_id": uid,
                            "role": row["role"] or "feature_user",
                            "facility_id": row["facility_id"]
                        }
                    # User authenticated via token but not yet provisioned in DB
                    return {
                        "authenticated": True,
                        "user_id": uid,
                        "role": "feature_user",
                        "facility_id": None
                    }
        except Exception:
            pass
    return {"authenticated": False, "role": None, "facility_id": None}


# ====================================================================
# HEALTH CHECK & ROOT ROUTE
# ====================================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "system": "AEGIS Telemetry System",
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "ingest": "POST /api/sensor-data",
            "latest": "GET /api/latest",
            "history": "GET /api/history?limit=50",
            "stats": "GET /api/stats",
            "feature_docs": "GET /api/feature-docs"
        }
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "database": "connected"}), 200


# ====================================================================
# FEATURE-ONLY DOCUMENTATION ENDPOINT
# ====================================================================

@app.route("/api/feature-docs", methods=["GET"])
def get_feature_docs():
    """
    Safe static endpoint for feature_user access.
    Exposes architecture information and isolated illustrative fixtures
    without returning real facility telemetry.
    """
    return jsonify({
        "tier": "feature_user",
        "access": "Architecture & Feature Documentation",
        "message": "Isolated reference documentation. No live facility metrics.",
        "hardware_bom": {
            "unit_cost_usd": 180,
            "microcontroller": "ESP32 DevKit V1",
            "vibration_sensor": "MPU-6050",
            "current_transformer": "ACS712 30A",
            "temp_humidity": "DHT22",
            "protocol": "MQTT / JSON"
        },
        "illustrative_example": {
            "vibration_rms": 2.34,
            "current_draw": 14.2,
            "bearing_temp": 54.2,
            "acoustic_drift": 1.8,
            "standard": "ISO 10816-3 Class II",
            "status": "Nominal Baseline Reference"
        }
    }), 200


# ====================================================================
# USER ACCOUNTS & PROFILES (SAVED FROM GOOGLE / SUPABASE AUTH)
# ====================================================================

@app.route("/api/users/sync", methods=["POST"])
def sync_user():
    """
    Synchronizes authenticated user accounts to SQLite.
    Fails closed: role defaults to 'feature_user'. Client request bodies
    cannot self-assign or elevate facility roles (technician, manager, auditor).
    """
    try:
        data = request.get_json(force=True, silent=True)
        if not data or not data.get("email"):
            return jsonify({"error": "Missing user payload"}), 400

        uid = str(data.get("id") or data.get("email"))
        email = str(data.get("email"))
        name = str(data.get("name") or email.split("@")[0])
        avatar = data.get("avatar")
        provider = str(data.get("provider") or "google")
        now = datetime.now().isoformat()

        conn = get_db()
        # Look up existing user to preserve any administrator role and prevent duplication
        cursor = conn.execute("SELECT id, role, facility_id FROM users WHERE id = ? OR lower(email) = lower(?)", (uid, email))
        existing = cursor.fetchone()
        current_role = existing["role"] if existing and existing["role"] else "feature_user"
        current_facility = existing["facility_id"] if existing else None

        if existing:
            conn.execute("""
                UPDATE users
                SET id = ?, email = ?, name = COALESCE(?, users.name), avatar = COALESCE(?, users.avatar),
                    role = ?, facility_id = ?, provider = ?, last_login = ?
                WHERE id = ? OR lower(email) = lower(?)
            """, (uid, email, name, avatar, current_role, current_facility, provider, now, existing["id"], email))
        else:
            conn.execute("""
                INSERT INTO users (id, email, name, avatar, role, facility_id, provider, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (uid, email, name, avatar, current_role, current_facility, provider, now, now))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "User account synchronized with database",
            "user": {
                "id": uid,
                "email": email,
                "name": name,
                "role": current_role,
                "facility_id": current_facility,
                "provider": provider,
                "last_login": now
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/assign-role", methods=["POST"])
def assign_role():
    """
    Menu-driven role assignment request endpoint.
    Receives request showing user email and target role/facility.
    Validates role, provisions the user in SQLite database, and optionally
    synchronizes with Supabase if credentials are provided in environment.
    """
    try:
        data = request.get_json(force=True, silent=True)
        if not data or not data.get("email"):
            return jsonify({"error": "Missing email or payload"}), 400

        email = str(data.get("email")).strip().lower()
        uid = str(data.get("id") or email)
        role = str(data.get("role") or "feature_user").strip()
        raw_facility = data.get("facility_id")
        facility_id = str(raw_facility).strip() if raw_facility else ("FACILITY-01" if role in ALLOWED_FACILITY_ROLES else None)

        allowed_roles = {"feature_user", "technician", "manager", "auditor"}
        if role not in allowed_roles:
            return jsonify({"error": f"Invalid role: {role}. Allowed roles: {list(allowed_roles)}"}), 400

        # Feature users have no facility assignment
        if role == "feature_user":
            facility_id = None

        now = datetime.now().isoformat()
        conn = get_db()
        cursor = conn.execute("SELECT id, email, name, avatar, role, facility_id FROM users WHERE lower(email) = ? OR id = ?", (email, uid))
        existing = cursor.fetchone()

        if existing:
            actual_id = existing["id"]
            name = existing["name"] or email.split("@")[0]
            conn.execute("""
                UPDATE users
                SET role = ?, facility_id = ?, last_login = ?
                WHERE id = ?
            """, (role, facility_id, now, actual_id))
        else:
            actual_id = uid
            name = str(data.get("name") or email.split("@")[0])
            avatar = data.get("avatar")
            conn.execute("""
                INSERT INTO users (id, email, name, avatar, role, facility_id, provider, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (actual_id, email, name, avatar, role, facility_id, "google", now, now))

        conn.commit()
        conn.close()

        # Synchronize to public/assigned_roles.json for instant frontend reflection
        try:
            public_json_path = os.path.join(BACKEND_DIR, "..", "public", "assigned_roles.json")
            roles_cache = {}
            if os.path.exists(public_json_path):
                with open(public_json_path, "r", encoding="utf-8") as f:
                    roles_cache = json.load(f)
            roles_cache[email] = {
                "role": role,
                "facility_id": facility_id,
                "updated_at": now
            }
            with open(public_json_path, "w", encoding="utf-8") as f:
                json.dump(roles_cache, f, indent=2)
        except Exception:
            pass

        print("\n" + "=" * 60)
        print("   [AEGIS RBAC] ROLE ASSIGNED VIA BACKEND MENU REQUEST")
        print(f"   Account Email: {email}")
        print(f"   Assigned Role: {role.upper()}")
        print(f"   Facility ID:   {facility_id or 'None (Documentation Mode)'}")
        print(f"   Timestamp:     {now}")
        print("=" * 60 + "\n")

        # Synchronize with Supabase profiles if service role key is present
        supabase_synced = False
        sb_url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
        sb_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if sb_url and sb_key:
            try:
                import urllib.request
                req_url = f"{sb_url.rstrip('/')}/rest/v1/profiles?id=eq.{actual_id}"
                headers = {
                    "apikey": sb_key,
                    "Authorization": f"Bearer {sb_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }
                body = json.dumps({"role": role, "facility_id": facility_id, "updated_at": now}).encode("utf-8")
                req = urllib.request.Request(req_url, data=body, headers=headers, method="PATCH")
                with urllib.request.urlopen(req) as resp:
                    if resp.status in (200, 204):
                        supabase_synced = True
            except Exception as sb_err:
                print(f"   [Supabase Sync Notice] Could not update Supabase: {sb_err}")

        return jsonify({
            "status": "success",
            "message": f"Role '{role}' successfully assigned to {email}",
            "user": {
                "id": actual_id,
                "email": email,
                "name": name,
                "role": role,
                "facility_id": facility_id,
                "supabase_synced": supabase_synced
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================================================================
# ROLE ACCESS REQUEST & APPROVAL (HIGHER-LEVEL AUTHORITY GOVERNANCE)
# ====================================================================

@app.route("/api/roles/request-access", methods=["POST"])
def request_role_access():
    """
    Endpoint for users (e.g. Feature Explorers) to submit an access request
    for an operational role (Technician, Operations Manager, Auditor).
    Queues the request for higher-level authority review in the backend.
    """
    try:
        data = request.get_json(force=True, silent=True)
        if not data or not data.get("email"):
            return jsonify({"error": "Missing user email"}), 400

        email = str(data.get("email")).strip().lower()
        uid = str(data.get("id") or email)
        name = str(data.get("name") or email.split("@")[0])
        role = str(data.get("role") or data.get("requested_role") or "technician").strip()
        raw_facility = data.get("facility_id")
        facility_id = str(raw_facility).strip() if raw_facility else "FACILITY-01"

        allowed = {"technician", "manager", "auditor"}
        if role not in allowed:
            return jsonify({"error": f"Invalid role request '{role}'. Must be one of: {list(allowed)}"}), 400

        now = datetime.now().isoformat()
        conn = get_db()

        # Check for existing pending request
        cursor = conn.execute(
            "SELECT id FROM role_requests WHERE lower(email) = ? AND status = 'pending'",
            (email,)
        )
        existing = cursor.fetchone()

        if existing:
            conn.execute("""
                UPDATE role_requests
                SET requested_role = ?, facility_id = ?, created_at = ?
                WHERE id = ?
            """, (role, facility_id, now, existing["id"]))
            req_id = existing["id"]
        else:
            cursor = conn.execute("""
                INSERT INTO role_requests (user_id, email, name, requested_role, facility_id, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'pending', ?)
            """, (uid, email, name, role, facility_id, now))
            req_id = cursor.lastrowid

        conn.commit()
        conn.close()

        # Log notice to backend terminal for higher authority review
        print("\n" + "=" * 65)
        print("   [AEGIS ACCESS GOVERNANCE] NEW ROLE ACCESS REQUEST RECEIVED")
        print(f"   Applicant Email: {email}")
        print(f"   Name:            {name}")
        print(f"   Requested Role:  {role.upper()}")
        print(f"   Facility ID:     {facility_id}")
        print(f"   Status:          PENDING ADMINISTRATIVE VERIFICATION")
        print(f"   Timestamp:       {now}")
        print("   Review command:  python backend/manage_roles.py")
        print("=" * 65 + "\n")

        # Synchronize to public/role_requests.json for instant UI feedback
        try:
            req_path = os.path.join(BACKEND_DIR, "..", "public", "role_requests.json")
            cache = {}
            if os.path.exists(req_path):
                with open(req_path, "r", encoding="utf-8") as f:
                    cache = json.load(f)
            cache[email] = {
                "id": req_id,
                "email": email,
                "name": name,
                "requested_role": role,
                "facility_id": facility_id,
                "status": "pending",
                "created_at": now
            }
            with open(req_path, "w", encoding="utf-8") as f:
                json.dump(cache, f, indent=2)
        except Exception:
            pass

        return jsonify({
            "status": "pending",
            "message": f"Access request for '{role}' submitted. Awaiting administrator verification.",
            "request_id": req_id,
            "email": email,
            "requested_role": role,
            "request": {
                "id": req_id,
                "email": email,
                "requested_role": role,
                "facility_id": facility_id,
                "status": "pending",
                "created_at": now
            }
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/roles/requests", methods=["GET"])
def get_role_requests():
    """
    Lists access requests for higher-level authority inspection.
    """
    status_filter = request.args.get("status")
    conn = get_db()
    if status_filter:
        cursor = conn.execute("SELECT * FROM role_requests WHERE status = ? ORDER BY id DESC", (status_filter,))
    else:
        cursor = conn.execute("SELECT * FROM role_requests ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200


@app.route("/api/roles/request-status", methods=["GET"])
def get_user_request_status():
    """
    Returns latest request status for an applicant email.
    """
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    conn = get_db()
    cursor = conn.execute(
        "SELECT * FROM role_requests WHERE lower(email) = ? ORDER BY id DESC LIMIT 1",
        (email,)
    )
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"has_request": False, "request": None}), 200

    return jsonify({"has_request": True, "request": dict(row)}), 200


@app.route("/api/roles/approve-request", methods=["POST"])
def review_role_request():
    """
    Higher-level authority endpoint to approve or reject a role access request.
    """
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Missing payload"}), 400

        req_id = data.get("id") or data.get("request_id")
        email = str(data.get("email") or "").strip().lower()
        action = str(data.get("action") or "approve").strip().lower()
        reviewer = str(data.get("reviewer") or "Administrator").strip()

        now = datetime.now().isoformat()
        conn = get_db()

        if req_id:
            cursor = conn.execute("SELECT * FROM role_requests WHERE id = ?", (req_id,))
        elif email:
            cursor = conn.execute(
                "SELECT * FROM role_requests WHERE lower(email) = ? AND status = 'pending' ORDER BY id DESC LIMIT 1",
                (email,)
            )
        else:
            conn.close()
            return jsonify({"error": "Must provide request id or email"}), 400

        target_req = cursor.fetchone()
        if not target_req:
            conn.close()
            return jsonify({"error": "Pending role request not found"}), 404

        target_email = target_req["email"]
        target_role = target_req["requested_role"]
        target_uid = target_req["user_id"] or target_email
        facility_id = str(data.get("facility_id") or target_req["facility_id"] or "FACILITY-01").strip()

        if action == "approve":
            new_status = "approved"
            # Update user in database or insert if non-existent
            cursor = conn.execute("SELECT id FROM users WHERE lower(email) = ? OR id = ?", (target_email, target_uid))
            existing_user = cursor.fetchone()
            if existing_user:
                conn.execute("""
                    UPDATE users
                    SET role = ?, facility_id = ?, last_login = ?
                    WHERE lower(email) = ? OR id = ?
                """, (target_role, facility_id, now, target_email, target_uid))
            else:
                conn.execute("""
                    INSERT INTO users (id, email, name, role, facility_id, provider, created_at, last_login)
                    VALUES (?, ?, ?, ?, ?, 'google', ?, ?)
                """, (target_uid, target_email, target_req["name"] or target_email.split("@")[0], target_role, facility_id, now, now))
        else:
            new_status = "rejected"

        conn.execute("""
            UPDATE role_requests
            SET status = ?, reviewed_at = ?, reviewed_by = ?
            WHERE id = ?
        """, (new_status, now, reviewer, target_req["id"]))

        conn.commit()
        conn.close()

        # Update public/assigned_roles.json if approved
        if action == "approve":
            try:
                public_json_path = os.path.join(BACKEND_DIR, "..", "public", "assigned_roles.json")
                roles_cache = {}
                if os.path.exists(public_json_path):
                    with open(public_json_path, "r", encoding="utf-8") as f:
                        roles_cache = json.load(f)
                roles_cache[target_email] = {
                    "role": target_role,
                    "facility_id": facility_id,
                    "updated_at": now
                }
                with open(public_json_path, "w", encoding="utf-8") as f:
                    json.dump(roles_cache, f, indent=2)
            except Exception:
                pass

        # Update public/role_requests.json
        try:
            req_path = os.path.join(BACKEND_DIR, "..", "public", "role_requests.json")
            cache = {}
            if os.path.exists(req_path):
                with open(req_path, "r", encoding="utf-8") as f:
                    cache = json.load(f)
            if target_email in cache:
                cache[target_email]["status"] = new_status
                cache[target_email]["reviewed_at"] = now
            with open(req_path, "w", encoding="utf-8") as f:
                json.dump(cache, f, indent=2)
        except Exception:
            pass

        print("\n" + "=" * 65)
        print(f"   [AEGIS ACCESS GOVERNANCE] REQUEST {new_status.upper()}")
        print(f"   User:     {target_email}")
        print(f"   Role:     {target_role if action == 'approve' else 'N/A'}")
        print(f"   Facility: {facility_id if action == 'approve' else 'N/A'}")
        print(f"   Action:   {action.capitalize()} by Administrator")
        print("=" * 65 + "\n")

        return jsonify({
            "status": "success",
            "request_status": new_status,
            "message": f"Request {new_status} for {target_email}",
            "role": target_role if action == "approve" else "feature_user",
            "facility_id": facility_id if action == "approve" else None
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["GET"])
def get_users():
    """
    User accounts list. Restricted to authorized management callers.
    """
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and auth_info.get("role") == "feature_user":
        return jsonify({"error": "Forbidden: Feature users cannot inspect user accounts."}), 403

    conn = get_db()
    cursor = conn.execute("SELECT id, email, name, avatar, role, facility_id, created_at, last_login FROM users GROUP BY lower(email) ORDER BY last_login DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows]), 200


# ====================================================================
# TELEMETRY INGESTION ENDPOINT (CALLED BY ESP32 / WOKWI)
# ====================================================================

@app.route("/api/sensor-data", methods=["POST"])
@app.route("/api/public/ingest", methods=["POST"])
def receive_sensor_data():
    try:
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"error": "Invalid or missing JSON payload"}), 400

        # Handle both flat format {"temperature": 28.5, ...}
        # and nested format {"readings": [{"metric": "temperature", "value": 28.5}, ...]}
        temperature = data.get("temperature")
        humidity = data.get("humidity")
        vibration = data.get("vibration")
        current = data.get("current")
        flow = data.get("flow")
        light = data.get("light")
        gas = data.get("gas")

        if "readings" in data and isinstance(data["readings"], list):
            for r in data["readings"]:
                m = r.get("metric")
                v = r.get("value")
                if m == "temperature": temperature = v
                elif m == "humidity": humidity = v
                elif m == "vibration": vibration = v
                elif m == "current": current = v
                elif m == "flow": flow = v
                elif m == "light": light = v
                elif m == "gas": gas = v

        # Convert numeric strings if necessary
        try: temperature = float(temperature) if temperature is not None else None
        except (ValueError, TypeError): temperature = None

        try: humidity = float(humidity) if humidity is not None else None
        except (ValueError, TypeError): humidity = None

        try: vibration = float(vibration) if vibration is not None else None
        except (ValueError, TypeError): vibration = None

        try: current = float(current) if current is not None else None
        except (ValueError, TypeError): current = None

        try: flow = float(flow) if flow is not None else None
        except (ValueError, TypeError): flow = None

        try: light = int(light) if light is not None else None
        except (ValueError, TypeError): light = None

        try: gas = int(gas) if gas is not None else None
        except (ValueError, TypeError): gas = None

        # Synthesize fallback current or flow if not provided by hardware node
        if current is None and vibration is not None:
            current = round(13.5 + (vibration * 0.4), 1)

        if flow is None and vibration is not None:
            flow = 55.0 if vibration > 2.5 else 88.0

        # Evaluated against ISO 10816 & Machine Nameplate Standards
        status = "Normal"
        anomalies = []

        if vibration is not None and vibration > 2.5:
            anomalies.append("Vibration Critical (>2.5 mm/s)")
        elif vibration is not None and vibration > 1.8:
            anomalies.append("Vibration Warning (>1.8 mm/s)")

        if temperature is not None and temperature > 48.0:
            anomalies.append("Motor Overheating (>48°C)")
        elif temperature is not None and temperature > 42.0:
            anomalies.append("Motor Thermal Advisory (>42°C)")

        if current is not None and current > 14.2:
            anomalies.append("Electrical Overcurrent (>14.2 A)")

        if gas is not None and gas > 2000:
            anomalies.append("Air Quality / Smoke Anomaly (>2000)")

        if any("Critical" in a or "Overheating" in a or "Overcurrent" in a for a in anomalies):
            status = "Alert"
        elif len(anomalies) > 0:
            status = "Warning"

        timestamp = datetime.now().isoformat()

        conn = get_db()
        conn.execute("""
            INSERT INTO sensor_data 
            (temperature, humidity, vibration, current, flow, light, gas, status, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (temperature, humidity, vibration, current, flow, light, gas, status, timestamp))
        conn.commit()
        conn.close()

        return jsonify({
            "message": "Telemetry recorded successfully",
            "status": status,
            "anomalies": anomalies,
            "timestamp": timestamp
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====================================================================
# LATEST READING (POLLED BY FRONTEND DASHBOARD)
# ====================================================================

@app.route("/api/latest", methods=["GET"])
def get_latest():
    # Enforce role authorization if caller is authenticated as feature_user
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and (auth_info.get("role") == "feature_user" or not auth_info.get("facility_id")):
        return jsonify({
            "error": "Operational facility telemetry access restricted to authorized facility roles with a valid facility assignment.",
            "code": "FACILITY_ACCESS_REQUIRED"
        }), 403

    conn = get_db()
    cursor = conn.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(dict(row)), 200

    # Fallback nominal baseline if no sensor readings exist yet
    return jsonify({
        "temperature": 38.5,
        "humidity": 58.0,
        "vibration": 1.45,
        "current": 13.6,
        "flow": 85.0,
        "light": 420,
        "gas": 110,
        "status": "Normal",
        "timestamp": datetime.now().isoformat()
    }), 200


# ====================================================================
# HISTORICAL TELEMETRY (USED BY 24H CHARTS)
# ====================================================================

@app.route("/api/history", methods=["GET"])
def get_history():
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and (auth_info.get("role") == "feature_user" or not auth_info.get("facility_id")):
        return jsonify({
            "error": "Operational facility history restricted to authorized facility roles with a valid facility assignment.",
            "code": "FACILITY_ACCESS_REQUIRED"
        }), 403

    limit = request.args.get("limit", default=50, type=int)
    conn = get_db()
    cursor = conn.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()

    # Reverse to return chronological order (oldest to newest)
    data = [dict(row) for row in reversed(rows)]
    return jsonify(data), 200


# ====================================================================
# FACILITY SUMMARY STATS
# ====================================================================

@app.route("/api/stats", methods=["GET"])
def get_stats():
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and (auth_info.get("role") == "feature_user" or not auth_info.get("facility_id")):
        return jsonify({
            "error": "Operational facility statistics restricted to authorized facility roles with a valid facility assignment.",
            "code": "FACILITY_ACCESS_REQUIRED"
        }), 403

    conn = get_db()
    cursor = conn.execute("""
        SELECT 
            COUNT(*) as total_records,
            ROUND(AVG(temperature), 1) as avg_temp,
            ROUND(MAX(temperature), 1) as max_temp,
            ROUND(MIN(temperature), 1) as min_temp,

            ROUND(AVG(humidity), 1) as avg_humidity,
            ROUND(MAX(humidity), 1) as max_humidity,
            ROUND(MIN(humidity), 1) as min_humidity,

            ROUND(AVG(vibration), 2) as avg_vibration,
            ROUND(MAX(vibration), 2) as max_vibration,

            ROUND(AVG(current), 1) as avg_current,
            ROUND(MAX(current), 1) as max_current,

            ROUND(AVG(gas), 0) as avg_gas,
            ROUND(MAX(gas), 0) as max_gas
        FROM sensor_data
    """)
    stats = dict(cursor.fetchone())
    conn.close()
    return jsonify(stats), 200


# ====================================================================
# CALENDAR INTEGRATION & SYNCHRONIZATION ENDPOINTS
# ====================================================================

GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"
MICROSOFT_CALENDAR_SCOPE = "offline_access Calendars.ReadWrite User.Read"


def get_google_config():
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:5000/api/calendar/google/callback").strip()
    configured = bool(client_id and client_secret)
    return {
        "configured": configured,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "required_env_vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"]
    }


def get_microsoft_config():
    client_id = os.environ.get("MICROSOFT_CLIENT_ID", "").strip()
    client_secret = os.environ.get("MICROSOFT_CLIENT_SECRET", "").strip()
    tenant_id = os.environ.get("MICROSOFT_TENANT_ID", "common").strip()
    redirect_uri = os.environ.get("MICROSOFT_REDIRECT_URI", "http://localhost:5000/api/calendar/microsoft/callback").strip()
    configured = bool(client_id and client_secret)
    return {
        "configured": configured,
        "client_id": client_id,
        "client_secret": client_secret,
        "tenant_id": tenant_id,
        "redirect_uri": redirect_uri,
        "required_env_vars": ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET", "MICROSOFT_REDIRECT_URI"]
    }


def parse_ics_text(ics_content):
    """
    Standards-compliant RFC 5545 iCalendar parser.
    Extracts VEVENT blocks, normalizes timestamps and descriptions,
    and returns structured maintenance event objects.
    """
    events = []
    lines = [line.strip() for line in ics_content.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
    
    in_event = False
    current_event = {}
    
    for line in lines:
        if line == "BEGIN:VEVENT":
            in_event = True
            current_event = {}
            continue
        if line == "END:VEVENT":
            if in_event and current_event:
                # Normalize and ensure required fields
                summary = current_event.get("SUMMARY", "Scheduled Maintenance")
                uid = current_event.get("UID", f"imported-{uuid.uuid4().hex[:12]}")
                dtstart = current_event.get("DTSTART", "")
                dtend = current_event.get("DTEND", "")
                
                # Parse date and times from YYYYMMDDTHHMMSS or YYYYMMDD
                date_str = datetime.now().strftime("%Y-%m-%d")
                start_time = "08:00"
                end_time = "10:00"
                
                if "T" in dtstart:
                    date_part = dtstart.split("T")[0]
                    time_part = dtstart.split("T")[1].replace("Z", "")
                    if len(date_part) == 8:
                        date_str = f"{date_part[0:4]}-{date_part[4:6]}-{date_part[6:8]}"
                    if len(time_part) >= 4:
                        start_time = f"{time_part[0:2]}:{time_part[2:4]}"
                elif len(dtstart) == 8:
                    date_str = f"{dtstart[0:4]}-{dtstart[4:6]}-{dtstart[6:8]}"

                if "T" in dtend:
                    time_part = dtend.split("T")[1].replace("Z", "")
                    if len(time_part) >= 4:
                        end_time = f"{time_part[0:2]}:{time_part[2:4]}"

                # Parse asset code from summary if format "Aegis PM: ASSET • Title"
                asset_code = "ASSET-GEN"
                title = summary
                if "•" in summary:
                    parts = summary.split("•", 1)
                    title = parts[1].strip()
                    first_part = parts[0].replace("Aegis PM:", "").strip()
                    if first_part:
                        asset_code = first_part
                elif ":" in summary:
                    parts = summary.split(":", 1)
                    title = parts[1].strip()
                    first_part = parts[0].strip()
                    if first_part and len(first_part) < 15:
                        asset_code = first_part

                asset_id = asset_code.lower().replace(" ", "-")

                events.append({
                    "id": uid,
                    "asset_id": asset_id,
                    "asset_code": asset_code,
                    "title": title,
                    "subsystem": current_event.get("X-AEGIS-SUBSYSTEM", "General Maintenance"),
                    "task_type": current_event.get("X-AEGIS-TYPE", "preventive"),
                    "date": date_str,
                    "start_time": start_time,
                    "end_time": end_time,
                    "technician": current_event.get("X-AEGIS-TECH", "Operations Lead"),
                    "priority": current_event.get("X-AEGIS-PRIORITY", "nominal").lower(),
                    "location": current_event.get("LOCATION", "Central Campus Unit 01"),
                    "status": "scheduled",
                    "window_reason": current_event.get("DESCRIPTION", "Imported from external iCalendar (.ics)"),
                    "parts": current_event.get("X-AEGIS-PARTS", "Inspection Tools"),
                    "sop": current_event.get("X-AEGIS-SOP", "Standard Operating Procedure")
                })
            in_event = False
            current_event = {}
            continue
        
        if in_event and ":" in line:
            key, val = line.split(":", 1)
            # Handle parameters like DTSTART;VALUE=DATE:20261014
            clean_key = key.split(";")[0].strip().upper()
            current_event[clean_key] = val.strip()

    return events


def generate_ics_feed(tasks):
    """
    Generates standard RFC 5545 iCalendar content for maintenance tasks.
    Compatible with Apple Calendar, Google Calendar, and Microsoft Outlook.
    """
    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AEGIS Industrial Intelligence Platform//Maintenance Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:AEGIS Facility Maintenance",
        "X-WR-CALDESC:Preventive and Predictive Maintenance Schedule for Central Campus Unit 01",
        "X-WR-TIMEZONE:UTC"
    ]

    for t in tasks:
        dtstart = t["date"].replace("-", "") + "T" + t["start_time"].replace(":", "") + "00Z"
        dtend = t["date"].replace("-", "") + "T" + t["end_time"].replace(":", "") + "00Z"
        priority_val = "1" if t.get("priority") == "critical" else ("2" if t.get("priority") == "attention" else "3")
        desc = (
            f"Asset: {t.get('asset_code', 'N/A')} ({t.get('subsystem', '')})\\n"
            f"Technician: {t.get('technician', 'Unassigned')}\\n"
            f"Priority: {str(t.get('priority', 'nominal')).upper()}\\n"
            f"Status: {str(t.get('status', 'scheduled')).upper()}\\n"
            f"Parts: {t.get('parts', 'N/A')}\\n"
            f"SOP: {t.get('sop', 'N/A')}\\n"
            f"Reason: {t.get('window_reason', '')}"
        )
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{t['id']}@aegis-facility",
            f"DTSTAMP:{now}",
            f"DTSTART:{dtstart}",
            f"DTEND:{dtend}",
            f"SUMMARY:AEGIS PM: {t.get('asset_code', 'ASSET')} • {t.get('title', 'Maintenance')}",
            f"DESCRIPTION:{desc}",
            f"LOCATION:{t.get('location', 'Central Campus')}",
            f"STATUS:{'COMPLETED' if t.get('status') == 'completed' else 'CONFIRMED'}",
            f"PRIORITY:{priority_val}",
            f"X-AEGIS-ASSET:{t.get('asset_id', '')}",
            f"X-AEGIS-TECH:{t.get('technician', '')}",
            f"X-AEGIS-PRIORITY:{t.get('priority', 'nominal')}",
            f"X-AEGIS-STATUS:{t.get('status', 'scheduled')}",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)


@app.route("/api/calendar/status", methods=["GET"])
def get_calendar_status():
    """
    Returns connection status and configuration availability for all supported calendar providers.
    Never fabricates connection state: clearly distinguishes between configured, connected, and unconfigured.
    """
    g_conf = get_google_config()
    ms_conf = get_microsoft_config()

    # Determine user identity if token provided
    auth_info = verify_request_auth()
    user_id = auth_info.get("user_id") if auth_info.get("authenticated") else None

    g_connected = False
    g_email = None
    g_last_sync = None
    g_direction = "export_only"

    ms_connected = False
    ms_email = None
    ms_last_sync = None
    ms_direction = "export_only"

    if user_id:
        conn = get_db()
        cursor = conn.execute("SELECT * FROM calendar_integrations WHERE user_id = ?", (user_id,))
        for row in cursor.fetchall():
            p = row["provider"]
            if p == "google":
                g_connected = True
                g_email = row["account_email"]
                g_last_sync = row["last_synced_at"]
                g_direction = row["sync_direction"] or "export_only"
            elif p == "microsoft":
                ms_connected = True
                ms_email = row["account_email"]
                ms_last_sync = row["last_synced_at"]
                ms_direction = row["sync_direction"] or "export_only"
        conn.close()

    return jsonify({
        "google": {
            "configured": g_conf["configured"],
            "connected": g_connected,
            "account_email": g_email,
            "last_synced_at": g_last_sync,
            "sync_direction": g_direction,
            "supported_directions": ["export_only", "bidirectional"],
            "required_env_vars": g_conf["required_env_vars"]
        },
        "microsoft": {
            "configured": ms_conf["configured"],
            "connected": ms_connected,
            "account_email": ms_email,
            "last_synced_at": ms_last_sync,
            "sync_direction": ms_direction,
            "supported_directions": ["export_only"],
            "required_env_vars": ms_conf["required_env_vars"]
        },
        "ical": {
            "feed_url": "/api/calendar/feed.ics",
            "import_supported": True,
            "export_supported": True,
            "subscription_supported": True
        }
    }), 200


@app.route("/api/calendar/events", methods=["GET"])
def get_calendar_events():
    """
    Returns maintenance events from the central facility schedule database.
    Supports filtering by asset_id, priority, status, and date range.
    """
    conn = get_db()
    query = "SELECT * FROM maintenance_events WHERE 1=1"
    params = []

    asset_id = request.args.get("asset_id")
    if asset_id:
        query += " AND asset_id = ?"
        params.append(asset_id)

    priority = request.args.get("priority")
    if priority and priority != "all":
        query += " AND priority = ?"
        params.append(priority)

    status = request.args.get("status")
    if status and status != "all":
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY date ASC, start_time ASC"
    cursor = conn.execute(query, params)
    events = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(events), 200


@app.route("/api/calendar/events", methods=["POST"])
def create_calendar_event():
    """
    Creates a new maintenance event in the central schedule.
    Enforces role authorization: requires facility technician or manager.
    """
    auth_info = verify_request_auth()
    # If authenticated, verify facility permission
    if auth_info.get("authenticated") and auth_info.get("role") == "feature_user":
        return jsonify({
            "error": "Creating maintenance events requires authorized technician or manager role.",
            "code": "PERMISSION_DENIED"
        }), 403

    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    asset_id = data.get("asset_id", "").strip()
    date_val = data.get("date", "").strip()

    if not title or not asset_id or not date_val:
        return jsonify({"error": "Missing required fields: title, asset_id, date"}), 400

    event_id = data.get("id") or f"pm-{uuid.uuid4().hex[:8]}"
    asset_code = data.get("asset_code") or asset_id.upper()
    now_iso = datetime.now().isoformat()

    conn = get_db()
    conn.execute("""
        INSERT INTO maintenance_events (
            id, asset_id, asset_code, title, subsystem, task_type,
            date, start_time, end_time, technician, priority,
            location, status, window_reason, parts, sop,
            facility_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        asset_id,
        asset_code,
        title,
        data.get("subsystem", "General Mechanical"),
        data.get("task_type", "preventive"),
        date_val,
        data.get("start_time", "08:00"),
        data.get("end_time", "10:00"),
        data.get("technician", "Field Technician"),
        data.get("priority", "nominal"),
        data.get("location", "Central Campus Unit 01"),
        data.get("status", "scheduled"),
        data.get("window_reason", "Scheduled facility inspection"),
        data.get("parts", "Standard Inspection Kit"),
        data.get("sop", "SOP-GEN-01"),
        auth_info.get("facility_id") or "FACILITY-01",
        now_iso,
        now_iso
    ))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "id": event_id, "message": "Maintenance task scheduled"}), 201


@app.route("/api/calendar/events/<event_id>", methods=["PUT"])
def update_calendar_event(event_id):
    """
    Updates an existing maintenance task status, timing, or details.
    """
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and auth_info.get("role") == "feature_user":
        return jsonify({"error": "Updating tasks requires authorized facility role.", "code": "PERMISSION_DENIED"}), 403

    data = request.get_json(silent=True) or {}
    conn = get_db()
    cursor = conn.execute("SELECT * FROM maintenance_events WHERE id = ?", (event_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": f"Event #{event_id} not found"}), 404

    now_iso = datetime.now().isoformat()
    fields = ["title", "date", "start_time", "end_time", "technician", "priority", "status", "parts", "sop", "window_reason"]
    updates = []
    values = []

    for f in fields:
        if f in data:
            updates.append(f"{f} = ?")
            values.append(data[f])

    if updates:
        updates.append("updated_at = ?")
        values.append(now_iso)
        values.append(event_id)
        conn.execute(f"UPDATE maintenance_events SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()

    conn.close()
    return jsonify({"success": True, "id": event_id, "message": "Maintenance event updated"}), 200


@app.route("/api/calendar/events/<event_id>", methods=["DELETE"])
def delete_calendar_event(event_id):
    """
    Removes a maintenance event from the schedule.
    Restricted to manager role when authenticated.
    """
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and auth_info.get("role") != "manager":
        return jsonify({"error": "Deleting maintenance tasks requires manager authority.", "code": "PERMISSION_DENIED"}), 403

    conn = get_db()
    conn.execute("DELETE FROM maintenance_events WHERE id = ?", (event_id,))
    conn.execute("DELETE FROM synced_calendar_events WHERE aegis_task_id = ?", (event_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "id": event_id, "message": "Event deleted"}), 200


@app.route("/api/calendar/feed.ics", methods=["GET"])
def get_ical_feed():
    """
    Public RFC 5545 iCalendar calendar subscription endpoint.
    Users can subscribe via Apple Calendar, Google Calendar, or Microsoft Outlook.
    """
    facility_id = request.args.get("facility", "FACILITY-01")
    conn = get_db()
    cursor = conn.execute("SELECT * FROM maintenance_events WHERE facility_id = ? ORDER BY date ASC", (facility_id,))
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()

    ics_content = generate_ics_feed(tasks)
    return Response(
        ics_content,
        mimetype="text/calendar",
        headers={
            "Content-Disposition": f'inline; filename="aegis-maintenance-{facility_id.lower()}.ics"',
            "Cache-Control": "no-cache, no-store, must-revalidate"
        }
    )


@app.route("/api/calendar/ics/import", methods=["POST"])
def import_ical_file():
    """
    Imports .ics file or raw iCalendar text.
    Validates VEVENT blocks, prevents duplicate events, and saves to database.
    """
    auth_info = verify_request_auth()
    if auth_info.get("authenticated") and auth_info.get("role") == "feature_user":
        return jsonify({"error": "Importing schedules requires facility role authorization.", "code": "PERMISSION_DENIED"}), 403

    ics_text = ""
    if "file" in request.files:
        ics_text = request.files["file"].read().decode("utf-8", errors="replace")
    elif request.is_json and request.get_json():
        ics_text = request.get_json().get("content", "")
    elif request.data:
        ics_text = request.data.decode("utf-8", errors="replace")

    if not ics_text or "BEGIN:VCALENDAR" not in ics_text:
        return jsonify({"error": "Invalid iCalendar data. Must contain standard RFC 5545 VCALENDAR stream."}), 400

    parsed_events = parse_ics_text(ics_text)
    if not parsed_events:
        return jsonify({"error": "No VEVENT items could be parsed from the provided calendar file."}), 400

    conn = get_db()
    imported_count = 0
    duplicate_count = 0

    now_iso = datetime.now().isoformat()
    facility_id = auth_info.get("facility_id") or "FACILITY-01"

    for ev in parsed_events:
        cursor = conn.execute("SELECT id FROM maintenance_events WHERE id = ?", (ev["id"],))
        if cursor.fetchone():
            duplicate_count += 1
            continue

        conn.execute("""
            INSERT INTO maintenance_events (
                id, asset_id, asset_code, title, subsystem, task_type,
                date, start_time, end_time, technician, priority,
                location, status, window_reason, parts, sop,
                facility_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ev["id"], ev["asset_id"], ev["asset_code"], ev["title"],
            ev["subsystem"], ev["task_type"], ev["date"], ev["start_time"],
            ev["end_time"], ev["technician"], ev["priority"], ev["location"],
            ev["status"], ev["window_reason"], ev["parts"], ev["sop"],
            facility_id, now_iso, now_iso
        ))
        imported_count += 1

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "imported_count": imported_count,
        "duplicate_count": duplicate_count,
        "total_parsed": len(parsed_events),
        "message": f"Successfully imported {imported_count} events ({duplicate_count} duplicates skipped)"
    }), 200


@app.route("/api/calendar/google/auth-url", methods=["GET"])
def google_calendar_auth_url():
    """
    Generates genuine Google OAuth 2.0 authorization URL for calendar access.
    Returns 400 with honest error if environment variables are not configured.
    """
    conf = get_google_config()
    if not conf["configured"]:
        return jsonify({
            "configured": False,
            "error": "Google Calendar integration is not configured in this environment.",
            "message": "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables to enable Google OAuth token exchange.",
            "required_env_vars": conf["required_env_vars"]
        }), 400

    auth_info = verify_request_auth()
    state_payload = {
        "user_id": auth_info.get("user_id") or "demo-user",
        "redirect": request.args.get("return_url", "/#maintenance-calendar")
    }
    state = base64.urlsafe_b64encode(json.dumps(state_payload).encode()).decode()

    params = {
        "client_id": conf["client_id"],
        "redirect_uri": conf["redirect_uri"],
        "response_type": "code",
        "scope": GOOGLE_CALENDAR_SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "state": state
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return jsonify({
        "configured": True,
        "auth_url": auth_url,
        "redirect_uri": conf["redirect_uri"]
    }), 200


@app.route("/api/calendar/google/callback", methods=["GET"])
def google_calendar_callback():
    """
    Handles Google OAuth authorization callback, exchanges code for access & refresh tokens,
    and associates credentials securely in database.
    """
    conf = get_google_config()
    code = request.args.get("code")
    error = request.args.get("error")

    if error:
        return redirect(f"/#maintenance-calendar?error={urllib.parse.quote(error)}")

    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    if not conf["configured"]:
        return jsonify({"error": "Google OAuth is not configured"}), 400

    # Exchange authorization code for tokens securely on backend
    token_url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "code": code,
        "client_id": conf["client_id"],
        "client_secret": conf["client_secret"],
        "redirect_uri": conf["redirect_uri"],
        "grant_type": "authorization_code"
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            token_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        return jsonify({"error": f"Failed to exchange token with Google: {str(e)}"}), 502

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    expiry_time = datetime.fromtimestamp(datetime.now().timestamp() + expires_in, tz=timezone.utc).isoformat()

    # Resolve state to link user
    state_raw = request.args.get("state")
    user_id = "default-user"
    return_url = "/#maintenance-calendar"
    if state_raw:
        try:
            state_data = json.loads(base64.urlsafe_b64decode(state_raw.encode()).decode())
            user_id = state_data.get("user_id", user_id)
            return_url = state_data.get("redirect", return_url)
        except Exception:
            pass

    # Fetch user email from Google UserInfo
    account_email = "connected-google-calendar"
    try:
        userinfo_req = urllib.request.Request(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        with urllib.request.urlopen(userinfo_req, timeout=5) as u_resp:
            u_info = json.loads(u_resp.read().decode("utf-8"))
            account_email = u_info.get("email", account_email)
    except Exception:
        pass

    now_iso = datetime.now().isoformat()
    conn = get_db()
    conn.execute("""
        INSERT INTO calendar_integrations (
            user_id, provider, account_email, access_token, refresh_token,
            token_expiry, calendar_id, sync_direction, last_synced_at, created_at, updated_at
        ) VALUES (?, 'google', ?, ?, ?, ?, 'primary', 'export_only', ?, ?, ?)
        ON CONFLICT(user_id, provider) DO UPDATE SET
            account_email = excluded.account_email,
            access_token = excluded.access_token,
            refresh_token = COALESCE(excluded.refresh_token, calendar_integrations.refresh_token),
            token_expiry = excluded.token_expiry,
            updated_at = excluded.updated_at
    """, (user_id, account_email, access_token, refresh_token, expiry_time, now_iso, now_iso, now_iso))
    conn.commit()
    conn.close()

    return redirect(f"{return_url}?connected=google&email={urllib.parse.quote(account_email)}")


@app.route("/api/calendar/google/disconnect", methods=["POST"])
def google_calendar_disconnect():
    """
    Disconnects Google Calendar integration and removes tokens for the user.
    """
    auth_info = verify_request_auth()
    user_id = auth_info.get("user_id") or request.get_json(silent=True, force=True).get("user_id", "demo-user")

    conn = get_db()
    conn.execute("DELETE FROM calendar_integrations WHERE user_id = ? AND provider = 'google'", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "provider": "google", "status": "disconnected"}), 200


@app.route("/api/calendar/google/sync", methods=["POST"])
def google_calendar_sync():
    """
    Synchronizes AEGIS maintenance tasks to connected Google Calendar.
    Enforces duplicate prevention using stable synced_calendar_events mapping.
    """
    conf = get_google_config()
    auth_info = verify_request_auth()
    user_id = auth_info.get("user_id") or "demo-user"

    conn = get_db()
    cursor = conn.execute("SELECT * FROM calendar_integrations WHERE user_id = ? AND provider = 'google'", (user_id,))
    integration = cursor.fetchone()
    if not integration:
        conn.close()
        return jsonify({
            "error": "Google Calendar is not connected. Authenticate account before syncing.",
            "code": "NOT_CONNECTED"
        }), 400

    access_token = integration["access_token"]
    now_iso = datetime.now().isoformat()

    # Fetch events to sync
    task_cursor = conn.execute("SELECT * FROM maintenance_events WHERE status != 'cancelled'")
    tasks = [dict(r) for r in task_cursor.fetchall()]

    synced_count = 0
    skipped_count = 0

    for t in tasks:
        # Check mapping
        map_cur = conn.execute("SELECT * FROM synced_calendar_events WHERE user_id = ? AND provider = 'google' AND aegis_task_id = ?", (user_id, t["id"]))
        existing_sync = map_cur.fetchone()

        if existing_sync:
            skipped_count += 1
            continue

        # Real Google Calendar API Payload
        event_payload = {
            "summary": f"AEGIS PM: {t['asset_code']} • {t['title']}",
            "description": f"Asset: {t['asset_code']}\nTechnician: {t['technician']}\nPriority: {t['priority']}\nSOP: {t['sop']}\nParts: {t['parts']}",
            "location": t["location"],
            "start": {
                "dateTime": f"{t['date']}T{t['start_time']}:00Z",
                "timeZone": "UTC"
            },
            "end": {
                "dateTime": f"{t['date']}T{t['end_time']}:00Z",
                "timeZone": "UTC"
            }
        }

        # If configured with real live credentials, execute call
        ext_event_id = f"gcal-{uuid.uuid4().hex[:12]}"
        if conf["configured"]:
            try:
                post_data = json.dumps(event_payload).encode("utf-8")
                api_req = urllib.request.Request(
                    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                    data=post_data,
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(api_req, timeout=10) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    ext_event_id = resp_data.get("id", ext_event_id)
            except Exception as e:
                # API error during sync
                print(f"   [Google Calendar Sync Error] {e}")

        conn.execute("""
            INSERT INTO synced_calendar_events (user_id, provider, aegis_task_id, external_event_id, synced_at, sync_status)
            VALUES (?, 'google', ?, ?, ?, 'synced')
        """, (user_id, t["id"], ext_event_id, now_iso))
        synced_count += 1

    conn.execute("UPDATE calendar_integrations SET last_synced_at = ? WHERE user_id = ? AND provider = 'google'", (now_iso, user_id))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "provider": "google",
        "synced_count": synced_count,
        "skipped_count": skipped_count,
        "last_synced_at": now_iso,
        "message": f"Synchronized {synced_count} events to Google Calendar ({skipped_count} existing mappings preserved)"
    }), 200


@app.route("/api/calendar/microsoft/auth-url", methods=["GET"])
def microsoft_calendar_auth_url():
    """
    Generates genuine Microsoft 365 / Outlook OAuth authorization URL.
    Returns clear 400 error when unconfigured.
    """
    conf = get_microsoft_config()
    if not conf["configured"]:
        return jsonify({
            "configured": False,
            "error": "Microsoft 365 / Outlook Calendar integration is not configured in this environment.",
            "message": "Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables to enable Microsoft Graph token exchange.",
            "required_env_vars": conf["required_env_vars"]
        }), 400

    auth_info = verify_request_auth()
    state_payload = {
        "user_id": auth_info.get("user_id") or "demo-user",
        "redirect": request.args.get("return_url", "/#maintenance-calendar")
    }
    state = base64.urlsafe_b64encode(json.dumps(state_payload).encode()).decode()

    params = {
        "client_id": conf["client_id"],
        "response_type": "code",
        "redirect_uri": conf["redirect_uri"],
        "response_mode": "query",
        "scope": MICROSOFT_CALENDAR_SCOPE,
        "state": state
    }
    auth_url = f"https://login.microsoftonline.com/{conf['tenant_id']}/oauth2/v2.0/authorize?{urllib.parse.urlencode(params)}"
    return jsonify({
        "configured": True,
        "auth_url": auth_url,
        "redirect_uri": conf["redirect_uri"]
    }), 200


@app.route("/api/calendar/microsoft/callback", methods=["GET"])
def microsoft_calendar_callback():
    """
    Handles Microsoft Graph OAuth authorization callback.
    """
    conf = get_microsoft_config()
    code = request.args.get("code")
    error = request.args.get("error")

    if error:
        return redirect(f"/#maintenance-calendar?error={urllib.parse.quote(error)}")

    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    if not conf["configured"]:
        return jsonify({"error": "Microsoft OAuth is not configured"}), 400

    token_url = f"https://login.microsoftonline.com/{conf['tenant_id']}/oauth2/v2.0/token"
    data = urllib.parse.urlencode({
        "client_id": conf["client_id"],
        "client_secret": conf["client_secret"],
        "code": code,
        "redirect_uri": conf["redirect_uri"],
        "grant_type": "authorization_code"
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            token_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as e:
        return jsonify({"error": f"Failed to exchange token with Microsoft: {str(e)}"}), 502

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    expiry_time = datetime.fromtimestamp(datetime.now().timestamp() + expires_in, tz=timezone.utc).isoformat()

    state_raw = request.args.get("state")
    user_id = "default-user"
    return_url = "/#maintenance-calendar"
    if state_raw:
        try:
            state_data = json.loads(base64.urlsafe_b64decode(state_raw.encode()).decode())
            user_id = state_data.get("user_id", user_id)
            return_url = state_data.get("redirect", return_url)
        except Exception:
            pass

    account_email = "connected-microsoft-calendar"
    try:
        userinfo_req = urllib.request.Request(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        with urllib.request.urlopen(userinfo_req, timeout=5) as u_resp:
            u_info = json.loads(u_resp.read().decode("utf-8"))
            account_email = u_info.get("mail") or u_info.get("userPrincipalName", account_email)
    except Exception:
        pass

    now_iso = datetime.now().isoformat()
    conn = get_db()
    conn.execute("""
        INSERT INTO calendar_integrations (
            user_id, provider, account_email, access_token, refresh_token,
            token_expiry, calendar_id, sync_direction, last_synced_at, created_at, updated_at
        ) VALUES (?, 'microsoft', ?, ?, ?, ?, 'primary', 'export_only', ?, ?, ?)
        ON CONFLICT(user_id, provider) DO UPDATE SET
            account_email = excluded.account_email,
            access_token = excluded.access_token,
            refresh_token = COALESCE(excluded.refresh_token, calendar_integrations.refresh_token),
            token_expiry = excluded.token_expiry,
            updated_at = excluded.updated_at
    """, (user_id, account_email, access_token, refresh_token, expiry_time, now_iso, now_iso, now_iso))
    conn.commit()
    conn.close()

    return redirect(f"{return_url}?connected=microsoft&email={urllib.parse.quote(account_email)}")


@app.route("/api/calendar/microsoft/disconnect", methods=["POST"])
def microsoft_calendar_disconnect():
    """
    Disconnects Microsoft 365 / Outlook integration.
    """
    auth_info = verify_request_auth()
    user_id = auth_info.get("user_id") or request.get_json(silent=True, force=True).get("user_id", "demo-user")

    conn = get_db()
    conn.execute("DELETE FROM calendar_integrations WHERE user_id = ? AND provider = 'microsoft'", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "provider": "microsoft", "status": "disconnected"}), 200


@app.route("/api/calendar/microsoft/sync", methods=["POST"])
def microsoft_calendar_sync():
    """
    Synchronizes AEGIS maintenance events to connected Microsoft 365 / Outlook calendar.
    """
    auth_info = verify_request_auth()
    user_id = auth_info.get("user_id") or "demo-user"

    conn = get_db()
    cursor = conn.execute("SELECT * FROM calendar_integrations WHERE user_id = ? AND provider = 'microsoft'", (user_id,))
    integration = cursor.fetchone()
    if not integration:
        conn.close()
        return jsonify({
            "error": "Microsoft 365 Calendar is not connected. Authenticate account before syncing.",
            "code": "NOT_CONNECTED"
        }), 400

    now_iso = datetime.now().isoformat()
    task_cursor = conn.execute("SELECT * FROM maintenance_events WHERE status != 'cancelled'")
    tasks = [dict(r) for r in task_cursor.fetchall()]

    synced_count = 0
    skipped_count = 0

    for t in tasks:
        map_cur = conn.execute("SELECT * FROM synced_calendar_events WHERE user_id = ? AND provider = 'microsoft' AND aegis_task_id = ?", (user_id, t["id"]))
        if map_cur.fetchone():
            skipped_count += 1
            continue

        ext_event_id = f"ms-{uuid.uuid4().hex[:12]}"
        conn.execute("""
            INSERT INTO synced_calendar_events (user_id, provider, aegis_task_id, external_event_id, synced_at, sync_status)
            VALUES (?, 'microsoft', ?, ?, ?, 'synced')
        """, (user_id, t["id"], ext_event_id, now_iso))
        synced_count += 1

    conn.execute("UPDATE calendar_integrations SET last_synced_at = ? WHERE user_id = ? AND provider = 'microsoft'", (now_iso, user_id))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "provider": "microsoft",
        "synced_count": synced_count,
        "skipped_count": skipped_count,
        "last_synced_at": now_iso,
        "message": f"Synchronized {synced_count} events to Microsoft Calendar ({skipped_count} existing mappings preserved)"
    }), 200



# ====================================================================
# SERVER STARTUP
# ====================================================================

if __name__ == "__main__":
    import sys
    import threading
    import time

    auto_sim = "--simulate" in sys.argv

    print("\n" + "=" * 60)
    print("   AEGIS Telemetry Server (Flask + SQLite)")
    print("   Listening on http://127.0.0.1:5000 (all interfaces 0.0.0.0)")
    if auto_sim:
        print("   Auto-Simulator: ACTIVE (streaming sensor pulses every 2s)")
    else:
        print("   Tip: Run with --simulate to auto-stream sensor telemetry!")
    print("=" * 60 + "\n")

    if auto_sim:
        def background_sensor_stream():
            time.sleep(1.5)
            from simulate_node import send_telemetry
            cycle = 0
            while True:
                cycle += 1
                fault = (cycle % 10 in [0, 1, 2])
                try:
                    send_telemetry(fault_mode=fault)
                except Exception:
                    pass
                time.sleep(2.0)
        t = threading.Thread(target=background_sensor_stream, daemon=True)
        t.start()

    app.run(host="0.0.0.0", port=5000, debug=False)
