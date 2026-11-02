<script setup>
// Previous and next buttons with the page counter.
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  limit: { type: Number, required: true },
  total: { type: Number, required: true },
})

defineEmits(['change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
</script>

<template>
  <div class="flex items-center justify-between text-sm text-slate-600">
    <span>{{ total }} request(s) - page {{ page }} of {{ totalPages }}</span>
    <div class="flex gap-2">
      <button class="btn-secondary" :disabled="page <= 1" @click="$emit('change', page - 1)">Previous</button>
      <button class="btn-secondary" :disabled="page >= totalPages" @click="$emit('change', page + 1)">Next</button>
    </div>
  </div>
</template>
