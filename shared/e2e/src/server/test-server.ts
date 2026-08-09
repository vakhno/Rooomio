import { createHmac, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { DEFAULT_USER_ROLE } from "@shared/zod-schemas";
import { authTablesSql } from "@shared/pg";
import { SignInSchema, SignUpSchema } from "@shared/zod-schemas/auth";
import cors from "cors";
import express from "express";
import pg from "pg";

const app = express();
const scrypt = promisify(scryptCallback);
const TOKEN_COOKIE_NAME = "token";
const TOKEN_TTL_SECONDS = 60 * 60 * 6;
const PASSWORD_KEY_LENGTH = 64;
const JWT_SECRET = "test_only_custom_auth_secret_32_chars";
const pool = new pg.Pool({
	connectionString: process.env.POSTGRES_URL ?? "postgresql://app_template:app_template@localhost:5432/app_template",
});
type TokenPayload = {
	exp: number;
	id: string;
};

const base64UrlJson = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

const signToken = (userId: string) => {
	const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
	const payload = base64UrlJson({
		id: userId,
		exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
	});
	const signature = createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");

	return `${header}.${payload}.${signature}`;
};

const verifyToken = (token: string): TokenPayload | null => {
	const [header, payload, signature] = token.split(".");

	if (!header || !payload || !signature) {
		return null;
	}

	const expectedSignature = createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");

	if (
		signature.length !== expectedSignature.length
		|| !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
	) {
		return null;
	}

	let data: { exp?: number; id?: string };

	try {
		data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number; id?: string };
	}
	catch {
		return null;
	}

	if (!data.id || !data.exp || data.exp * 1000 <= Date.now()) {
		return null;
	}

	return { exp: data.exp, id: data.id };
};

const getCookie = (cookieHeader: string | undefined, name: string) => {
	const cookies = cookieHeader?.split(";").map(cookie => cookie.trim()) ?? [];
	const cookie = cookies.find(value => value.startsWith(`${name}=`));

	return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

const hashPassword = async (password: string) => {
	const salt = randomBytes(16).toString("base64url");
	const key = await scrypt(password, salt, PASSWORD_KEY_LENGTH) as Buffer;

	return `scrypt$${salt}$${key.toString("base64url")}`;
};

const verifyPassword = async (password: string, storedPassword: string) => {
	const [algorithm, salt, key] = storedPassword.split("$");

	if (algorithm !== "scrypt" || !salt || !key) {
		return false;
	}

	const storedKey = Buffer.from(key, "base64url");
	const enteredKey = await scrypt(password, salt, storedKey.length) as Buffer;

	return storedKey.length === enteredKey.length && timingSafeEqual(storedKey, enteredKey);
};

const cookieOptions = {
	httpOnly: true,
	secure: false,
	sameSite: "lax" as const,
	path: "/",
	maxAge: TOKEN_TTL_SECONDS * 1000
};

await pool.query(authTablesSql);

app.use(cors({ origin: "http://localhost:5183", credentials: true }));
app.use(express.json());

app.get("/api/auth/ok", (_req, res) => {
	res.json({ ok: true });
});

app.post("/api/auth/sign-up", async (req, res) => {
	const result = SignUpSchema.safeParse(req.body);

	if (!result.success) {
		res.status(400).json({ error: "Invalid request body", issues: result.error.issues });
		return;
	}

	const client = await pool.connect();

	try {
		const now = new Date();
		const userId = randomUUID();
		const accountId = randomUUID();
		const password = await hashPassword(result.data.password);

		await client.query("begin");
		const insertedUser = await client.query(
			`insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role)
			 values ($1, $2, $3, false, null, $4, $4, $5)
			 returning id, name, email, "emailVerified", image, "createdAt", "updatedAt", role`,
			[userId, result.data.name, result.data.email, now, DEFAULT_USER_ROLE]
		);
		await client.query(
			`insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
			 values ($1, $2, 'credential', $3, $4, $5, $5)`,
			[accountId, result.data.email, userId, password, now]
		);
		await client.query("commit");

		res.cookie(TOKEN_COOKIE_NAME, signToken(userId), cookieOptions);
		res.status(201).json({ user: insertedUser.rows[0], session: { expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString() } });
	}
	catch {
		await client.query("rollback").catch(() => {});
		res.status(409).json({ error: "Could not create user" });
	}
	finally {
		client.release();
	}
});

app.post("/api/auth/sign-in", async (req, res) => {
	const result = SignInSchema.safeParse(req.body);

	if (!result.success) {
		res.status(400).json({ error: "Invalid request body", issues: result.error.issues });
		return;
	}

	const userResult = await pool.query(
		`select id, name, email, "emailVerified", image, "createdAt", "updatedAt", role from "user" where email = $1 limit 1`,
		[result.data.email]
	);
	const user = userResult.rows[0] ?? null;
	const accountResult = user
		? await pool.query(`select password from "account" where "userId" = $1 and "providerId" = 'credential' limit 1`, [user.id])
		: null;
	const password = accountResult?.rows[0]?.password;
	const isPasswordValid = password ? await verifyPassword(result.data.password, password) : false;

	if (!user || !isPasswordValid) {
		res.status(401).json({ error: "Invalid email or password" });
		return;
	}

	res.cookie(TOKEN_COOKIE_NAME, signToken(user.id), cookieOptions);
	res.json({ user, session: { expiresAt: new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString() } });
});

app.get("/api/auth/session", async (req, res) => {
	const token = getCookie(req.headers.cookie, TOKEN_COOKIE_NAME);
	const payload = token ? verifyToken(token) : null;

	if (!payload) {
		res.json(null);
		return;
	}

	const userResult = await pool.query(
		`select id, name, email, "emailVerified", image, "createdAt", "updatedAt", role from "user" where id = $1 limit 1`,
		[payload.id]
	);
	const user = userResult.rows[0] ?? null;

	res.json(user ? { user, session: { expiresAt: new Date(payload.exp * 1000).toISOString() } } : null);
});

app.get("/test/user-by-email", async (req, res) => {
	const email = String(req.query.email ?? "");
	const result = await pool.query(`select email, name from "user" where email = $1 limit 1`, [email]);
	res.json(result.rows[0] ?? null);
});

const server = app.listen(3001);

process.on("SIGTERM", async () => {
	server.close();
	await pool.end();
});
