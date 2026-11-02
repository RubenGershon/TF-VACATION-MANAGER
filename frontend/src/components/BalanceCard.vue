<script setup>
// Card showing the remaining vacation days of the year with a progress bar.
import { computed } from 'vue'

// Shows how many vacation days the user has left this year, with a bar of the days already used.
const props = defineProps({
  balance: { type: Object, required: true },
})

const usedPercent = computed(() => {
  const { used, allowance } = props.balance
  if (!allowance) return used > 0 ? 100 : 0
  return Math.min(100, (used / allowance) * 100)
})
</script>

<template>
  <div class="card space-y-2">
    <div class="flex items-baseline justify-between">
      <h2 class="font-semibold">Vacation days {{ balance.year }}</h2>
      <p class="text-sm text-slate-500">
        <span class="text-lg font-semibold text-slate-900">{{ balance.remaining }}</span>
        left of {{ balance.allowance }}
      </p>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-slate-100">
      <div class="h-full rounded-full bg-indigo-500" :style="{ width: usedPercent + '%' }"></div>
    </div>
    <p class="text-xs text-slate-500">Pending and approved requests count as used.</p>
  </div>
</template>
