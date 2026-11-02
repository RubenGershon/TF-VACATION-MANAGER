<script setup>
// Login page.
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { errorMessage } from '../api/http'
import AlertMessage from '../components/AlertMessage.vue'
import BrandLogo from '../components/BrandLogo.vue'

const store = useStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await store.dispatch('auth/login', { email: email.value, password: password.value })
    router.push('/')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-sky-50 p-4">
    <form class="card w-full max-w-sm space-y-4 p-8 shadow-lg" @submit.prevent="submit">
      <div class="space-y-3">
        <BrandLogo large />
        <p class="text-sm text-slate-500">Welcome back. Log in to manage your time off.</p>
      </div>

      <label class="block text-sm">
        Email
        <input v-model="email" type="email" required class="input mt-1" />
      </label>
      <label class="block text-sm">
        Password
        <input v-model="password" type="password" required class="input mt-1" />
      </label>

      <AlertMessage :message="error" />
      <button type="submit" class="btn-primary w-full" :disabled="submitting">Log in</button>

      <div class="border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p>Demo accounts (password: password123)</p>
        <p>alice, bob, carol, david @example.com (requesters)</p>
        <p>victor, vera @example.com (validators)</p>
      </div>
    </form>
  </div>
</template>
