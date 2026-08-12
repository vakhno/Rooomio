import type { Request, Response } from "express";

import { getPgPool } from "@shared/pg";
import { type FloorPlan, SaveFloorPlanSchema } from "@shared/zod-schemas";
import { randomUUID } from "node:crypto";

import { requireUser } from "../auth/session.js";

export const listFloorPlans = async (req: Request, res: Response) => {
	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const buildingId = typeof req.query.buildingId === "string" ? req.query.buildingId : "";

		if (!buildingId)
			return res.status(400).json({ error: "buildingId is required" });

		const result = await getPgPool().query<FloorPlan>(
			`select id, "buildingId", "ownerId", floor, name, structure, "createdAt", "updatedAt"
			 from "floorPlan"
			 where "buildingId" = $1
			 order by floor asc, "createdAt" asc`,
			[buildingId],
		);

		return res.json(result.rows);
	}
	catch {
		return res.status(500).json({ error: "Could not load floor plans" });
	}
};

export const getFloorPlan = async (req: Request, res: Response) => {
	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const result = await getPgPool().query<FloorPlan>(
			`select id, "buildingId", "ownerId", floor, name, structure, "createdAt", "updatedAt"
			 from "floorPlan"
			 where id = $1
			 limit 1`,
			[req.params.id],
		);

		if (!result.rows[0])
			return res.status(404).json({ error: "Floor plan not found" });

		return res.json(result.rows[0]);
	}
	catch {
		return res.status(500).json({ error: "Could not load floor plan" });
	}
};

export const getCurrentFloorPlan = async (req: Request, res: Response) => {
	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const buildingId = typeof req.query.buildingId === "string" ? req.query.buildingId : "";

		if (!buildingId)
			return res.status(400).json({ error: "buildingId is required" });

		const result = await getPgPool().query<FloorPlan>(
			`select id, "buildingId", "ownerId", floor, name, structure, "createdAt", "updatedAt"
			 from "floorPlan"
			 where "buildingId" = $1 and "ownerId" = $2
			 order by floor asc
			 limit 1`,
			[buildingId, user.id],
		);

		return res.json(result.rows[0] ?? null);
	}
	catch {
		return res.status(500).json({ error: "Could not load floor plan" });
	}
};

export const saveCurrentFloorPlan = async (req: Request, res: Response) => {
	const parsedBody = SaveFloorPlanSchema.safeParse(req.body);

	if (!parsedBody.success) {
		return res.status(400).json({ error: "Invalid request body", issues: parsedBody.error.issues });
	}

	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const now = new Date();
		const { buildingId, floor, name, structure } = parsedBody.data;
		const pool = getPgPool();
		const building = await pool.query<{ floorCount: number }>(
			`select "floorCount" from "building" where id = $1 and "ownerId" = $2 limit 1`,
			[buildingId, user.id],
		);

		if (!building.rows[0])
			return res.status(403).json({ error: "Building does not belong to current user" });

		if (floor > building.rows[0].floorCount)
			return res.status(400).json({ error: "Floor exceeds building floor count" });

		const serializedStructure = JSON.stringify(structure);
		const result = await pool.query<FloorPlan>(
			`insert into "floorPlan" (id, "buildingId", "ownerId", "userId", floor, name, structure, layout, "createdAt", "updatedAt")
			 values ($1, $2, $3, $3, $4, $5, $6, $6, $7, $7)
			 on conflict ("buildingId", floor) where "buildingId" is not null
			 do update set name = excluded.name, structure = excluded.structure, layout = excluded.layout, "updatedAt" = excluded."updatedAt"
			 returning id, "buildingId", "ownerId", floor, name, structure, "createdAt", "updatedAt"`,
			[randomUUID(), buildingId, user.id, floor, name, serializedStructure, now],
		);

		return res.status(200).json(result.rows[0]);
	}
	catch {
		return res.status(500).json({ error: "Could not save floor plan" });
	}
};
