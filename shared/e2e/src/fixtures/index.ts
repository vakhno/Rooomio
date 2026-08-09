import { test as base, type Page } from "@playwright/test";

export type AuthCookie = {
	name: string;
	value: string;
	domain: string;
	path: string;
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
};

export type AuthFixtures = {
	authenticatedPage: Page;
};

export type AuthFixtureOptions = {
	getCookies: () => Promise<AuthCookie[]>;
};

/**
 * Creates a Playwright `test` extended with an `authenticatedPage` fixture.
 * The fixture injects the auth cookies returned by `getCookies` before handing
 * the page to each test, so the user is already logged in.
 */
export function createAuthFixtures(options: AuthFixtureOptions) {
	return base.extend<AuthFixtures>({
		authenticatedPage: async ({ page }, use) => {
			const cookies = await options.getCookies();
			await page.context().addCookies(cookies);
			await use(page);
			await page.context().clearCookies();
		},
	});
}

export { test, expect } from "@playwright/test";
