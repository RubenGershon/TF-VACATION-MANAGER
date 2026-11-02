// Reacts to the vacation events. For now it only logs them.
import { VacationEvent, VacationEventPayload, vacationEvents } from "./vacationEvents";

// Stand-in for real notifications (email, chat...): we only log the events.
export function registerVacationListeners(): void {
	for (const eventName of Object.values(VacationEvent)) {
		vacationEvents.on(eventName, ({ requestId, userId }: VacationEventPayload) => {
			console.log(`[event] ${eventName} (request ${requestId}, user ${userId})`);
		});
	}
}
