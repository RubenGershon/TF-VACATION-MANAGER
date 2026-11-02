// Routes of the app and the guard that redirects guests. The other pages are added with their features.
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import LoginView from '../views/LoginView.vue'

const REQUESTER = 'REQUESTER'
const VALIDATOR = 'VALIDATOR'

// Each role has its own start page
function homeFor(role) {
  if (role === VALIDATOR) return '/dashboard'
  if (role === REQUESTER) return '/my-requests'
  return '/login'
}

const routes = [
  { path: '/', redirect: () => homeFor(store.getters['auth/role']) },
  { path: '/login', component: LoginView, meta: { guestOnly: true } },
  // Placeholder for the pages that do not exist yet
  { path: '/:pathMatch(.*)*', component: { template: '<h1 class="p-6 text-xl font-semibold">Coming soon</h1>' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Route guard: runs before every page change.
// A guest goes to the login page, and a logged-in user cannot open the login page.
// This only improves the experience. The real protection is the role check in the backend.
router.beforeEach((to) => {
  const isLoggedIn = store.getters['auth/isLoggedIn']

  if (to.meta.guestOnly) {
    return isLoggedIn ? homeFor(store.getters['auth/role']) : true
  }
  return isLoggedIn ? true : '/login'
})

export default router
