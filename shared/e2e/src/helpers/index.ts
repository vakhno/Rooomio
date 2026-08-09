import type { BrowserContext, Page } from "@playwright/test";
import type { AuthCookie } from "../fixtures";

/**
 * Injects auth cookies into the given browser context so subsequent requests
 * are authenticated. Pair with server-side auth test utils.
 *
 * @example
 * const testUtils = (await auth.$context).test;
 * const user = testUtils.createUser({ email: "u@test.com", name: "Test", emailVerified: true });
 * await testUtils.saveUser(user);
 * const cookies = await testUtils.getCookies({ userId: user.id, domain: "localhost" });
 * await addAuthCookies(page.context(), cookies);
 */
export async function addAuthCookies(
	context: BrowserContext,
	cookies: AuthCookie[],
): Promise<void> {
	await context.addCookies(cookies);
}

/**
 * Clears all cookies from the browser context, effectively logging the user out
 * on the browser side without triggering a server-side signout request.
 */
export async function clearAuthCookies(context: BrowserContext): Promise<void> {
	await context.clearCookies();
}

/**
 * Navigates to `path` and waits for the network to be idle.
 * Prefer this over bare `page.goto` in e2e tests for more reliable assertions.
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
	await page.goto(path, { waitUntil: "networkidle" });
}

/**
 * Asserts that the current URL ends with `path` (ignoring query strings and
 * the origin), then returns. Useful for redirect assertions.
 */
export async function expectRedirectTo(page: Page, path: string): Promise<void> {
	await page.waitForURL((url) => url.pathname === path, { timeout: 10_000 });
}

