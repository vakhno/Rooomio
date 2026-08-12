import { z } from "zod";

import { MAX_WEEKLY_RECURRENCE_COUNT } from "./reservation-rules";

export const ReservationHoldPayloadSchema = z.object({
	end: z.string().trim().min(1),
	floorId: z.string().trim().min(1),
	holdId: z.string().trim().min(1),
	roomId: z.string().trim().min(1),
	roomName: z.string().trim().min(1).max(80),
	start: z.string().trim().min(1)
});

export const ReservationCommitPayloadSchema = z.object({
	holdId: z.string().trim().min(1),
	recurrenceCount: z.number().int().min(1).max(MAX_WEEKLY_RECURRENCE_COUNT).default(1),
	title: z.string().trim().min(1).max(100)
});

export const ReservationDeletePayloadSchema = z.object({
	id: z.string().trim().min(1),
	roomId: z.string().trim().min(1),
	scope: z.enum(["occurrence", "series"]).default("occurrence")
});

export const ReservationRoomPayloadSchema = z.object({
	roomId: z.string().trim().min(1)
});
