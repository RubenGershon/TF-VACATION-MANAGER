// Work calendar endpoints: read the calendar (anyone), change weekly days off and special days (validators).
import { Response } from "commoneventframework";
import { Role } from "../entities/User";
import { authenticate } from "../middleware/auth";
import { addSpecialDaySchema, setWeekSchema, specialDayIdSchema } from "../schemas/calendarSchemas";
import * as calendarService from "../services/calendarService";
import { parseJsonBody } from "../utils/http";
import { HandlerFn, InputParserFn } from "./types";

// Any logged-in user can read the calendar. Only validators can change it.
export const getCalendar: HandlerFn = async (_input, event) => {
	authenticate(event);
	return calendarService.getCalendar();
};

export const parseSetWeek: InputParserFn = (event) => setWeekSchema.parse(parseJsonBody(event));

export const setWeek: HandlerFn = async (input, event) => {
	authenticate(event, Role.Validator);
	return calendarService.setNonWorkingWeekdays(input.nonWorkingWeekdays);
};

export const parseAddSpecialDay: InputParserFn = (event) => addSpecialDaySchema.parse(parseJsonBody(event));

export const addSpecialDay: HandlerFn = async (input, event) => {
	authenticate(event, Role.Validator);
	return new Response(201, await calendarService.addSpecialDay(input));
};

export const parseSpecialDayId: InputParserFn = (event) => specialDayIdSchema.parse(event.pathParameters ?? {});

export const deleteSpecialDay: HandlerFn = async (input, event) => {
	authenticate(event, Role.Validator);
	return calendarService.deleteSpecialDay(input.id);
};
