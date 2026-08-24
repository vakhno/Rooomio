import type { AddressInfo } from "node:net";
import type { ReservationAck, RoomReservationWire } from "@shared/sockets";
import type { Socket } from "socket.io-client";

import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { initSocketEvents, initSocketServer } from "@shared/sockets";
import { io as connect } from "socket.io-client";

const weekdaySchedule = [
	{ closesAt: "19:00", day: "monday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "tuesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "wednesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "thursday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "friday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "saturday", dayOff: true, opensAt: "09:00" },
	{ closesAt: "19:00", day: "sunday", dayOff: true, opensAt: "09:00" }
];

let cleanup: (() => Promise<void>) | null = null;

const createHarness = async () => {
	const app = express();
	const { io, server } = initSocketServer(app);
	const rooms = new Map<string, { id: string; name: string; schedule: typeof weekdaySchedule }>();

	initSocketEvents(io, {
		getRoom: ({ roomId }) => rooms.get(roomId) ?? null,
		getUserId: socket => typeof socket.handshake.auth.userId === "string" ? socket.handshake.auth.userId : null
	});

	await new Promise<void>(resolve => server.listen(0, resolve));

	const port = (server.address() as AddressInfo).port;
	const url = `http://127.0.0.1:${port}`;
	const sockets: Socket[] = [];

	cleanup = async () => {
		for (const socket of sockets)
			socket.disconnect();

		io.close();
		await new Promise<void>(resolve => server.close(() => resolve()));
	};

	const addRoom = () => {
		const id = globalThis.crypto.randomUUID();
		rooms.set(id, { id, name: "Focus", schedule: weekdaySchedule });
		return id;
	};

	const connectUser = async (userId: string) => {
		const socket = connect(url, {
			auth: { userId },
			transports: ["websocket"]
		});

		sockets.push(socket);
		await new Promise<void>((resolve, reject) => {
			socket.once("connect", resolve);
			socket.once("connect_error", reject);
		});

		return socket;
	};

	return { addRoom, connectUser };
};

afterEach(async () => {
	await cleanup?.();
	cleanup = null;
});

const emitAck = <T = ReservationAck>(socket: Socket, event: string, payload: unknown) =>
	new Promise<T>((resolve, reject) => {
		socket.timeout(1_000).emit(event, payload, (error: Error | null, ack: T) => {
			if (error)
				reject(error);
			else
				resolve(ack);
		});
	});

const listMine = (socket: Socket) =>
	new Promise<RoomReservationWire[]>(resolve => {
		socket.once("reservation:my:state", resolve);
		socket.emit("reservation:my:list");
	});

const createBooking = async (
	socket: Socket,
	input: { end?: string; floorId: string; roomId: string; start?: string; title?: string }
) => {
	const holdId = globalThis.crypto.randomUUID();
	const holdAck = await emitAck(socket, "reservation:hold:upsert", {
		end: input.end ?? "2026-09-15T07:00:00.000Z",
		floorId: input.floorId,
		holdId,
		roomId: input.roomId,
		roomName: "Focus",
		start: input.start ?? "2026-09-15T06:00:00.000Z"
	});

	if (!holdAck.ok)
		return holdAck;

	return emitAck(socket, "reservation:commit", {
		holdId,
		title: input.title ?? "Planning"
	});
};

describe("booking socket integration", () => {
	it("creates and cancels an own booking", async () => {
		const { addRoom, connectUser } = await createHarness();
		const roomId = addRoom();
		const socket = await connectUser("user-1");

		expect(await createBooking(socket, { floorId: "floor-1", roomId })).toEqual({ ok: true });

		const [reservation] = await listMine(socket);
		expect(reservation).toMatchObject({ ownerId: "user-1", roomId, title: "Planning" });

		expect(await emitAck(socket, "reservation:delete", { id: reservation.id, roomId })).toEqual({ ok: true });

		expect(await listMine(socket)).toHaveLength(0);
	});

	it("rejects another user canceling a booking", async () => {
		const { addRoom, connectUser } = await createHarness();
		const roomId = addRoom();
		const owner = await connectUser("owner");
		const stranger = await connectUser("stranger");

		expect(await createBooking(owner, { floorId: "floor-1", roomId })).toEqual({ ok: true });

		const [reservation] = await listMine(owner);
		expect(await emitAck(stranger, "reservation:delete", { id: reservation.id, roomId })).toEqual({
			error: "Only the reservation owner can cancel it.",
			ok: false
		});

		expect(await listMine(owner)).toHaveLength(1);
		expect(await listMine(stranger)).toHaveLength(0);
	});

	it("rejects occupied slots with a clear error", async () => {
		const { addRoom, connectUser } = await createHarness();
		const roomId = addRoom();
		const first = await connectUser("user-1");
		const second = await connectUser("user-2");

		expect(await createBooking(first, { floorId: "floor-1", roomId })).toEqual({ ok: true });

		expect(await createBooking(second, { floorId: "floor-1", roomId })).toEqual({
			error: "This time range is already selected or reserved.",
			ok: false
		});
	});

	it("rejects outside-hours bookings with a clear error", async () => {
		const { addRoom, connectUser } = await createHarness();
		const roomId = addRoom();
		const socket = await connectUser("user-1");

		expect(await createBooking(socket, {
			end: "2026-09-15T06:30:00.000Z",
			floorId: "floor-1",
			roomId,
			start: "2026-09-15T05:30:00.000Z"
		})).toEqual({
			error: "Reservation must be inside room working hours.",
			ok: false
		});
	});

	it("rejects past bookings with a clear error", async () => {
		const { addRoom, connectUser } = await createHarness();
		const roomId = addRoom();
		const socket = await connectUser("user-1");

		expect(await createBooking(socket, {
			end: "2020-09-15T07:00:00.000Z",
			floorId: "floor-1",
			roomId,
			start: "2020-09-15T06:00:00.000Z"
		})).toEqual({
			error: "Reservation must be in the future.",
			ok: false
		});
	});
});
