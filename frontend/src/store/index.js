// The Vuex store: puts the auth, calendar, requests and toasts modules together.
import { createStore } from 'vuex'
import auth from './modules/auth'
import calendar from './modules/calendar'
import requests from './modules/requests'
import toasts from './modules/toasts'

export default createStore({
  modules: { auth, calendar, requests, toasts },
})
