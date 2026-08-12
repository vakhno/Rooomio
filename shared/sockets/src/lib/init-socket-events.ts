import type { Server } from "socket.io";

import type {
	ReservationAck,
	ReservationDeletePayload,
	ReservationEndingSoonPayload,
	RoomReservationHold,
	RoomReservationWire
} from "../contracts";
import type { ReservationScheduleDay } from "../reservation-rules";
import type { Socket } from "socket.io";

import { findNextOccupiedSlot, notifyBeforeMinutes } from "../reservation-notifications";
import {
	ReservationCommitPayloadSchema,
	ReservationDeletePayloadSchema,
	ReservationHoldPayloadSchema,
	ReservationRoomPayloadSchema
} from "../reservation-schemas";
import {
	createWeeklyReservationOccurrences,
	reservationRangesOverlap,
	validateReservationInput,
	validateReservationOfficeHours
} from "../reservation-rules";

type ReservableRoom = {
	id: string;
	name: string;
	schedule: ReservationScheduleDay[];
};

type SocketEventsOptions = {
	getRoom?: (input: { floorId: string; roomId: string }) => Promise<ReservableRoom | null> | ReservableRoom | null;
	getUserId?: (socket: Socket) => string | null;
};

const HOLD_TTL_MS = 45_000;
const holds = new Map<string, RoomReservationHold>();
const reservations = new Map<string, RoomReservationWire>();
const notificationTimers = new Map<string, ReturnType<typeof setTimeout>>();

const roomChannel = (roomId: string) => `room-reservations:${roomId}`;
const userChannel = (ownerId: string) => `reservation-owner:${ownerId}`;
const now = () => Date.now();
const roomReservations = (roomId: string) => [...reservations.values()].filter(item => item.roomId === roomId);
const roomHolds = (roomId: string) => [...holds.values()].filter(item => item.roomId === roomId && item.expiresAt > now());

const toDate = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
	const startA = toDate(aStart);
	const endA = toDate(aEnd);
	const startB = toDate(bStart);
	const endB = toDate(bEnd);

	return Boolean(startA && endA && startB && endB && reservationRangesOverlap(startA, endA, startB, endB));
};

const hasReservationOverlap = (roomId: string, start: string, end: string) =>
	roomReservations(roomId).some(item => overlaps(start, end, item.start, item.end));

const hasHoldOverlap = (roomId: string, start: string, end: string, holdId: string) =>
	roomHolds(roomId).some(item => item.id !== holdId && overlaps(start, end, item.start, item.end));

const validateBooking = (
	input: { end: string; room?: ReservableRoom | null; start: string; title: string }
) =>
	validateReservationInput(input)
	?? (input.room ? validateReservationOfficeHours({ end: input.end, schedule: input.room.schedule, start: input.start }) : null);

function deleteHold(io: Server, holdId: string) {
	const hold = holds.get(holdId);

	if (!hold)
		return;

	holds.delete(holdId);
	io.to(roomChannel(hold.roomId)).emit("reservation:hold:clear", { holdId });
}

function clearNotification(reservationId: string) {
	const timer = notificationTimers.get(reservationId);

	if (timer)
		clearTimeout(timer);

	notificationTimers.delete(reservationId);
}

function scheduleEndingNotification(io: Server, reservation: RoomReservationWire) {
	clearNotification(reservation.id);

	const nextReservation = findNextOccupiedSlot(reservation, reservations.values());

	if (!nextReservation)
		return;

	const minutes = notifyBeforeMinutes();
	const notifyAt = new Date(reservation.end).getTime() - minutes * 60_000;
	const reservationEnd = new Date(reservation.end).getTime();

	if (!Number.isFinite(notifyAt) || reservationEnd <= now())
		return;

	const timer = setTimeout(() => {
		const current = reservations.get(reservation.id);
		const next = current ? findNextOccupiedSlot(current, reservations.values()) : null;

		notificationTimers.delete(reservation.id);

		if (!current || !next)
			return;

		const payload: ReservationEndingSoonPayload = {
			nextReservation: next,
			notifyBeforeMinutes: minutes,
			reservation: current
		};

		io.to(userChannel(current.ownerId)).emit("reservation:ending-soon", payload);
	}, Math.max(0, notifyAt - now()));

	timer.unref?.();
	notificationTimers.set(reservation.id, timer);
}

function rescheduleRoomNotifications(io: Server, roomId: string) {
	for (const reservation of roomReservations(roomId))
		scheduleEndingNotification(io, reservation);
}

export const initSocketEvents = (io: Server, options: SocketEventsOptions = {}) => {
	const cleanupTimer = setInterval(() => {
		for (const hold of holds.values()) {
			if (hold.expiresAt <= now())
				deleteHold(io, hold.id);
		}
	}, 1_000);

	cleanupTimer.unref?.();

	io.on("connection", (socket) => {
		const ownerId = options.getUserId ? options.getUserId(socket) : socket.id;

		if (!ownerId) {
			socket.disconnect(true);
			return;
		}

		socket.join(userChannel(ownerId));

		socket.on("reservation:room:join", (payload) => {
			const parsedPayload = ReservationRoomPayloadSchema.safeParse(payload);

			if (!parsedPayload.success)
				return;

			socket.join(roomChannel(parsedPayload.data.roomId));
			socket.emit("reservation:state", {
				holds: roomHolds(parsedPayload.data.roomId),
				reservations: roomReservations(parsedPayload.data.roomId)
			});
		});

		socket.on("reservation:my:list", () => {
			socket.emit("reservation:my:state", [...reservations.values()].filter(item => item.ownerId === ownerId));
		});

		socket.on("reservation:hold:upsert", async (payload, reply?: (ack: ReservationAck) => void) => {
			const parsedPayload = ReservationHoldPayloadSchema.safeParse(payload);

			if (!parsedPayload.success) {
				reply?.({ error: "Room data is missing.", ok: false });
				return;
			}

			const input = parsedPayload.data;
			const room = options.getRoom ? await options.getRoom({ floorId: input.floorId, roomId: input.roomId }) : null;

			if (options.getRoom && !room) {
				reply?.({ error: "Room is not available for booking.", ok: false });
				return;
			}

			const validationError = validateBooking({
				room,
				end: input.end,
				start: input.start,
				title: "hold"
			});

			if (validationError) {
				reply?.({ error: validationError, ok: false });
				return;
			}

			if (
				hasReservationOverlap(input.roomId, input.start, input.end)
				|| hasHoldOverlap(input.roomId, input.start, input.end, input.holdId)
			) {
				deleteHold(io, input.holdId);
				reply?.({ error: "This time range is already selected or reserved.", ok: false });
				return;
			}

			const hold: RoomReservationHold = {
				end: input.end,
				expiresAt: now() + HOLD_TTL_MS,
				floorId: input.floorId,
				id: input.holdId,
				ownerId,
				roomId: input.roomId,
				roomName: room?.name ?? input.roomName,
				start: input.start
			};

			holds.set(input.holdId, hold);
			io.to(roomChannel(input.roomId)).emit("reservation:hold:upsert", hold);
			reply?.({ ok: true });
		});

		socket.on("reservation:hold:cancel", (payload: { holdId: string }) => {
			const hold = holds.get(payload.holdId);

			if (hold?.ownerId === ownerId)
				deleteHold(io, payload.holdId);
		});

		socket.on("reservation:commit", async (payload, reply?: (ack: ReservationAck) => void) => {
			const parsedPayload = ReservationCommitPayloadSchema.safeParse(payload);

			if (!parsedPayload.success) {
				reply?.({ error: "Title must be 1 to 100 characters.", ok: false });
				return;
			}

			const hold = holds.get(parsedPayload.data.holdId);
			const title = parsedPayload.data.title.trim();
			const recurrenceCount = parsedPayload.data.recurrenceCount;

			if (!hold || hold.ownerId !== ownerId) {
				reply?.({ error: "Reservation hold is no longer available.", ok: false });
				return;
			}

			const room = options.getRoom ? await options.getRoom({ floorId: hold.floorId, roomId: hold.roomId }) : null;

			if (options.getRoom && !room) {
				deleteHold(io, hold.id);
				reply?.({ error: "Room is not available for booking.", ok: false });
				return;
			}

			const occurrences = createWeeklyReservationOccurrences(hold.start, hold.end, recurrenceCount);

			if (occurrences.length !== recurrenceCount) {
				deleteHold(io, hold.id);
				reply?.({ error: "Weekly recurrence count must be from 1 to 52.", ok: false });
				return;
			}

			const validationError = occurrences
				.map((occurrence) => {
					const occurrenceLabel = recurrenceCount > 1 ? `Occurrence ${occurrence.index + 1}: ` : "";
					const error = validateBooking({
						room,
						end: occurrence.end,
						start: occurrence.start,
						title
					});

					if (error)
						return `${occurrenceLabel}${error}`;

					if (hasReservationOverlap(hold.roomId, occurrence.start, occurrence.end))
						return `${occurrenceLabel}This time range was already reserved.`;

					if (hasHoldOverlap(hold.roomId, occurrence.start, occurrence.end, hold.id))
						return `${occurrenceLabel}This time range is already selected or reserved.`;

					return null;
				})
				.find(Boolean);

			if (validationError) {
				deleteHold(io, hold.id);
				reply?.({ error: validationError, ok: false });
				return;
			}

			const seriesId = recurrenceCount > 1 ? globalThis.crypto.randomUUID() : undefined;
			const createdReservations = occurrences.map((occurrence): RoomReservationWire => ({
				end: occurrence.end,
				floorId: hold.floorId,
				id: globalThis.crypto.randomUUID(),
				ownerId,
				roomId: hold.roomId,
				roomName: room?.name ?? hold.roomName,
				seriesCount: seriesId ? recurrenceCount : undefined,
				seriesId,
				seriesIndex: seriesId ? occurrence.index : undefined,
				start: occurrence.start,
				title
			}));

			for (const reservation of createdReservations)
				reservations.set(reservation.id, reservation);

			deleteHold(io, hold.id);
			rescheduleRoomNotifications(io, hold.roomId);
			for (const reservation of createdReservations)
				io.to(roomChannel(hold.roomId)).emit("reservation:created", reservation);
			io.emit("reservation:my:changed", ownerId);
			reply?.({ ok: true });
		});

		socket.on("reservation:delete", (payload: ReservationDeletePayload) => {
			const parsedPayload = ReservationDeletePayloadSchema.safeParse(payload);

			if (!parsedPayload.success)
				return;

			const reservation = reservations.get(parsedPayload.data.id);

			if (!reservation || reservation.roomId !== parsedPayload.data.roomId || reservation.ownerId !== ownerId)
				return;

			const deletedReservations = parsedPayload.data.scope === "series" && reservation.seriesId
				? [...reservations.values()].filter(item => item.seriesId === reservation.seriesId && item.ownerId === ownerId)
				: [reservation];

			for (const item of deletedReservations) {
				reservations.delete(item.id);
				clearNotification(item.id);
				io.to(roomChannel(item.roomId)).emit("reservation:deleted", { id: item.id, roomId: item.roomId });
			}

			rescheduleRoomNotifications(io, reservation.roomId);
			io.emit("reservation:my:changed", reservation.ownerId);
		});

		socket.on("disconnect", () => {
			for (const hold of holds.values()) {
				if (hold.ownerId === ownerId)
					deleteHold(io, hold.id);
			}
		});
	});
};
