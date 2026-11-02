<script setup>
// Root component: the current page and the toasts.
import ToastContainer from './components/ToastContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <router-view />
    <ToastContainer />
  </div>
</template>
