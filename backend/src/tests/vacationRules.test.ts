// Unit tests of the pure vacation rules and of working-day counting (no database needed).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertEnoughDays, assertHasWorkingDays, assertValidDates } from "../services/vacationRules";
import { countWorkingDays } from "../utils/dates";

// These tests need no database: the rules are plain functions.

const TODAY = "2030-06-15";

describe("countWorkingDays", () => {
	const calendar = { nonWorkingWeekdays: [6, 7], holidays: ["12-25"] };

	it("skips weekends", () => {
		// Monday 2030-07-01 to Sunday 2030-07-07
		assert.equal(countWorkingDays("2030-07-01", "2030-07-07", calendar), 5);
	});

	it("skips holidays, whatever the year", () => {
		// Tuesday 2029-12-25 and Wednesday 2030-12-25
		assert.equal(countWorkingDays("2029-12-24", "2029-12-26", calendar), 2);
		assert.equal(countWorkingDays("2030-12-25", "2030-12-25", calendar), 0);
	});

	it("uses the configured weekdays", () => {
		const fridayOff = { nonWorkingWeekdays: [5, 6, 7], holidays: [] };
		assert.equal(countWorkingDays("2030-07-01", "2030-07-07", fridayOff), 4);
	});
});

describe("assertHasWorkingDays", () => {
	it("refuses a request with no working day", () => {
		assert.throws(() => assertHasWorkingDays(0), { status: 400 });
		assert.doesNotThrow(() => assertHasWorkingDays(1));
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

	it("refuses a request that spans two years", () => {
		assert.throws(() => assertValidDates("2030-12-30", "2031-01-02", TODAY), { status: 400 });
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
