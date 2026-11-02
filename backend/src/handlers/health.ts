// Health check endpoint.
import { AppDataSource } from "../db/dataSource";
import { HandlerFn } from "./types";

// A public route used to check that the API is running and can reach the database.
// If the database does not answer, the query throws and the error handler returns a 500.
export const getHealth: HandlerFn = async () => {
	await AppDataSource.query("SELECT 1");
	return { status: "ok", database: "up" };
};
