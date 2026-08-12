import { API_SEGMENT } from "@shared/routes/constants";
import { Router } from "express";

import * as floorPlansController from "./floor-plans.controller.js";

const router = Router();

router.get(API_SEGMENT.FLOOR_PLANS.LIST.path, floorPlansController.listFloorPlans);
router.get(API_SEGMENT.FLOOR_PLANS.CURRENT.path, floorPlansController.getCurrentFloorPlan);
router.put(API_SEGMENT.FLOOR_PLANS.CURRENT.path, floorPlansController.saveCurrentFloorPlan);
router.get("/:id", floorPlansController.getFloorPlan);

export default router;
