import { describe, expect, it } from "vitest";

import { pathMatchesRoutePrefix } from "./index";

describe("pathMatchesRoutePrefix", () => {
	it("matches exact prefix", () => {
		expect(pathMatchesRoutePrefix("/profile", "/profile")).toBe(true);
		expect(pathMatchesRoutePrefix("/settings", "/settings")).toBe(true);
	});

	it("matches one segment deeper", () => {
		expect(pathMatchesRoutePrefix("/profile/edit", "/profile")).toBe(true);
		expect(pathMatchesRoutePrefix("/settings/account", "/settings")).toBe(true);
	});

	it("does not match sibling path that shares a prefix substring", () => {
		expect(pathMatchesRoutePrefix("/profiles", "/profile")).toBe(false);
		expect(pathMatchesRoutePrefix("/profiled", "/profile")).toBe(false);
	});

	it("does not match without leading slash boundary on prefix", () => {
		expect(pathMatchesRoutePrefix("/profilex/foo", "/profile")).toBe(false);
	});
});
