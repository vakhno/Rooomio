import type { ClientSession, UserSchemaType } from "@shared/zod-schemas";
import type { CookieOptions, Request, Response } from "express";

import { getPgPool } from "@shared/pg";
import { DEFAULT_USER_ROLE, SignInSchema, SignUpSchema } from "@shared/zod-schemas";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import { clearTokenCookie, findUserById, TOKEN_COOKIE_NAME, TOKEN_TTL_SECONDS, verifyToken } from "./session.js";

const PASSWORD_SALT_ROUNDS = 10;

const tokenCookieOptions = (): CookieOptions => {
	const appUrl = process.env.VITE_APP_URL || "";
	const secure = appUrl.startsWith("https://");

	return {
		httpOnly: true,
		secure,
		sameSite: secure ? "none" : "lax",
		path: "/",
		maxAge: TOKEN_TTL_SECONDS * 1000,
	};
};

export const signIn = async (req: Request, res: Response) => {
	const { body } = req;
	const parsedBody = SignInSchema.safeParse(body);
	const { success } = parsedBody;

	if (!success) {
		const { error: { issues } } = parsedBody;

		return res.status(400).json({ error: "Invalid request body", issues });
	}

	try {
		const clientPg = await getPgPool().connect();
		const { data: { email: parsedBodyEmail, password: parsedBodyPassword } } = parsedBody;
		const userQuery = await clientPg.query<UserSchemaType>(
			`select id, name, email, "emailVerified", image, "createdAt", "updatedAt", role from "user" where lower(email) = $1 limit 1`,
			[parsedBodyEmail],
		);
		const { rows: userQueryRows } = userQuery;
		const user = userQueryRows[0] ?? null;

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		const { id: userId } = user;
		const accountQuery = await clientPg.query(
			`select password from "account" where "userId" = $1 and "providerId" = 'credential' limit 1`,
			[userId],
		);
		const { rows: accountQueryRows } = accountQuery;
		const account = accountQueryRows[0] ?? null;

		if (!account || !account?.password) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const { password: accountPassword } = account;
		const isPasswordValid = await bcrypt.compare(parsedBodyPassword, accountPassword);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const { id, role } = user;
		const token = jwt.sign(
			{
				id,
				role,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: TOKEN_TTL_SECONDS,
			},
		);
		const clientSession: ClientSession = {
			user: { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() },
			session: {
				expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString(),
			},
		};

		res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions());
		return res.status(200).json(clientSession);
	}
	catch {
		return res.status(500).json({ error: "Could not sign in" });
	}
};

export const signUp = async (req: Request, res: Response) => {
	const { body } = req;
	const parsedBody = SignUpSchema.safeParse(body);
	const { success } = parsedBody;

	if (!success) {
		const { error: { issues } } = parsedBody;

		return res.status(400).json({ error: "Invalid request body", issues });
	}

	try {
		const clientPg = await getPgPool().connect();
		const { data: { email: parsedBodyEmail, name: parsedBodyName } } = parsedBody;
		const currentDate = new Date();
		const generatedUserId = randomUUID();
		const generatedAccountId = randomUUID();
		const password = await bcrypt.hash(parsedBody.data.password, PASSWORD_SALT_ROUNDS);

		try {
			const existingUserQuery = await clientPg.query<UserSchemaType>(
				`select id, name, email, "emailVerified", image, "createdAt", "updatedAt", role from "user" where lower(email) = $1 limit 1`,
				[parsedBodyEmail],
			);

			const { rows: existingUserQueryRows } = existingUserQuery;
			const existingUser = existingUserQueryRows[0] ?? null;

			if (existingUser) {
				return res.status(409).json({ error: "Email already exists" });
			}

			await clientPg.query("begin");

			const insertedUserQuery = await clientPg.query<UserSchemaType>(
				`insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role)
			 values ($1, $2, $3, false, null, $4, $4, $5)
			 returning id, name, email, "emailVerified", image, "createdAt", "updatedAt", role`,
				[generatedUserId, parsedBodyName, parsedBodyEmail, currentDate, DEFAULT_USER_ROLE],
			);

			await clientPg.query(
				`insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
			 values ($1, $2, 'credential', $3, $4, $5, $5)`,
				[generatedAccountId, parsedBodyEmail, generatedUserId, password, currentDate],
			);

			await clientPg.query("commit");

			const { rows: insertedUserQueryRows } = insertedUserQuery;
			const insertedUser = insertedUserQueryRows[0];
			const { id, role } = insertedUser;

			const token = jwt.sign(
				{
					id,
					role,
				},
				process.env.JWT_SECRET,
				{
					expiresIn: TOKEN_TTL_SECONDS,
				},
			);
			const clientSession: ClientSession = {
				user: { ...insertedUser, createdAt: insertedUser.createdAt.toISOString(), updatedAt: insertedUser.updatedAt.toISOString() },
				session: {
					expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString(),
				},
			};

			res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions());
			return res.status(201).json(clientSession);
		}
		catch (error) {
			await clientPg.query("rollback").catch(() => {});

			throw error;
		}
		finally {
			clientPg.release();
		}
	}
	catch (error) {
		if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
			return res.status(409).json({ error: "Email already exists" });
		}

		return res.status(500).json({ error: "Could not sign up" });
	}
};

export const getSession = async (req: Request, res: Response) => {
	try {
		const token = req.cookies?.[TOKEN_COOKIE_NAME];

		if (!token) {
			return res.json(null);
		}

		const payload = verifyToken(token);

		if (!payload) {
			clearTokenCookie(res);

			return res.json(null);
		}

		const user = await findUserById(payload.id);

		if (!user) {
			clearTokenCookie(res);

			return res.json(null);
		}

		const clientSession: ClientSession = {
			user: { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() },
			session: {
				expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString(),
			},
		};

		return res.json(clientSession);
	}
	catch {
		return res.status(500).json({ error: "Could not get session" });
	}
};

export const signOut = (_req: Request, res: Response) => {
	clearTokenCookie(res);

	return res.status(200).json(null);
};
