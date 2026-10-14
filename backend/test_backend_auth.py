import unittest
import json
import base64
import os
import sqlite3
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import app

class TestBackendAuth(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.app.config["TESTING"] = True
        cls.client = app.app.test_client()

    def create_fake_jwt(self, user_id, email="test@gmail.com"):
        header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({"sub": user_id, "email": email}).encode()).decode().rstrip("=")
        return f"{header}.{payload}.signature"

    def test_feature_docs_accessible(self):
        """Feature docs endpoint must be accessible and contain no live facility data"""
        res = self.client.get("/api/feature-docs")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("tier"), "feature_user")
        self.assertIn("hardware_bom", data)
        self.assertIn("illustrative_example", data)

    def test_sync_user_cannot_escalate_role(self):
        """User sync cannot self-assign or elevate role to manager from client payload"""
        user_id = "test_user_new_123"
        payload = {
            "id": user_id,
            "email": "attacker@gmail.com",
            "name": "Attacker",
            "role": "manager"  # Attacker attempts role injection
        }
        res = self.client.post("/api/users/sync", json=payload)
        self.assertEqual(res.status_code, 200)
        user_data = res.get_json()["user"]
        self.assertEqual(user_data["role"], "feature_user")
        self.assertIsNone(user_data["facility_id"])

    def test_sync_user_preserves_admin_assigned_role(self):
        """User sync preserves pre-existing database-assigned role and facility"""
        user_id = "admin_assigned_user_456"
        conn = app.get_db()
        conn.execute("""
            INSERT OR REPLACE INTO users (id, email, name, role, facility_id)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, "tech@facility.org", "Tech User", "technician", "FACILITY-01"))
        conn.commit()
        conn.close()

        # Attacker tries to sync and downgrade or change role
        res = self.client.post("/api/users/sync", json={
            "id": user_id,
            "email": "tech@facility.org",
            "role": "auditor"  # should be ignored
        })
        self.assertEqual(res.status_code, 200)
        user_data = res.get_json()["user"]
        self.assertEqual(user_data["role"], "technician")
        self.assertEqual(user_data["facility_id"], "FACILITY-01")

    def test_feature_user_denied_sensitive_endpoints(self):
        """feature_user token is rejected with 403 on operational telemetry endpoints"""
        uid = "feature_user_789"
        conn = app.get_db()
        conn.execute("""
            INSERT OR REPLACE INTO users (id, email, name, role, facility_id)
            VALUES (?, ?, ?, ?, ?)
        """, (uid, "guest@gmail.com", "Guest User", "feature_user", None))
        conn.commit()
        conn.close()

        token = self.create_fake_jwt(uid, "guest@gmail.com")
        headers = {"Authorization": f"Bearer {token}"}

        # 1. /api/latest
        res = self.client.get("/api/latest", headers=headers)
        self.assertEqual(res.status_code, 403)
        self.assertEqual(res.get_json().get("code"), "FACILITY_ACCESS_REQUIRED")

        # 2. /api/history
        res = self.client.get("/api/history", headers=headers)
        self.assertEqual(res.status_code, 403)

        # 3. /api/stats
        res = self.client.get("/api/stats", headers=headers)
        self.assertEqual(res.status_code, 403)

        # 4. /api/users
        res = self.client.get("/api/users", headers=headers)
        self.assertEqual(res.status_code, 403)

    def test_facility_authorized_user_allowed_operational_endpoints(self):
        """User with facility role and facility_id is granted operational telemetry"""
        uid = "manager_user_999"
        conn = app.get_db()
        conn.execute("""
            INSERT OR REPLACE INTO users (id, email, name, role, facility_id)
            VALUES (?, ?, ?, ?, ?)
        """, (uid, "manager@facility.org", "Manager", "manager", "FACILITY-A"))
        conn.commit()
        conn.close()

        token = self.create_fake_jwt(uid, "manager@facility.org")
        headers = {"Authorization": f"Bearer {token}"}

        res = self.client.get("/api/latest", headers=headers)
        self.assertEqual(res.status_code, 200)

        res = self.client.get("/api/history", headers=headers)
        self.assertEqual(res.status_code, 200)

        res = self.client.get("/api/stats", headers=headers)
        self.assertEqual(res.status_code, 200)

    def test_assign_role_success(self):
        """Menu-driven role assignment assigns role and facility correctly"""
        payload = {
            "email": "technician.user@facility.org",
            "role": "technician",
            "facility_id": "FACILITY-01"
        }
        res = self.client.post("/api/users/assign-role", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["user"]["role"], "technician")
        self.assertEqual(data["user"]["facility_id"], "FACILITY-01")

        # Verify record in database
        conn = app.get_db()
        cursor = conn.execute("SELECT role, facility_id FROM users WHERE email = ?", ("technician.user@facility.org",))
        row = cursor.fetchone()
        conn.close()
        self.assertIsNotNone(row)
        self.assertEqual(row["role"], "technician")
        self.assertEqual(row["facility_id"], "FACILITY-01")

    def test_assign_role_validation(self):
        """Rejects missing email or invalid role"""
        # Missing email
        res = self.client.post("/api/users/assign-role", json={"role": "manager"})
        self.assertEqual(res.status_code, 400)

        # Invalid role
        res = self.client.post("/api/users/assign-role", json={"email": "bad@org.com", "role": "superadmin"})
        self.assertEqual(res.status_code, 400)

    def test_request_role_access(self):
        """Feature Explorer requests operational role access and request is recorded as pending"""
        req_email = "applicant.tech@facility.org"
        payload = {
            "email": req_email,
            "name": "Applicant Tech",
            "role": "technician",
            "facility_id": "FACILITY-01",
            "notes": "Testing access request"
        }
        res = self.client.post("/api/roles/request-access", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["status"], "pending")
        self.assertEqual(data["email"], req_email)
        self.assertEqual(data["requested_role"], "technician")
        self.assertIn("request_id", data)

        # Verify role_requests table
        conn = app.get_db()
        cursor = conn.execute("SELECT status, requested_role, facility_id FROM role_requests WHERE email = ? AND status = 'pending'", (req_email,))
        row = cursor.fetchone()
        conn.close()
        self.assertIsNotNone(row)
        self.assertEqual(row["requested_role"], "technician")
        self.assertEqual(row["facility_id"], "FACILITY-01")

    def test_get_and_approve_role_request(self):
        """Backend authority lists pending requests and approves one to provision user"""
        req_email = "pending.manager@facility.org"
        # First submit request
        res = self.client.post("/api/roles/request-access", json={
            "email": req_email,
            "name": "Pending Manager",
            "role": "manager",
            "facility_id": "FACILITY-02"
        })
        self.assertEqual(res.status_code, 201)
        req_id = res.get_json()["request_id"]

        # List pending requests
        list_res = self.client.get("/api/roles/requests?status=pending")
        self.assertEqual(list_res.status_code, 200)
        requests = list_res.get_json()
        emails = [r["email"] for r in requests]
        self.assertIn(req_email, emails)

        # Approve request
        approve_res = self.client.post("/api/roles/approve-request", json={
            "request_id": req_id,
            "action": "approve",
            "reviewer": "admin"
        })
        self.assertEqual(approve_res.status_code, 200)
        appr_data = approve_res.get_json()
        self.assertEqual(appr_data["status"], "success")
        self.assertEqual(appr_data["request_status"], "approved")
        self.assertEqual(appr_data["role"], "manager")

        # Verify user is now provisioned in database
        conn = app.get_db()
        user_row = conn.execute("SELECT role, facility_id FROM users WHERE email = ?", (req_email,)).fetchone()
        req_row = conn.execute("SELECT status FROM role_requests WHERE id = ?", (req_id,)).fetchone()
        conn.close()
        self.assertIsNotNone(user_row)
        self.assertEqual(user_row["role"], "manager")
        self.assertEqual(user_row["facility_id"], "FACILITY-02")
        self.assertEqual(req_row["status"], "approved")

    def test_reject_role_request(self):
        """Backend authority can reject an unauthorized role request"""
        req_email = "rejected.user@facility.org"
        res = self.client.post("/api/roles/request-access", json={
            "email": req_email,
            "role": "auditor",
            "facility_id": "FACILITY-01"
        })
        self.assertEqual(res.status_code, 201)
        req_id = res.get_json()["request_id"]

        reject_res = self.client.post("/api/roles/approve-request", json={
            "request_id": req_id,
            "action": "reject",
            "reviewer": "admin"
        })
        self.assertEqual(reject_res.status_code, 200)
        self.assertEqual(reject_res.get_json()["status"], "success")
        self.assertEqual(reject_res.get_json()["request_status"], "rejected")

        # User should not have received the auditor role
        conn = app.get_db()
        user_row = conn.execute("SELECT role FROM users WHERE email = ?", (req_email,)).fetchone()
        conn.close()
        # Either no user row or role is not auditor
        if user_row:
            self.assertNotEqual(user_row["role"], "auditor")

if __name__ == "__main__":
    unittest.main()
