<script setup>
// Popup where a validator writes the required comment to reject a request.
import { ref } from 'vue'

defineProps({
  request: { type: Object, required: true },
})

const emit = defineEmits(['confirm', 'cancel'])

const comment = ref('')
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="emit('cancel')">
    <form class="card w-full max-w-md space-y-3" @submit.prevent="emit('confirm', comment.trim())">
      <h2 class="font-semibold">Reject request of {{ request.userName }}</h2>
      <p class="text-sm text-slate-600">{{ request.startDate }} to {{ request.endDate }}</p>

      <label class="block text-sm">
        Comment (required)
        <textarea v-model="comment" rows="3" required class="input mt-1"></textarea>
      </label>

      <div class="flex justify-end gap-2">
        <button type="button" class="btn-secondary" @click="emit('cancel')">Cancel</button>
        <button type="submit" class="btn-danger" :disabled="!comment.trim()">Reject</button>
      </div>
    </form>
  </div>
</template>
