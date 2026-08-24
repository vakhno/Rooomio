import { initAuthTables, initBuildingTables, initDb, initFloorPlanTables, initReservationTables } from "@shared/pg";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { initRoutes } from "../routes/index.js";

export const createApp = async () => {
	const app = express();

	app.set("trust proxy", true);

	app.use(cookieParser());
	app.use(cors({
		origin: [process.env.VITE_APP_URL],
		credentials: true,
	}));

	await initDb();
	await initAuthTables();
	await initBuildingTables();
	await initFloorPlanTables();
	await initReservationTables();

	app.use(helmet());
	app.use(express.json());

	app.get("/", (_req, res) => {
		res.json({ ok: true });
	});

	initRoutes(app);

	return app;
};
