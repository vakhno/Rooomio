import type { Express } from "express";

import request from "supertest";
import { afterEach, beforeAll, expect, it } from "vitest";

import { createAuthApp, createCredentials, deleteUsersByEmail, describeWithPg, SESSION_API_PATH, SIGN_IN_API_PATH, SIGN_UP_API_PATH } from "../auth-test-utils.js";

let app: Express | null = null;
const cleanupEmails = new Set<string>();

beforeAll(async () => {
	app = await createAuthApp();
});

afterEach(async () => {
	await deleteUsersByEmail([...cleanupEmails]);
	cleanupEmails.clear();
});

describeWithPg("sign in integration", () => {
	it("signs in an existing user and starts a session", async () => {
		if (!app)
			return;

		const credentials = createCredentials("signin");
		cleanupEmails.add(credentials.email);

		await request(app).post(SIGN_UP_API_PATH).send(credentials).expect(201);

		const agent = request.agent(app);
		const res = await agent
			.post(SIGN_IN_API_PATH)
			.send({ email: credentials.email, password: credentials.password })
			.expect(200);

		expect(res.body.user.email).toBe(credentials.email);

		const session = await agent.get(SESSION_API_PATH).expect(200);

		expect(session.body.user.email).toBe(credentials.email);
	});

	it("rejects wrong password", async () => {
		if (!app)
			return;

		const credentials = createCredentials("signin-wrong-password");
		cleanupEmails.add(credentials.email);

		await request(app).post(SIGN_UP_API_PATH).send(credentials).expect(201);

		const res = await request(app)
			.post(SIGN_IN_API_PATH)
			.send({ email: credentials.email, password: "wrong-password" })
			.expect(401);

		expect(res.body.error).toBe("Invalid email or password");
	});
});
