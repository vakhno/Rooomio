import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

/**
 * Returns a pre-configured Playwright config suitable for any app in this
 * monorepo. Reads `VITE_PORT` from the environment (falls back to 5173).
 *
 * The caller can pass `overrides` to merge/replace any top-level key, and
 * `webServerOverrides` to extend only the `webServer` block.
 *
 * @example
 * // apps/frontend/playwright.config.ts
 * import { defineBaseConfig } from "@shared/e2e/base-config";
 * export default defineBaseConfig("./e2e");
 *
 * @example
 * // with custom webServer env
 * export default defineBaseConfig("./e2e", {
 *   webServer: {
 *     env: { VITE_API_URL: "http://127.0.0.1:9" },
 *   },
 * });
 */
export function defineBaseConfig(
	testDir: string,
	overrides: Partial<PlaywrightTestConfig> = {},
): PlaywrightTestConfig {
	const port = Number(process.env.VITE_PORT) || 5173;
	const baseURL = process.env.VITE_APP_URL || `http://127.0.0.1:${port}`;

	const webServerBase = {
		command: "npm run dev",
		url: baseURL,
		reuseExistingServer: !process.env.CI,
	};

	const ciWebServerEnv = process.env.CI
		? {
				env: {
					...process.env,
					VITE_API_URL: "http://127.0.0.1:9",
					VITE_APP_URL: baseURL,
				},
			}
		: {
				// Locally, still override VITE_APP_URL so OAuth callbackURLs
				// point to the test server (not the deployed Cloudflare URL from .env).
				env: {
					...process.env,
					VITE_APP_URL: baseURL,
				},
			};

	const { webServer: webServerOverride, use: useOverride, ...restOverrides } = overrides;

	return defineConfig({
		testDir,
		forbidOnly: Boolean(process.env.CI),
		retries: process.env.CI ? 2 : 0,
		reporter: process.env.CI ? "github" : "html",
		use: {
			baseURL,
			trace: "on-first-retry",
			...useOverride,
		},
		projects: [
			{ name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },		  
			{ name: 'chromium-mobile-ios', use: { ...devices['iPhone 13'] } },
			{ name: 'chromium-mobile-android', use: { ...devices['Pixel 7'] } },
		],
		webServer: {
			...webServerBase,
			...ciWebServerEnv,
			...webServerOverride,
		},
		...restOverrides,
	});
}

// import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

// /**
//  * Returns a pre-configured Playwright config suitable for any app in this
//  * monorepo. Reads `VITE_PORT` from the environment (falls back to 5173).
//  *
//  * The caller can pass `overrides` to merge/replace any top-level key, and
//  * `webServerOverrides` to extend only the `webServer` block.
//  *
//  * @example
//  * // apps/frontend/playwright.config.ts
//  * import { defineBaseConfig } from "@shared/e2e/base-config";
//  * export default defineBaseConfig("./e2e");
//  *
//  * @example
//  * // with custom webServer env
//  * export default defineBaseConfig("./e2e", {
//  *   webServer: {
//  *     env: { VITE_API_URL: "http://127.0.0.1:9" },
//  *   },
//  * });
//  */
// export function defineBaseConfig(
// 	testDir: string,
// 	overrides: Partial<PlaywrightTestConfig> = {},
// ): PlaywrightTestConfig {
// 	const port = Number(process.env.VITE_PORT) || 5173;
// 	const baseURL = `http://127.0.0.1:${port}`;

// 	const webServerBase = {
// 		command: "npm run dev",
// 		url: baseURL,
// 		reuseExistingServer: !process.env.CI,
// 	};

// 	const ciWebServerEnv = process.env.CI
// 		? {
// 				env: {
// 					...process.env,
// 					VITE_API_URL: "http://127.0.0.1:9",
// 					VITE_APP_URL: baseURL,
// 				},
// 			}
// 		: {};

// 	const { webServer: webServerOverride, ...restOverrides } = overrides;

// 	return defineConfig({
// 		testDir,
// 		forbidOnly: Boolean(process.env.CI),
// 		retries: process.env.CI ? 2 : 0,
// 		reporter: process.env.CI ? "github" : "html",
// 		use: {
// 			baseURL,
// 			trace: "on-first-retry",
// 		},
// 		projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
// 		webServer: {
// 			...webServerBase,
// 			...ciWebServerEnv,
// 			...webServerOverride,
// 		},
// 		...restOverrides,
// 	});
// }
