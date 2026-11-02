// Users endpoint: the list of requesters used by the dashboard's user filter.
import { Role } from "../entities/User";
import { authenticate } from "../middleware/auth";
import * as userService from "../services/userService";
import { HandlerFn } from "./types";

export const listRequesters: HandlerFn = async (_input, event) => {
	authenticate(event, Role.Validator);
	return userService.listRequesters();
};
