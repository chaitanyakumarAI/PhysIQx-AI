import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests (e2e/). Runs against the dev server, reusing one that's
 * already up. On Windows it drives the installed Edge, so no browser
 * download is needed; set E2E_CHANNEL="" to use Playwright's own Chromium
 * (after `npx playwright install chromium`).
 */
const channel = process.env.E2E_CHANNEL ?? "msedge";

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"], ...(channel ? { channel } : {}) } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
