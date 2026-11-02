// Date helpers: ISO date formatting, the month grid of the calendar, and day counting.
const DAY_IN_MS = 24 * 60 * 60 * 1000

// A Date as "YYYY-MM-DD" in local time
export function toIsoDate(date) {
  return date.toLocaleDateString('en-CA')
}

// Today as "YYYY-MM-DD", used as the minimum for date inputs
export function today() {
  return toIsoDate(new Date())
}

// The days of a month as "YYYY-MM-DD", with null for the empty cells before day 1 (week starts on Monday)
export function buildMonthGrid(year, month) {
  const emptyCells = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, index) => toIsoDate(new Date(year, month, index + 1)))
  return [...Array(emptyCells).fill(null), ...days]
}

// Number of days from start to end, both included
export function countDays(startDate, endDate) {
  return Math.round((new Date(endDate) - new Date(startDate)) / DAY_IN_MS) + 1
}

// Same rule as the backend: weekly days off (ISO 1-7) and holidays ("MM-DD") are not counted
export function countWorkingDays(startDate, endDate, { nonWorkingWeekdays, holidays }) {
  const start = new Date(startDate).getTime()
  let working = 0
  for (let index = 0; index < countDays(startDate, endDate); index++) {
    const day = new Date(start + index * DAY_IN_MS)
    const isoWeekday = day.getUTCDay() || 7
    if (!nonWorkingWeekdays.includes(isoWeekday) && !holidays.includes(day.toISOString().slice(5, 10))) {
      working++
    }
  }
  return working
}
