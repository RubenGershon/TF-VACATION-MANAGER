// Reads the JSON body of a request, with a clear 400 error when it is not valid JSON.
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { badRequest } from "../errors/AppError";

// The body arrives as a string. Broken JSON gives a clear 400 instead of a 500 crash.
export function parseJsonBody(event: CommonEvent): unknown {
	try {
		return JSON.parse(event.body ?? "{}");
	} catch {
		throw badRequest("Request body must be valid JSON");
	}
}
