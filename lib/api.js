import axios from 'axios'

// Backend server URL
// To'g'ridan-to'g'ri backend'ga murojaat qilamiz (CORS backend tarafda ruxsat beriladi).
// NEXT_PUBLIC_API_URL bo'lsa, o'sha qiymat ishlatiladi (masalan: http://localhost:5000)
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 8000,
})

// Inject token from store
import useStore from '../store/useStore'

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const state = useStore.getState()
    const token = state.token || (typeof localStorage !== 'undefined' && localStorage.getItem('bt_token'))
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const state = useStore.getState()
      if (state.token) {
        state.logout()
        const path = window.location.pathname
        if (path !== '/login' && path !== '/register' && path !== '/game') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  me:             ()     => api.get('/users/me'),
}

// Game
export const gameAPI = {
  randomTrack: (level) => api.get(`/tracks/random?level=${level}`),
  saveResult:  (data)  => api.post('/game/result', data),
  history:     (limit=10) => api.get(`/game/history?limit=${limit}`),
}

// Leaderboard
export const leaderboardAPI = {
  global:  (worldId) => api.get(`/leaderboard?type=global${worldId ? `&worldId=${worldId}` : ''}`),
  weekly:  (worldId) => api.get(`/leaderboard?type=weekly${worldId ? `&worldId=${worldId}` : ''}`),
  daily:   ()        => api.get('/leaderboard?type=daily'),
}

// Shop
export const shopAPI = {
  list: ()       => api.get('/shop'),
  buy:  (itemId) => api.post('/shop/buy', { itemId }),
}

// User
export const userAPI = {
  profile:  (username) => api.get(`/users/${username}`),
  updateMe: (data)     => api.patch('/users/me', data),
}
