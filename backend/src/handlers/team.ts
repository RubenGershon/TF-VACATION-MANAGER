// Team vacations endpoint: the approved vacations shown in the team calendar.
import { authenticate } from "../middleware/auth";
import { teamVacationsSchema } from "../schemas/requestSchemas";
import * as vacationService from "../services/vacationService";
import { HandlerFn, InputParserFn } from "./types";

export const parseTeamVacations: InputParserFn = (event) =>
	teamVacationsSchema.parse(event.queryStringParameters ?? {});

// Any logged-in user can see the team vacations, so no role is passed to authenticate.
export const getTeamVacations: HandlerFn = async (input, event) => {
	authenticate(event);
	return vacationService.listTeamVacations(input);
};
