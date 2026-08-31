# Personal Website WebMCP Tests

A small, independent Playwright project that verifies a personal website is useful to people, search crawlers, and browser agents.

## What it checks

- Crawlable identity plus ordinary résumé, project, and writing links.
- Registration of `get_profile`, `get_resume`, `list_projects`, `search_posts`, and `contact` through the WebMCP imperative API.
- Useful tool descriptions, object input schemas, and `readOnlyHint: true` annotations.
- Execution of the public profile tool with a canonical identity URL.
- Availability of `robots.txt`, `sitemap.xml`, `llms.txt`, and public JSON endpoints.
- A usable primary interface when reduced motion is enabled.
- Chromium desktop and mobile layouts, with screenshots, video, and traces retained on failure.

The default run starts a local contract fixture so the harness can verify itself. Set `PORTFOLIO_URL` to test a real preview or production deployment.

## Run locally

```bash
npm install
npx playwright install chromium
npm test
npm run test:e2e
```

PowerShell against a deployed site:

```powershell
$env:PORTFOLIO_URL = "https://example.com"
npm run test:e2e
```

## How WebMCP is tested

Playwright installs a standards-shaped `document.modelContext` probe before site JavaScript runs. The real site registers its tools normally; the probe captures the definitions and executes them without requiring an experimental browser build.

For native manual verification, use a Chrome version that supports WebMCP, enable `chrome://flags/#enable-webmcp-testing` for local development, and inspect the registered tools with a compatible agent or inspector. WebMCP remains a progressive enhancement; the ordinary HTML and HTTP APIs are tested separately.

## CI

GitHub Actions runs unit tests and Chromium E2E tests on every push and pull request. Configure `PORTFOLIO_URL` in the workflow environment when the portfolio has a stable preview deployment; without it, CI uses the included fixture.
