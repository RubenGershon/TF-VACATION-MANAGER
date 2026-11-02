// Authentication: creates and reads the JWT cookie, and authenticate() checks who is calling and their role.
import jwt from "jsonwebtoken";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { Role } from "../entities/User";
import { forbidden, unauthorized } from "../errors/AppError";

export type AuthUser = {
	id: number;
	name: string;
	role: Role;
};

const COOKIE_NAME = "token";
const SESSION_SECONDS = Number(process.env.SESSION_HOURS ?? 8) * 3600;

// Creates the JWT. It holds the id, name and role, so protected requests do not need a database lookup.
export function signToken(user: AuthUser): string {
	return jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: SESSION_SECONDS });
}

// Builds the Set-Cookie header value. The JWT travels in a cookie that JavaScript cannot read (HttpOnly),
// so a script injected in the page (XSS) cannot steal it.
// SameSite=Strict makes the browser send the cookie only from our own site, which protects against CSRF.
// Secure (HTTPS only) is added in production.
function buildCookie(value: string, maxAgeSeconds: number): string {
	const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
	return `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

export function buildAuthCookie(token: string): string {
	return buildCookie(token, SESSION_SECONDS);
}

// A cookie with Max-Age=0 is deleted by the browser. This is how logout works.
export function buildClearedCookie(): string {
	return buildCookie("", 0);
}

// Reads the token from the cookie.
// On AWS, CEF puts the parsed cookies in event.cookies. Its local dev server does not, so we also read the raw Cookie header.
function readToken(event: CommonEvent): string {
	const headers = event.headers ?? {};
	const headerName = Object.keys(headers).find((name) => name.toLowerCase() === "cookie");
	const rawCookies = headerName ? headers[headerName] ?? "" : "";
	const fromHeader = rawCookies
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${COOKIE_NAME}=`))
		?.slice(COOKIE_NAME.length + 1);

	const token = event.cookies?.[COOKIE_NAME] ?? fromHeader;
	if (!token) {
		throw unauthorized();
	}
	return token;
}

// Call at the start of a protected handler.
// With no roles, any logged-in user is accepted. With roles, the user must have one of them.
export function authenticate(event: CommonEvent, ...allowedRoles: Role[]): AuthUser {
	let user: AuthUser;
	try {
		const payload = jwt.verify(readToken(event), process.env.JWT_SECRET as string) as AuthUser;
		user = { id: payload.id, name: payload.name, role: payload.role };
	} catch {
		throw unauthorized("Invalid or expired token");
	}

	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		throw forbidden();
	}
	return user;
}
