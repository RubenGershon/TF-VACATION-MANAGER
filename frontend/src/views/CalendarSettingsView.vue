<script setup>
// Page for validators to set the weekly days off and manage holidays and events.
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { errorMessage } from '../api/http'
import AlertMessage from '../components/AlertMessage.vue'

const store = useStore()
const error = ref('')

const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
]

const nonWorkingWeekdays = computed(() => store.state.calendar.nonWorkingWeekdays)
const specialDays = computed(() => store.state.calendar.specialDays)

const newDate = ref('')
const newName = ref('')
const newType = ref('HOLIDAY')

// Runs a calendar change, shows a toast when it works and the error otherwise
async function run(action, successMessage) {
  error.value = ''
  try {
    await action()
    store.dispatch('toasts/show', { message: successMessage })
  } catch (e) {
    error.value = errorMessage(e)
  }
}

function toggleWeekday(value) {
  const weekdays = nonWorkingWeekdays.value.includes(value)
    ? nonWorkingWeekdays.value.filter((day) => day !== value)
    : [...nonWorkingWeekdays.value, value]
  run(() => store.dispatch('calendar/saveWeek', weekdays), 'Weekly days off saved.')
}

async function addSpecialDay() {
  await run(
    () => store.dispatch('calendar/addSpecialDay', { date: newDate.value, name: newName.value, type: newType.value }),
    'Special day added.',
  )
  if (!error.value) {
    newDate.value = ''
    newName.value = ''
  }
}

// "MM-DD" shown as "25 December"
function formatMonthDay(monthDay) {
  const [month, day] = monthDay.split('-').map(Number)
  return new Date(2000, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-4 p-4">
    <div>
      <h1 class="text-xl font-semibold text-slate-900">Work calendar</h1>
      <p class="text-sm text-slate-500">Non-working days are not counted as vacation days.</p>
    </div>

    <AlertMessage :message="error" />

    <section class="card space-y-3">
      <h2 class="font-semibold">Weekly days off</h2>
      <p class="text-sm text-slate-500">Applies to every week of the year.</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="weekday in WEEKDAYS"
          :key="weekday.value"
          type="button"
          class="btn border"
          :class="
            nonWorkingWeekdays.includes(weekday.value)
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          "
          :aria-pressed="nonWorkingWeekdays.includes(weekday.value)"
          @click="toggleWeekday(weekday.value)"
        >
          {{ weekday.label }}
        </button>
      </div>
      <p class="text-xs text-slate-500">Highlighted days are days off.</p>
    </section>

    <section class="card space-y-3">
      <h2 class="font-semibold">Holidays and events</h2>
      <p class="text-sm text-slate-500">
        They repeat every year. A holiday is a day off. An event is only shown on the calendar.
      </p>

      <form class="grid gap-3 sm:grid-cols-[10rem_1fr_9rem_auto] sm:items-end" @submit.prevent="addSpecialDay">
        <label class="block text-sm">
          Date
          <input v-model="newDate" type="date" required class="input mt-1" />
        </label>
        <label class="block text-sm">
          Name
          <input v-model="newName" type="text" required maxlength="100" class="input mt-1" placeholder="Christmas Day" />
        </label>
        <label class="block text-sm">
          Type
          <select v-model="newType" class="input mt-1">
            <option value="HOLIDAY">Holiday</option>
            <option value="EVENT">Event</option>
          </select>
        </label>
        <button type="submit" class="btn-primary">Add</button>
      </form>

      <p v-if="!specialDays.length" class="text-sm text-slate-500">No special days yet.</p>
      <ul v-else class="divide-y divide-slate-100">
        <li v-for="day in specialDays" :key="day.id" class="flex items-center justify-between gap-3 py-2 text-sm">
          <span class="flex items-center gap-3">
            <span class="w-28 text-slate-500">{{ formatMonthDay(day.monthDay) }}</span>
            <span>{{ day.name }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs"
              :class="day.type === 'HOLIDAY' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ day.type === 'HOLIDAY' ? 'Holiday' : 'Event' }}
            </span>
          </span>
          <button
            class="btn-secondary"
            @click="run(() => store.dispatch('calendar/deleteSpecialDay', day.id), 'Special day deleted.')"
          >
            Delete
          </button>
        </li>
      </ul>
    </section>
  </main>
</template>
