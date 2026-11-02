// Converts any thrown error (AppError, validation error or unexpected crash) into the JSON error response.
import { Response } from "commoneventframework";
import { ZodError } from "zod";
import { AppError } from "./AppError";

// Turns any thrown error into a JSON response: { error: "message" }
export function toErrorResponse(error: unknown): Response {
	if (error instanceof AppError) {
		return new Response(error.status, { error: error.message });
	}
	if (error instanceof ZodError) {
		const message = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
		return new Response(400, { error: message });
	}
	console.error(error);
	return new Response(500, { error: "Internal server error" });
}
