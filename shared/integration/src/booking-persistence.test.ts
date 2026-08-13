import type { AddressInfo } from "node:net";
import type { ReservationAck, RoomReservationWire } from "@shared/sockets";
import type { Socket } from "socket.io-client";

import { getPgPool, initAuthTables, initBuildingTables, initDb, initFloorPlanTables, initReservationTables } from "@shared/pg";
import { initSocketEvents, initSocketServer } from "@shared/sockets";
import { FloorLayoutSchema } from "@shared/zod-schemas";
import express from "express";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { io as connect } from "socket.io-client";

import { createPostgresReservationStore } from "../../../apps/backend/src/lib/reservation-store.js";

const describeWithPg = process.env.POSTGRES_URL ? describe : describe.skip;

const weekdaySchedule = [
	{ closesAt: "19:00", day: "monday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "tuesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "wednesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "thursday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "friday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "saturday", dayOff: true, opensAt: "09:00" },
	{ closesAt: "19:00", day: "sunday", dayOff: true, opensAt: "09:00" },
] as const;

const floorStructure = (roomId: string) => ({
	cols: 4,
	floor: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]],
	floorMaterials: [],
	rooms: [{
		bounds: { maxCol: 1, maxRow: 1, minCol: 0, minRow: 0 },
		capacity: 4,
		floor: "1",
		id: roomId,
		name: "Focus",
		schedule: weekdaySchedule,
	}],
	rows: 4,
	walls: [],
});

let cleanupServers: Array<() => Promise<void>> = [];
let cleanupIds: { buildingId: string; userId: string } | null = null;
let pgAvailable = false;

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

const startSocketHarness = async () => {
	const app = express();
	const { io, server } = initSocketServer(app);

	initSocketEvents(io, {
		getRoom: async ({ floorId, roomId }) => {
			const result = await getPgPool().query<{ structure: unknown }>(
				`select structure from "floorPlan" where id = $1 limit 1`,
				[floorId],
			);
			const parsed = FloorLayoutSchema.safeParse(result.rows[0]?.structure);

			if (!parsed.success)
				return null;

			const room = parsed.data.rooms.find(item => item.id === roomId);
			return room ? { id: room.id, name: room.name, schedule: room.schedule } : null;
		},
		getUserId: socket => typeof socket.handshake.auth.userId === "string" ? socket.handshake.auth.userId : null,
		reservations: createPostgresReservationStore(),
	});

	await new Promise<void>(resolve => server.listen(0, resolve));

	const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	const sockets: Socket[] = [];

	cleanupServers.push(async () => {
		for (const socket of sockets)
			socket.disconnect();

		io.close();
		await new Promise<void>(resolve => server.close(() => resolve()));
	});

	const connectUser = async (userId: string) => {
		const socket = connect(url, {
			auth: { userId },
			transports: ["websocket"],
		});

		sockets.push(socket);
		await new Promise<void>((resolve, reject) => {
			socket.once("connect", resolve);
			socket.once("connect_error", reject);
		});

		return socket;
	};

	return { connectUser };
};

const seedBuildingFloorAndRoom = async () => {
	const suffix = globalThis.crypto.randomUUID();
	const userId = `user-${suffix}`;
	const buildingId = `building-${suffix}`;
	const floorId = `floor-${suffix}`;
	const roomId = `room-${suffix}`;
	const now = new Date();

	await getPgPool().query(
		`insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role)
		 values ($1, 'Owner', $2, false, null, $3, $3, 'user')`,
		[userId, `${suffix}@roomio.test`, now],
	);
	await getPgPool().query(
		`insert into "building" (id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt")
		 values ($1, $2, 'HQ', 'Main street', 1, $3, $3)`,
		[buildingId, userId, now],
	);
	await getPgPool().query(
		`insert into "floorPlan" (id, "buildingId", "ownerId", "userId", floor, name, structure, layout, "createdAt", "updatedAt")
		 values ($1, $2, $3, $3, 1, 'First floor', $4, $4, $5, $5)`,
		[floorId, buildingId, userId, JSON.stringify(floorStructure(roomId)), now],
	);

	cleanupIds = { buildingId, userId };
	return { floorId, roomId, userId };
};

beforeAll(async () => {
	if (!process.env.POSTGRES_URL)
		return;

	try {
		await initDb();
		await initAuthTables();
		await initBuildingTables();
		await initFloorPlanTables();
		await initReservationTables();
		pgAvailable = true;
	}
	catch {
		pgAvailable = false;
	}
});

afterEach(async () => {
	for (const cleanup of cleanupServers.splice(0).reverse())
		await cleanup();

	if (cleanupIds) {
		await getPgPool().query(`delete from "building" where id = $1`, [cleanupIds.buildingId]);
		await getPgPool().query(`delete from "user" where id = $1`, [cleanupIds.userId]);
		cleanupIds = null;
	}
});

describeWithPg("booking persistence with buildings and rooms", () => {
	it("stores committed bookings in Postgres and reloads them after socket server restart", async () => {
		if (!pgAvailable)
			return;

		const { floorId, roomId, userId } = await seedBuildingFloorAndRoom();
		const firstServer = await startSocketHarness();
		const firstSocket = await firstServer.connectUser(userId);
		const holdId = globalThis.crypto.randomUUID();

		expect(await emitAck(firstSocket, "reservation:hold:upsert", {
			end: "2026-09-15T07:00:00.000Z",
			floorId,
			holdId,
			roomId,
			roomName: "Focus",
			start: "2026-09-15T06:30:00.000Z",
		})).toEqual({ ok: true });
		expect(await emitAck(firstSocket, "reservation:commit", { holdId, title: "Planning" })).toEqual({ ok: true });

		const [created] = await listMine(firstSocket);
		expect(created).toMatchObject({ floorId, ownerId: userId, roomId, roomName: "Focus", title: "Planning" });

		await cleanupServers.pop()?.();

		const secondServer = await startSocketHarness();
		const secondSocket = await secondServer.connectUser(userId);
		const [persisted] = await listMine(secondSocket);

		expect(persisted).toMatchObject({ id: created.id, floorId, ownerId: userId, roomId, title: "Planning" });

		const stored = await getPgPool().query<{ count: string }>(
			`select count(*) from "reservation" where id = $1 and "ownerId" = $2 and "floorId" = $3 and "roomId" = $4`,
			[created.id, userId, floorId, roomId],
		);
		expect(stored.rows[0]?.count).toBe("1");
	});
});
