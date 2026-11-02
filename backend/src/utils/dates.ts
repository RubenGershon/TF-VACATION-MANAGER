// Date helpers: counting the days between two "YYYY-MM-DD" dates.
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Number of days from start to end, both included. Dates are "YYYY-MM-DD" strings.
export function countDays(startDate: string, endDate: string): number {
	return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_IN_MS) + 1;
}
