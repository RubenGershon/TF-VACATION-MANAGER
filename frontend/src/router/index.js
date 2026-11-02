// Routes of the app and the guard that redirects guests and users of the wrong role.
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import MyRequestsView from '../views/MyRequestsView.vue'
import TeamView from '../views/TeamView.vue'
import CalendarSettingsView from '../views/CalendarSettingsView.vue'

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
  { path: '/my-requests', component: MyRequestsView, meta: { role: REQUESTER } },
  { path: '/dashboard', component: DashboardView, meta: { role: VALIDATOR } },
  { path: '/team', component: TeamView },
  { path: '/calendar-settings', component: CalendarSettingsView, meta: { role: VALIDATOR } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Route guard: runs before every page change.
// A guest goes to the login page, a logged-in user cannot open the login page,
// and a user who opens a page of the other role is sent back to their own home page.
// This only improves the experience. The real protection is the role check in the backend.
router.beforeEach((to) => {
  const isLoggedIn = store.getters['auth/isLoggedIn']
  const role = store.getters['auth/role']

  if (to.meta.guestOnly) {
    return isLoggedIn ? homeFor(role) : true
  }
  if (!isLoggedIn) {
    return '/login'
  }
  if (to.meta.role && to.meta.role !== role) {
    return homeFor(role)
  }
  return true
})

export default router
