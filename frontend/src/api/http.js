// The shared Axios instance: base URL, automatic logout on 401, and error message helper.
import axios from 'axios'

// "/api" is rewritten by the Vite proxy (see vite.config.js) and sent to the backend on port 8888.
// The session lives in an HttpOnly cookie, which the browser sends by itself on every request.
// That is why there is no token handling here.
const http = axios.create({ baseURL: '/api' })

let onUnauthorized = () => {}

// Called once from main.js, so this file does not need to import the store or the router
export function setupHttp(handlers) {
  onUnauthorized = handlers.onUnauthorized
}

// Ends the session when the server answers 401 (for example when the cookie has expired).
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

// The backend always answers errors as { error: "message" }
export function errorMessage(error) {
  return error.response?.data?.error ?? 'Cannot reach the server'
}

export default http
