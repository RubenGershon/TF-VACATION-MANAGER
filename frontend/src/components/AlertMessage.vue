<script setup>
// Inline error message box for errors that belong to the page content.
// A message shown inside the page, for errors that belong to the page content (like a list that failed to load).
// Results of user actions are shown as toasts instead.
defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <p v-if="message" class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
    {{ message }}
  </p>
</template>