<script setup>
// Form to submit a vacation request, with a live count of the working days it will use.
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { errorMessage } from '../api/http'
import { countDays, countWorkingDays, today } from '../utils/dates'
import AlertMessage from './AlertMessage.vue'

const emit = defineEmits(['created'])
const store = useStore()

const startDate = ref('')
const endDate = ref('')
const reason = ref('')
const error = ref('')
const submitting = ref(false)

// A start date after the end date makes the end date invalid, so it is cleared
watch(startDate, (start) => {
  if (start && endDate.value && start > endDate.value) endDate.value = ''
})

const hasRange = computed(() => Boolean(startDate.value && endDate.value && endDate.value >= startDate.value))
const totalDays = computed(() =>
  hasRange.value ? countWorkingDays(startDate.value, endDate.value, store.getters['calendar/workCalendar']) : 0,
)
const skippedDays = computed(() => (hasRange.value ? countDays(startDate.value, endDate.value) - totalDays.value : 0))

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await store.dispatch('requests/createRequest', {
      startDate: startDate.value,
      endDate: endDate.value,
      reason: reason.value,
    })
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
    store.dispatch('toasts/show', { message: 'Request submitted. It is now pending approval.' })
    emit('created')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="card space-y-3" @submit.prevent="submit">
    <h2 class="font-semibold">New vacation request</h2>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-sm">
        Start date
        <input v-model="startDate" type="date" required :min="today()" class="input mt-1" />
      </label>
      <label class="block text-sm">
        End date
        <input v-model="endDate" type="date" required :min="startDate || today()" class="input mt-1" />
      </label>
    </div>

    <div
      v-if="hasRange"
      class="flex items-center gap-3 rounded-lg border px-4 py-3"
      :class="totalDays > 0 ? 'border-indigo-100 bg-indigo-50 text-indigo-900' : 'border-amber-200 bg-amber-50 text-amber-900'"
    >
      <span class="text-3xl font-bold leading-none">{{ totalDays }}</span>
      <span class="text-sm">
        working {{ totalDays === 1 ? 'day' : 'days' }} of vacation
        <span class="block text-xs opacity-80">
          {{ startDate }} &rarr; {{ endDate }}<template v-if="skippedDays">
            · {{ skippedDays }} non-working {{ skippedDays === 1 ? 'day' : 'days' }} not counted</template>
        </span>
      </span>
    </div>

    <label class="block text-sm">
      Reason (optional)
      <textarea v-model="reason" rows="2" maxlength="500" class="input mt-1"></textarea>
    </label>

    <AlertMessage :message="error" />
    <button type="submit" class="btn-primary" :disabled="submitting || !hasRange || totalDays === 0">Submit request</button>
  </form>
</template>
