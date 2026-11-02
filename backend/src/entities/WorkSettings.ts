// Table "work_settings": a single row with the weekly days off of the company.
import { Column, Entity, PrimaryColumn } from "typeorm";

// The company's work calendar settings. The table always holds exactly one row (id 1).
@Entity("work_settings")
export class WorkSettings {
	@PrimaryColumn()
	id: number;

	// Weekdays nobody works, repeated every week of the year. ISO numbers: 1 = Monday ... 7 = Sunday.
	@Column({ name: "non_working_weekdays", type: "int", array: true, default: () => "'{6,7}'" })
	nonWorkingWeekdays: number[];
}
