import type { UserSchemaType } from "@shared/zod-schemas";
import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { getPgPool } from "@shared/pg";
import jwt from "jsonwebtoken";

export const TOKEN_COOKIE_NAME = "token";
export const TOKEN_TTL_SECONDS = 60 * 60 * 6;

interface TokenPayload extends JwtPayload {
	id: string;
}

export const verifyToken = (token: string): TokenPayload | null => {
	try {
		const data = jwt.verify(token, process.env.JWT_SECRET);

		if (typeof data === "string" || typeof data.id !== "string") {
			return null;
		}

		return data as TokenPayload;
	}
	catch {
		return null;
	}
};

export const clearTokenCookie = (res: Response) => {
	res.clearCookie(TOKEN_COOKIE_NAME, {
		maxAge: undefined,
	});
};

export const findUserById = async (id: string) => {
	const result = await getPgPool().query<UserSchemaType>(
		`select id, name, email, "emailVerified", image, "createdAt", "updatedAt", role from "user" where id = $1 limit 1`,
		[id],
	);

	return result.rows[0] ?? null;
};

export const requireUser = async (req: Request, res: Response) => {
	const token = req.cookies?.[TOKEN_COOKIE_NAME];

	if (!token) {
		res.status(401).json({ error: "Authentication required" });
		return null;
	}

	const payload = verifyToken(token);

	if (!payload) {
		clearTokenCookie(res);
		res.status(401).json({ error: "Authentication required" });
		return null;
	}

	const user = await findUserById(payload.id);

	if (!user) {
		clearTokenCookie(res);
		res.status(401).json({ error: "Authentication required" });
		return null;
	}

	return user;
};
