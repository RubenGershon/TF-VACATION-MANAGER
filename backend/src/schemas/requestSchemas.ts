// Validation of the vacation request inputs: new request, reject comment, id, list filters and team range.
import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config";
import { RequestStatus } from "../entities/VacationRequest";

// Zod schemas describe what valid input looks like. Anything else is refused with a 400.
// Dates must be real calendar dates written as YYYY-MM-DD (so "2030-02-31" is refused).
const isoDate = z.iso.date("Date must use the format YYYY-MM-DD");

export const createRequestSchema = z.object({
	startDate: isoDate,
	endDate: isoDate,
	reason: z.string().trim().max(500, "Reason must be 500 characters or less").optional()
});

export const rejectRequestSchema = z.object({
	comment: z.string().trim().min(1, "A comment is required to reject a request")
});

export const requestIdSchema = z.object({
	id: z.coerce.number().int().positive()
});

// Query parameters arrive as text, so "coerce" turns them into numbers.
// The limit is capped (see config.ts) so nobody can ask for the whole table at once.
const pagination = {
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
};

export const listRequestsSchema = z.object({
	...pagination,
	status: z.enum(RequestStatus).optional(),
	userId: z.coerce.number().int().positive().optional()
});

export const teamVacationsSchema = z.object({
	from: isoDate.optional(),
	to: isoDate.optional()
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;
export type ListRequestsInput = z.infer<typeof listRequestsSchema>;
export type TeamVacationsInput = z.infer<typeof teamVacationsSchema>;
