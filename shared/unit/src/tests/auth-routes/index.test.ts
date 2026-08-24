import { describe, expect, it } from "vitest";

import { ROUTES } from "@shared/routes/constants";
import { isAuthRequiredPage, isBlockedDuringAuthPage } from "@shared/routes/utils";

describe("route auth guards", () => {
	it("requires auth for protected pages", () => {
		expect(isAuthRequiredPage(ROUTES.BUILDINGS.path)).toBe(true);
		expect(isAuthRequiredPage(ROUTES.BUILDING_FLOORS.path)).toBe(true);
		expect(isAuthRequiredPage(ROUTES.BUILDER.path)).toBe(true);
		expect(isAuthRequiredPage(ROUTES.FLOOR.path)).toBe(true);
		expect(isAuthRequiredPage(ROUTES.MY_BUILDINGS.path)).toBe(true);
		expect(isAuthRequiredPage(ROUTES.PROFILE.path)).toBe(true);
		expect(isAuthRequiredPage(ROUTES.RESERVATIONS.path)).toBe(true);
	});

	it("does not require auth for public pages", () => {
		expect(isAuthRequiredPage(ROUTES.HOME.path)).toBe(false);
		expect(isAuthRequiredPage(ROUTES.LOGIN.path)).toBe(false);
	});

	it("blocks auth page for authenticated users", () => {
		expect(isBlockedDuringAuthPage(ROUTES.LOGIN.path)).toBe(true);
		expect(isBlockedDuringAuthPage(ROUTES.HOME.path)).toBe(false);
	});
});
