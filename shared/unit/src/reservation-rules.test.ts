import { describe, expect, it } from "vitest";

import { reservationRangesOverlap } from "@shared/sockets";

const at = (iso: string) => new Date(iso);

describe("reservationRangesOverlap", () => {
	it("does not conflict when ranges touch", () => {
		expect(reservationRangesOverlap(
			at("2026-08-12T10:00:00.000Z"),
			at("2026-08-12T11:00:00.000Z"),
			at("2026-08-12T11:00:00.000Z"),
			at("2026-08-12T12:00:00.000Z")
		)).toBe(false);
	});

	it("conflicts on partial overlap", () => {
		expect(reservationRangesOverlap(
			at("2026-08-12T10:00:00.000Z"),
			at("2026-08-12T11:30:00.000Z"),
			at("2026-08-12T11:00:00.000Z"),
			at("2026-08-12T12:00:00.000Z")
		)).toBe(true);
	});

	it("conflicts on exact match", () => {
		expect(reservationRangesOverlap(
			at("2026-08-12T10:00:00.000Z"),
			at("2026-08-12T11:00:00.000Z"),
			at("2026-08-12T10:00:00.000Z"),
			at("2026-08-12T11:00:00.000Z")
		)).toBe(true);
	});

	it("does not conflict on neighboring days", () => {
		expect(reservationRangesOverlap(
			at("2026-08-12T23:00:00.000Z"),
			at("2026-08-13T00:00:00.000Z"),
			at("2026-08-13T00:00:00.000Z"),
			at("2026-08-13T01:00:00.000Z")
		)).toBe(false);
	});
});
