// Pure vacation rules (dates, working days, allowance) with no database access.
import { badRequest } from "../errors/AppError";

// The business rules that need no database. Keeping them here makes them easy to read and to test.

// Local date as "YYYY-MM-DD", the same format the database returns for date columns
export function today(): string {
	return new Date().toLocaleDateString("en-CA");
}

// Rules 1 and 4: no vacation in the past, and the end cannot be before the start.
// An end date equal to the start date is allowed, it means a one-day vacation.
export function assertValidDates(startDate: string, endDate: string, currentDate = today()): void {
	if (startDate < currentDate) {
		throw badRequest("Vacation cannot start in the past");
	}
	if (endDate < startDate) {
		throw badRequest("End date cannot be before start date");
	}
}

// A request made only of weekends and holidays would use no vacation day, so it is refused.
export function assertHasWorkingDays(days: number): void {
	if (days < 1) {
		throw badRequest("These dates contain no working day, so there is nothing to book");
	}
}

// The yearly allowance rule: a request cannot use more days than the user has left.
export function assertEnoughDays(days: number, remaining: number, year: number): void {
	if (days > remaining) {
		throw badRequest(`Not enough vacation days: you asked for ${days} and have ${remaining} left in ${year}`);
	}
}
