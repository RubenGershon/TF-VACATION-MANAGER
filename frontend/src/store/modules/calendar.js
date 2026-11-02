// Store module for the work calendar: loading it and changing it.
import * as calendarApi from '../../api/calendarApi'

// The company work calendar: weekly days off (ISO 1 = Monday ... 7 = Sunday) and special days.
// Special days repeat every year and are stored as "MM-DD".
export default {
  namespaced: true,

  state: () => ({
    nonWorkingWeekdays: [6, 7],
    specialDays: [],
  }),

  getters: {
    holidays: (state) => state.specialDays.filter((day) => day.type === 'HOLIDAY').map((day) => day.monthDay),
    // What the day counting in utils/dates.js needs
    workCalendar: (state, getters) => ({
      nonWorkingWeekdays: state.nonWorkingWeekdays,
      holidays: getters.holidays,
    }),
  },

  mutations: {
    setCalendar(state, calendar) {
      state.nonWorkingWeekdays = calendar.nonWorkingWeekdays
      state.specialDays = calendar.specialDays
    },
  },

  actions: {
    async load({ commit }) {
      commit('setCalendar', await calendarApi.fetchCalendar())
    },
    async saveWeek({ commit }, weekdays) {
      commit('setCalendar', await calendarApi.saveWeek(weekdays))
    },
    async addSpecialDay({ commit }, payload) {
      commit('setCalendar', await calendarApi.addSpecialDay(payload))
    },
    async deleteSpecialDay({ commit }, id) {
      commit('setCalendar', await calendarApi.deleteSpecialDay(id))
    },
  },
}
