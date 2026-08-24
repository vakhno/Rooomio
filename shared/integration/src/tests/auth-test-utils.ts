import type { Express } from "express";

import { getPgPool } from "@shared/pg";
import { API_MOUNT, API_PREFIX, API_SEGMENT } from "@shared/routes/constants";
import { describe } from "vitest";

import { createApp } from "../../../../apps/backend/src/inits/create-app.js";

const TEST_JWT_SECRET = "test_only_custom_auth_secret_32_chars";
const TEST_FRONTEND_URL = "http://localhost:5183";

const AUTH_API_PATH = `${API_PREFIX}${API_MOUNT.auth}`;

export const SIGN_IN_API_PATH = `${AUTH_API_PATH}${API_SEGMENT.AUTH.SIGN_IN.path}`;
export const SIGN_UP_API_PATH = `${AUTH_API_PATH}${API_SEGMENT.AUTH.SIGN_UP.path}`;
export const SESSION_API_PATH = `${AUTH_API_PATH}${API_SEGMENT.AUTH.SESSION.path}`;

export const describeWithPg = process.env.POSTGRES_URL ? describe : describe.skip;

export const createAuthApp = async (): Promise<Express | null> => {
	if (!process.env.POSTGRES_URL)
		return null;

	process.env.JWT_SECRET ||= TEST_JWT_SECRET;
	process.env.VITE_APP_URL ||= TEST_FRONTEND_URL;

	try {
		return await createApp();
	}
	catch {
		return null;
	}
};

export const createCredentials = (prefix: string) => {
	const suffix = globalThis.crypto.randomUUID();

	return {
		email: `${prefix}-${suffix}@roomio.test`,
		name: `${prefix}-${suffix}`,
		password: `Password-${suffix}`,
	};
};

export const deleteUsersByEmail = async (emails: string[]) => {
	if (!emails.length || !process.env.POSTGRES_URL)
		return;

	await getPgPool().query(`delete from "user" where email = any($1::text[])`, [emails]);
};
