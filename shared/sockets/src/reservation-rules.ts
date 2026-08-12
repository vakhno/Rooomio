export type ReservationValidationInput = {
	end: string;
	now?: Date;
	start: string;
	title: string;
};

export const SLOT_MINUTES = 30;
export const MAX_RESERVATION_MINUTES = 4 * 60;

const toDate = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

export const reservationRangesOverlap = (firstStart: Date, firstEnd: Date, secondStart: Date, secondEnd: Date) =>
	firstStart < secondEnd && firstEnd > secondStart;

export const isUtcIso = (value: string) => value.endsWith("Z") && toDate(value)?.toISOString() === value;

export function validateReservationInput({ end, now = new Date(), start, title }: ReservationValidationInput) {
	const startDate = toDate(start);
	const endDate = toDate(end);
	const trimmedTitle = title.trim();

	if (!trimmedTitle || trimmedTitle.length > 100)
		return "Title must be 1 to 100 characters.";

	if (!startDate || !endDate || !isUtcIso(start) || !isUtcIso(end))
		return "Reservation time must be stored in UTC ISO format.";

	if (startDate < now)
		return "Reservation must be in the future.";

	if (startDate >= endDate)
		return "Reservation end must be after start.";

	const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60_000;

	if (durationMinutes < SLOT_MINUTES || durationMinutes > MAX_RESERVATION_MINUTES)
		return "Reservation duration must be from 30 minutes to 4 hours.";

	if (startDate.getUTCMinutes() % SLOT_MINUTES !== 0 || endDate.getUTCMinutes() % SLOT_MINUTES !== 0)
		return "Reservation time must use 30 minute slots.";

	return null;
}
