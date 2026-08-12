import { defineConfig, devices } from "@playwright/test";

const FRONTEND_PORT = 5183;
const BACKEND_PORT = 3001;
const FRONTEND_URL  = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL   = `http://localhost:${BACKEND_PORT}`;

export default defineConfig({
	testDir: "./src/tests",
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? "github" : "html",
	use: {
		baseURL: FRONTEND_URL,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], ...devices["Mobile Chrome"], channel: "chrome" } }],

	// Start the test backend first, then the frontend pointing at it.
	// Both servers are started in parallel; Playwright waits for both health
	// checks to pass before running any test.
	webServer: [
		{
			// Minimal Express auth server backed by local PostgreSQL.
			command: "npm run test-server",
			url: `${BACKEND_URL}/api/auth/ok`,
			reuseExistingServer: !process.env.CI,
			timeout: process.env.CI ? 120_000 : 30_000,
		},
		{
			command: "npm run dev -w frontend",
			url: FRONTEND_URL,
			reuseExistingServer: !process.env.CI,
			timeout: 60_000,
			env: {
				VITE_PORT: String(FRONTEND_PORT),
				VITE_APP_URL: FRONTEND_URL,
				// Point auth and socket calls at the local test backend instead
				// of the Cloudflare tunnel defined in .env.
				VITE_API_URL: BACKEND_URL,
				VITE_ALLOWED_HOSTS: "localhost",
			},
		},
	],
});
