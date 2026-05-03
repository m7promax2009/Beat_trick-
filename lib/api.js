import axios from 'axios'

// Backend server URL
// To'g'ridan-to'g'ri backend'ga murojaat qilamiz (CORS backend tarafda ruxsat beriladi).
// NEXT_PUBLIC_API_URL bo'lsa, o'sha qiymat ishlatiladi (masalan: http://localhost:5000)
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'https://beat-trick-back.onrender.com'
const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 8000,
})

// Inject token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bt_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('bt_token')
      localStorage.removeItem('bt_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/users/me'),
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
