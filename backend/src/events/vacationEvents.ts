// The vacation events (requested, approved, rejected, cancelled) and the emitter the service uses to announce them.
import { EventEmitter } from "events";

export enum VacationEvent {
	Requested = "vacation.requested",
	Approved = "vacation.approved",
	Rejected = "vacation.rejected",
	Cancelled = "vacation.cancelled"
}

export type VacationEventPayload = {
	requestId: number;
	userId: number;
};

// The service emits events here. Listeners react without the service knowing about them.
export const vacationEvents = new EventEmitter();
