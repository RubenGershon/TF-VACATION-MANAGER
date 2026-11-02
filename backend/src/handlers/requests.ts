// Vacation request endpoints: create, list, balance, approve, reject and cancel.
import { Response } from "commoneventframework";
import { Role } from "../entities/User";
import { authenticate } from "../middleware/auth";
import {
	createRequestSchema,
	listRequestsSchema,
	rejectRequestSchema,
	requestIdSchema
} from "../schemas/requestSchemas";
import * as vacationService from "../services/vacationService";
import { parseJsonBody } from "../utils/http";
import { HandlerFn, InputParserFn } from "./types";

// Handlers for the vacation request endpoints. Each endpoint has a "parse" function (validates the input)
// and a handler (checks the role, then calls the service). Both are named in root.yaml.

export const parseCreateRequest: InputParserFn = (event) => createRequestSchema.parse(parseJsonBody(event));

export const createRequest: HandlerFn = async (input, event) => {
	const user = authenticate(event, Role.Requester);
	return new Response(201, await vacationService.createRequest(user.id, input));
};

// One route for both roles. A validator sees all requests and can filter by user.
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
	const user = authenticate(event, Role.Requester);
	return vacationService.getBalance(user.id);
};

export const cancelRequest: HandlerFn = async (input, event) => {
	const user = authenticate(event, Role.Requester);
	return vacationService.cancelRequest(input.id, user.id);
};

export const approveRequest: HandlerFn = async (input, event) => {
	authenticate(event, Role.Validator);
	return vacationService.approveRequest(input.id);
};

// Reject needs two inputs: the id from the URL and the comment from the body.
export const parseRejectRequest: InputParserFn = (event) => ({
	...requestIdSchema.parse(event.pathParameters ?? {}),
	...rejectRequestSchema.parse(parseJsonBody(event))
});

export const rejectRequest: HandlerFn = async (input, event) => {
	authenticate(event, Role.Validator);
	return vacationService.rejectRequest(input.id, input.comment);
};
