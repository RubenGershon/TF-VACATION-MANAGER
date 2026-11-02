// Validation of the work calendar inputs: weekly days off, new special day and special day id.
import { z } from "zod";
import { SpecialDayType } from "../entities/SpecialDay";

export const setWeekSchema = z.object({
	nonWorkingWeekdays: z.array(z.number().int().min(1).max(7)).max(6, "At least one day of the week must be a working day")
});

// The year of the date does not matter: special days repeat every year.
export const addSpecialDaySchema = z.object({
	date: z.iso.date("Date must use the format YYYY-MM-DD"),
	name: z.string().trim().min(1, "A name is required").max(100, "Name must be 100 characters or less"),
	type: z.enum(SpecialDayType)
});

export const specialDayIdSchema = z.object({
	id: z.coerce.number().int().positive()
});

export type AddSpecialDayInput = z.infer<typeof addSpecialDaySchema>;
