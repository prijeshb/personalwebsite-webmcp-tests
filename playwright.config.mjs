import { defineConfig, devices } from "@playwright/test";

const configuredURL = process.env.PORTFOLIO_URL?.trim();
const targetURL = configuredURL || "http://127.0.0.1:4173";
const useFixture = !configuredURL;

export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/html", open: "never" }],
    ["junit", { outputFile: "artifacts/junit.xml" }],
  ],
  outputDir: "artifacts/results",
  webServer: useFixture
    ? {
        command: "node fixture/server.mjs",
        url: targetURL,
        reuseExistingServer: false,
      }
    : undefined,
  use: {
    baseURL: targetURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
});
