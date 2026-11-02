// Vacation request logic: creating, listing, approving, rejecting and cancelling requests, the balance and the team vacations.
import { FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../db/dataSource";
import { User } from "../entities/User";
import { RequestStatus, VacationRequest } from "../entities/VacationRequest";
import { conflict, notFound, unauthorized } from "../errors/AppError";
import { VacationEvent, VacationEventPayload, vacationEvents } from "../events/vacationEvents";
import { CreateRequestInput, ListRequestsInput, TeamVacationsInput } from "../schemas/requestSchemas";
import { countWorkingDays } from "../utils/dates";
import { pageToSkip, toPage } from "../utils/pagination";
import { getWorkCalendar } from "./calendarService";
import { toDto } from "./vacationDto";
import { assertEnoughDays, assertHasWorkingDays, assertValidDates, today } from "./vacationRules";

const requests = () => AppDataSource.getRepository(VacationRequest);

// Tells the rest of the app that something happened, without knowing who listens (see events/).
function emit(event: VacationEvent, request: VacationRequest): void {
	const payload: VacationEventPayload = { requestId: request.id, userId: request.userId };
	vacationEvents.emit(event, payload);
}

// Vacation days of a year: the allowance, the days already booked, and what is left.
// Pending requests count as used, so a user cannot book more days while waiting for an answer.
// A request counts for the year of its start date, which keeps the calculation simple.
export async function getBalance(userId: number, year = new Date().getFullYear()) {
	const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
	if (!user) {
		throw unauthorized("User no longer exists");
	}

	const { used } = await requests()
		.createQueryBuilder("request")
		.select("COALESCE(SUM(request.days), 0)", "used")
		.where("request.userId = :userId", { userId })
		.andWhere("request.status IN (:...statuses)", { statuses: [RequestStatus.Pending, RequestStatus.Approved] })
		.andWhere("EXTRACT(YEAR FROM request.startDate) = :year", { year })
		.getRawOne();

	const usedDays = Number(used);
	return { year, allowance: user.vacationAllowance, used: usedDays, remaining: user.vacationAllowance - usedDays };
}

// Business rules 1, 2 and 4, plus the yearly allowance. Returns the working days the request would use.
async function assertCanBook(userId: number, startDate: string, endDate: string): Promise<number> {
	assertValidDates(startDate, endDate);

	const overlaps = await requests().existsBy({
		userId,
		status: In([RequestStatus.Pending, RequestStatus.Approved]),
		startDate: LessThanOrEqual(endDate),
		endDate: MoreThanOrEqual(startDate)
	});
	if (overlaps) {
		throw conflict("You already have a pending or approved request on these dates");
	}

	const year = Number(startDate.slice(0, 4));
	const days = countWorkingDays(startDate, endDate, await getWorkCalendar());
	assertHasWorkingDays(days);
	const { remaining } = await getBalance(userId, year);
	assertEnoughDays(days, remaining, year);
	return days;
}

// Checks the business rules, saves a new Pending request, and announces it with an event.
export async function createRequest(userId: number, input: CreateRequestInput) {
	const days = await assertCanBook(userId, input.startDate, input.endDate);

	const saved = await requests().save(
		requests().create({
			userId,
			startDate: input.startDate,
			endDate: input.endDate,
			days,
			reason: input.reason || null
		})
	);

	const request = await requests().findOneOrFail({ where: { id: saved.id }, relations: { user: true } });
	emit(VacationEvent.Requested, request);
	return toDto(request);
}

// One query for the page and one for the total, both done by the database.
// The order is newest first, and the id breaks ties so pages never repeat or skip a row.
async function findPage(where: FindOptionsWhere<VacationRequest>, page: number, limit: number) {
	const [found, total] = await requests().findAndCount({
		where,
		relations: { user: true },
		order: { createdAt: "DESC", id: "DESC" },
		skip: pageToSkip(page, limit),
		take: limit
	});
	return toPage(found.map(toDto), total, page, limit);
}

// Lists requests, newest first. A filter is only added to the query when the caller provided it.
export function listRequests({ page, limit, status, userId }: ListRequestsInput) {
	return findPage({ ...(status && { status }), ...(userId && { userId }) }, page, limit);
}

// Business rules 3 and 5: only a pending request can change, so approved ones never change.
// With an ownerId, the request must also belong to that user. Someone else's request is "not found".
async function changePendingRequest(
	id: number,
	ownerId: number | undefined,
	status: RequestStatus,
	comments: string | null,
	event: VacationEvent
) {
	const found = await requests().findOneBy({ id, ...(ownerId && { userId: ownerId }) });
	if (!found) {
		throw notFound("Request not found");
	}
	if (found.status !== RequestStatus.Pending) {
		throw conflict(`This request was already ${found.status.toLowerCase()}`);
	}

	found.status = status;
	found.comments = comments;
	await requests().save(found);

	const request = await requests().findOneOrFail({ where: { id }, relations: { user: true } });
	emit(event, request);
	return toDto(request);
}

export function approveRequest(id: number) {
	return changePendingRequest(id, undefined, RequestStatus.Approved, null, VacationEvent.Approved);
}

export function rejectRequest(id: number, comment: string) {
	return changePendingRequest(id, undefined, RequestStatus.Rejected, comment, VacationEvent.Rejected);
}

// The requester withdraws their own pending request. The days are given back, because
// cancelled requests do not count in the balance or in the overlap check.
export function cancelRequest(id: number, userId: number) {
	return changePendingRequest(id, userId, RequestStatus.Cancelled, null, VacationEvent.Cancelled);
}

// Approved vacations that overlap [from, to]. By default: everything that has not ended yet.
export async function listTeamVacations({ from = today(), to }: TeamVacationsInput) {
	const approved = await requests().find({
		where: {
			status: RequestStatus.Approved,
			endDate: MoreThanOrEqual(from),
			...(to && { startDate: LessThanOrEqual(to) })
		},
		relations: { user: true },
		order: { startDate: "ASC", id: "ASC" }
	});

	return approved.map((request) => ({
		id: request.id,
		userName: request.user.name,
		startDate: request.startDate,
		endDate: request.endDate
	}));
}
