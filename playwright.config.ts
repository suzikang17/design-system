import { defineConfig } from "@playwright/test"

const PORT = 4317

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  webServer: {
    // SITE_URL makes the registry's /r/*.json URLs match the server under test.
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    env: { SITE_URL: `http://localhost:${PORT}` },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false, // never test whatever stale server happens to be on the port
    timeout: 240_000,
  },
  use: { baseURL: `http://localhost:${PORT}/` },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 } } },
  ],
})
