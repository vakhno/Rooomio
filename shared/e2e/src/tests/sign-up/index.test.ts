import { expect, test } from "@playwright/test";
import { CONSTANTS } from "@shared/constants";
import { API_MOUNT, API_PREFIX, API_SEGMENT, ROUTES } from "@shared/routes/constants";

import { generateUniqueEmail } from "../../utils/generateUniqueEmail";
import { generateUniqueName } from "../../utils/generateUniqueName";
import { generateUniquePassword } from "../../utils/generateUniquePassword";

const AUTH_API_PATH = `${API_PREFIX}${API_MOUNT.auth}`;
const SIGN_UP_API_PATH = `${AUTH_API_PATH}${API_SEGMENT.AUTH.SIGN_UP.path}`;
const SESSION_API_PATH = `${AUTH_API_PATH}${API_SEGMENT.AUTH.SESSION.path}`;

test.describe("Sign up", () => {
	test("invalid body is rejected by the server", async ({ request }) => {
		const res = await request.post(SIGN_UP_API_PATH, {
			data: { email: "not-an-email", name: "", password: "short" },
		});

		expect(res.status()).toBe(400);
		expect(res.ok()).toBe(false);
	});

	test("creates a user and lands on profile page", async ({ page }) => {
		const email = generateUniqueEmail({ prefix: "signup" });
		const name = generateUniqueName({ prefix: "signup" });
		const password = generateUniquePassword();

		await page.goto("/auth/login");
		await page.getByRole("tab", { name: "Sign Up" }).click();
		await page.getByRole("textbox", { name: "Name" }).fill(name);
		await page.getByRole("textbox", { name: "Email" }).fill(email);
		await page.getByLabel("Password").fill(password);
		await page.getByRole("button", { name: "Sign Up" }).click();

		await expect(page).toHaveURL(new RegExp(`${ROUTES.PROFILE.path}$`));

		const sessionRes = await page.request.get(SESSION_API_PATH);
		expect(sessionRes.ok()).toBe(true);
		const session = await sessionRes.json();
		expect(session).not.toBeNull();
		expect(session.user.email).toBe(email);
		expect(session.user.name).toBe(name);
	});

	test("normalizes email and rejects duplicate variants", async ({ request }) => {
		const email = generateUniqueEmail({ prefix: "normalize" });
		const firstName = generateUniqueName({ prefix: "first" });
		const secondName = generateUniqueName({ prefix: "second" });
		const password = generateUniquePassword();

		const first = await request.post(SIGN_UP_API_PATH, {
			data: { email: ` ${email.toUpperCase()} `, name: firstName, password },
		});
		expect(first.status()).toBe(201);
		const firstBody = await first.json();
		expect(firstBody.user.email).toBe(email);

		const duplicate = await request.post(SIGN_UP_API_PATH, {
			data: { email, name: secondName, password },
		});
		expect(duplicate.status()).toBe(409);
	});

	test("rejects passwords longer than 72 characters", async ({ request }) => {
		const res = await request.post(SIGN_UP_API_PATH, {
			data: {
				email: generateUniqueEmail({ prefix: "long-password" }),
				name: generateUniqueName({ prefix: "long-password" }),
				password: "x".repeat(CONSTANTS.auth.password.max + 1),
			},
		});

		expect(res.status()).toBe(400);
	});
});
