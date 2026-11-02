// Test of the health check endpoint.
import "dotenv/config";
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { AppDataSource } from "../db/dataSource";
import { send } from "./helpers";

// These tests send fake requests straight to the API handler, so no server has to be started.
// They need PostgreSQL to be running, with the database from backend/.env.

describe("API health checks", () => {
	// Closes the database connection, otherwise the test process would never exit.
	after(async () => {
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
		}
	});

	it("GET /health says the API and the database are up", async () => {
		const response = await send("GET", "/health");
		assert.equal(response.statusCode, 200);
		assert.deepEqual(JSON.parse(response.body as string), { status: "ok", database: "up" });
	});

	it("returns 404 for an unknown route", async () => {
		const response = await send("GET", "/does-not-exist");
		assert.equal(response.statusCode, 404);
	});

	it("returns 401 on a protected route without a cookie", async () => {
		const response = await send("GET", "/me");
		assert.equal(response.statusCode, 401);
	});

	it("returns 400 when the login body is invalid", async () => {
		const response = await send("POST", "/auth/login", { body: { email: "not-an-email" } });
		assert.equal(response.statusCode, 400);
	});

	it("returns 401 for a wrong password", async () => {
		const response = await send("POST", "/auth/login", { body: { email: "alice@example.com", password: "wrong-password" } });
		assert.equal(response.statusCode, 401);
	});
});
