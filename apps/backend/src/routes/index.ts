import type { Express } from "express";

import { API_MOUNT, API_PREFIX } from "@shared/routes/constants";

import authRoutes from "./auth/auth.routes.js";

export const initRoutes = (app: Express) => {
	app.use(`${API_PREFIX}${API_MOUNT.auth}`, authRoutes);
};
