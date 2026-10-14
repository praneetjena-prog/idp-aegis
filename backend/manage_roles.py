"""
AEGIS Industrial Platform — Interactive Role Manager & Access Governance CLI
Higher-level authority tool to review, verify, and approve role access requests.

Usage:
  Interactive menu (checks for pending requests first):
    python manage_roles.py

  Direct CLI approval:
    python manage_roles.py --approve user@example.com
    python manage_roles.py --reject user@example.com

  Direct role assignment:
    python manage_roles.py --email user@example.com --role manager --facility FACILITY-01
"""

import os
import sys
import sqlite3
import argparse
import json
from datetime import datetime

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BACKEND_DIR, "aegis.db")

ROLES = {
    "1": ("technician", "Field Technician", "Checklists, LOTO sign-off, work order execution"),
    "2": ("manager", "Operations Manager", "SCADA telemetry, automated PM calendar, triage dispatch"),
    "3": ("auditor", "Reliability Auditor", "ISO 10816 compliance, FFT spectral analysis, CSV audit export"),
    "4": ("feature_user", "Feature Explorer", "Architecture specifications & educational documentation only")
}


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_tables():
    conn = get_db()
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
    conn.commit()
    deduplicate_users(conn)
    conn.close()


def deduplicate_users(conn):
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
    except Exception:
        pass


def list_pending_requests():
    ensure_tables()
    conn = get_db()
    cursor = conn.execute("SELECT * FROM role_requests WHERE status = 'pending' ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def list_users():
    ensure_tables()
    conn = get_db()
    cursor = conn.execute("""
        SELECT id, email, name, role, facility_id, last_login 
        FROM users 
        GROUP BY lower(email)
        ORDER BY last_login DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def review_request(identifier, action="approve"):
    ensure_tables()
    conn = get_db()
    if isinstance(identifier, int) or str(identifier).isdigit():
        cursor = conn.execute("SELECT * FROM role_requests WHERE id = ?", (int(identifier),))
    else:
        cursor = conn.execute(
            "SELECT * FROM role_requests WHERE lower(email) = ? AND status = 'pending' ORDER BY id DESC LIMIT 1",
            (str(identifier).strip().lower(),)
        )
    req = cursor.fetchone()
    if not req:
        conn.close()
        return None

    req = dict(req)
    target_email = req["email"]
    target_role = req["requested_role"]
    facility_id = req["facility_id"] or "FACILITY-01"
    now = datetime.now().isoformat()

    if action == "approve":
        status = "approved"
        cursor = conn.execute("SELECT id FROM users WHERE lower(email) = ? OR id = ?", (target_email, req["user_id"] or target_email))
        existing_user = cursor.fetchone()
        if existing_user:
            conn.execute("""
                UPDATE users
                SET role = ?, facility_id = ?, last_login = ?
                WHERE lower(email) = ? OR id = ?
            """, (target_role, facility_id, now, target_email, req["user_id"] or target_email))
        else:
            conn.execute("""
                INSERT INTO users (id, email, name, role, facility_id, provider, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, 'google', ?, ?)
            """, (req["user_id"] or target_email, target_email, req["name"] or target_email.split("@")[0], target_role, facility_id, now, now))
    else:
        status = "rejected"

    conn.execute("""
        UPDATE role_requests
        SET status = ?, reviewed_at = ?, reviewed_by = 'Administrator'
        WHERE id = ?
    """, (status, now, req["id"]))
    conn.commit()
    conn.close()

    # Synchronize to public/assigned_roles.json
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

    # Synchronize to public/role_requests.json
    try:
        req_path = os.path.join(BACKEND_DIR, "..", "public", "role_requests.json")
        cache = {}
        if os.path.exists(req_path):
            with open(req_path, "r", encoding="utf-8") as f:
                cache = json.load(f)
        if target_email in cache:
            cache[target_email]["status"] = status
            cache[target_email]["reviewed_at"] = now
        with open(req_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass

    return {
        "id": req["id"],
        "email": target_email,
        "role": target_role,
        "facility_id": facility_id,
        "status": status
    }


def assign_role_db(email, role, facility_id="FACILITY-01"):
    ensure_tables()
    email = email.strip().lower()
    role = role.strip()
    if role == "feature_user":
        facility_id = None
    elif not facility_id:
        facility_id = "FACILITY-01"

    now = datetime.now().isoformat()
    conn = get_db()
    cursor = conn.execute("SELECT id, name FROM users WHERE lower(email) = ?", (email,))
    existing = cursor.fetchone()

    if existing:
        user_id = existing["id"]
        conn.execute("""
            UPDATE users
            SET role = ?, facility_id = ?, last_login = ?
            WHERE id = ? OR lower(email) = ?
        """, (role, facility_id, now, user_id, email))
    else:
        user_id = email
        name = email.split("@")[0]
        conn.execute("""
            INSERT INTO users (id, email, name, role, facility_id, provider, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, 'google', ?, ?)
        """, (user_id, email, name, role, facility_id, now, now))

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

    return {
        "email": email,
        "role": role,
        "facility_id": facility_id
    }


def interactive_menu():
    print("\n" + "=" * 65)
    print("      AEGIS INDUSTRIAL PLATFORM — ROLE GOVERNANCE CONSOLE")
    print("=" * 65)

    pending = list_pending_requests()

    if pending:
        print(f"\n[!] NOTICE: {len(pending)} PENDING ROLE ACCESS REQUEST(S) WAITING FOR APPROVAL:\n")
        for idx, req in enumerate(pending, 1):
            print(f"  [{idx}] Applicant:       {req['email']}")
            print(f"      Requested Role:  {req['requested_role'].upper()} (Facility: {req.get('facility_id') or 'FACILITY-01'})")
            print(f"      Requested At:    {req.get('created_at', 'Unknown')}\n")

        print("Select an action:")
        print(f"  [1] Review & Approve Pending Requests ({len(pending)} pending)")
        print("  [2] Manually Assign / Change Role for Any Account")
        print("  [3] List All Registered Users")
        print("  [4] Exit")

        main_choice = input("\nEnter choice [1-4] (default: 1): ").strip() or "1"
        if main_choice == "1":
            for req in pending:
                print("\n" + "-" * 50)
                print(f"Reviewing Request #{req['id']}:")
                print(f"  Applicant:       {req['email']}")
                print(f"  Requested Role:  {req['requested_role'].upper()}")
                print(f"  Target Facility: {req.get('facility_id') or 'FACILITY-01'}")
                print(f"  Submitted At:    {req.get('created_at')}")
                
                decision = input("Decision -> [A]pprove / [R]eject / [S]kip (default: A): ").strip().lower() or "a"
                if decision in ("a", "approve", "y", "yes"):
                    res = review_request(req["id"], action="approve")
                    print(f"-> APPROVED! {res['email']} is now {res['role'].upper()} ({res['facility_id']}).")
                elif decision in ("r", "reject"):
                    res = review_request(req["id"], action="reject")
                    print(f"-> REJECTED request for {res['email']}.")
                else:
                    print("-> Skipped.")
            print("-" * 50 + "\nAll pending requests processed.")
            return
        elif main_choice == "3":
            show_users_list()
            return
        elif main_choice == "4":
            print("Exiting.")
            return

    # If no pending requests, or user selected manual assignment
    print("\nNo pending requests. Running manual role provisioning.")
    users = list_users()
    target_email = None

    if users:
        print("\nRegistered User Accounts in Database:")
        for idx, u in enumerate(users, 1):
            role_display = u.get("role") or "feature_user"
            fac_display = u.get("facility_id") or "Unassigned"
            print(f"  [{idx}] {u.get('email')}  |  Role: {role_display.upper()}  |  Facility: {fac_display}")
        print(f"  [{len(users) + 1}] Enter a different email manually...")

        try:
            choice = input(f"\nSelect an account [1-{len(users) + 1}]: ").strip()
            choice_num = int(choice)
            if 1 <= choice_num <= len(users):
                target_email = users[choice_num - 1]["email"]
        except (ValueError, IndexError):
            pass

    if not target_email:
        target_email = input("\nEnter Google account email to provision: ").strip()

    if not target_email or "@" not in target_email:
        print("Error: Valid email address is required.")
        return

    print(f"\nTarget Account: {target_email}")
    print("Which role should be assigned?")
    print("  [1] Field Technician       (Checklists, LOTO sign-off, work orders)")
    print("  [2] Operations Manager     (SCADA telemetry, calendar scheduling, triage)")
    print("  [3] Reliability Auditor    (ISO 10816 compliance, FFT spectral analysis)")
    print("  [4] Feature Explorer       (Platform architecture specifications only)")

    role_choice = input("Enter choice [1-4] (default: 2): ").strip() or "2"
    if role_choice not in ROLES:
        print("Invalid choice, defaulting to Operations Manager.")
        role_choice = "2"

    role_key, role_label, role_desc = ROLES[role_choice]

    facility_id = None
    if role_key != "feature_user":
        fac_input = input("Enter Facility ID (default: FACILITY-01): ").strip()
        facility_id = fac_input if fac_input else "FACILITY-01"

    print("\nUpdating database...")
    res = assign_role_db(target_email, role_key, facility_id)

    print("\n" + "-" * 65)
    print(f"SUCCESS: Role updated for {res['email']}")
    print(f"  Role:        {role_label} ({res['role']})")
    print(f"  Facility:    {res['facility_id'] or 'None (Documentation Mode)'}")
    print("-" * 65 + "\n")


def show_users_list():
    users = list_users()
    print("\nRegistered User Accounts:")
    for idx, u in enumerate(users, 1):
        print(f"  [{idx}] {u['email']} | {u.get('role', 'feature_user').upper()} | {u.get('facility_id') or 'None'}")
    print()


def main():
    parser = argparse.ArgumentParser(description="AEGIS Role Governance & Access Control Tool")
    parser.add_argument("--approve", help="Approve pending request for user email or request ID")
    parser.add_argument("--reject", help="Reject pending request for user email or request ID")
    parser.add_argument("--pending", action="store_true", help="List all pending access requests")
    parser.add_argument("--users", "--list", dest="list_users", action="store_true", help="List registered user accounts")
    parser.add_argument("--email", help="Account email address (for manual assignment)")
    parser.add_argument("--role", choices=["technician", "manager", "auditor", "feature_user"], help="Role to assign manually")
    parser.add_argument("--facility", default="FACILITY-01", help="Facility ID (default: FACILITY-01)")
    args = parser.parse_args()

    if args.list_users:
        show_users_list()
    elif args.pending:
        pending = list_pending_requests()
        print(f"\nPending Access Requests: {len(pending)}")
        for req in pending:
            print(f"  ID: {req['id']} | Email: {req['email']} | Requested: {req['requested_role']} | Facility: {req.get('facility_id')}")
        print()
    elif args.approve:
        res = review_request(args.approve, action="approve")
        if res:
            print(f"Success: Approved request for {res['email']} -> {res['role']} ({res['facility_id']})")
        else:
            print(f"Error: No pending request found for '{args.approve}'")
    elif args.reject:
        res = review_request(args.reject, action="reject")
        if res:
            print(f"Success: Rejected request for {res['email']}")
        else:
            print(f"Error: No pending request found for '{args.reject}'")
    elif args.email and args.role:
        res = assign_role_db(args.email, args.role, args.facility)
        print(f"Success: Assigned '{res['role']}' to {res['email']} (Facility: {res['facility_id']})")
    else:
        interactive_menu()


if __name__ == "__main__":
    main()
