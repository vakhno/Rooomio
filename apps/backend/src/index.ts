import { getPgPool, initAuthTables, initBuildingTables, initDb, initFloorPlanTables, initReservationTables } from "@shared/pg";
import { initSocketEvents, initSocketServer } from "@shared/sockets";
import { FloorLayoutSchema } from "@shared/zod-schemas";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { createPostgresReservationStore } from "./lib/reservation-store.js";
import { TOKEN_COOKIE_NAME, verifyToken } from "./routes/auth/session.js";
import { initRoutes } from "./routes/index.js";

const corsConfig = {
	origin: [process.env.VITE_APP_URL],
	credentials: true,
};

const expressApp = express();

expressApp.set("trust proxy", true);

expressApp.use(cookieParser());
expressApp.use(cors(corsConfig));

await initDb();
await initAuthTables();
await initBuildingTables();
await initFloorPlanTables();
await initReservationTables();

expressApp.use(helmet());
expressApp.use(express.json());

initRoutes(expressApp);

const { io, server } = initSocketServer(expressApp);

expressApp.set("io", io);

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
	getUserId: (socket) => {
		const cookieToken = socket.handshake.headers.cookie
			?.split(";")
			.map(part => part.trim())
			.find(part => part.startsWith(`${TOKEN_COOKIE_NAME}=`))
			?.slice(TOKEN_COOKIE_NAME.length + 1);
		const authToken = typeof socket.handshake.auth.token === "string" ? socket.handshake.auth.token : null;
		const token = cookieToken ?? authToken;

		return token ? verifyToken(decodeURIComponent(token))?.id ?? null : null;
	},
	reservations: createPostgresReservationStore(),
});

server.listen(process.env.PORT);
