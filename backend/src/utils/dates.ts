// Date helpers: counting days and working days between two "YYYY-MM-DD" dates.
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Number of days from start to end, both included. Dates are "YYYY-MM-DD" strings.
export function countDays(startDate: string, endDate: string): number {
	return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_IN_MS) + 1;
}

export interface WorkCalendar {
	// ISO weekdays: 1 = Monday ... 7 = Sunday
	nonWorkingWeekdays: number[];
	// "MM-DD" of the holidays, repeated every year
	holidays: string[];
}

// Number of working days from start to end, both included.
// Weekly days off and holidays are skipped.
export function countWorkingDays(startDate: string, endDate: string, calendar: WorkCalendar): number {
	const holidays = new Set(calendar.holidays);
	const daysOff = new Set(calendar.nonWorkingWeekdays);
	const start = new Date(startDate).getTime();
	const total = countDays(startDate, endDate);

	let working = 0;
	for (let index = 0; index < total; index++) {
		const day = new Date(start + index * DAY_IN_MS);
		const isoWeekday = day.getUTCDay() || 7;
		const monthDay = day.toISOString().slice(5, 10);
		if (!daysOff.has(isoWeekday) && !holidays.has(monthDay)) {
			working++;
		}
	}
	return working;
}
