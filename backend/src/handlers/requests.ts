// Vacation request endpoints: create, list, balance and cancel.
import { Response } from "commoneventframework";
import { Role } from "../entities/User";
import { authenticate } from "../middleware/auth";
import { createRequestSchema, listRequestsSchema, requestIdSchema } from "../schemas/requestSchemas";
import * as vacationService from "../services/vacationService";
import { parseJsonBody } from "../utils/http";
import { HandlerFn, InputParserFn } from "./types";

// Handlers for the vacation request endpoints. Each endpoint has a "parse" function (validates the input)
// and a handler (checks who is calling, then calls the service). Both are named in root.yaml.

export const parseCreateRequest: InputParserFn = (event) => createRequestSchema.parse(parseJsonBody(event));

export const createRequest: HandlerFn = async (input, event) => {
	const user = authenticate(event);
	return new Response(201, await vacationService.createRequest(user.id, input));
};

// A validator would see all requests and can filter by user.
// A requester only ever sees their own: their user id replaces any userId they sent.
export const parseListRequests: InputParserFn = (event) =>
	listRequestsSchema.parse(event.queryStringParameters ?? {});

export const listRequests: HandlerFn = async (input, event) => {
	const user = authenticate(event);
	const filters = user.role === Role.Requester ? { ...input, userId: user.id } : input;
	return vacationService.listRequests(filters);
};

export const parseRequestId: InputParserFn = (event) => requestIdSchema.parse(event.pathParameters ?? {});

export const getMyBalance: HandlerFn = async (_input, event) => {
	const user = authenticate(event);
	return vacationService.getBalance(user.id);
};

export const cancelRequest: HandlerFn = async (input, event) => {
	const user = authenticate(event);
	return vacationService.cancelRequest(input.id, user.id);
};
