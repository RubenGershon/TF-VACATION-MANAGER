<script setup>
// Month calendar of the team: initials of the people on vacation, holidays and non-working days.
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

const MAX_VISIBLE = 3

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

// Full class strings so Tailwind can detect them.
const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-800',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
]

function colorOf(name = '') {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

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
  <div class="rounded-xl border border-slate-300 bg-white shadow-sm">
    <div class="grid grid-cols-7 rounded-t-xl border-b border-slate-300 bg-slate-50  text-center text-xs font-medium text-slate-500">
      <div v-for="weekday in WEEKDAYS" :key="weekday" class="py-2">{{ weekday }}</div>
    </div>

    <div class="grid grid-cols-7">
      <div
        v-for="(cell, index) in cells"
        :key="index"
        class="min-h-24 border-b border-r border-slate-300 p-1.5 transition-colors [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0"
        :class="cell.date ? (cell.nonWorking ? 'bg-slate-100' : 'hover:bg-indigo-50/40') : 'bg-slate-50'"
        :title="cell.special?.name"
      >
        <template v-if="cell.date">
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs"
            :class="cell.date === today() ? 'bg-indigo-600 font-semibold text-white' : cell.nonWorking ? 'text-slate-500' : 'text-slate-600'"
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
          <p v-if="cell.nonWorking" class="mt-2 text-[11px] italic text-slate-400">Non working day</p>
          <div v-else-if="cell.people.length" class="group relative mt-2 flex cursor-pointer items-center">
            <span
              v-for="(vacation, i) in cell.people.slice(0, MAX_VISIBLE)"
              :key="vacation.id"
              class="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-white"
              :class="[colorOf(vacation.userName), i > 0 ? 'ml-1' : '']"
            >
              {{ initials(vacation.userName) }}
            </span>
            <span
              v-if="cell.people.length > MAX_VISIBLE"
              class="ml-1 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-700 px-1.5 text-[10px] font-semibold text-white ring-2 ring-white"
            >
              +{{ cell.people.length - MAX_VISIBLE }}
            </span>
            <div
              class="pointer-events-none absolute top-9 z-30 hidden max-h-72 w-max min-w-44 max-w-64 overflow-y-auto rounded-lg bg-slate-900 p-3 text-xs text-white shadow-xl group-hover:block"
              :class="index % 7 > 3 ? 'right-0' : 'left-0'"
            >
              <p class="mb-2 border-b border-slate-700 pb-1.5 font-semibold text-slate-300">
                {{ cell.people.length }} {{ cell.people.length === 1 ? 'person' : 'people' }} off
              </p>
              <ul class="space-y-1.5">
                <li v-for="vacation in cell.people" :key="vacation.id" class="flex items-center gap-2">
                  <span
                    class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold"
                    :class="colorOf(vacation.userName)"
                  >
                    {{ initials(vacation.userName) }}
                  </span>
                  <span class="whitespace-nowrap">{{ vacation.userName }}</span>
                </li>
              </ul>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
