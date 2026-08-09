import { initAuthTables, initDb } from "@shared/pg";
import { initSocketEvents, initSocketServer } from "@shared/sockets";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

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

expressApp.use(helmet());
expressApp.use(express.json());

initRoutes(expressApp);

const { io, server } = initSocketServer(expressApp);

expressApp.set("io", io);

initSocketEvents(io);

server.listen(process.env.PORT);
