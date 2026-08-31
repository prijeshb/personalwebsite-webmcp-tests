import { expect, test } from "@playwright/test";

import { auditToolRegistrations } from "../../src/contracts.mjs";

async function waitForRegistrations(page) {
  await expect
    .poll(() =>
      page.evaluate(() => window.__webmcpProbe?.registrations.length ?? 0),
    )
    .toBeGreaterThanOrEqual(5);

  return page.evaluate(() => window.__webmcpProbe?.registrations ?? []);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const registrations = [];
    const modelContext = {
      registerTool(tool) {
        registrations.push(tool);
      },
      unregisterTool(name) {
        const index = registrations.findIndex((tool) => tool.name === name);
        if (index >= 0) registrations.splice(index, 1);
      },
    };

    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: modelContext,
    });
    window.__webmcpProbe = { registrations };
  });
});

test("publishes a crawlable identity and portfolio navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /resume/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /projects/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /writing/i })).toBeVisible();
});

test("registers the public WebMCP portfolio tools", async ({ page }) => {
  await page.goto("/");

  const registrations = await waitForRegistrations(page);
  const report = auditToolRegistrations(registrations);

  expect(report.missing).toEqual([]);
  expect(report.invalid).toEqual([]);
});

test("executes the public profile tool with canonical identity data", async ({
  page,
}) => {
  await page.goto("/");
  await waitForRegistrations(page);

  const result = await page.evaluate(async () => {
    const tool = window.__webmcpProbe?.registrations.find(
      (registration) => registration.name === "get_profile",
    );
    return tool?.execute({});
  });

  expect(result).toMatchObject({
    name: expect.any(String),
    canonicalUrl: expect.stringMatching(/^https?:\/\//),
  });
});

test("serves the machine-readable discovery surface", async ({ request }) => {
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/api/profile",
    "/api/projects",
    "/api/posts",
  ]) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should return 2xx`).toBeTruthy();
  }
});

test("keeps the primary experience usable with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("textbox")).toBeVisible();
});
