// Unit tests of the pure vacation rules and of day counting (no database needed).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertEnoughDays, assertValidDates } from "../services/vacationRules";
import { countDays } from "../utils/dates";

// These tests need no database: the rules are plain functions.

const TODAY = "2030-06-15";

describe("countDays", () => {
	it("counts both the first and the last day", () => {
		assert.equal(countDays("2030-07-01", "2030-07-01"), 1);
		assert.equal(countDays("2030-07-01", "2030-07-05"), 5);
	});
});

describe("assertValidDates", () => {
	it("accepts a normal range in the future", () => {
		assert.doesNotThrow(() => assertValidDates("2030-07-01", "2030-07-05", TODAY));
	});

	it("accepts a one-day vacation (end date equals start date)", () => {
		assert.doesNotThrow(() => assertValidDates("2030-07-01", "2030-07-01", TODAY));
	});

	it("accepts a vacation that starts today", () => {
		assert.doesNotThrow(() => assertValidDates(TODAY, TODAY, TODAY));
	});

	it("refuses a start date in the past", () => {
		assert.throws(() => assertValidDates("2030-06-14", "2030-06-20", TODAY), { status: 400 });
	});

	it("refuses an end date before the start date", () => {
		assert.throws(() => assertValidDates("2030-07-05", "2030-07-01", TODAY), { status: 400 });
	});
});

describe("assertEnoughDays", () => {
	it("accepts a request that uses exactly the remaining days", () => {
		assert.doesNotThrow(() => assertEnoughDays(5, 5, 2030));
	});

	it("refuses a request that uses more than the remaining days", () => {
		assert.throws(() => assertEnoughDays(6, 5, 2030), { status: 400 });
	});
});
