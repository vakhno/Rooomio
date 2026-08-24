import { describe, expect, it } from "vitest";

import { QUERIES } from "@shared/routes/constants";
import { isConsumeQuery, pickRootSearchQueries } from "@shared/routes/utils";

describe("route query utils", () => {
	it("picks root search queries", () => {
		expect(pickRootSearchQueries({
			[QUERIES.ERROR_TOAST]: "bad",
			[QUERIES.ERROR_AUTH_TOAST]: "auth",
			[QUERIES.AUTH_NEEDED]: true,
			other: "ignored"
		})).toEqual({
			[QUERIES.ERROR_TOAST]: "bad",
			[QUERIES.AUTH_NEEDED]: true,
			[QUERIES.ERROR_AUTH_TOAST]: "auth"
		});
	});

	it("detects consumable queries", () => {
		expect(isConsumeQuery(QUERIES.ERROR_TOAST)).toBe(true);
		expect(isConsumeQuery(QUERIES.AUTH_NEEDED)).toBe(true);
		expect(isConsumeQuery("other")).toBe(false);
	});
});
