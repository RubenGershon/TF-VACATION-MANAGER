// Table "users": the people who log in, their role and their yearly vacation allowance.
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DEFAULT_VACATION_ALLOWANCE } from "../config";

// The two roles of the app. They decide which endpoints and pages a user can use.
export enum Role {
	Requester = "REQUESTER",
	Validator = "VALIDATOR"
}

// Maps to the "users" table. Users are created by the seed script.
@Entity("users")
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	// Stores the bcrypt hash, never the real password.
	@Column()
	password: string;

	@Column({ type: "enum", enum: Role })
	role: Role;

	// Vacation days the user can take per year. Only pending and approved requests use them up.
	@Column({ name: "vacation_allowance", type: "int", default: DEFAULT_VACATION_ALLOWANCE })
	vacationAllowance: number;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;
}
