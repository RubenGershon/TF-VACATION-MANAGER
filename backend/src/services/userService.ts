// User queries: the list of requesters for the dashboard filter.
import { AppDataSource } from "../db/dataSource";
import { Role, User } from "../entities/User";

// Feeds the "User" filter on the validator dashboard. Only id and name are returned.
export async function listRequesters() {
	const users = await AppDataSource.getRepository(User).find({
		where: { role: Role.Requester },
		order: { name: "ASC" }
	});
	return users.map((user) => ({ id: user.id, name: user.name }));
}
