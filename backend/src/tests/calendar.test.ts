// Tests of the work calendar endpoints: permissions and the effect on day counting.
import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { AppDataSource, initDatabase } from "../db/dataSource";
import { Role, User } from "../entities/User";
import { signToken } from "../middleware/auth";
import { parseBody, send } from "./helpers";

let requesterToken: string;
let validatorToken: string;
const createdUserIds: number[] = [];

async function createUser(role: Role) {
	const user = await AppDataSource.getRepository(User).save({
		name: `Test ${role}`,
		email: `test-cal-${role.toLowerCase()}-${Date.now()}@example.com`,
		password: "not-a-real-hash",
		role
	});
	createdUserIds.push(user.id);
	return signToken({ id: user.id, name: user.name, role: user.role });
}

describe("Work calendar", () => {
	before(async () => {
		await initDatabase();
		requesterToken = await createUser(Role.Requester);
		validatorToken = await createUser(Role.Validator);
	});

	after(async () => {
		await AppDataSource.getRepository(User).delete(createdUserIds);
		await AppDataSource.destroy();
	});

	it("lets any logged-in user read the calendar", async () => {
		const response = await send("GET", "/calendar", { token: requesterToken });
		assert.equal(response.statusCode, 200);
		assert.ok(Array.isArray(parseBody(response).nonWorkingWeekdays));
	});

	it("does not let a requester change the calendar", async () => {
		const week = await send("PUT", "/calendar/week", { token: requesterToken, body: { nonWorkingWeekdays: [6, 7] } });
		assert.equal(week.statusCode, 403);
		const day = await send("POST", "/calendar/special-days", {
			token: requesterToken,
			body: { date: "2030-03-03", name: "Nope", type: "HOLIDAY" }
		});
		assert.equal(day.statusCode, 403);
	});

	it("refuses a week with no working day", async () => {
		const response = await send("PUT", "/calendar/week", {
			token: validatorToken,
			body: { nonWorkingWeekdays: [1, 2, 3, 4, 5, 6, 7] }
		});
		assert.equal(response.statusCode, 400);
	});

	it("lets a validator add and delete a special day, and refuses a duplicate date", async () => {
		const body = { date: "2030-03-03", name: "Test day", type: "EVENT" };
		const added = await send("POST", "/calendar/special-days", { token: validatorToken, body });
		assert.equal(added.statusCode, 201);
		const created = parseBody(added).specialDays.find((day: { monthDay: string }) => day.monthDay === "03-03");
		assert.ok(created);

		const duplicate = await send("POST", "/calendar/special-days", { token: validatorToken, body: { ...body, date: "2031-03-03" } });
		assert.equal(duplicate.statusCode, 409);

		const deleted = await send("DELETE", `/calendar/special-days/${created.id}`, { token: validatorToken });
		assert.equal(deleted.statusCode, 200);
	});
});
