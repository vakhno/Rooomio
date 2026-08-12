import type { FloorLayout } from "@shared/zod-schemas";
import type { Socket } from "socket.io-client";

import {
	getPgPool,
	initAuthTables,
	initBuildingTables,
	initDb,
	initFloorPlanTables,
} from "@shared/pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { io } from "socket.io-client";

const password = "Roomio2026!";
const now = new Date();
const ids = {
	building: "seed-building-roomio-hq",
	floor: "seed-floor-main",
	shelbyAccount: "seed-account-shelby",
	shelbyUser: "seed-user-shelby",
	sparrowAccount: "seed-account-sparrow",
	sparrowUser: "seed-user-sparrow",
};

const users = [
	{ accountId: ids.shelbyAccount, email: "shelby@roomio.test", id: ids.shelbyUser, name: "Shelby" },
	{ accountId: ids.sparrowAccount, email: "sparrow@roomio.test", id: ids.sparrowUser, name: "Sparrow" },
];

const rooms: NonNullable<FloorLayout["rooms"]> = [
	{ bounds: { maxCol: 5, maxRow: 4, minCol: 1, minRow: 1 }, capacity: 6, floor: "1st floor", id: "seed-room-aquarium", name: "Aquarium", schedule: [] },
	{ bounds: { maxCol: 11, maxRow: 4, minCol: 7, minRow: 1 }, capacity: 10, floor: "1st floor", id: "seed-room-mars", name: "Mars", schedule: [] },
	{ bounds: { maxCol: 17, maxRow: 4, minCol: 13, minRow: 1 }, capacity: 8, floor: "1st floor", id: "seed-room-gagarin", name: "Gagarin", schedule: [] },
	{ bounds: { maxCol: 5, maxRow: 10, minCol: 1, minRow: 7 }, capacity: 4, floor: "1st floor", id: "seed-room-luna", name: "Luna", schedule: [] },
	{ bounds: { maxCol: 11, maxRow: 10, minCol: 7, minRow: 7 }, capacity: 12, floor: "1st floor", id: "seed-room-orion", name: "Orion", schedule: [] },
	{ bounds: { maxCol: 17, maxRow: 10, minCol: 13, minRow: 7 }, capacity: 16, floor: "1st floor", id: "seed-room-apollo", name: "Apollo", schedule: [] },
];

const schedule = [
	{ closesAt: "19:00", day: "monday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "tuesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "wednesday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "thursday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "friday", dayOff: false, opensAt: "09:00" },
	{ closesAt: "19:00", day: "saturday", dayOff: true, opensAt: "09:00" },
	{ closesAt: "19:00", day: "sunday", dayOff: true, opensAt: "09:00" },
] satisfies NonNullable<FloorLayout["rooms"]>[number]["schedule"];

const layout: FloorLayout = {
	cols: 19,
	floor: Array.from({ length: 19 * 12 }, (_, index) => [index % 19, Math.floor(index / 19)]),
	floorMaterials: [],
	rooms: rooms.map(room => ({ ...room, schedule })),
	rows: 12,
	walls: [],
};

const nextBusinessDate = (offset: number) => {
	const date = new Date();
	date.setUTCDate(date.getUTCDate() + 1);
	date.setUTCHours(10, 0, 0, 0);

	while (date.getUTCDay() === 0 || date.getUTCDay() === 6)
		date.setUTCDate(date.getUTCDate() + 1);

	for (let count = 0; count < offset; count += 1) {
		date.setUTCDate(date.getUTCDate() + 1);
		while (date.getUTCDay() === 0 || date.getUTCDay() === 6)
			date.setUTCDate(date.getUTCDate() + 1);
	}

	return date;
};

const demoBookings = [
	{ dayOffset: 0, ownerId: ids.shelbyUser, roomId: "seed-room-aquarium", startHourUtc: 10, title: "Design review" },
	{ dayOffset: 1, ownerId: ids.sparrowUser, roomId: "seed-room-mars", startHourUtc: 12, title: "Sprint planning" },
	{ dayOffset: 2, ownerId: ids.shelbyUser, roomId: "seed-room-gagarin", startHourUtc: 14, title: "Client sync" },
	{ dayOffset: 3, ownerId: ids.sparrowUser, roomId: "seed-room-orion", startHourUtc: 9, title: "Roadmap check" },
];

const seedDatabase = async () => {
	await initDb();
	await initAuthTables();
	await initBuildingTables();
	await initFloorPlanTables();

	const pool = getPgPool();
	const hashedPassword = await bcrypt.hash(password, 10);

	for (const user of users) {
		await pool.query(
			`insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role)
			 values ($1, $2, $3, true, null, $4, $4, 'user')
			 on conflict (id)
			 do update set name = excluded.name, email = excluded.email, "updatedAt" = excluded."updatedAt"`,
			[user.id, user.name, user.email, now],
		);
		await pool.query(
			`insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
			 values ($1, $2, 'credential', $3, $4, $5, $5)
			 on conflict (id)
			 do update set "accountId" = excluded."accountId", password = excluded.password, "updatedAt" = excluded."updatedAt"`,
			[user.accountId, user.email, user.id, hashedPassword, now],
		);
	}

	await pool.query(
		`insert into "building" (id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt")
		 values ($1, $2, 'Roomio HQ', 'Demo Avenue 1, Kyiv', 1, $3, $3)
		 on conflict (id)
		 do update set name = excluded.name, address = excluded.address, "floorCount" = excluded."floorCount", "updatedAt" = excluded."updatedAt"`,
		[ids.building, ids.shelbyUser, now],
	);

	await pool.query(
		`insert into "floorPlan" (id, "buildingId", "ownerId", "userId", floor, name, structure, layout, "createdAt", "updatedAt")
		 values ($1, $2, $3, $3, 1, 'Demo office', $4, $4, $5, $5)
		 on conflict ("buildingId", floor) where "buildingId" is not null
		 do update set name = excluded.name, structure = excluded.structure, layout = excluded.layout, "updatedAt" = excluded."updatedAt"`,
		[ids.floor, ids.building, ids.shelbyUser, JSON.stringify(layout), now],
	);
};

const connectSeedUser = async (apiUrl: string, userId: string) => {
	const token = jwt.sign({ id: userId, role: "user" }, process.env.JWT_SECRET, { expiresIn: "6h" });
	const socket = io(apiUrl, {
		extraHeaders: {
			Cookie: `token=${encodeURIComponent(token)}`,
		},
		transports: ["websocket"],
		withCredentials: true,
	});

	await new Promise<void>((resolve, reject) => {
		socket.once("connect", resolve);
		socket.once("connect_error", reject);
	});

	return socket;
};

const emitAck = (socket: Socket, event: string, payload: unknown) =>
	new Promise<{ error?: string; ok: boolean }>((resolve, reject) => {
		socket.timeout(5_000).emit(event, payload, (error: Error | null, ack?: { error?: string; ok: boolean }) => {
			if (error)
				reject(error);
			else
				resolve(ack ?? { error: "Missing acknowledgement.", ok: false });
		});
	});

const listMine = (socket: Socket) =>
	new Promise<Array<{ roomId: string; start: string; title: string }>>((resolve) => {
		socket.once("reservation:my:state", resolve);
		socket.emit("reservation:my:list");
	});

const seedDemoBookings = async () => {
	const apiUrl = process.env.SEED_API_URL || process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3000}`;
	const sockets = new Map<string, Socket>();

	try {
		for (const user of users)
			sockets.set(user.id, await connectSeedUser(apiUrl, user.id));

		for (const booking of demoBookings) {
			const socket = sockets.get(booking.ownerId);

			if (!socket)
				continue;

			const start = nextBusinessDate(booking.dayOffset);
			start.setUTCHours(booking.startHourUtc, 0, 0, 0);
			const end = new Date(start);
			end.setUTCHours(start.getUTCHours() + 1);

			const existing = await listMine(socket);
			if (existing.some(item => item.roomId === booking.roomId && item.start === start.toISOString() && item.title === booking.title))
				continue;

			const holdId = globalThis.crypto.randomUUID();
			const holdAck = await emitAck(socket, "reservation:hold:upsert", {
				end: end.toISOString(),
				floorId: ids.floor,
				holdId,
				roomId: booking.roomId,
				roomName: rooms.find(room => room.id === booking.roomId)?.name ?? "Room",
				start: start.toISOString(),
			});

			if (!holdAck.ok)
				throw new Error(`Could not create hold for ${booking.title}: ${holdAck.error}`);

			const commitAck = await emitAck(socket, "reservation:commit", { holdId, title: booking.title });

			if (!commitAck.ok)
				throw new Error(`Could not create booking for ${booking.title}: ${commitAck.error}`);
		}
	}
	finally {
		for (const socket of sockets.values())
			socket.disconnect();
	}
};

try {
	await seedDatabase();
	await seedDemoBookings();
	console.warn("Seeded Roomio demo data.");
	console.warn(`Users: ${users.map(user => `${user.email} / ${password}`).join(", ")}`);
}
catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}
finally {
	await getPgPool().end();
}
