import type { Server } from "socket.io";

import type {
	ReservationAck,
	ReservationCommitPayload,
	ReservationDeletePayload,
	ReservationHoldPayload,
	ReservationRoomPayload,
	RoomReservationHold,
	RoomReservationWire
} from "../contracts";
import type { Socket } from "socket.io";

import { reservationRangesOverlap, validateReservationInput } from "../reservation-rules";

type SocketEventsOptions = {
	getUserId?: (socket: Socket) => string | null;
};

const HOLD_TTL_MS = 45_000;
const holds = new Map<string, RoomReservationHold>();
const reservations = new Map<string, RoomReservationWire>();

const roomChannel = (roomId: string) => `room-reservations:${roomId}`;
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

function deleteHold(io: Server, holdId: string) {
	const hold = holds.get(holdId);

	if (!hold)
		return;

	holds.delete(holdId);
	io.to(roomChannel(hold.roomId)).emit("reservation:hold:clear", { holdId });
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
		const ownerId = options.getUserId?.(socket) ?? socket.id;

		socket.on("reservation:room:join", (payload: ReservationRoomPayload) => {
			if (!payload.roomId)
				return;

			socket.join(roomChannel(payload.roomId));
			socket.emit("reservation:state", {
				holds: roomHolds(payload.roomId),
				reservations: roomReservations(payload.roomId)
			});
		});

		socket.on("reservation:my:list", () => {
			socket.emit("reservation:my:state", [...reservations.values()].filter(item => item.ownerId === ownerId));
		});

		socket.on("reservation:hold:upsert", (payload: ReservationHoldPayload, reply?: (ack: ReservationAck) => void) => {
			if (!payload.holdId || !payload.roomId || !payload.floorId || !payload.roomName) {
				reply?.({ error: "Room data is missing.", ok: false });
				return;
			}

			const validationError = validateReservationInput({
				end: payload.end,
				start: payload.start,
				title: "hold"
			});

			if (validationError) {
				reply?.({ error: validationError, ok: false });
				return;
			}

			if (
				hasReservationOverlap(payload.roomId, payload.start, payload.end)
				|| hasHoldOverlap(payload.roomId, payload.start, payload.end, payload.holdId)
			) {
				deleteHold(io, payload.holdId);
				reply?.({ error: "This time range is already selected or reserved.", ok: false });
				return;
			}

			const hold: RoomReservationHold = {
				end: payload.end,
				expiresAt: now() + HOLD_TTL_MS,
				floorId: payload.floorId,
				id: payload.holdId,
				ownerId,
				roomId: payload.roomId,
				roomName: payload.roomName,
				start: payload.start
			};

			holds.set(payload.holdId, hold);
			io.to(roomChannel(payload.roomId)).emit("reservation:hold:upsert", hold);
			reply?.({ ok: true });
		});

		socket.on("reservation:hold:cancel", (payload: { holdId: string }) => {
			const hold = holds.get(payload.holdId);

			if (hold?.ownerId === ownerId)
				deleteHold(io, payload.holdId);
		});

		socket.on("reservation:commit", (payload: ReservationCommitPayload, reply?: (ack: ReservationAck) => void) => {
			const hold = holds.get(payload.holdId);
			const title = payload.title.trim();

			if (!hold || hold.ownerId !== ownerId) {
				reply?.({ error: "Reservation hold is no longer available.", ok: false });
				return;
			}

			const validationError = validateReservationInput({ end: hold.end, start: hold.start, title });

			if (validationError) {
				deleteHold(io, hold.id);
				reply?.({ error: validationError, ok: false });
				return;
			}

			if (hasReservationOverlap(hold.roomId, hold.start, hold.end)) {
				deleteHold(io, hold.id);
				reply?.({ error: "This time range was already reserved.", ok: false });
				return;
			}

			const reservation: RoomReservationWire = {
				end: hold.end,
				floorId: hold.floorId,
				id: globalThis.crypto.randomUUID(),
				ownerId,
				roomId: hold.roomId,
				roomName: hold.roomName,
				start: hold.start,
				title
			};

			reservations.set(reservation.id, reservation);
			deleteHold(io, hold.id);
			io.to(roomChannel(hold.roomId)).emit("reservation:created", reservation);
			io.emit("reservation:my:changed", reservation.ownerId);
			reply?.({ ok: true });
		});

		socket.on("reservation:delete", (payload: ReservationDeletePayload) => {
			const reservation = reservations.get(payload.id);

			if (!reservation || reservation.roomId !== payload.roomId || reservation.ownerId !== ownerId)
				return;

			reservations.delete(payload.id);
			io.to(roomChannel(payload.roomId)).emit("reservation:deleted", payload);
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
