import type { Request, Response } from "express";

import { getPgPool } from "@shared/pg";
import { type Building, CreateBuildingSchema } from "@shared/zod-schemas";
import { randomUUID } from "node:crypto";

import { requireUser } from "../auth/session.js";

export const listBuildings = async (req: Request, res: Response) => {
	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const result = await getPgPool().query<Building>(
			`select id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt"
			 from "building"
			 order by "createdAt" desc`,
		);

		return res.json(result.rows);
	}
	catch {
		return res.status(500).json({ error: "Could not load buildings" });
	}
};

export const listMyBuildings = async (req: Request, res: Response) => {
	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const result = await getPgPool().query<Building>(
			`select id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt"
			 from "building"
			 where "ownerId" = $1
			 order by "createdAt" desc`,
			[user.id],
		);

		return res.json(result.rows);
	}
	catch {
		return res.status(500).json({ error: "Could not load buildings" });
	}
};

export const createBuilding = async (req: Request, res: Response) => {
	const parsedBody = CreateBuildingSchema.safeParse(req.body);

	if (!parsedBody.success) {
		return res.status(400).json({ error: "Invalid request body", issues: parsedBody.error.issues });
	}

	try {
		const user = await requireUser(req, res);

		if (!user)
			return;

		const now = new Date();
		const { address, floorCount, name } = parsedBody.data;
		const pool = getPgPool();
		const result = await pool.query<Building>(
			`insert into "building" (id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt")
			 values ($1, $2, $3, $4, $5, $6, $6)
			 returning id, "ownerId", name, address, "floorCount", "createdAt", "updatedAt"`,
			[randomUUID(), user.id, name, address, floorCount, now],
		);
		await pool.query(`update "user" set "updatedAt" = $1 where id = $2`, [now, user.id]);

		return res.status(201).json(result.rows[0]);
	}
	catch {
		return res.status(500).json({ error: "Could not create building" });
	}
};
