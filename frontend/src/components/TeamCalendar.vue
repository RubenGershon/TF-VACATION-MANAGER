<script setup>
// Month calendar of the team: who is on vacation each day, holidays and non-working days.
import { computed } from 'vue'
import { useStore } from 'vuex'
import { buildMonthGrid, today } from '../utils/dates'

// Shows one month as a grid. It only displays what it receives, and the parent view loads the data.
const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  vacations: { type: Array, required: true },
})

const store = useStore()
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const cells = computed(() => {
  const { nonWorkingWeekdays, specialDays } = store.state.calendar
  const grid = buildMonthGrid(props.year, props.month)
  while (grid.length % 7) grid.push(null)
  return grid.map((date) => {
    const special = date ? specialDays.find((day) => day.monthDay === date.slice(5)) : null
    const isoWeekday = date ? new Date(date).getUTCDay() || 7 : null
    return {
      date,
      day: date ? Number(date.slice(-2)) : null,
      people: date ? peopleOn(date) : [],
      special,
      nonWorking: Boolean(date) && (nonWorkingWeekdays.includes(isoWeekday) || special?.type === 'HOLIDAY'),
    }
  })
})

// Dates are "YYYY-MM-DD" strings, so comparing them as text gives the right order.
function peopleOn(date) {
  return props.vacations.filter((v) => v.startDate <= date && date <= v.endDate)
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
      <div v-for="weekday in WEEKDAYS" :key="weekday" class="py-2">{{ weekday }}</div>
    </div>

    <div class="grid grid-cols-7">
      <div
        v-for="(cell, index) in cells"
        :key="index"
        class="min-h-24 border-b border-r border-slate-100 p-1.5"
        :class="cell.date ? (cell.nonWorking ? 'bg-slate-100' : '') : 'bg-slate-50'"
        :title="cell.special?.name"
      >
        <template v-if="cell.date">
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
            :class="cell.date === today() ? 'bg-indigo-600 font-semibold text-white' : 'text-slate-600'"
          >
            {{ cell.day }}
          </span>
          <p
            v-if="cell.special"
            class="mt-1 truncate rounded px-1 text-xs"
            :class="cell.special.type === 'HOLIDAY' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'"
          >
            {{ cell.special.name }}
          </p>
          <ul v-if="!cell.nonWorking" class="mt-1 space-y-0.5">
            <li v-for="vacation in cell.people" :key="vacation.id" class="truncate rounded bg-indigo-100 px-1 text-xs text-indigo-800">
              {{ vacation.userName }}
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>
