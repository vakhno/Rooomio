import { initAuthTables, initBuildingTables, initDb, initFloorPlanTables } from "@shared/pg";
import { initSocketEvents, initSocketServer } from "@shared/sockets";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

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

expressApp.use(helmet());
expressApp.use(express.json());

initRoutes(expressApp);

const { io, server } = initSocketServer(expressApp);

expressApp.set("io", io);

initSocketEvents(io, {
	getUserId: (socket) => {
		const token = socket.handshake.headers.cookie
			?.split(";")
			.map(part => part.trim())
			.find(part => part.startsWith(`${TOKEN_COOKIE_NAME}=`))
			?.slice(TOKEN_COOKIE_NAME.length + 1);

		return token ? verifyToken(decodeURIComponent(token))?.id ?? null : null;
	},
});

server.listen(process.env.PORT);
