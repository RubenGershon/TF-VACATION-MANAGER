// Script (npm run seed): creates the demo users and the default holidays if they do not exist yet. Safe to run many times.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { AppDataSource, initDatabase } from "./dataSource";
import { Role, User } from "../entities/User";
import { SpecialDay, SpecialDayType } from "../entities/SpecialDay";

const DEMO_PASSWORD = "password123";

const demoUsers = [
	{ name: "Alice Requester", email: "alice@example.com", role: Role.Requester },
	{ name: "Bob Requester", email: "bob@example.com", role: Role.Requester },
	{ name: "Carol Requester", email: "carol@example.com", role: Role.Requester },
	{ name: "David Requester", email: "david@example.com", role: Role.Requester },
	{ name: "Victor Validator", email: "victor@example.com", role: Role.Validator },
	{ name: "Vera Validator", email: "vera@example.com", role: Role.Validator }
];

async function seed() {
	await initDatabase();
	const users = AppDataSource.getRepository(User);
	const password = await bcrypt.hash(DEMO_PASSWORD, 10);

	for (const demoUser of demoUsers) {
		const exists = await users.existsBy({ email: demoUser.email });
		if (!exists) {
			await users.save(users.create({ ...demoUser, password }));
		}
	}

	console.log(`Seeded demo users (password for all: ${DEMO_PASSWORD})`);

	const specialDays = AppDataSource.getRepository(SpecialDay);
	if ((await specialDays.count()) === 0) {
		await specialDays.save(
			[
				{ monthDay: "01-01", name: "New Year's Day" },
				{ monthDay: "05-01", name: "Labour Day" },
				{ monthDay: "12-25", name: "Christmas Day" }
			].map((day) => specialDays.create({ ...day, type: SpecialDayType.Holiday }))
		);
	}
	await AppDataSource.destroy();
}

seed().catch((error) => {
	console.error(error);
	process.exit(1);
});
