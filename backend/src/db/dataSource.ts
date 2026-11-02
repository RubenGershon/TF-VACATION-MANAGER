// TypeORM connection to PostgreSQL: lists the entities and migrations, and connects once on first use.
import "reflect-metadata";
import path from "node:path";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL,
	entities: [],
	// The schema is changed only by migration files (see src/migrations), never automatically.
	// Pending migrations run when the app connects, so a fresh database gets its tables on first start.
	migrations: [path.join(__dirname, "../migrations/*.{ts,js}")],
	migrationsRun: true,
	synchronize: false
});

// Connects to the database the first time it is called, then reuses the same connection.
export async function initDatabase(): Promise<DataSource> {
	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}
	return AppDataSource;
}
