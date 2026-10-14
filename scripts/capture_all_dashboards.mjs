import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\Users\\DEVANSH\\Downloads\\AEGIS Dash screenshots";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
  // Clear any existing screenshots to prevent clutter
  const files = fs.readdirSync(OUTPUT_DIR);
  for (const f of files) {
    if (f.endsWith(".png")) {
      fs.unlinkSync(path.join(OUTPUT_DIR, f));
    }
  }
}

const AUTH_TOKEN_KEY = "sb-leyghtpchjfrqutcircu-auth-token";
const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

// Verified Technician session (devanshmishra3108@gmail.com in assigned_roles.json)
const techJwt =
  b64({ alg: "HS256", typ: "JWT" }) +
  "." +
  b64({
    sub: "29f5cf37-663a-49f8-a1b9-16a5569c7b66",
    email: "devanshmishra3108@gmail.com",
    role: "authenticated",
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 999999,
  }) +
  ".fakesig";

const technicianSession = {
  access_token: techJwt,
  token_type: "bearer",
  expires_in: 999999,
  expires_at: Math.floor(Date.now() / 1000) + 999999,
  refresh_token: "fake-refresh",
  user: {
    id: "29f5cf37-663a-49f8-a1b9-16a5569c7b66",
    aud: "authenticated",
    role: "authenticated",
    email: "devanshmishra3108@gmail.com",
    user_metadata: { name: "Devansh Mishra" },
  },
};

// Ordinary Visitor / Feature User session (Not in assigned_roles.json -> locked to #platform)
const visitorJwt =
  b64({ alg: "HS256", typ: "JWT" }) +
  "." +
  b64({
    sub: "visitor-uuid-889911-public",
    email: "ordinary.visitor@gmail.com",
    role: "authenticated",
    aud: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 999999,
  }) +
  ".fakesig";

const visitorSession = {
  access_token: visitorJwt,
  token_type: "bearer",
  expires_in: 999999,
  expires_at: Math.floor(Date.now() / 1000) + 999999,
  refresh_token: "fake-refresh-visitor",
  user: {
    id: "visitor-uuid-889911-public",
    aud: "authenticated",
    role: "authenticated",
    email: "ordinary.visitor@gmail.com",
    user_metadata: { name: "Ordinary Explorer" },
  },
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("================================================================");
  console.log("   AEGIS DASHBOARD COMPREHENSIVE SCREENSHOT SUITE");
  console.log(`   Destination: ${OUTPUT_DIR}`);
  console.log("================================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1680,950",
      "--force-device-scale-factor=1.5",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 920, deviceScaleFactor: 1.5 });

  console.log("[1/8] Injecting verified technician session...");
  await page.goto("http://localhost:8080");
  await page.evaluate(
    (authKey, authData) => {
      window.localStorage.setItem(authKey, JSON.stringify(authData));
      window.localStorage.setItem(
        "aegis_role_devanshmishra3108@gmail.com",
        JSON.stringify({ role: "technician", facility_id: "FACILITY-01" }),
      );
      window.localStorage.setItem("aegis-theme", "light");
    },
    AUTH_TOKEN_KEY,
    technicianSession,
  );

  await page.reload({ waitUntil: "networkidle0" });
  await sleep(1500);

  async function snap(filename, waitMs = 500) {
    if (waitMs > 0) await sleep(waitMs);
    const targetPath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`  ✓ Saved: ${filename}`);
  }

  async function snapFull(filename, waitMs = 800) {
    if (waitMs > 0) await sleep(waitMs);
    const targetPath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: true });
    console.log(`  ★ Saved [Full-Page]: ${filename}`);
  }

  async function clickTab(label) {
    await page.evaluate((lbl) => {
      // 1. Direct match on aria-label
      let btn = document.querySelector(`button[aria-label="${lbl}"]`);
      if (btn) {
        btn.click();
        return;
      }

      // 2. Partial match on aria-label or text
      const allBtns = Array.from(document.querySelectorAll("button"));
      btn = allBtns.find((b) => {
        const al = (b.getAttribute("aria-label") || "").toLowerCase();
        const tc = (b.textContent || "").trim().toLowerCase();
        const target = lbl.toLowerCase();
        return al.includes(target) || tc.includes(target);
      });
      if (btn) btn.click();
    }, label);
    await sleep(1000);
  }

  async function closeModal() {
    await page.evaluate(() => {
      const closeBtns = Array.from(document.querySelectorAll("button")).filter((b) => {
        const al = (b.getAttribute("aria-label") || "").toLowerCase();
        const tc = (b.textContent || "").trim().toLowerCase();
        return al.includes("close") || tc === "close" || tc === "cancel";
      });
      if (closeBtns.length > 0) {
        closeBtns[closeBtns.length - 1].click();
      }
    });
    await page.keyboard.press("Escape");
    await sleep(600);
  }

  // =========================================================================
  // 1. OPERATIONS CONSOLE (#console)
  // =========================================================================
  console.log("\n[2/8] Capturing: Live Operations Console (#console)...");
  await clickTab("Live Console");

  // 1.1 Un-scrolled top view
  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("01_Console_01_TopView_Status_and_LiveTicker.png");

  // 1.2 Scrolled: Building Subsystems Grid
  await page.evaluate(() => window.scrollTo({ top: 380, behavior: "instant" }));
  await snap("01_Console_02_Scrolled_BuildingSubsystems_Grid.png");

  // 1.3 Scrolled: Failure Forecast RUL Cards & Dispatched Work Orders
  await page.evaluate(() => window.scrollTo({ top: 780, behavior: "instant" }));
  await snap("01_Console_03_Scrolled_FailureForecast_and_WorkOrders.png");

  // 1.4 Full-page complete view of Console
  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("01_Console_FullPage_CompleteDashboard.png");

  // 1.5 Drilldown into Subsystem Detail
  console.log("  -> Drilling down into Subsystem Detail (AHU-03 Supply Fan)...");
  const clickedSubsystem = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll("div, button")).find(
      (el) =>
        el.textContent &&
        el.textContent.includes("AHU-03") &&
        el.textContent.includes("Supply Fan"),
    );
    if (card) {
      card.click();
      return true;
    }
    return false;
  });

  if (clickedSubsystem) {
    await sleep(1000);
    await page.evaluate(() => window.scrollTo(0, 160));
    await snap("01_Console_Drilldown_AHU03_LiveSensors_and_Trends.png");

    await page.evaluate(() => window.scrollTo({ top: 680, behavior: "instant" }));
    await snap("01_Console_Drilldown_AHU03_Scrolled_RootCause_and_Specs.png");

    await page.evaluate(() => window.scrollTo(0, 0));
    await snapFull("01_Console_Drilldown_AHU03_FullPage.png");

    // Return to console
    await page.evaluate(() => {
      const retBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent && b.textContent.includes("Return to Facility Console"),
      );
      if (retBtn) retBtn.click();
    });
    await sleep(600);
  }

  // =========================================================================
  // 2. FACILITY OVERVIEW (#overview)
  // =========================================================================
  console.log("\n[3/8] Capturing: Facility Overview Dashboard (#overview)...");
  await clickTab("Overview");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("02_Overview_01_TopView_FacilitySummary_and_Spotlight.png");

  await page.evaluate(() => window.scrollTo({ top: 450, behavior: "instant" }));
  await snap("02_Overview_02_Scrolled_Subsystems_and_Actions.png");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("02_Overview_FullPage_CompleteDashboard.png");

  // =========================================================================
  // 3. DEEP ANALYSIS & COMPLIANCE (#analysis)
  // =========================================================================
  console.log("\n[4/8] Capturing: Analysis & Triage Queue (#analysis)...");
  await clickTab("Diagnostics");

  // 3.1 Root Cause Inspector & Active Triage Queue
  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("03_Analysis_01_TopView_RootCauseInspector_and_TriageQueue.png");

  // 3.2 ISO 10816 Auditor Compliance Subtab
  await page.evaluate(() => {
    const compBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent && b.textContent.includes("Compliance & Audit"),
    );
    if (compBtn) compBtn.click();
  });
  await sleep(600);
  await snap("03_Analysis_02_Scrolled_AuditorCompliance_ISO10816.png");

  // 3.3 Telemetry & Trends Subtab
  await page.evaluate(() => {
    const telBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent && b.textContent.includes("Telemetry & Trends"),
    );
    if (telBtn) telBtn.click();
  });
  await sleep(600);
  await snap("03_Analysis_03_Scrolled_24HTelemetry_CorrelationChart.png");

  // 3.4 Maintenance & SOP Subtab
  await page.evaluate(() => {
    const sopBtn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent && b.textContent.includes("Maintenance & SOP"),
    );
    if (sopBtn) sopBtn.click();
  });
  await sleep(600);
  await snap("03_Analysis_04_Scrolled_MaintenanceChecklist_LOTO.png");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("03_Analysis_FullPage_CompleteDashboard.png");

  // =========================================================================
  // 4. SCENARIO SIMULATOR (#simulator)
  // =========================================================================
  console.log("\n[5/8] Capturing: Scenario Simulator (#simulator)...");
  await clickTab("Physics Simulator");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("04_Simulator_01_TopView_DegradationSliders_and_Controls.png");

  await page.evaluate(() => window.scrollTo({ top: 520, behavior: "instant" }));
  await snap("04_Simulator_02_Scrolled_WearCurve_and_PhysicsModel.png");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("04_Simulator_FullPage_CompleteDashboard.png");

  // =========================================================================
  // 5. ASSET PASSPORT / DIGITAL TWIN (#asset/ahu-03)
  // =========================================================================
  console.log("\n[6/8] Capturing: Asset Passport (#asset/ahu-03)...");
  await clickTab("Asset Passports");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("05_AssetPassport_01_TopView_DigitalTwin_Specs_and_Sensors.png");

  await page.evaluate(() => window.scrollTo({ top: 520, behavior: "instant" }));
  await snap("05_AssetPassport_02_Scrolled_MaintenanceHistory_Timeline.png");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("05_AssetPassport_FullPage_CompleteDashboard.png");

  // =========================================================================
  // 6. PLATFORM ARCHITECTURE & SPECIFICATIONS (#platform)
  // =========================================================================
  console.log("\n[7/8] Capturing: Platform Architecture & Specifications (#platform)...");
  await clickTab("Platform Guide");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("06_Platform_01_TopView_MonitoredMachines_and_Bottlenecks.png");

  await page.evaluate(() => window.scrollTo({ top: 650, behavior: "instant" }));
  await snap("06_Platform_02_Scrolled_ComparisonMatrix_vs_Existing.png");

  await page.evaluate(() => window.scrollTo({ top: 1250, behavior: "instant" }));
  await snap("06_Platform_03_Scrolled_5OperationalPillars_Workflow.png");

  await page.evaluate(() => window.scrollTo({ top: 1750, behavior: "instant" }));
  await snap("06_Platform_04_Scrolled_SystemArchitecture_Flowchart.png");

  await page.evaluate(() => window.scrollTo({ top: 2250, behavior: "instant" }));
  await snap("06_Platform_05_Scrolled_HardwareLayer_DemocratizedBOM.png");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("06_Platform_FullPage_CompleteDashboard.png");

  // =========================================================================
  // 7. OPERATIONAL MODALS & OVERLAYS
  // =========================================================================
  console.log("\n[8/8] Capturing: Operational Modals & Overlays...");
  await clickTab("Live Console");
  await sleep(600);

  // 7.1 Field Sheet Modal
  const openedFieldSheet = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent && b.textContent.includes("Field Sheet"),
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (openedFieldSheet) {
    await sleep(700);
    await snap("07_Modal_PrintableFieldSheet_Checklist.png");
    await closeModal();
  }

  // 7.2 Machine QR Tag Modal
  const openedQr = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        b.textContent && (b.textContent.includes("QR Sticker") || b.textContent.includes("QR Tag")),
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (openedQr) {
    await sleep(700);
    await snap("07_Modal_AssetQRTag_MachineLabel.png");
    await closeModal();
  }

  // 7.3 Maintenance Calendar Modal
  const openedCalendar = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        (b.textContent &&
          (b.textContent.includes("PM Calendar") ||
            b.textContent.includes("Maintenance Schedule") ||
            b.textContent.includes("Calendar"))) ||
        (b.title && b.title.includes("Calendar")),
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (openedCalendar) {
    await sleep(700);
    await snap("07_Modal_MaintenanceCalendar_PM_Scheduler.png");
    await closeModal();
  }

  // 7.4 Facility Settings & Calibration Modal
  const openedSettings = await page.evaluate(() => {
    const btn =
      document.querySelector('button[title*="Settings"]') ||
      document.querySelector('button[aria-label*="Settings"]') ||
      Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent && b.textContent.includes("Facility Settings"),
      );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  if (openedSettings) {
    await sleep(700);
    await snap("07_Modal_FacilitySettings_and_SensorCalibration.png");
    await closeModal();
  }

  // 7.5 Role Access Governance Request Modal
  await page.evaluate(() => {
    const userBtn = document.querySelector('button[title*="Account"]');
    if (userBtn) userBtn.click();
  });
  await sleep(400);
  const openedRoleModal = await page.evaluate(() => {
    const roleBtn = Array.from(document.querySelectorAll("button")).find(
      (b) =>
        b.textContent &&
        (b.textContent.includes("Request Role Access") ||
          b.textContent.includes("Role Request Status") ||
          b.textContent.includes("Assign Operational Role")),
    );
    if (roleBtn) {
      roleBtn.click();
      return true;
    }
    return false;
  });
  if (openedRoleModal) {
    await sleep(700);
    await snap("07_Modal_RoleAccessGovernance_RequestMenu.png");
    await closeModal();
  }

  // =========================================================================
  // 8. FEATURE EXPLORER MODE (Zero-Trust Platform Tour)
  // =========================================================================
  console.log("\n[Bonus] Capturing Feature Explorer Mode (Zero-Trust Platform Page)...");
  await page.evaluate(
    (authKey, vSession) => {
      window.localStorage.setItem(authKey, JSON.stringify(vSession));
      // Remove any elevated role cache
      window.localStorage.removeItem("aegis_role_ordinary.visitor@gmail.com");
      window.localStorage.setItem(
        "aegis_role_ordinary.visitor@gmail.com",
        JSON.stringify({ role: "feature_user", facility_id: null }),
      );
    },
    AUTH_TOKEN_KEY,
    visitorSession,
  );

  await page.reload({ waitUntil: "networkidle0" });
  await sleep(1500);

  // Top view
  await page.evaluate(() => window.scrollTo(0, 0));
  await snap("08_FeatureExplorer_01_TopView_ArchitectureTour_Hero.png");

  // Workflow Bottlenecks
  await page.evaluate(() => window.scrollTo({ top: 750, behavior: "instant" }));
  await snap("08_FeatureExplorer_02_Scrolled_WorkflowBottlenecks.png");

  // Access Governance Card
  await page.evaluate(() => window.scrollTo({ top: 1550, behavior: "instant" }));
  await snap("08_FeatureExplorer_03_Scrolled_AccessGovernance_Card.png");

  await page.evaluate(() => window.scrollTo(0, 0));
  await snapFull("08_FeatureExplorer_FullPage_CompletePlatform.png");

  // Restore technician role in localStorage
  await page.evaluate(
    (authKey, tSession) => {
      window.localStorage.setItem(authKey, JSON.stringify(tSession));
      window.localStorage.setItem(
        "aegis_role_devanshmishra3108@gmail.com",
        JSON.stringify({ role: "technician", facility_id: "FACILITY-01" }),
      );
    },
    AUTH_TOKEN_KEY,
    technicianSession,
  );

  await browser.close();

  console.log("\n================================================================");
  console.log("   ALL SCREENSHOTS SUCCESSFULLY CAPTURED AND SAVED!");
  console.log(`   Folder: ${OUTPUT_DIR}`);
  console.log("================================================================\n");
}

run().catch((err) => {
  console.error("Fatal execution error:", err);
  process.exit(1);
});
