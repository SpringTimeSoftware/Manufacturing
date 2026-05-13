import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const require = createRequire(import.meta.url);
const puppeteer = require("./wave-automation/node_modules/puppeteer-core");

const baseUrl = process.env.WS11_BASE_URL ?? "http://127.0.0.1:5173";
const screenshotDir = path.resolve(process.env.WS11_SCREENSHOT_DIR ?? "docs/codex-review-screens/WS11");
const resultPath = path.resolve(process.env.WS11_RESULT_PATH ?? "docs/workstream-progress/WS11/performance-smoke-results.json");
const chromePath = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const maxLoadMs = Number(process.env.WS11_MAX_LOAD_MS ?? "8000");

const session = {
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token",
  accessTokenExpiresOnUtc: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  user: {
    userId: 1,
    userName: "super.admin",
    displayName: "Super Admin",
    email: "super.admin@sts.local",
    languageCode: "en-IN",
    activeContext: {
      companyId: 1,
      branchId: 10,
      companyCode: "STS",
      companyName: "STS Precision Fabricators",
      branchCode: "PLANT-1",
      branchName: "Main Fabrication Plant"
    },
    availableContexts: [
      {
        companyId: 1,
        companyCode: "STS",
        companyName: "STS Precision Fabricators",
        branchId: 10,
        branchCode: "PLANT-1",
        branchName: "Main Fabrication Plant"
      }
    ],
    roles: ["SuperAdmin"],
    scope: {
      hasDeploymentAccess: true,
      visibilityMode: "Global",
      allowedWarehouseIds: [101, 102, 103, 201, 202],
      allowedDepartmentIds: [12, 14, 16],
      teamUserIds: [1, 3, 5, 8]
    }
  }
};

const routeChecks = [
  { route: "/", expectedText: "Delivery risk", screenshot: "release-dashboard-home.png" },
  { route: "/dashboards/order-delivery", expectedText: "Order Delivery Dashboard", screenshot: "release-order-delivery-dashboard.png" },
  { route: "/dashboards/stage-wise", expectedText: "Stage Wise Dashboard", screenshot: "release-stage-wise-dashboard.png" },
  { route: "/planning/mrp", expectedText: "MRP Run Console", screenshot: "release-mrp-run-console.png" },
  { route: "/production/machine-board", expectedText: "Machine Schedule Board", screenshot: "release-machine-board.png" },
  { route: "/inventory/traceability", expectedText: "Lot / Serial / Catch Weight Traceability", screenshot: "release-traceability.png" },
  { route: "/reports/catalog", expectedText: "Report Catalog", screenshot: "release-report-catalog.png" },
  { route: "/platform/runtime-uat", expectedText: "Runtime UAT", screenshot: "release-runtime-uat.png" },
  { route: "/integrations/health", expectedText: "Provider Health", screenshot: "release-provider-health.png" },
  { route: "/platform/audit-trail", expectedText: "Audit Trail", screenshot: "release-audit-trail.png" }
];

async function waitForText(page, text) {
  await page.waitForFunction(
    (needle) => document.body && document.body.innerText.includes(needle),
    { timeout: maxLoadMs },
    text
  );
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  await mkdir(path.dirname(resultPath), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((storedSession) => {
    localStorage.setItem("sts-mfg.web.session", JSON.stringify(storedSession));
  }, session);

  const results = [];
  try {
    for (const check of routeChecks) {
      const started = performance.now();
      await page.goto(`${baseUrl}${check.route}`, { waitUntil: "networkidle0", timeout: maxLoadMs });
      await waitForText(page, check.expectedText);
      const elapsedMs = Math.round(performance.now() - started);
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasInternalCopy = /\b(adapter|fallback|mock|seeded|source status|React|TypeScript|prompt IDs)\b/i.test(bodyText);
      const status = elapsedMs <= maxLoadMs && !hasInternalCopy ? "PASS" : "FAIL";
      const screenshotPath = path.join(screenshotDir, check.screenshot);

      await page.screenshot({ path: screenshotPath, fullPage: false });
      results.push({
        route: check.route,
        expectedText: check.expectedText,
        elapsedMs,
        status,
        screenshot: check.screenshot,
        hasInternalCopy
      });
    }
  } finally {
    await browser.close();
  }

  const payload = {
    baseUrl,
    capturedAt: new Date().toISOString(),
    maxLoadMs,
    pass: results.every((result) => result.status === "PASS"),
    results
  };

  await writeFile(resultPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  await writeFile(path.join(screenshotDir, "capture-summary.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

  if (!payload.pass) {
    console.error(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
