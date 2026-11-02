// Test helper: calls the API handler directly with a fake request.
import { handler } from "../index";

// Sends a fake request straight to the API handler, so no server has to be started.
// An optional token is sent as a cookie, like the browser does after login.
export function send(method: string, path: string, options: { body?: object; token?: string; query?: Record<string, string> } = {}) {
	return handler({
		version: "commonEvent",
		method,
		path,
		body: options.body ? JSON.stringify(options.body) : null,
		headers: { "content-type": "application/json", ...(options.token && { cookie: `token=${options.token}` }) },
		pathParameters: undefined,
		queryStringParameters: options.query ?? {}
	});
}

export function parseBody(response: { body?: string | unknown }) {
	return JSON.parse(response.body as string);
}
