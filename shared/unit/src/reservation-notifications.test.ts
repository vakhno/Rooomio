import { describe, expect, it } from "vitest";

import { findNextOccupiedSlot, notifyBeforeMinutes, type RoomReservationWire } from "@shared/sockets";

const reservation = (override: Partial<RoomReservationWire>): RoomReservationWire => ({
	end: "2026-08-12T10:30:00.000Z",
	floorId: "floor-1",
	id: "reservation-1",
	ownerId: "user-1",
	roomId: "room-1",
	roomName: "Focus",
	start: "2026-08-12T10:00:00.000Z",
	title: "Planning",
	...override
});

describe("findNextOccupiedSlot", () => {
	it("returns the booking that starts when the current booking ends", () => {
		const current = reservation({});
		const next = reservation({
			end: "2026-08-12T11:00:00.000Z",
			id: "reservation-2",
			ownerId: "user-2",
			start: current.end
		});

		expect(findNextOccupiedSlot(current, [next])).toBe(next);
	});

	it("ignores free gaps and other rooms", () => {
		const current = reservation({});

		expect(findNextOccupiedSlot(current, [
			reservation({ id: "reservation-2", start: "2026-08-12T10:45:00.000Z" }),
			reservation({ id: "reservation-3", roomId: "room-2", start: current.end })
		])).toBeNull();
	});
});

describe("notifyBeforeMinutes", () => {
	it("defaults to ten minutes for missing or invalid configuration", () => {
		expect(notifyBeforeMinutes()).toBe(10);
		expect(notifyBeforeMinutes("nope")).toBe(10);
		expect(notifyBeforeMinutes("0")).toBe(10);
	});

	it("uses a positive numeric environment value", () => {
		expect(notifyBeforeMinutes("5")).toBe(5);
	});
});
