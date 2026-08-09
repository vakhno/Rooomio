import { test, expect } from "@playwright/test";
import { ROUTES } from "@shared/routes/constants";

const BACKEND_URL          = "http://localhost:3001";
const PASSWORD = "password123";
const SIGN_IN_TAB_NAME = /^(Sign In|Enter)$/;
const SIGN_UP_TAB_NAME = /^(Sign Up|Create)$/;
const EMAIL_FIELD_NAME = /^(Email|Account email)$/;
const SIGN_IN_BUTTON_NAME = /^(Sign In|Enter coworking)$/;
const SIGN_UP_BUTTON_NAME = /^(Sign Up|Create coworking account)$/;

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;

test.describe("Email password auth", () => {
	test.describe("Login page", () => {
		test("renders sign in and sign up tabs", async ({ page }) => {
			await page.goto("/auth/login");
			await expect(page.getByRole("tab", { name: SIGN_IN_TAB_NAME })).toBeVisible();
			await expect(page.getByRole("textbox", { name: EMAIL_FIELD_NAME })).toBeVisible();
			await expect(page.getByLabel("Password")).toBeVisible();

			await page.getByRole("tab", { name: SIGN_UP_TAB_NAME }).click();
			await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
			await expect(page.getByRole("textbox", { name: EMAIL_FIELD_NAME })).toBeVisible();
			await expect(page.getByLabel("Password")).toBeVisible();
		});
	});

	test.describe("Sign up", () => {
		test("invalid body is rejected by the server", async ({ request }) => {
			const res = await request.post(`${BACKEND_URL}/api/auth/sign-up`, {
				data: { email: "not-an-email", name: "", password: "short" },
				headers: { Origin: "http://localhost:5183" },
			});

			expect(res.status()).toBe(400);
			expect(res.ok()).toBe(false);
		});

		test("creates a user and lands on profile page", async ({ page, request }) => {
			const email = uniqueEmail("signup");
			const name = "Test User";

			await page.goto("/auth/login");
			await page.getByRole("tab", { name: SIGN_UP_TAB_NAME }).click();
			await page.getByRole("textbox", { name: "Name" }).fill(name);
			await page.getByRole("textbox", { name: EMAIL_FIELD_NAME }).fill(email);
			await page.getByLabel("Password").fill(PASSWORD);
			await page.getByRole("button", { name: SIGN_UP_BUTTON_NAME }).click();

			await expect(page).toHaveURL(new RegExp(`${ROUTES.PROFILE.path}$`));

			const dbUserRes = await request.get(`${BACKEND_URL}/test/user-by-email`, {
				params: { email },
			});
			expect(dbUserRes.ok()).toBe(true);
			const dbUser = await dbUserRes.json();
			expect(dbUser).not.toBeNull();
			expect(dbUser.email).toBe(email);
			expect(dbUser.name).toBe(name);
		});
	});

	test.describe("Sign in", () => {
		test("existing user can sign in", async ({ page, request }) => {
			const email = uniqueEmail("signin");

			const res = await request.post(`${BACKEND_URL}/api/auth/sign-up`, {
				data: { email, name: "Existing User", password: PASSWORD },
				headers: { Origin: "http://localhost:5183" },
			});
			expect(res.ok()).toBe(true);

			await page.goto("/auth/login");
			await page.getByRole("textbox", { name: EMAIL_FIELD_NAME }).fill(email);
			await page.getByLabel("Password").fill(PASSWORD);
			await page.getByRole("button", { name: SIGN_IN_BUTTON_NAME }).click();

			await expect(page).toHaveURL(new RegExp(`${ROUTES.PROFILE.path}$`));
		});
	});
});
