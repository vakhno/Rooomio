import { expect, test } from "@playwright/test";
import { API_MOUNT, API_PREFIX, API_SEGMENT, ROUTES } from "@shared/routes/constants";

import { generateUniqueEmail } from "../../utils/generateUniqueEmail";
import { generateUniqueName } from "../../utils/generateUniqueName";
import { generateUniquePassword } from "../../utils/generateUniquePassword";

const SIGN_UP_API_PATH = `${API_PREFIX}${API_MOUNT.auth}${API_SEGMENT.AUTH.SIGN_UP.path}`;

test.describe("Sign in", () => {
	test("renders sign in and sign up tabs", async ({ page }) => {
		await page.goto("/auth/login");
		await expect(page.getByRole("tab", { name: "Sign In" })).toBeVisible();
		await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
		await expect(page.getByLabel("Password")).toBeVisible();

		await page.getByRole("tab", { name: "Sign Up" }).click();
		await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
		await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
		await expect(page.getByLabel("Password")).toBeVisible();
	});

	test("existing user can sign in", async ({ page, request }) => {
		const email = generateUniqueEmail({ prefix: "signin" });
		const name = generateUniqueName({ prefix: "signin" });
		const password = generateUniquePassword();

		const res = await request.post(SIGN_UP_API_PATH, {
			data: { email, name, password },
		});
		expect(res.ok()).toBe(true);

		await page.goto("/auth/login");
		await page.getByRole("textbox", { name: "Email" }).fill(email);
		await page.getByLabel("Password").fill(password);
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page).toHaveURL(new RegExp(`${ROUTES.PROFILE.path}$`));
	});

	test("accepts email case and edge-space variants", async ({ page, request }) => {
		const email = generateUniqueEmail({ prefix: "signin-normalize" });
		const name = generateUniqueName({ prefix: "signin-normalize" });
		const password = generateUniquePassword();

		const res = await request.post(SIGN_UP_API_PATH, {
			data: { email, name, password },
		});
		expect(res.ok()).toBe(true);

		await page.goto("/auth/login");
		await page.getByRole("textbox", { name: "Email" }).fill(` ${email.toUpperCase()} `);
		await page.getByLabel("Password").fill(password);
		await page.getByRole("button", { name: "Sign In" }).click();

		await expect(page).toHaveURL(new RegExp(`${ROUTES.PROFILE.path}$`));
	});
});
