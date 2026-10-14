import unittest
import os
import json
import sqlite3
import tempfile
from unittest.mock import patch, MagicMock

import app


class TestCalendarIntegrations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.app.config["TESTING"] = True
        cls.client = app.app.test_client()

    def setUp(self):
        # Reset tables before each test
        conn = app.get_db()
        conn.execute("DELETE FROM calendar_integrations")
        conn.execute("DELETE FROM synced_calendar_events")
        conn.commit()
        conn.close()

    def test_calendar_status_endpoint(self):
        """Test GET /api/calendar/status returns all providers with configuration details."""
        resp = self.client.get("/api/calendar/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()

        self.assertIn("google", data)
        self.assertIn("microsoft", data)
        self.assertIn("ical", data)

        self.assertIn("configured", data["google"])
        self.assertIn("connected", data["google"])
        self.assertIn("sync_direction", data["google"])
        self.assertIn("feed_url", data["ical"])

    def test_calendar_events_retrieval(self):
        """Test GET /api/calendar/events returns seeded maintenance tasks."""
        resp = self.client.get("/api/calendar/events")
        self.assertEqual(resp.status_code, 200)
        events = resp.get_json()
        self.assertIsInstance(events, list)
        self.assertGreater(len(events), 0)

        ahu = next((e for e in events if e.get("asset_code") == "AHU-03"), None)
        self.assertIsNotNone(ahu)
        self.assertIn("Bearing Overhaul", ahu["title"])

    def test_create_and_update_event(self):
        """Test POST /api/calendar/events and PUT /api/calendar/events/<id>."""
        new_event = {
            "id": "test-pm-unit99",
            "asset_id": "unit-99",
            "asset_code": "UNIT-99",
            "title": "Quarterly Filter Calibration",
            "subsystem": "Air Handling",
            "date": "2026-11-01",
            "start_time": "10:00",
            "end_time": "12:00",
            "technician": "A. Kumar",
            "priority": "nominal"
        }
        create_resp = self.client.post("/api/calendar/events", json=new_event)
        self.assertEqual(create_resp.status_code, 201)

        # Verify created
        get_resp = self.client.get("/api/calendar/events?asset_id=unit-99")
        events = get_resp.get_json()
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["title"], "Quarterly Filter Calibration")

        # Update event
        update_resp = self.client.put(
            "/api/calendar/events/test-pm-unit99",
            json={"status": "completed", "priority": "critical"}
        )
        self.assertEqual(update_resp.status_code, 200)

        # Verify updated
        get_resp2 = self.client.get("/api/calendar/events?asset_id=unit-99")
        events2 = get_resp2.get_json()
        self.assertEqual(events2[0]["status"], "completed")
        self.assertEqual(events2[0]["priority"], "critical")

        # Cleanup
        self.client.delete("/api/calendar/events/test-pm-unit99")

    def test_ical_feed_generation(self):
        """Test GET /api/calendar/feed.ics returns RFC 5545 iCalendar stream."""
        resp = self.client.get("/api/calendar/feed.ics")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.mimetype, "text/calendar")
        content = resp.data.decode("utf-8")

        self.assertIn("BEGIN:VCALENDAR", content)
        self.assertIn("VERSION:2.0", content)
        self.assertIn("BEGIN:VEVENT", content)
        self.assertIn("SUMMARY:AEGIS PM: AHU-03", content)
        self.assertIn("END:VCALENDAR", content)

    def test_ical_import_and_deduplication(self):
        """Test POST /api/calendar/ics/import parses VEVENTs and skips duplicates."""
        sample_ics = (
            "BEGIN:VCALENDAR\r\n"
            "VERSION:2.0\r\n"
            "PRODID:-//Test//EN\r\n"
            "BEGIN:VEVENT\r\n"
            "UID:ext-import-001\r\n"
            "DTSTART:20261115T090000Z\r\n"
            "DTEND:20261115T110000Z\r\n"
            "SUMMARY:Aegis PM: PUMP-05 • Impeller Clearance Check\r\n"
            "LOCATION:Pump House West\r\n"
            "DESCRIPTION:Quarterly impeller clearance gauge verification\r\n"
            "END:VEVENT\r\n"
            "END:VCALENDAR\r\n"
        )

        resp = self.client.post("/api/calendar/ics/import", json={"content": sample_ics})
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data["imported_count"], 1)
        self.assertEqual(data["duplicate_count"], 0)

        # Re-importing same ICS stream must skip duplicate UID
        resp2 = self.client.post("/api/calendar/ics/import", json={"content": sample_ics})
        self.assertEqual(resp2.status_code, 200)
        data2 = resp2.get_json()
        self.assertEqual(data2["imported_count"], 0)
        self.assertEqual(data2["duplicate_count"], 1)

        # Cleanup
        self.client.delete("/api/calendar/events/ext-import-001")

    def test_unconfigured_google_calendar_reports_clear_error(self):
        """Verify unconfigured Google OAuth reports honest error and required env vars."""
        with patch.dict(os.environ, {"GOOGLE_CLIENT_ID": "", "GOOGLE_CLIENT_SECRET": ""}, clear=True):
            resp = self.client.get("/api/calendar/google/auth-url")
            self.assertEqual(resp.status_code, 400)
            data = resp.get_json()
            self.assertFalse(data["configured"])
            self.assertIn("GOOGLE_CLIENT_ID", data["required_env_vars"])

    def test_configured_google_calendar_generates_auth_url(self):
        """Verify configured Google OAuth generates valid authorization URL with correct scopes."""
        with patch.dict(os.environ, {
            "GOOGLE_CLIENT_ID": "test-google-id.apps.googleusercontent.com",
            "GOOGLE_CLIENT_SECRET": "test-google-secret",
            "GOOGLE_REDIRECT_URI": "http://localhost:5000/api/calendar/google/callback"
        }):
            resp = self.client.get("/api/calendar/google/auth-url")
            self.assertEqual(resp.status_code, 200)
            data = resp.get_json()
            self.assertTrue(data["configured"])
            self.assertIn("accounts.google.com/o/oauth2/v2/auth", data["auth_url"])
            self.assertIn("test-google-id.apps.googleusercontent.com", data["auth_url"])
            self.assertIn("calendar.events", data["auth_url"])

    def test_unconfigured_microsoft_calendar_reports_clear_error(self):
        """Verify unconfigured Microsoft OAuth reports honest error."""
        with patch.dict(os.environ, {"MICROSOFT_CLIENT_ID": "", "MICROSOFT_CLIENT_SECRET": ""}, clear=True):
            resp = self.client.get("/api/calendar/microsoft/auth-url")
            self.assertEqual(resp.status_code, 400)
            data = resp.get_json()
            self.assertFalse(data["configured"])
            self.assertIn("MICROSOFT_CLIENT_ID", data["required_env_vars"])

    def test_configured_microsoft_calendar_generates_auth_url(self):
        """Verify configured Microsoft OAuth generates valid Graph authorization URL."""
        with patch.dict(os.environ, {
            "MICROSOFT_CLIENT_ID": "test-ms-client-id",
            "MICROSOFT_CLIENT_SECRET": "test-ms-secret",
            "MICROSOFT_TENANT_ID": "common",
            "MICROSOFT_REDIRECT_URI": "http://localhost:5000/api/calendar/microsoft/callback"
        }):
            resp = self.client.get("/api/calendar/microsoft/auth-url")
            self.assertEqual(resp.status_code, 200)
            data = resp.get_json()
            self.assertTrue(data["configured"])
            self.assertIn("login.microsoftonline.com/common/oauth2/v2.0/authorize", data["auth_url"])
            self.assertIn("test-ms-client-id", data["auth_url"])
            self.assertIn("Calendars.ReadWrite", data["auth_url"])

    def test_calendar_disconnect(self):
        """Test disconnecting Google and Microsoft calendar integrations."""
        conn = app.get_db()
        conn.execute("""
            INSERT INTO calendar_integrations (user_id, provider, account_email, access_token)
            VALUES ('test-user', 'google', 'user@example.com', 'dummy-token')
        """)
        conn.commit()
        conn.close()

        disc_resp = self.client.post("/api/calendar/google/disconnect", json={"user_id": "test-user"})
        self.assertEqual(disc_resp.status_code, 200)
        self.assertEqual(disc_resp.get_json()["status"], "disconnected")

        # Verify deleted
        conn = app.get_db()
        cur = conn.execute("SELECT * FROM calendar_integrations WHERE user_id = 'test-user'")
        self.assertIsNone(cur.fetchone())
        conn.close()


if __name__ == "__main__":
    unittest.main()
