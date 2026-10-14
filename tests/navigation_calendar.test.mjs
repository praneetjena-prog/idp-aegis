import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();

test("Sidebar IA conforms strictly to 4 categories and consolidated destinations", () => {
  const siderailPath = path.join(ROOT_DIR, "src", "components", "layout", "SideRail.jsx");
  const siderailContent = fs.readFileSync(siderailPath, "utf8");

  // Verify group titles
  assert.match(siderailContent, /title:\s*['"]MONITOR['"]/i, "SideRail must have MONITOR group");
  assert.match(
    siderailContent,
    /title:\s*['"]ASSETS & MAINTENANCE['"]/i,
    "SideRail must have ASSETS & MAINTENANCE group",
  );
  assert.match(
    siderailContent,
    /title:\s*['"]RELIABILITY & INTELLIGENCE['"]/i,
    "SideRail must have RELIABILITY & INTELLIGENCE group",
  );
  assert.match(
    siderailContent,
    /title:\s*['"]ADMINISTRATION['"]/i,
    "SideRail must have ADMINISTRATION group",
  );

  // Verify destinations
  assert.match(siderailContent, /id:\s*['"]overview['"]/, "Overview must be present");
  assert.match(siderailContent, /id:\s*['"]console['"]/, "Live Console must be present");
  assert.match(siderailContent, /id:\s*['"]alerts['"]/, "Alerts & Triage must be present");
  assert.match(siderailContent, /id:\s*['"]asset['"]/, "Asset Passports must be present");
  assert.match(
    siderailContent,
    /id:\s*['"]calendar['"]/,
    "Maintenance Calendar must be present in ASSETS & MAINTENANCE",
  );
  assert.match(
    siderailContent,
    /id:\s*['"]audit['"]/,
    "Reliability Audit must be present in RELIABILITY & INTELLIGENCE",
  );
  assert.match(
    siderailContent,
    /id:\s*['"]simulator['"]/,
    "Physics Simulator must be present in RELIABILITY & INTELLIGENCE",
  );
  assert.match(
    siderailContent,
    /id:\s*['"]settings['"]/,
    "Facility Settings must be present in ADMINISTRATION",
  );

  // Resources section must NOT be in nav groups
  assert.doesNotMatch(
    siderailContent,
    /title:\s*['"]RESOURCES['"]/i,
    "RESOURCES category must not exist",
  );
  assert.doesNotMatch(
    siderailContent,
    /id:\s*['"]platform['"]/,
    "Platform/Resources destination must not exist in SideRail groups",
  );
});

test("TopHeader has clock and redundant utility icons removed, AEGIS shield toggle present", () => {
  const headerPath = path.join(ROOT_DIR, "src", "components", "layout", "TopHeader.jsx");
  const headerContent = fs.readFileSync(headerPath, "utf8");

  // Shield icon toggle with aria-label
  assert.match(
    headerContent,
    /aria-label=["']Toggle navigation["']/,
    'TopHeader must have navigation toggle with aria-label="Toggle navigation"',
  );
  assert.match(headerContent, /Shield/, "TopHeader toggle button must use Shield icon");

  // Clock completely removed
  assert.doesNotMatch(
    headerContent,
    /useFacilityClock/,
    "TopHeader must not use facility clock hook",
  );
  assert.doesNotMatch(
    headerContent,
    /formattedTime/,
    "TopHeader must not render formattedTime clock",
  );
  assert.doesNotMatch(headerContent, /timeStr/, "TopHeader must not render timeStr");

  // 3 utility icons removed from TopHeader (relocated to sidebar)
  assert.doesNotMatch(headerContent, /toggleSound/, "Mute sound button must not be in TopHeader");
  assert.doesNotMatch(headerContent, /toggleTheme/, "Theme toggle button must not be in TopHeader");
  assert.doesNotMatch(
    headerContent,
    /SettingsModal/,
    "Settings modal/icon must not be in TopHeader",
  );
});

test("SideRail footer houses relocated utility icons (Mute, Theme, Settings/Facility)", () => {
  const siderailPath = path.join(ROOT_DIR, "src", "components", "layout", "SideRail.jsx");
  const siderailContent = fs.readFileSync(siderailPath, "utf8");

  assert.match(siderailContent, /toggleSound/, "SideRail footer must house toggleSound");
  assert.match(siderailContent, /toggleTheme/, "SideRail footer must house toggleTheme");
  assert.match(
    siderailContent,
    /UNIT-01/,
    "SideRail footer must display Facility / Unit identifier",
  );
});

test("App.jsx provides first-class routing for #audit, #alerts, and #maintenance-calendar", () => {
  const appPath = path.join(ROOT_DIR, "src", "App.jsx");
  const appContent = fs.readFileSync(appPath, "utf8");

  assert.match(appContent, /'audit'/, "VALID_TABS must include audit");
  assert.match(appContent, /'compliance'/, "VALID_TABS must include compliance alias");
  assert.match(appContent, /'alerts'/, "VALID_TABS must include alerts");
  assert.match(appContent, /'calendar'/, "VALID_TABS must include calendar");
  assert.match(
    appContent,
    /'maintenance-calendar'/,
    "VALID_TABS must include maintenance-calendar",
  );

  // Routing hash check
  assert.match(appContent, /tabName === 'audit'/, "App.jsx parseHash must handle #audit");
  assert.match(
    appContent,
    /tabName === 'maintenance-calendar'/,
    "App.jsx parseHash must handle #maintenance-calendar",
  );
  assert.match(appContent, /tabName === 'alerts'/, "App.jsx parseHash must handle #alerts");

  // Dedicated component views mounted
  assert.match(
    appContent,
    /<ReliabilityAuditView/,
    "App.jsx must mount ReliabilityAuditView for audit/compliance",
  );
  assert.match(appContent, /<AlertsTriageView/, "App.jsx must mount AlertsTriageView for alerts");
  assert.match(
    appContent,
    /<MaintenanceCalendarPage/,
    "App.jsx must mount MaintenanceCalendarPage for calendar",
  );
});

test("Responsive layout prevents mobile bottom bar replacement on desktop and laptop zoom levels", () => {
  const siderailPath = path.join(ROOT_DIR, "src", "components", "layout", "SideRail.jsx");
  const siderailContent = fs.readFileSync(siderailPath, "utf8");

  // Must not have xl:hidden fixed bottom-0 bar
  assert.doesNotMatch(
    siderailContent,
    /fixed bottom-0/,
    "SideRail must not render a fixed bottom navigation bar",
  );
  // Uses md: breakpoint for desktop/tablet preservation
  assert.match(
    siderailContent,
    /hidden md:flex/,
    "Desktop SideRail must use md: breakpoint (768px+) instead of xl: (1280px+)",
  );
});

test("Maintenance Calendar supports external provider integrations (Google, Microsoft, iCal)", () => {
  const calendarPath = path.join(
    ROOT_DIR,
    "src",
    "components",
    "dashboard",
    "MaintenanceCalendarPage.jsx",
  );
  const calendarContent = fs.readFileSync(calendarPath, "utf8");

  assert.match(calendarContent, /Google Calendar/, "Calendar page must support Google Calendar");
  assert.match(
    calendarContent,
    /Microsoft 365 \/ Outlook/,
    "Calendar page must support Microsoft Outlook",
  );
  assert.match(
    calendarContent,
    /iCalendar \/ ICS Subscription Feed/,
    "Calendar page must support iCalendar Feed",
  );
  assert.match(calendarContent, /\.ics/, "Calendar page must support .ics import and export");
});

test("Calendar launch handlers and ErrorBoundary protect against white-screen crashes", () => {
  const appPath = path.join(ROOT_DIR, "src", "App.jsx");
  const appContent = fs.readFileSync(appPath, "utf8");

  // No obsolete undefined modal calls
  assert.doesNotMatch(
    appContent,
    /setShowCalendarModal/,
    "Obsolete setShowCalendarModal must not exist in App.jsx",
  );

  // HomePage onOpenCalendar calls setTab('calendar')
  assert.match(
    appContent,
    /onOpenCalendar=\{[^}]*setTab\('calendar'\)/,
    "HomePage onOpenCalendar must route to calendar tab",
  );

  // OperationalCockpit calls useAuth to safely access roleConfig
  assert.match(
    appContent,
    /const\s*\{\s*roleConfig\s*\}\s*=\s*useAuth\(\)/,
    "OperationalCockpit must obtain roleConfig from useAuth",
  );

  // ErrorBoundary is imported and wraps main content
  assert.match(
    appContent,
    /import\s*\{\s*ErrorBoundary\s*\}\s*from/,
    "App.jsx must import ErrorBoundary",
  );
  assert.match(
    appContent,
    /<ErrorBoundary/,
    "OperationalCockpit must wrap main content in ErrorBoundary",
  );
});
