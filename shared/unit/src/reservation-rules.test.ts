import { describe, expect, it } from "vitest";

import { createWeeklyReservationOccurrences, reservationRangesOverlap, validateReservationOfficeHours } from "@shared/sockets";

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

const weekdaySchedule = [
	{ closesAt: "19:00", day: "monday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "tuesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "wednesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "thursday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "friday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "saturday", dayOff: true, opensAt: "09:00" },
	{ closesAt: "19:00", day: "sunday", dayOff: true, opensAt: "09:00" }
];

describe("validateReservationOfficeHours", () => {
	it("accepts bookings ending exactly at closing time in Europe/Kyiv", () => {
		expect(validateReservationOfficeHours({
			end: "2026-08-12T16:00:00.000Z",
			schedule: weekdaySchedule,
			start: "2026-08-12T15:30:00.000Z"
		})).toBeNull();
	});

	it("rejects bookings before opening time in Europe/Kyiv", () => {
		expect(validateReservationOfficeHours({
			end: "2026-08-12T06:30:00.000Z",
			schedule: weekdaySchedule,
			start: "2026-08-12T05:30:00.000Z"
		})).toBe("Reservation must be inside room working hours.");
	});
});

describe("createWeeklyReservationOccurrences", () => {
	it("creates the requested number of weekly occurrences", () => {
		expect(createWeeklyReservationOccurrences(
			"2026-08-12T09:00:00.000Z",
			"2026-08-12T10:00:00.000Z",
			8
		)).toHaveLength(8);
	});

	it("keeps the same Europe/Kyiv local time across daylight-saving changes", () => {
		expect(createWeeklyReservationOccurrences(
			"2026-10-20T06:00:00.000Z",
			"2026-10-20T07:00:00.000Z",
			2
		)).toEqual([
			{ end: "2026-10-20T07:00:00.000Z", index: 0, start: "2026-10-20T06:00:00.000Z" },
			{ end: "2026-10-27T08:00:00.000Z", index: 1, start: "2026-10-27T07:00:00.000Z" }
		]);
	});
});
