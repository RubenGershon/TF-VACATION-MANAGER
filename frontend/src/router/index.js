// Routes of the app. The pages and the guard that protects them are added with the pages themselves.
import { createRouter, createWebHistory } from 'vue-router'

const routes = [{ path: '/:pathMatch(.*)*', component: { template: '<h1 class="p-6 text-xl font-semibold">Vacation Management</h1>' } }]

export default createRouter({
  history: createWebHistory(),
  routes,
})
