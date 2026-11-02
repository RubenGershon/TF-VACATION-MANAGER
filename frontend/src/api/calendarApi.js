// API calls for the work calendar.
import http from './http'

const getData = (request) => request.then((response) => response.data)

// Every call returns the whole updated calendar: { nonWorkingWeekdays, specialDays }
export const fetchCalendar = () => getData(http.get('/calendar'))

export const saveWeek = (nonWorkingWeekdays) => getData(http.put('/calendar/week', { nonWorkingWeekdays }))

export const addSpecialDay = (payload) => getData(http.post('/calendar/special-days', payload))

export const deleteSpecialDay = (id) => getData(http.delete(`/calendar/special-days/${id}`))
