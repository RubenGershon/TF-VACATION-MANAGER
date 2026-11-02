// Converts a request entity into the plain object sent to the client.
import { VacationRequest } from "../entities/VacationRequest";

// We never return the entity directly, so user data like the password hash cannot leak
export function toDto(request: VacationRequest) {
	return {
		id: request.id,
		userId: request.userId,
		userName: request.user?.name,
		startDate: request.startDate,
		endDate: request.endDate,
		reason: request.reason,
		status: request.status,
		comments: request.comments,
		createdAt: request.createdAt,
		updatedAt: request.updatedAt
	};
}
