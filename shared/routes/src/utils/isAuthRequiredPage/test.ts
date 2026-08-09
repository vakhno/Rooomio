import { describe, expect, it } from "vitest";

import { ROUTES } from "../../constants";
import { isAuthRequiredPage } from "./index";

describe("isAuthRequiredPage", () => {
	it("requires auth for profile", () => {
		expect(isAuthRequiredPage(ROUTES.PROFILE.path)).toBe(true);
	});

	it("does not require auth for public pages", () => {
		expect(isAuthRequiredPage(ROUTES.HOME.path)).toBe(false);
		expect(isAuthRequiredPage(ROUTES.LOGIN.path)).toBe(false);
	});
});
