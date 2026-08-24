import { describe, expect, it } from "vitest";

import { pathMatchesRoutePrefix } from "@shared/routes/utils";

describe("pathMatchesRoutePrefix", () => {
	it("matches exact prefix", () => {
		expect(pathMatchesRoutePrefix("/profile", "/profile")).toBe(true);
		expect(pathMatchesRoutePrefix("/settings", "/settings")).toBe(true);
	});

	it("matches nested paths", () => {
		expect(pathMatchesRoutePrefix("/profile/edit", "/profile")).toBe(true);
		expect(pathMatchesRoutePrefix("/settings/account", "/settings")).toBe(true);
	});

	it("does not match sibling paths that share prefix text", () => {
		expect(pathMatchesRoutePrefix("/profiles", "/profile")).toBe(false);
		expect(pathMatchesRoutePrefix("/profiled", "/profile")).toBe(false);
		expect(pathMatchesRoutePrefix("/profilex/foo", "/profile")).toBe(false);
	});
});
