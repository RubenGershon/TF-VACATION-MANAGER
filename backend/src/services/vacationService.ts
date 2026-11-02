// Vacation request logic: creating, listing and cancelling requests, and the balance.
import { FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../db/dataSource";
import { User } from "../entities/User";
import { RequestStatus, VacationRequest } from "../entities/VacationRequest";
import { conflict, notFound, unauthorized } from "../errors/AppError";
import { CreateRequestInput, ListRequestsInput } from "../schemas/requestSchemas";
import { countDays } from "../utils/dates";
import { pageToSkip, toPage } from "../utils/pagination";
import { toDto } from "./vacationDto";
import { assertEnoughDays, assertValidDates } from "./vacationRules";

const requests = () => AppDataSource.getRepository(VacationRequest);

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
		.select("COALESCE(SUM(request.endDate - request.startDate + 1), 0)", "used")
		.where("request.userId = :userId", { userId })
		.andWhere("request.status IN (:...statuses)", { statuses: [RequestStatus.Pending, RequestStatus.Approved] })
		.andWhere("EXTRACT(YEAR FROM request.startDate) = :year", { year })
		.getRawOne();

	const usedDays = Number(used);
	return { year, allowance: user.vacationAllowance, used: usedDays, remaining: user.vacationAllowance - usedDays };
}

// Business rules 1, 2 and 4, plus the yearly allowance.
async function assertCanBook(userId: number, startDate: string, endDate: string): Promise<void> {
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
	const { remaining } = await getBalance(userId, year);
	assertEnoughDays(countDays(startDate, endDate), remaining, year);
}

// Checks the business rules and saves a new Pending request.
export async function createRequest(userId: number, input: CreateRequestInput) {
	await assertCanBook(userId, input.startDate, input.endDate);

	const saved = await requests().save(
		requests().create({
			userId,
			startDate: input.startDate,
			endDate: input.endDate,
			reason: input.reason || null
		})
	);

	return toDto(await requests().findOneOrFail({ where: { id: saved.id }, relations: { user: true } }));
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
async function changePendingRequest(id: number, ownerId: number | undefined, status: RequestStatus, comments: string | null) {
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
	return toDto(await requests().findOneOrFail({ where: { id }, relations: { user: true } }));
}

// The requester withdraws their own pending request. The days are given back, because
// cancelled requests do not count in the balance or in the overlap check.
export function cancelRequest(id: number, userId: number) {
	return changePendingRequest(id, userId, RequestStatus.Cancelled, null);
}
