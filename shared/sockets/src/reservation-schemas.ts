import { z } from "zod";

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
	title: z.string().trim().min(1).max(100)
});

export const ReservationDeletePayloadSchema = z.object({
	id: z.string().trim().min(1),
	roomId: z.string().trim().min(1)
});

export const ReservationRoomPayloadSchema = z.object({
	roomId: z.string().trim().min(1)
});
