// API calls for login and logout.
import http from './http'

export const login = (email, password) =>
  http.post('/auth/login', { email, password }).then((response) => response.data)

// Asks the server to delete the session cookie. The browser does not let JavaScript delete it.
export const logout = () => http.post('/auth/logout')
