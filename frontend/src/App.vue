<script setup>
// Root component: the navbar (when logged in), the current page, and the toasts.
import { computed } from 'vue'
import { useStore } from 'vuex'
import AppNavbar from './components/AppNavbar.vue'
import ToastContainer from './components/ToastContainer.vue'

const store = useStore()
const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppNavbar v-if="isLoggedIn" />
    <router-view />
    <ToastContainer />
  </div>
</template>
