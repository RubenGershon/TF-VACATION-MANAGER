// Table "special_days": yearly holidays and events of the company calendar.
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum SpecialDayType {
	// A day off for everybody. It is not counted as a vacation day.
	Holiday = "HOLIDAY",
	// Only shown on the calendars, people still work.
	Event = "EVENT"
}

// A day of the year that repeats every year, like December 25. It is stored as "MM-DD".
@Entity("special_days")
export class SpecialDay {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ name: "month_day", type: "varchar", length: 5, unique: true })
	monthDay: string;

	@Column()
	name: string;

	@Column({ type: "enum", enum: SpecialDayType, default: SpecialDayType.Holiday })
	type: SpecialDayType;
}
