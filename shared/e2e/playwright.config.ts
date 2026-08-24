import { defineConfig, devices } from "@playwright/test";

const TEST_FRONTEND_PORT = 5183;
const TEST_BACKEND_PORT = 3001;
const TEST_FRONTEND_URL  = `http://localhost:${TEST_FRONTEND_PORT}`;
const TEST_BACKEND_URL   = `http://localhost:${TEST_BACKEND_PORT}`;
const TEST_POSTGRES_URL = "postgresql://app_template:app_template@localhost:5432/app_template";
const TEST_JWT_SECRET = "test_only_custom_auth_secret_32_chars";

export default defineConfig({
	testDir: "./src/tests",
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? "github" : "html",
	use: {
		baseURL: TEST_FRONTEND_URL,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], ...devices["Mobile Chrome"], channel: "chrome" } }],
	webServer: [
		{
			command: "npm run dev:tsx -w backend",
			url: TEST_BACKEND_URL,
			reuseExistingServer: !process.env.CI,
			timeout: 60_000,
			env: {
				PORT: String(TEST_BACKEND_PORT),
				JWT_SECRET: TEST_JWT_SECRET,
				POSTGRES_URL: TEST_POSTGRES_URL,
				VITE_APP_URL: TEST_FRONTEND_URL,
			},
		},
		{
			command: "npm run dev -w frontend",
			url: TEST_FRONTEND_URL,
			reuseExistingServer: !process.env.CI,
			timeout: 60_000,
			env: {
				VITE_PORT: String(TEST_FRONTEND_PORT),
				VITE_APP_URL: TEST_FRONTEND_URL,
				VITE_API_URL: TEST_BACKEND_URL,
				VITE_ALLOWED_HOSTS: "localhost",
			},
		},
	],
});
