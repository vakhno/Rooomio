import type { z } from "zod";

import type {
	ReservationCommitPayloadSchema,
	ReservationDeletePayloadSchema,
	ReservationHoldPayloadSchema,
	ReservationRoomPayloadSchema
} from "./reservation-schemas";

export type RoomReservationWire = {
	end: string;
	floorId: string;
	id: string;
	ownerId: string;
	roomId: string;
	roomName: string;
	start: string;
	title: string;
};

export type RoomReservationHold = {
	end: string;
	expiresAt: number;
	floorId: string;
	id: string;
	ownerId: string;
	roomId: string;
	roomName: string;
	start: string;
};

export type ReservationRoomPayload = z.infer<typeof ReservationRoomPayloadSchema>;

export type ReservationHoldPayload = z.infer<typeof ReservationHoldPayloadSchema>;

export type ReservationCommitPayload = z.infer<typeof ReservationCommitPayloadSchema>;

export type ReservationDeletePayload = z.infer<typeof ReservationDeletePayloadSchema>;

export type ReservationStatePayload = {
	holds: RoomReservationHold[];
	reservations: RoomReservationWire[];
};

export type ReservationEndingSoonPayload = {
	nextReservation: RoomReservationWire;
	notifyBeforeMinutes: number;
	reservation: RoomReservationWire;
};

export type ReservationAck =
	| { error: string; ok: false }
	| { ok: true };
