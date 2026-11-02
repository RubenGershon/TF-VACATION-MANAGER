// App entry point: creates the Vue app, plugs in the store and router, and handles expired sessions.
import { createApp } from 'vue'
import { setupHttp } from './api/http'
import App from './App.vue'
import router from './router'
import store from './store'
import './style.css'

setupHttp({
  onUnauthorized: () => {
    store.commit('auth/clearSession')
    router.push('/login')
  },
})

createApp(App).use(store).use(router).mount('#app')
