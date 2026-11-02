<script setup>
// Top navigation bar: page links by role and the user menu with the logout button.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const user = computed(() => store.state.auth.user)
const isValidator = computed(() => store.getters['auth/isValidator'])
// "Victor Validator" becomes "VV".
const initials = computed(() =>
  user.value.name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const menuOpen = ref(false)
const menu = ref(null)

// The menu closes when the user clicks anywhere outside of it.
function closeMenuOnOutsideClick(event) {
  if (menu.value && !menu.value.contains(event.target)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeMenuOnOutsideClick))
onUnmounted(() => document.removeEventListener('click', closeMenuOnOutsideClick))

async function logout() {
  await store.dispatch('auth/logout')
  router.push('/login')
}
</script>

<template>
  <nav class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div class="flex items-center gap-5 text-sm">
        <span class="text-base font-semibold text-indigo-600">Vacation Manager</span>
        <router-link v-if="isValidator" to="/dashboard" class="text-slate-500 hover:text-indigo-600" active-class="font-medium text-indigo-600">Dashboard</router-link>
        <router-link v-else to="/my-requests" class="text-slate-500 hover:text-indigo-600" active-class="font-medium text-indigo-600">My requests</router-link>
        <router-link to="/team" class="text-slate-500 hover:text-indigo-600" active-class="font-medium text-indigo-600">Team</router-link>
        <router-link v-if="isValidator" to="/calendar-settings" class="text-slate-500 hover:text-indigo-600" active-class="font-medium text-indigo-600">Work calendar</router-link>
      </div>
      <div ref="menu" class="relative">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
          :title="user.name"
          @click="menuOpen = !menuOpen"
        >
          {{ initials }}
        </button>
        <div v-if="menuOpen" class="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <p class="px-3 py-2 text-sm text-slate-500">{{ user.name }}</p>
          <button class="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50" @click="logout">
            Log out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
