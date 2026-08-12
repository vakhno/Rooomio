export type ReservationValidationInput = {
	end: string;
	now?: Date;
	start: string;
	title: string;
};

export type ReservationScheduleDay = {
	closesAt: string;
	day: string;
	dayOff: boolean;
	opensAt: string;
};

export type ReservationOfficeHoursInput = {
	end: string;
	schedule: ReservationScheduleDay[];
	start: string;
};

export const SLOT_MINUTES = 30;
export const MAX_RESERVATION_MINUTES = 4 * 60;
export const MAX_WEEKLY_RECURRENCE_COUNT = 52;
export const OFFICE_TIME_ZONE = "Europe/Kyiv";

const officeDateParts = (date: Date) => {
	const parts = new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		hour: "numeric",
		hour12: false,
		minute: "numeric",
		month: "numeric",
		timeZone: OFFICE_TIME_ZONE,
		weekday: "short",
		year: "numeric"
	}).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";

	return {
		day: Number(value("day")),
		hours: Number(value("hour")),
		minutes: Number(value("minute")),
		month: Number(value("month")),
		weekday: value("weekday").toLowerCase(),
		year: Number(value("year"))
	};
};

const dateTimeFromParts = (parts: ReturnType<typeof officeDateParts>) =>
	Date.UTC(parts.year, parts.month - 1, parts.day, parts.hours, parts.minutes);

const officeDateToUtc = (parts: ReturnType<typeof officeDateParts>) => {
	let utc = dateTimeFromParts(parts);

	for (let attempt = 0; attempt < 2; attempt += 1) {
		const actual = officeDateParts(new Date(utc));
		utc += dateTimeFromParts(parts) - dateTimeFromParts(actual);
	}

	return new Date(utc);
};

const minutesFromTime = (value: string) => {
	const [hours = "0", minutes = "0"] = value.split(":");
	return Number(hours) * 60 + Number(minutes);
};

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

export function validateReservationOfficeHours({ end, schedule, start }: ReservationOfficeHoursInput) {
	const startDate = toDate(start);
	const endDate = toDate(end);

	if (!startDate || !endDate)
		return "Reservation time must be stored in UTC ISO format.";

	const officeStart = officeDateParts(startDate);
	const officeEnd = officeDateParts(endDate);
	const workDay = schedule.find(day => day.day.startsWith(officeStart.weekday));

	if (
		!workDay
		|| workDay.dayOff
		|| officeStart.year !== officeEnd.year
		|| officeStart.month !== officeEnd.month
		|| officeStart.day !== officeEnd.day
	) {
		return "Reservation must be inside room working hours.";
	}

	const startMinutes = officeStart.hours * 60 + officeStart.minutes;
	const endMinutes = officeEnd.hours * 60 + officeEnd.minutes;

	if (startMinutes < minutesFromTime(workDay.opensAt) || endMinutes > minutesFromTime(workDay.closesAt))
		return "Reservation must be inside room working hours.";

	return null;
}

export function createWeeklyReservationOccurrences(start: string, end: string, count: number) {
	const startDate = toDate(start);
	const endDate = toDate(end);

	if (!startDate || !endDate || count < 1 || count > MAX_WEEKLY_RECURRENCE_COUNT)
		return [];

	const durationMs = endDate.getTime() - startDate.getTime();
	const startParts = officeDateParts(startDate);

	return Array.from({ length: count }, (_, index) => {
		const occurrenceStart = officeDateToUtc({
			...startParts,
			day: startParts.day + index * 7
		});
		const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);

		return {
			end: occurrenceEnd.toISOString(),
			index,
			start: occurrenceStart.toISOString()
		};
	});
}
