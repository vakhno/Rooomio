import type { Express } from "express";

import { API_MOUNT, API_PREFIX } from "@shared/routes/constants";

import authRoutes from "./auth/auth.routes.js";
import buildingsRoutes from "./buildings/buildings.routes.js";
import floorPlansRoutes from "./floor-plans/floor-plans.routes.js";

export const initRoutes = (app: Express) => {
	app.use(`${API_PREFIX}${API_MOUNT.auth}`, authRoutes);
	app.use(`${API_PREFIX}${API_MOUNT.buildings}`, buildingsRoutes);
	app.use(`${API_PREFIX}${API_MOUNT.floorPlans}`, floorPlansRoutes);
};
