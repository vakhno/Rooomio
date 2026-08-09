import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { authTablesSql } from "../auth-schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export const getPostgresUrl = (): string => {
	const postgresUrl = process.env.POSTGRES_URL || "";
	if (!postgresUrl || postgresUrl.trim() === "") {
		throw new Error(
			"POSTGRES_URL environment variable is required and must be a valid PostgreSQL connection string",
		);
	}
	return postgresUrl;
};

export const getPgPool = (): pg.Pool => {
	if (!pool) {
		pool = new Pool({
			connectionString: getPostgresUrl(),
		});
	}
	return pool;
};

export const getDb = (): ReturnType<typeof drizzle> => {
	if (!db) {
		db = drizzle(getPgPool());
	}

	return db;
};

export const initDb = async () => {
	await getPgPool().query("select 1");
};

export const initAuthTables = async () => {
	await getPgPool().query(authTablesSql);
};
