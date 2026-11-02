// Store module for the short messages (toasts) shown at the top of the page.
const DISPLAY_MILLISECONDS = 4000

let nextId = 1

// The Vuex module for toasts: short messages shown at the top of the page that remove themselves.
// Any component can show one with store.dispatch('toasts/show', { message, type }).
export default {
  namespaced: true,

  state: () => ({
    // Each toast is { id, message, type }, where type is 'success' or 'error'
    items: [],
  }),

  mutations: {
    add(state, toast) {
      state.items.push(toast)
    },
    remove(state, id) {
      state.items = state.items.filter((toast) => toast.id !== id)
    },
  },

  actions: {
    show({ commit }, { message, type = 'success' }) {
      const id = nextId++
      commit('add', { id, message, type })
      setTimeout(() => commit('remove', id), DISPLAY_MILLISECONDS)
    },
  },
}
