// Store module for vacation requests, balance, team vacations and the requesters list.
import * as requestApi from '../../api/requestApi'

// Counters that identify the latest call of each loader, to ignore stale responses.
let listTicket = 0
let teamTicket = 0

// The Vuex module for request data: the current page of requests, the team vacations and the user filter list.
// Actions call the API layer. Mutations are the only place that changes the state.
export default {
  namespaced: true,

  state: () => ({
    // One page of requests: { items, total, page, limit }
    list: { items: [], total: 0, page: 1, limit: 10 },
    loading: false,
    teamVacations: [],
    requesters: [],
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
    setTeamVacations(state, teamVacations) {
      state.teamVacations = teamVacations
    },
    setRequesters(state, requesters) {
      state.requesters = requesters
    },
  },

  actions: {
    // Loads a page of requests. "fetch" is the API function that returns the page.
    // The "my requests" page and the validator dashboard share one list, because only one is shown at a time.
    // "loading" is switched off in finally, so it also stops when the request fails.
    // Only the latest call may write the result: a slow, older response must not overwrite a newer one.
    async loadList({ commit }, fetch) {
      const ticket = ++listTicket
      commit('setLoading', true)
      try {
        const result = await fetch()
        if (ticket === listTicket) commit('setList', result)
      } finally {
        if (ticket === listTicket) commit('setLoading', false)
      }
    },
    loadRequests({ dispatch }, params) {
      return dispatch('loadList', () => requestApi.fetchRequests(params))
    },
    createRequest(_context, payload) {
      return requestApi.createRequest(payload)
    },
    approveRequest(_context, id) {
      return requestApi.approveRequest(id)
    },
    rejectRequest(_context, { id, comment }) {
      return requestApi.rejectRequest(id, comment)
    },
    cancelRequest(_context, id) {
      return requestApi.cancelRequest(id)
    },
    async loadBalance({ commit }) {
      commit('setBalance', await requestApi.fetchBalance())
    },
    async loadTeamVacations({ commit }, params) {
      const ticket = ++teamTicket
      const result = await requestApi.fetchTeamVacations(params)
      if (ticket === teamTicket) commit('setTeamVacations', result)
    },
    async loadRequesters({ commit }) {
      commit('setRequesters', await requestApi.fetchRequesters())
    },
  },
}
