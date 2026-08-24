import type { Express } from "express";

import request from "supertest";
import { afterEach, beforeAll, expect, it } from "vitest";

import { createAuthApp, createCredentials, deleteUsersByEmail, describeWithPg, SESSION_API_PATH, SIGN_UP_API_PATH } from "../auth-test-utils.js";

let app: Express | null = null;
const cleanupEmails = new Set<string>();

beforeAll(async () => {
	app = await createAuthApp();
});

afterEach(async () => {
	await deleteUsersByEmail([...cleanupEmails]);
	cleanupEmails.clear();
});

describeWithPg("sign up integration", () => {
	it("creates a user and starts a session", async () => {
		if (!app)
			return;

		const credentials = createCredentials("signup");
		cleanupEmails.add(credentials.email);
		const agent = request.agent(app);

		const res = await agent.post(SIGN_UP_API_PATH).send(credentials).expect(201);

		expect(res.body.user).toMatchObject({
			email: credentials.email,
			name: credentials.name,
		});

		const session = await agent.get(SESSION_API_PATH).expect(200);

		expect(session.body.user.email).toBe(credentials.email);
	});

	it("rejects duplicate email", async () => {
		if (!app)
			return;

		const credentials = createCredentials("signup-duplicate");
		cleanupEmails.add(credentials.email);

		await request(app).post(SIGN_UP_API_PATH).send(credentials).expect(201);
		const duplicate = await request(app).post(SIGN_UP_API_PATH).send(credentials).expect(409);

		expect(duplicate.body.error).toBe("Email already exists");
	});

	it("rejects invalid request body", async () => {
		if (!app)
			return;

		const res = await request(app)
			.post(SIGN_UP_API_PATH)
			.send({ email: "not-an-email", name: "", password: "short" })
			.expect(400);

		expect(res.body.error).toBe("Invalid request body");
	});
});
