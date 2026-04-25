const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer");

const PDF_BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AcceptCHFrame,BackForwardCache,MediaRouter,OptimizationHints,SegmentationPlatform,Translate",
  "--disable-sync",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-first-run",
  "--no-default-browser-check",
];

const launchPdfBrowser = async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "glazia-pdf-chrome-"));
  const cacheDir = path.join(userDataDir, "cache");
  fs.mkdirSync(cacheDir, { recursive: true });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir,
      args: PDF_BROWSER_ARGS,
      env: {
        ...process.env,
        XDG_CACHE_HOME: cacheDir,
        XDG_CONFIG_HOME: userDataDir,
      },
    });

    return { browser, userDataDir };
  } catch (error) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
    throw error;
  }
};

const closePdfBrowser = async (handle) => {
  if (!handle) return;

  try {
    if (handle.browser) {
      await handle.browser.close();
    }
  } finally {
    if (handle.userDataDir) {
      fs.rmSync(handle.userDataDir, { recursive: true, force: true });
    }
  }
};

module.exports = {
  closePdfBrowser,
  launchPdfBrowser,
};
