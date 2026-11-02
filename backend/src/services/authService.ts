// Login and profile logic: checks credentials and builds the session token.
import bcrypt from "bcryptjs";
import { AppDataSource } from "../db/dataSource";
import { User } from "../entities/User";
import { unauthorized } from "../errors/AppError";
import { AuthUser, signToken } from "../middleware/auth";
import { LoginInput } from "../schemas/authSchemas";
import { assertNotLocked, clearFailures, recordFailure } from "../utils/loginThrottle";

function toAuthUser(user: User): AuthUser {
	return { id: user.id, name: user.name, role: user.role };
}

// Checks the email and password and returns a JWT with the user's public data.
// Both failures (unknown email, wrong password) give the same message, so nobody can learn which emails exist.
// Compared when the email is unknown, so both failures take the same time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function login({ email, password }: LoginInput) {
	const key = email.toLowerCase();
	assertNotLocked(key);

	const user = await AppDataSource.getRepository(User).findOneBy({ email });
	const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

	if (!user || !passwordMatches) {
		recordFailure(key);
		throw unauthorized("Invalid email or password");
	}
	clearFailures(key);

	const authUser = toAuthUser(user);
	return { token: signToken(authUser), user: { ...authUser, email: user.email } };
}

// Returns the logged-in user's data without the password hash.
export async function getProfile(userId: number) {
	const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
	if (!user) {
		throw unauthorized("User no longer exists");
	}
	return { id: user.id, name: user.name, email: user.email, role: user.role };
}
