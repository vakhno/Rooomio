import type { Socket } from "socket.io-client";

import {
	getPgPool,
	initAuthTables,
	initBuildingTables,
	initDb,
	initFloorPlanTables,
} from "@shared/pg";
import { type FloorLayout, FloorLayoutSchema } from "@shared/zod-schemas";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readFileSync } from "node:fs";
import { io } from "socket.io-client";

const password = "Roomio2026!";
const now = new Date();
const ids = {
	shelbyBuilding: "seed-building-roomio-hq",
	shelbyFloor: "seed-floor-main",
	shelbyAccount: "seed-account-shelby",
	shelbyUser: "seed-user-shelby",
	sparrowBuilding: "seed-building-sparrow-roomio-hq",
	sparrowFloor: "seed-floor-sparrow-main",
	sparrowAccount: "seed-account-sparrow",
	sparrowUser: "seed-user-sparrow",
};

const seedProfiles = [
	{ buildingId: ids.shelbyBuilding, buildingName: "Shelby Roomio HQ", floorId: ids.shelbyFloor, ownerId: ids.shelbyUser, roomPrefix: "seed-shelby-room" },
	{ buildingId: ids.sparrowBuilding, buildingName: "Sparrow Roomio HQ", floorId: ids.sparrowFloor, ownerId: ids.sparrowUser, roomPrefix: "seed-sparrow-room" },
] as const;

const users = [
	{ accountId: ids.shelbyAccount, email: "shelby@roomio.test", id: ids.shelbyUser, name: "Shelby" },
	{ accountId: ids.sparrowAccount, email: "sparrow@roomio.test", id: ids.sparrowUser, name: "Sparrow" },
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

const baseLayout = FloorLayoutSchema.parse(JSON.parse(readFileSync(new URL("./seed-floor-layout.json", import.meta.url), "utf8")));
const roomNames = ["Aquarium", "Mars", "Sol", "Luna", "Orion"];
const roomCapacities = [6, 6, 12, 2, 2];
const seedLayout = (profile: (typeof seedProfiles)[number]): FloorLayout => ({
	...baseLayout,
	rooms: baseLayout.rooms.map((room, index) => ({
		...room,
		capacity: roomCapacities[index] ?? room.capacity,
		floor: "1st floor",
		id: `${profile.roomPrefix}-${index + 1}`,
		name: roomNames[index] ?? room.name,
		schedule,
	})),
});
const shelbyLayout = seedLayout(seedProfiles[0]);
const sparrowLayout = seedLayout(seedProfiles[1]);
const allRooms = [...shelbyLayout.rooms, ...sparrowLayout.rooms];

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
	{ dayOffset: 0, floorId: ids.shelbyFloor, ownerId: ids.shelbyUser, roomId: shelbyLayout.rooms[0]?.id ?? "", startHourUtc: 10, title: "Design review" },
	{ dayOffset: 1, floorId: ids.sparrowFloor, ownerId: ids.sparrowUser, roomId: sparrowLayout.rooms[1]?.id ?? "", startHourUtc: 12, title: "Sprint planning" },
	{ dayOffset: 2, floorId: ids.shelbyFloor, ownerId: ids.shelbyUser, roomId: shelbyLayout.rooms[2]?.id ?? "", startHourUtc: 14, title: "Client sync" },
	{ dayOffset: 3, floorId: ids.sparrowFloor, ownerId: ids.sparrowUser, roomId: sparrowLayout.rooms[3]?.id ?? "", startHourUtc: 9, title: "Roadmap check" },
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

	for (const profile of seedProfiles) {
		await pool.query(
			`insert into "building" (id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt")
			 values ($1, $2, $3, 'Demo Avenue 1, Kyiv', 1, $4, $4)
			 on conflict (id)
			 do update set name = excluded.name, address = excluded.address, "floorCount" = excluded."floorCount", "updatedAt" = excluded."updatedAt"`,
			[profile.buildingId, profile.ownerId, profile.buildingName, now],
		);

		const profileLayout = seedLayout(profile);
		await pool.query(
			`insert into "floorPlan" (id, "buildingId", "ownerId", "userId", floor, name, structure, layout, "createdAt", "updatedAt")
			 values ($1, $2, $3, $3, 1, 'Demo office', $4, $4, $5, $5)
			 on conflict ("buildingId", floor) where "buildingId" is not null
			 do update set name = excluded.name, structure = excluded.structure, layout = excluded.layout, "updatedAt" = excluded."updatedAt"`,
			[profile.floorId, profile.buildingId, profile.ownerId, JSON.stringify(profileLayout), now],
		);
	}
};

const connectSeedUser = async (apiUrl: string, userId: string) => {
	const token = jwt.sign({ id: userId, role: "user" }, process.env.JWT_SECRET, { expiresIn: "6h" });
	const socket = io(apiUrl, {
		autoConnect: false,
		auth: { token },
		extraHeaders: {
			Cookie: `token=${encodeURIComponent(token)}`,
		},
		transports: ["websocket"],
		withCredentials: true,
	});

	await new Promise<void>((resolve, reject) => {
		let onConnect: () => void;
		let onDisconnect: () => void;
		let onError: (error: Error) => void;
		let timeout: ReturnType<typeof setTimeout>;
		const cleanup = () => {
			clearTimeout(timeout);
			socket.off("connect", onConnect);
			socket.off("connect_error", onError);
			socket.off("disconnect", onDisconnect);
		};
		onConnect = () => {
			cleanup();
			resolve();
		};
		onError = (error: Error) => {
			cleanup();
			reject(error);
		};
		onDisconnect = () => {
			cleanup();
			reject(new Error("Seed socket was disconnected before it could connect."));
		};
		timeout = setTimeout(() => {
			cleanup();
			reject(new Error(`Could not connect seed socket to ${apiUrl}. Is the backend running?`));
		}, 5_000);

		socket.once("connect", onConnect);
		socket.once("connect_error", onError);
		socket.once("disconnect", onDisconnect);
		socket.connect();
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
	new Promise<Array<{ roomId: string; start: string; title: string }>>((resolve, reject) => {
		let onDisconnect: () => void;
		let onState: (items: Array<{ roomId: string; start: string; title: string }>) => void;
		const timeout = setTimeout(() => reject(new Error("Timed out loading existing seed reservations.")), 5_000);
		const cleanup = () => {
			clearTimeout(timeout);
			socket.off("disconnect", onDisconnect);
			socket.off("reservation:my:state", onState);
		};
		onDisconnect = () => {
			cleanup();
			reject(new Error("Seed socket disconnected while loading existing reservations."));
		};
		onState = (items: Array<{ roomId: string; start: string; title: string }>) => {
			cleanup();
			resolve(items);
		};

		socket.once("disconnect", onDisconnect);
		socket.once("reservation:my:state", onState);
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
				floorId: booking.floorId,
				holdId,
				roomId: booking.roomId,
				roomName: allRooms.find(room => room.id === booking.roomId)?.name ?? "Room",
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
