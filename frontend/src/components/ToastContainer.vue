<script setup>
// Short messages at the top of the page that close by themselves.
import { computed } from 'vue'
import { useStore } from 'vuex'

// Shows the toasts of the store at the top of the page. Clicking a toast closes it early.
// It is placed once in App.vue, so every page can show toasts.
const store = useStore()
const toasts = computed(() => store.state.toasts.items)

const styles = {
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
    <TransitionGroup name="toast">
      <button
        v-for="toast in toasts"
        :key="toast.id"
        type="button"
        class="pointer-events-auto rounded-lg border px-4 py-2 text-sm shadow-lg"
        :class="styles[toast.type]"
        @click="store.commit('toasts/remove', toast.id)"
      >
        {{ toast.message }}
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.75rem);
}
</style>
