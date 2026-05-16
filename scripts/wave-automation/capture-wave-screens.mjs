import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const [, , configPathArg, outputDirArg] = process.argv;

if (!configPathArg || !outputDirArg) {
  console.error("Usage: node capture-wave-screens.mjs <configPath> <outputDir>");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPathArg, "utf8"));
const outputDir = outputDirArg;
const baseUrl = config.runtime?.web_url ?? "http://127.0.0.1:5173";
const screenshotMode = config.screenshot_mode ?? "top_only";
const defaultUser = process.env.STS_WAVE_USER ?? "super.admin";
const defaultPassword = process.env.STS_WAVE_PASSWORD ?? "Super@123";
const captureSummary = [];

const browserCandidates = [
  process.env.WAVE_SCREENSHOT_BROWSER,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
].filter(Boolean);

const browserPath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!browserPath) {
  console.error("No supported browser executable found for screenshot capture.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBodyText(page, text, timeout = 30000) {
  await page.waitForFunction(
    (expected) => document.body && document.body.innerText.includes(expected),
    { timeout },
    text,
  );
}

async function findClickableByText(page, label) {
  const target = await page.evaluateHandle((text) => {
    const candidates = Array.from(document.querySelectorAll("button, [role='button'], a"));
    return candidates.find((element) => element.innerText.trim() === text) ?? null;
  }, label);

  const element = target.asElement();
  if (!element) {
    throw new Error(`Could not find clickable element with label '${label}'.`);
  }

  return element;
}

async function clickByText(page, label) {
  const element = await findClickableByText(page, label);
  await element.click();
}

async function applyPreActions(page, preActions = []) {
  for (const action of preActions) {
    if (action.kind === "button") {
      await clickByText(page, action.label);
      await sleep(500);
      continue;
    }

    if (action.kind === "text") {
      const locator = await page.evaluateHandle((text) => {
        const candidates = Array.from(document.querySelectorAll("td, tr, button, a, div, span"));
        return candidates.find((element) => element.innerText.trim().includes(text)) ?? null;
      }, action.label);

      const element = locator.asElement();
      if (!element) {
        throw new Error(`Could not find text target '${action.label}'.`);
      }

      await element.click();
      await sleep(500);
      continue;
    }

    if (action.kind === "selector") {
      await page.click(action.selector);
      await sleep(500);
      continue;
    }

    throw new Error(`Unsupported pre-action kind '${action.kind}'.`);
  }
}

async function capturePageScreens(page, outputPrefix, mode) {
  const files = [];
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);

  const topPath = path.join(outputDir, `${outputPrefix}-top.png`);
  await page.screenshot({ path: topPath, fullPage: false });
  files.push(topPath);

  if (mode !== "top_mid_bottom") {
    return files;
  }

  const metrics = await page.evaluate(() => ({
    scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    viewportHeight: window.innerHeight
  }));

  if (metrics.scrollHeight <= metrics.viewportHeight + 80) {
    return files;
  }

  const bottomOffset = Math.max(0, metrics.scrollHeight - metrics.viewportHeight);
  const middleOffset = Math.max(0, Math.floor(bottomOffset / 2));

  if (middleOffset > 0) {
    await page.evaluate((offset) => window.scrollTo(0, offset), middleOffset);
    await sleep(300);
    const middlePath = path.join(outputDir, `${outputPrefix}-middle.png`);
    await page.screenshot({ path: middlePath, fullPage: false });
    files.push(middlePath);
  }

  if (bottomOffset > 0 && bottomOffset !== middleOffset) {
    await page.evaluate((offset) => window.scrollTo(0, offset), bottomOffset);
    await sleep(300);
    const bottomPath = path.join(outputDir, `${outputPrefix}-bottom.png`);
    await page.screenshot({ path: bottomPath, fullPage: false });
    files.push(bottomPath);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(200);
  return files.slice(0, 3);
}

async function captureModalScreens(page, outputPrefix, mode) {
  const files = [];
  const modalSelector = "[data-testid='erp-modal-workspace']";
  await page.waitForSelector(modalSelector, { timeout: 30000 });
  await sleep(300);

  const overviewPath = path.join(outputDir, `${outputPrefix}-overview.png`);
  await page.screenshot({ path: overviewPath, fullPage: false });
  files.push(overviewPath);

  if (mode !== "top_mid_bottom") {
    return files;
  }

  const canScroll = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) {
      return false;
    }

    return element.scrollHeight > element.clientHeight + 40;
  }, modalSelector);

  if (!canScroll) {
    return files;
  }

  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
    }
  }, modalSelector);
  await sleep(300);

  const lowerPath = path.join(outputDir, `${outputPrefix}-lower.png`);
  await page.screenshot({ path: lowerPath, fullPage: false });
  files.push(lowerPath);
  return files.slice(0, 2);
}

async function login(page) {
  if (config.runtime?.session_mode === "stored-review-session") {
    const session = {
      accessToken: "review-access-token",
      refreshToken: "review-refresh-token",
      accessTokenExpiresOnUtc: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      user: {
        userId: 1,
        userName: "review.user",
        displayName: "Review User",
        email: "review.user@sts.local",
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
        roles: ["SuperAdmin", "PlantHead", "QCInspector", "DispatchManager"],
        scope: {
          hasDeploymentAccess: false,
          visibilityMode: "Company",
          allowedWarehouseIds: [],
          allowedDepartmentIds: [],
          teamUserIds: [1]
        }
      }
    };

    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate((value) => {
      window.localStorage.setItem("sts-mfg.web.session", JSON.stringify(value));
    }, session);
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForBodyText(page, "Home Dashboard");
    await sleep(1500);
    return;
  }

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForBodyText(page, "Sign in to STS Manufacturing ERP");

  const userInput = await page.$("input[autocomplete='username']");
  const passwordInput = await page.$("input[autocomplete='current-password']");
  if (!userInput || !passwordInput) {
    throw new Error("Could not find login inputs for screenshot capture.");
  }

  await userInput.click({ clickCount: 3 });
  await userInput.type(defaultUser);
  await passwordInput.click({ clickCount: 3 });
  await passwordInput.type(defaultPassword);
  await clickByText(page, "Sign in");
  await waitForBodyText(page, "Home Dashboard");
  await sleep(1500);
}

async function openRoute(page, route) {
  await page.goto(`${baseUrl}${route.route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForBodyText(page, route.ready_text);
  await applyPreActions(page, route.pre_actions ?? []);
  await sleep(1200);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: browserPath,
    args: ["--no-sandbox"],
    defaultViewport: { width: 1600, height: 1300 }
  });

  const page = await browser.newPage();

  try {
    await login(page);

    for (const route of config.routes_to_capture ?? []) {
      await openRoute(page, route);
      const files = await capturePageScreens(page, route.output_prefix, route.screenshot_mode ?? screenshotMode);
      captureSummary.push({ route: route.route, files });
    }

    for (const modalRoute of config.modal_routes_to_capture ?? []) {
      await openRoute(page, modalRoute);
      await clickByText(page, modalRoute.open_action_label);
      await waitForBodyText(page, modalRoute.modal_ready_text);
      await sleep(600);
      const files = await captureModalScreens(page, modalRoute.output_prefix, modalRoute.screenshot_mode ?? screenshotMode);
      captureSummary.push({ route: modalRoute.route, modal: modalRoute.open_action_label, files });
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(outputDir, "capture-summary.json"),
    JSON.stringify(
      {
        wave_id: config.wave_id,
        screenshot_mode: screenshotMode,
        captures: captureSummary
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
