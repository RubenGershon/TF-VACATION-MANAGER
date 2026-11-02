// Tests of the vacation request endpoints and their business rules, against a real database.
import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { AppDataSource, initDatabase } from "../db/dataSource";
import { Role, User } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";
import { signToken } from "../middleware/auth";
import { parseBody, send } from "./helpers";

// These tests use the real API handlers and the real database, with two temporary users.
// The users and their requests are deleted at the end. Dates are far in the future so they never clash with demo data.

let requesterToken: string;
let validatorToken: string;
let requesterId: number;
const createdUserIds: number[] = [];

async function createUser(role: Role) {
	const user = await AppDataSource.getRepository(User).save({
		name: `Test ${role}`,
		email: `test-${role.toLowerCase()}-${Date.now()}@example.com`,
		password: "not-a-real-hash",
		role
	});
	createdUserIds.push(user.id);
	return signToken({ id: user.id, name: user.name, role: user.role });
}

const book = (startDate: string, endDate: string) =>
	send("POST", "/requests", { token: requesterToken, body: { startDate, endDate } });

describe("Vacation business rules", () => {
	before(async () => {
		await initDatabase();
		requesterToken = await createUser(Role.Requester);
		requesterId = createdUserIds[0];
		validatorToken = await createUser(Role.Validator);
	});

	after(async () => {
		await AppDataSource.getRepository(VacationRequest).delete({ userId: createdUserIds[0] });
		await AppDataSource.getRepository(User).delete(createdUserIds);
		await AppDataSource.destroy();
	});

	it("creates a one-day vacation as Pending", async () => {
		const response = await book("2032-03-01", "2032-03-01");
		assert.equal(response.statusCode, 201);
		assert.equal(parseBody(response).status, "PENDING");
	});

	it("refuses a request that starts in the past", async () => {
		assert.equal((await book("2020-01-01", "2020-01-05")).statusCode, 400);
	});

	it("refuses an end date before the start date", async () => {
		assert.equal((await book("2032-04-10", "2032-04-05")).statusCode, 400);
	});

	it("refuses an overlap with another request of the same user", async () => {
		await book("2032-05-10", "2032-05-14");
		assert.equal((await book("2032-05-12", "2032-05-16")).statusCode, 409);
	});

	it("refuses a request over the yearly allowance", async () => {
		assert.equal((await book("2032-08-01", "2032-09-30")).statusCode, 400);
	});

	it("lets a requester list only their own requests, even when asking for another user", async () => {
		await book("2032-11-01", "2032-11-01");
		const response = await send("GET", "/requests", { token: requesterToken, query: { userId: "1" } });
		const { items } = parseBody(response);
		assert.equal(response.statusCode, 200);
		assert.ok(items.length > 0);
		assert.ok(items.every((item: { userId: number }) => item.userId === requesterId));
	});

	it("lets a validator list requests of every user", async () => {
		const response = await send("GET", "/requests", { token: validatorToken, query: { userId: String(requesterId) } });
		assert.equal(response.statusCode, 200);
		assert.ok(parseBody(response).items.length > 0);
	});

	it("cancels a pending request, and gives the days back", async () => {
		const before = parseBody(await send("GET", "/requests/balance", { token: requesterToken })).remaining;
		const { id } = parseBody(await book("2032-12-06", "2032-12-07"));

		const cancelled = await send("PUT", `/requests/${id}/cancel`, { token: requesterToken });
		assert.equal(cancelled.statusCode, 200);
		assert.equal(parseBody(cancelled).status, "CANCELLED");

		const after = parseBody(await send("GET", "/requests/balance", { token: requesterToken })).remaining;
		assert.equal(after, before);
	});

	it("does not let a cancelled request be cancelled again", async () => {
		const { id } = parseBody(await book("2032-12-13", "2032-12-14"));
		await send("PUT", `/requests/${id}/cancel`, { token: requesterToken });
		const again = await send("PUT", `/requests/${id}/cancel`, { token: requesterToken });
		assert.equal(again.statusCode, 409);
	});
});
