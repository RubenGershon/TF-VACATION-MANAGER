// The app's own error type, plus short helpers (badRequest, notFound...) to throw it with the right HTTP status.
// An error that carries the HTTP status to send back to the client.
export class AppError extends Error {
	constructor(public readonly status: number, message: string) {
		super(message);
	}
}

// Short helpers so the code reads like a sentence: throw conflict("...").
export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message = "Authentication required") => new AppError(401, message);
export const forbidden = (message = "You are not allowed to do this") => new AppError(403, message);
export const notFound = (message: string) => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);
export const tooManyRequests = (message: string) => new AppError(429, message);
