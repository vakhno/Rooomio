import { describe, expect, it } from "vitest";

import { ROUTES } from "../../constants";
import { isAdminRoleRequiredPage } from "./index";

describe("isAdminRoleRequiredPage", () => {
	it("does not require admin for template routes", () => {
		expect(isAdminRoleRequiredPage(ROUTES.HOME.path)).toBe(false);
		expect(isAdminRoleRequiredPage(ROUTES.PROFILE.path)).toBe(false);
	});
});
