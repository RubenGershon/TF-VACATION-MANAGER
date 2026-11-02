// Table "vacation_requests": one row per request, with its dates, status and the validator's comment.
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

export enum RequestStatus {
	Pending = "PENDING",
	Approved = "APPROVED",
	Rejected = "REJECTED",
	// The requester withdrew a pending request.
	Cancelled = "CANCELLED"
}

// Maps to the "vacation_requests" table. Each request belongs to one user.
@Entity("vacation_requests")
export class VacationRequest {
	@PrimaryGeneratedColumn()
	id: number;

	// Indexed because we often search by user: "my requests", the user filter and the overlap check.
	@Index()
	@Column({ name: "user_id" })
	userId: number;

	@ManyToOne(() => User, (user) => user.requests)
	@JoinColumn({ name: "user_id" })
	user: User;

	// "date" columns are returned as "YYYY-MM-DD" strings, which compare correctly as text
	@Column({ name: "start_date", type: "date" })
	startDate: string;

	@Column({ name: "end_date", type: "date" })
	endDate: string;

	@Column({ type: "text", nullable: true })
	reason: string | null;

	// Indexed because the validator dashboard filters by status. A new request always starts as Pending.
	@Index()
	@Column({ type: "enum", enum: RequestStatus, default: RequestStatus.Pending })
	status: RequestStatus;

	// The validator's comment. It is required when rejecting and empty when approving.
	@Column({ type: "text", nullable: true })
	comments: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
