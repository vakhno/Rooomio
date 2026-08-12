import type { RoomReservationWire } from "./contracts";

export const DEFAULT_NOTIFY_BEFORE_MINUTES = 10;

export const notifyBeforeMinutes = (value = process.env.NOTIFY_BEFORE_MINUTES) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_NOTIFY_BEFORE_MINUTES;
};

export const findNextOccupiedSlot = (
	reservation: RoomReservationWire,
	reservations: Iterable<RoomReservationWire>
) =>
	[...reservations]
		.filter(item =>
			item.id !== reservation.id
			&& item.roomId === reservation.roomId
			&& item.start === reservation.end)
		.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] ?? null;
