// API calls for vacation requests, balance, team vacations and the requesters list.
import http from './http'

// The API layer: one small function per endpoint. Components and the store never write URLs themselves.
// "getData" returns only the response body, so callers do not deal with Axios responses.
const getData = (request) => request.then((response) => response.data)

export const createRequest = (payload) => getData(http.post('/requests', payload))

// One endpoint for both roles: the server returns all requests to a validator and only their own to a requester.
export const fetchRequests = (params) => getData(http.get('/requests', { params }))

export const fetchBalance = () => getData(http.get('/requests/balance'))

export const cancelRequest = (id) => getData(http.put(`/requests/${id}/cancel`))

export const approveRequest = (id) => getData(http.put(`/requests/${id}/approve`))

export const rejectRequest = (id, comment) => getData(http.put(`/requests/${id}/reject`, { comment }))

export const fetchTeamVacations = (params) => getData(http.get('/team/vacations', { params }))

export const fetchRequesters = () => getData(http.get('/users'))
