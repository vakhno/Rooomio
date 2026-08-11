import { API_SEGMENT } from "@shared/routes/constants";
import { Router } from "express";

import * as buildingsController from "./buildings.controller.js";

const router = Router();

router.get(API_SEGMENT.BUILDINGS.LIST.path, buildingsController.listBuildings);
router.get(API_SEGMENT.BUILDINGS.MY.path, buildingsController.listMyBuildings);
router.post(API_SEGMENT.BUILDINGS.LIST.path, buildingsController.createBuilding);

export default router;
