// Login, logout and "who am I" endpoints.
import { Response } from "commoneventframework";
import { HandlerFn, InputParserFn } from "./types";
import { loginSchema } from "../schemas/authSchemas";
import { authenticate, buildAuthCookie, buildClearedCookie } from "../middleware/auth";
import * as authService from "../services/authService";
import { parseJsonBody } from "../utils/http";

export const parseLogin: InputParserFn = (event) => loginSchema.parse(parseJsonBody(event));

// The JWT is sent back in an HttpOnly cookie. The body only contains the user, so the token never reaches JavaScript.
export const login: HandlerFn = async (input) => {
	const { token, user } = await authService.login(input);
	return new Response(200, { user }, { "Set-Cookie": buildAuthCookie(token) });
};

// Logging out means asking the browser to delete the cookie.
export const logout: HandlerFn = async () => new Response(200, {}, { "Set-Cookie": buildClearedCookie() });

export const getMe: HandlerFn = async (_input, event) => {
	const user = authenticate(event);
	return authService.getProfile(user.id);
};
