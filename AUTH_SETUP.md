# AEGIS — Google OAuth & Supabase RBAC Configuration Guide

This document details the configuration required to activate real Google OAuth, database-assigned facility role-based access control (RBAC), and Row Level Security (RLS) in AEGIS.

> **IMPORTANT NOTICE:**  
> Code changes in this repository establish the frontend authentication architecture and database migration policies. Real Google OAuth and Supabase Auth require an operator with administrative credentials to perform external dashboard configurations in **Google Cloud Console** and **Supabase Dashboard**. The platform will remain in fail-closed / unconfigured state until these external steps are completed.

---

## 1. Google Cloud Console Configuration

### Step 1.1: Create or Select Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select an existing project or create a new project named `aegis-open-bms`.

### Step 1.2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services** → **OAuth consent screen**.
2. Select User Type:
   - **Internal** (if deploying strictly within a Google Workspace organization), or
   - **External** (if allowing any Google account; requires adding test users while in "Testing" mode).
3. Fill in the required application identity fields:
   - **App name:** `AEGIS Facility Intelligence`
   - **User support email:** Select your administrator email.
   - **Developer contact information:** Your administrator email.
4. Scopes:
   - Request standard open identity scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   - Do NOT request sensitive, drive, or calendar administrative write scopes.
5. Save and continue.

### Step 1.3: Create Web Application OAuth Client ID
1. Navigate to **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth client ID**.
3. Application Type: **Web application**.
4. Name: `AEGIS Web Client`.
5. **Authorized JavaScript origins:**
   - Development: `http://localhost:8080`
   - Development (IP): `http://127.0.0.1:8080`
   - Production / GitHub Pages: `https://praneetjena-prog.github.io`
6. **Authorized redirect URIs:**
   - Add the exact Supabase authentication callback URI found in your Supabase project under **Authentication** → **Providers** → **Google**:
     `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
7. Click **Create**.
8. Securely save the generated **Client ID** and **Client Secret**.

---

## 2. Supabase Dashboard Configuration

### Step 2.1: Enable Google Authentication Provider
1. Log in to the [Supabase Dashboard](https://app.supabase.com/) and open your AEGIS project.
2. In the left sidebar, navigate to **Authentication** → **Providers**.
3. Locate **Google** and toggle it **Enabled**.
4. Enter your credentials obtained from Google Cloud:
   - **Client ID (for OAuth)**: Paste your Google Client ID.
   - **Client Secret (for OAuth)**: Paste your Google Client Secret.
5. Ensure the callback URL displayed matches what you registered in Google Cloud:
   `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
6. Click **Save**.

### Step 2.2: Configure Site URL & Redirect URLs
1. Navigate to **Authentication** → **URL Configuration**.
2. Set **Site URL**:
   - Local: `http://localhost:8080/` (or your production deployment `https://praneetjena-prog.github.io/idp-aegis/`).
3. Under **Redirect URLs**, add all valid callback destinations:
   - `http://localhost:8080/`
   - `http://localhost:8080/index.html`
   - `http://127.0.0.1:8080/`
   - `https://praneetjena-prog.github.io/idp-aegis/`
4. Click **Save**.

---

## 3. Database Schema & Migration Execution

### Step 3.1: Apply Migration `0003_secure_oauth_role_assignment.sql`
In your Supabase project, navigate to the **SQL Editor** and run the statements from:
`drizzle/migrations/0003_secure_oauth_role_assignment.sql`

This migration guarantees:
1. `public.profiles` contains columns `id`, `email`, `full_name`, `avatar_url`, `role`, and `facility_id`.
2. Newly created profiles automatically default to `role = 'feature_user'`.
3. Row Level Security (RLS) is enabled with strict policies:
   - Authenticated users can only read their own profile (`auth.uid() = id`).
   - Client-side insertions and updates are revoked; profiles are populated exclusively by the `SECURITY DEFINER` auth trigger `public.handle_new_user()`.
4. The trigger preserves administrator-assigned roles and facility assignments across subsequent sign-ins.

---

## 4. Administrative Role & Facility Provisioning

In accordance with AEGIS zero-trust security policy, signing in with Google verifies identity but grants only **Feature Explorer** access (`role = 'feature_user'`).

### Supported Role Values
1. `feature_user` — Default tier. Explores architecture, BOM specifications, and non-sensitive educational documentation. Restricted from operational telemetry.
2. `technician` — Field inspections, LOTO protocols, asset passports, work orders.
3. `manager` — Operations lead with fleet SCADA telemetry, threshold configurations, triage dispatch.
4. `auditor` — Read-only compliance auditor with ISO 10816 evaluation and raw CSV exports.

### Provisioning a Facility Role
Once a user has signed in at least once via Google, an authorized administrator runs an administrative SQL update in the Supabase SQL Editor:

```sql
-- Example 1: Assigning Operations Lead to Facility Unit 01
UPDATE public.profiles
SET
  role = 'manager',
  facility_id = 'FACILITY-01',
  updated_at = now()
WHERE email = 'operations.lead@yourdomain.com';

-- Example 2: Assigning Field Technician
UPDATE public.profiles
SET
  role = 'technician',
  facility_id = 'FACILITY-01',
  updated_at = now()
WHERE email = 'technician.field@yourdomain.com';

-- Example 3: Assigning Reliability Auditor
UPDATE public.profiles
SET
  role = 'auditor',
  facility_id = 'FACILITY-01',
  updated_at = now()
WHERE email = 'compliance.auditor@yourdomain.com';
```

> **Note on Facility Isolation:**  
> A user assigned `role = 'technician'` without a non-empty `facility_id` will fail closed to Feature Explorer mode (`#platform`) until a valid facility assignment is provisioned.

---

## 5. Local Frontend Environment Configuration

Create a `.env` or `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY>
VITE_DEFAULT_FEED_MODE=fault
```

Start the application:
```bash
npm run dev
```
The application will launch on `http://localhost:8080`.

---

## 6. Backend API & Security Boundary Analysis

The Flask telemetry server (`backend/app.py`) operates alongside the React frontend. The table below identifies the security posture of each endpoint:

| Endpoint | Method | Intended Caller | Authorization Enforcement |
|---|---|---|---|
| `/` | GET | Monitoring / Public | Unrestricted health metadata |
| `/api/health` | GET | Edge Gateway / Liveness | Unrestricted health status |
| `/api/feature-docs` | GET | `feature_user` / Public | Unrestricted static documentation & design fixtures |
| `/api/users/sync` | POST | Supabase Auth webhook / mirror | Fails closed: defaults role to `feature_user`; ignores client role elevation |
| `/api/users` | GET | Facility Administrator | Restricts `feature_user` callers (returns 403 Forbidden) |
| `/api/latest` | GET | Operational Console (`manager`, `technician`, `auditor`) | Restricts `feature_user` and missing facility callers (returns 403 Forbidden) |
| `/api/history` | GET | Operational Console (`manager`, `auditor`) | Restricts `feature_user` and missing facility callers (returns 403 Forbidden) |
| `/api/stats` | GET | Operational Console (`manager`, `auditor`) | Restricts `feature_user` and missing facility callers (returns 403 Forbidden) |
| `/api/sensor-data` | POST | ESP32 Hardware / Wokwi Simulation | Edge telemetry ingestion. Unauthenticated in standalone local mode. |
| `/api/public/ingest`| POST | ESP32 Hardware / Wokwi Simulation | Edge telemetry ingestion. Unauthenticated in standalone local mode. |

### Remaining Backend Exposure & Mitigation
1. **Edge Node Ingestion (`/api/sensor-data`):**  
   Edge microcontrollers (ESP32 DevKit) currently push telemetry directly via HTTP POST. For production deployments with internet-facing ingress, hardware nodes should be provisioned with symmetric device ingestion keys or mutual TLS (mTLS) as defined in `drizzle/migrations/0000_create_sensor_platform.sql` (`devices.ingest_key`), rather than accepting unauthenticated POST payloads.
2. **End-to-End Cryptographic Verification:**  
   When running the standalone Flask server decoupled from Supabase, bearer tokens are parsed and checked against SQLite user records. In enterprise production deployments, configure Supabase JWT signature verification with the Supabase JWT secret in Flask or proxy all API requests through Supabase Edge Functions.
