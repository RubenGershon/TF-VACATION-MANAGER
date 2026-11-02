// Work calendar logic: reads and changes the weekly days off and the special days (holidays and events).
import { AppDataSource } from "../db/dataSource";
import { SpecialDay, SpecialDayType } from "../entities/SpecialDay";
import { WorkSettings } from "../entities/WorkSettings";
import { conflict, notFound } from "../errors/AppError";
import { AddSpecialDayInput } from "../schemas/calendarSchemas";
import { WorkCalendar } from "../utils/dates";

const settings = () => AppDataSource.getRepository(WorkSettings);
const specialDays = () => AppDataSource.getRepository(SpecialDay);

// The weekly days off and the special days. The special days repeat every year.
export async function getCalendar() {
	const [week, days] = await Promise.all([
		settings().findOneByOrFail({ id: 1 }),
		specialDays().find({ order: { monthDay: "ASC" } })
	]);
	return {
		nonWorkingWeekdays: [...week.nonWorkingWeekdays].sort((a, b) => a - b),
		specialDays: days.map(({ id, monthDay, name, type }) => ({ id, monthDay, name, type }))
	};
}

// What the day counting needs: the weekly days off and the holidays (events do not count).
export async function getWorkCalendar(): Promise<WorkCalendar> {
	const { nonWorkingWeekdays, specialDays: days } = await getCalendar();
	return {
		nonWorkingWeekdays,
		holidays: days.filter((day) => day.type === SpecialDayType.Holiday).map((day) => day.monthDay)
	};
}

export async function setNonWorkingWeekdays(weekdays: number[]) {
	await settings().update({ id: 1 }, { nonWorkingWeekdays: [...new Set(weekdays)] });
	return getCalendar();
}

export async function addSpecialDay({ date, name, type }: AddSpecialDayInput) {
	const monthDay = date.slice(5);
	if (await specialDays().existsBy({ monthDay })) {
		throw conflict("A special day already exists on this date");
	}
	await specialDays().save(specialDays().create({ monthDay, name, type }));
	return getCalendar();
}

export async function deleteSpecialDay(id: number) {
	const { affected } = await specialDays().delete({ id });
	if (!affected) {
		throw notFound("Special day not found");
	}
	return getCalendar();
}
