// Store module for vacation requests and the balance.
import * as requestApi from '../../api/requestApi'

// The Vuex module for request data: the current page of requests and the balance.
// Actions call the API layer. Mutations are the only place that changes the state.
export default {
  namespaced: true,

  state: () => ({
    // One page of requests: { items, total, page, limit }
    list: { items: [], total: 0, page: 1, limit: 10 },
    loading: false,
    // The requester's vacation days: { year, allowance, used, remaining }
    balance: null,
  }),

  mutations: {
    setBalance(state, balance) {
      state.balance = balance
    },
    setList(state, list) {
      state.list = list
    },
    setLoading(state, loading) {
      state.loading = loading
    },
  },

  actions: {
    // Loads a page of requests. "fetch" is the API function that returns the page.
    // "loading" is switched off in finally, so it also stops when the request fails.
    async loadList({ commit }, fetch) {
      commit('setLoading', true)
      try {
        commit('setList', await fetch())
      } finally {
        commit('setLoading', false)
      }
    },
    loadRequests({ dispatch }, params) {
      return dispatch('loadList', () => requestApi.fetchRequests(params))
    },
    createRequest(_context, payload) {
      return requestApi.createRequest(payload)
    },
    cancelRequest(_context, id) {
      return requestApi.cancelRequest(id)
    },
    async loadBalance({ commit }) {
      commit('setBalance', await requestApi.fetchBalance())
    },
  },
}
