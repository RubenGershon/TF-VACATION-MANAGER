<script setup>
// Coloured label for the status of a request.
defineProps({
  status: { type: String, required: true },
})

const styles = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  REJECTED: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

const labels = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}
</script>

<template>
  <span class="rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset" :class="styles[status]">
    {{ labels[status] }}
  </span>
</template>
