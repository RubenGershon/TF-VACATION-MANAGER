// Login brute-force protection: locks an email for a while after too many failed attempts.
import { tooManyRequests } from "../errors/AppError";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; resetAt: number };
const attempts = new Map<string, Entry>();

// Simple in-memory brute-force protection, per email. With several server instances, use a shared store instead.
export function assertNotLocked(key: string): void {
	const entry = attempts.get(key);
	if (entry && entry.resetAt > Date.now() && entry.failures >= MAX_FAILURES) {
		throw tooManyRequests("Too many failed attempts. Try again in a few minutes.");
	}
}

export function recordFailure(key: string): void {
	const now = Date.now();
	const entry = attempts.get(key);
	if (!entry || entry.resetAt <= now) {
		attempts.set(key, { failures: 1, resetAt: now + WINDOW_MS });
	} else {
		entry.failures++;
	}
}

export function clearFailures(key: string): void {
	attempts.delete(key);
}
