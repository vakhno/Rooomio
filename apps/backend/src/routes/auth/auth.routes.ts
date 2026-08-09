import { API_SEGMENT } from "@shared/routes/constants";
import express, { Router } from "express";

import * as authController from "./auth.controller";

const router = Router();

router.get(API_SEGMENT.AUTH.SESSION.path, authController.getSession);
router.post(API_SEGMENT.AUTH.SIGN_IN.path, express.json(), authController.signIn);
router.post(API_SEGMENT.AUTH.SIGN_UP.path, express.json(), authController.signUp);
router.post(API_SEGMENT.AUTH.SIGN_OUT.path, authController.signOut);

export default router;
