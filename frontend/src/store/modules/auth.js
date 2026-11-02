// Store module for the logged-in user: login, logout and the saved session.
import * as authApi from '../../api/authApi'

const USER_KEY = 'user'

// The Vuex module for the session. Components read the user from here and never touch localStorage.
// The login token is NOT stored here. It is in an HttpOnly cookie that JavaScript cannot read.
export default {
  namespaced: true,

  // Only the user's public data is kept in localStorage, so the page knows who is logged in after a refresh.
  // If the cookie has expired, the first API call answers 401 and the session is cleared (see main.js).
  state: () => ({
    user: JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'),
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.user),
    role: (state) => state.user?.role,
    isValidator: (state) => state.user?.role === 'VALIDATOR',
  },

  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    clearSession(state) {
      state.user = null
      localStorage.removeItem(USER_KEY)
    },
  },

  actions: {
    async login({ commit }, { email, password }) {
      const { user } = await authApi.login(email, password)
      commit('setUser', user)
    },
    // The session is cleared even if the server cannot be reached.
    async logout({ commit }) {
      try {
        await authApi.logout()
      } finally {
        commit('clearSession')
      }
    },
  },
}
