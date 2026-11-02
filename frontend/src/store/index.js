// The Vuex store: puts the auth and toasts modules together.
import { createStore } from 'vuex'
import auth from './modules/auth'
import toasts from './modules/toasts'

export default createStore({
  modules: { auth, toasts },
})
