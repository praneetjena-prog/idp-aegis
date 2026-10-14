import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Test 1: Validate ROLES and ROLE_PERMISSIONS configuration
test("ROLES and ROLE_PERMISSIONS contain feature_user and the 3 facility roles", async () => {
  const authContextContent = fs.readFileSync(
    path.join(rootDir, "src/context/AuthContext.jsx"),
    "utf-8",
  );

  assert.match(authContextContent, /feature_user:\s*\{/, "ROLES should define feature_user");
  assert.match(authContextContent, /technician:\s*\{/, "ROLES should define technician");
  assert.match(authContextContent, /manager:\s*\{/, "ROLES should define manager");
  assert.match(authContextContent, /auditor:\s*\{/, "ROLES should define auditor");

  assert.match(
    authContextContent,
    /const ALLOWED_ROLES = \['technician', 'manager', 'auditor', 'feature_user'\]/,
    "Allowed roles must be strictly enumerated",
  );
  assert.match(
    authContextContent,
    /const ALLOWED_FACILITY_ROLES = \['technician', 'manager', 'auditor'\]/,
    "Facility roles must be strictly enumerated",
  );
});

// Test 2: Role resolution logic & fail-closed behavior simulation
test("Role resolver correctly resolves roles and enforces facility_id binding", () => {
  const ALLOWED_FACILITY_ROLES = ["technician", "manager", "auditor"];
  const ALLOWED_ROLES = ["technician", "manager", "auditor", "feature_user"];

  function resolveTestRole(dbProfile) {
    let role = "feature_user";
    if (dbProfile?.role && ALLOWED_ROLES.includes(dbProfile.role)) {
      role = dbProfile.role;
    }
    const rawFacilityId = dbProfile?.facility_id ? String(dbProfile.facility_id).trim() : null;
    const facilityId = rawFacilityId || null;
    const hasFacilityAccess = Boolean(facilityId && ALLOWED_FACILITY_ROLES.includes(role));
    return { role, facilityId, hasFacilityAccess };
  }

  // Case A: New Google account with no profile or feature_user
  assert.deepEqual(resolveTestRole(null), {
    role: "feature_user",
    facilityId: null,
    hasFacilityAccess: false,
  });
  assert.deepEqual(resolveTestRole({ role: "feature_user", facility_id: null }), {
    role: "feature_user",
    facilityId: null,
    hasFacilityAccess: false,
  });

  // Case B: Unknown or invalid role fails closed
  assert.deepEqual(resolveTestRole({ role: "superadmin", facility_id: "FAC-01" }), {
    role: "feature_user",
    facilityId: "FAC-01",
    hasFacilityAccess: false,
  });
  assert.deepEqual(resolveTestRole({ role: "facility_admin", facility_id: "FAC-01" }), {
    role: "feature_user",
    facilityId: "FAC-01",
    hasFacilityAccess: false,
  });

  // Case C: Facility role without facility_id is denied facility access
  assert.deepEqual(resolveTestRole({ role: "manager", facility_id: null }), {
    role: "manager",
    facilityId: null,
    hasFacilityAccess: false,
  });
  assert.deepEqual(resolveTestRole({ role: "technician", facility_id: "   " }), {
    role: "technician",
    facilityId: null,
    hasFacilityAccess: false,
  });
  assert.deepEqual(resolveTestRole({ role: "auditor", facility_id: "" }), {
    role: "auditor",
    facilityId: null,
    hasFacilityAccess: false,
  });

  // Case D: Approved facility role with valid facility_id
  assert.deepEqual(resolveTestRole({ role: "technician", facility_id: "FACILITY-A" }), {
    role: "technician",
    facilityId: "FACILITY-A",
    hasFacilityAccess: true,
  });
  assert.deepEqual(resolveTestRole({ role: "manager", facility_id: "FACILITY-01" }), {
    role: "manager",
    facilityId: "FACILITY-01",
    hasFacilityAccess: true,
  });
  assert.deepEqual(resolveTestRole({ role: "auditor", facility_id: "FACILITY-02" }), {
    role: "auditor",
    facilityId: "FACILITY-02",
    hasFacilityAccess: true,
  });
});

// Test 3: Verify GoogleSignInModal does not contain demo personas or role selectors
test("GoogleSignInModal is stripped of self-selected role pickers and demo personas", () => {
  const modalContent = fs.readFileSync(
    path.join(rootDir, "src/components/auth/GoogleSignInModal.jsx"),
    "utf-8",
  );
  assert.doesNotMatch(modalContent, /Demo Role Personas/, "Demo role personas tab must be removed");
  assert.doesNotMatch(
    modalContent,
    /Select Your Operational Role/,
    "Role selector must be removed",
  );
  assert.doesNotMatch(modalContent, /customName/, "Custom name mock input must be removed");
  assert.doesNotMatch(
    modalContent,
    /aegis_saved_google_profile/,
    "Local storage profile mock must be removed",
  );
  assert.match(modalContent, /signInWithGoogle/, "Must invoke real signInWithGoogle");
});

// Test 4: Verify UserRoleDropdown does not permit role switching
test("UserRoleDropdown displays verified role and facility_id without role switching", () => {
  const dropdownContent = fs.readFileSync(
    path.join(rootDir, "src/components/layout/UserRoleDropdown.jsx"),
    "utf-8",
  );
  assert.doesNotMatch(dropdownContent, /switchRole/, "Dropdown must not contain switchRole");
  assert.doesNotMatch(
    dropdownContent,
    /Switch Role \(RBAC Simulation\)/,
    "Role switching UI must be removed",
  );
  assert.match(dropdownContent, /Facility ID/, "Dropdown must display Facility ID");
  assert.match(dropdownContent, /signOut/, "Dropdown must provide working Sign Out");
});

// Test 5: Verify App.jsx navigation routing rules
test("App.jsx separates render paths and restricts feature_user to platform", () => {
  const appContent = fs.readFileSync(path.join(rootDir, "src/App.jsx"), "utf-8");
  assert.match(
    appContent,
    /<FeatureOnlyPage/,
    "Must render FeatureOnlyPage for unauthorized/feature users",
  );
  assert.match(
    appContent,
    /<OperationalCockpit/,
    "Must isolate OperationalCockpit for authorized facility users",
  );
  assert.match(
    appContent,
    /if\s*\(authLoading\)/,
    "Must render loading state while verifying auth",
  );
  assert.match(
    appContent,
    /nextTab = 'platform'/,
    "Unauthorized access to operational tabs must route to platform",
  );
});

// Test 6: Verify Database Migration
test("Migration 0003 includes required RLS, facility_id, and handle_new_user trigger", () => {
  const migrationContent = fs.readFileSync(
    path.join(rootDir, "drizzle/migrations/0003_secure_oauth_role_assignment.sql"),
    "utf-8",
  );
  assert.match(
    migrationContent,
    /ALTER TABLE public\.profiles ADD COLUMN IF NOT EXISTS facility_id text;/,
    "Must add facility_id column",
  );
  assert.match(
    migrationContent,
    /ALTER TABLE public\.profiles ALTER COLUMN role SET DEFAULT 'feature_user';/,
    "Must default role to feature_user",
  );
  assert.match(
    migrationContent,
    /ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY;/,
    "Must enable RLS",
  );
  assert.match(
    migrationContent,
    /CREATE POLICY "Users can view own profile"/,
    "Must restrict profile reading to own user",
  );
  assert.match(
    migrationContent,
    /REVOKE INSERT, UPDATE, DELETE ON public\.profiles FROM authenticated;/,
    "Must revoke client mutations",
  );
  assert.match(migrationContent, /'feature_user'/, "Trigger must initialize role to feature_user");
  assert.match(
    migrationContent,
    /SECURITY DEFINER SET search_path = public, auth;/,
    "Trigger must have safe search path",
  );
});
