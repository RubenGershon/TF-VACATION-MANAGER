<script setup>
// Team page: the month calendar of approved vacations, with previous and next month buttons.
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { errorMessage } from '../api/http'
import AlertMessage from '../components/AlertMessage.vue'
import TeamCalendar from '../components/TeamCalendar.vue'
import { toIsoDate } from '../utils/dates'

const store = useStore()
const error = ref('')

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth())

const vacations = computed(() => store.state.requests.teamVacations)
const monthTitle = computed(() =>
  new Date(year.value, month.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
)

// We ask the backend only for the visible month, so the page stays fast when there are many vacations.
async function loadMonth() {
  error.value = ''
  try {
    await store.dispatch('requests/loadTeamVacations', {
      from: toIsoDate(new Date(year.value, month.value, 1)),
      to: toIsoDate(new Date(year.value, month.value + 1, 0)),
    })
  } catch (e) {
    error.value = errorMessage(e)
  }
}

function changeMonth(step) {
  const target = new Date(year.value, month.value + step, 1)
  year.value = target.getFullYear()
  month.value = target.getMonth()
  loadMonth()
}

onMounted(loadMonth)
</script>

<template>
  <main class="mx-auto max-w-5xl space-y-4 p-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Team vacations</h1>
        <p class="text-sm text-slate-500">Approved vacations of the whole team.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary" aria-label="Previous month" @click="changeMonth(-1)">&larr;</button>
        <span class="w-36 text-center text-sm font-medium">{{ monthTitle }}</span>
        <button class="btn-secondary" aria-label="Next month" @click="changeMonth(1)">&rarr;</button>
      </div>
    </div>

    <AlertMessage :message="error" />
    <TeamCalendar :year="year" :month="month" :vacations="vacations" />
  </main>
</template>
