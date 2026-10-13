'use client'
import { create } from 'zustand'

const getInitialAuth = () => {
  if (typeof window === 'undefined') return { user: null, token: null }
  try {
    const token = localStorage.getItem('bt_token') || sessionStorage.getItem('bt_token')
    const userStr = localStorage.getItem('bt_user') || sessionStorage.getItem('bt_user')
    const user = userStr ? JSON.parse(userStr) : null
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

const initialAuth = getInitialAuth()

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────
  user:  initialAuth.user,
  token: initialAuth.token,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem('bt_token', token)
          sessionStorage.setItem('bt_token', token)
        }
        if (user) {
          localStorage.setItem('bt_user', JSON.stringify(user))
          sessionStorage.setItem('bt_user', JSON.stringify(user))
        }
      } catch {}
    }
    set({ user, token })
  },
  updateUser: (data) => set(s => {
    const updated = { ...s.user, ...data }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bt_user', JSON.stringify(updated))
        sessionStorage.setItem('bt_user', JSON.stringify(updated))
      } catch {}
    }
    return { user: updated }
  }),
  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bt_token')
        localStorage.removeItem('bt_user')
        sessionStorage.removeItem('bt_token')
        sessionStorage.removeItem('bt_user')
      } catch {}
    }
    set({ user: null, token: null })
  },

  // ── Active Game Session ───────────────────────────────────────
  currentLevel:   1,
  currentWorldId: 'forest',
  activeTrack:    null,
  sessionScore:   0,
  sessionCombo:   0,
  sessionMaxCombo: 0,
  sessionHits:    0,
  sessionMisses:  0,
  sessionTricks:  0,

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setActiveTrack:  (track) => set({ activeTrack: track }),
  resetSession: () => set({ sessionScore:0, sessionCombo:0, sessionMaxCombo:0, sessionHits:0, sessionMisses:0, sessionTricks:0 }),

  addScore:  (pts) => set(s => ({ sessionScore: Math.max(0, s.sessionScore + pts) })),
  addHit:    ()   => set(s => {
    const combo = s.sessionCombo + 1
    return { sessionHits: s.sessionHits + 1, sessionCombo: combo, sessionMaxCombo: Math.max(s.sessionMaxCombo, combo) }
  }),
  addMiss:   ()   => set(s => ({ sessionMisses: s.sessionMisses + 1, sessionCombo: 0 })),
  addTrick:  ()   => set(s => ({ sessionTricks: s.sessionTricks + 1, sessionCombo: 0 })),

  // Last result (for ResultPage)
  lastResult: null,
  setLastResult: (r) => set({ lastResult: r }),

  // ── Settings ─────────────────────────────────────────────────
  settings: {
    sfxVolume:   0.8,
    musicVolume: 0.7,
    showHints:   true,
    colorblind:  false,
    particles:   true,
    language:    'uz',
  },
  updateSettings: (s) => set(st => ({ settings: { ...st.settings, ...s } })),

  // ── Owned items ───────────────────────────────────────────────
  ownedItems: [],
  setOwnedItems: (items) => set({ ownedItems: items }),

  // ── Selected skin ─────────────────────────────────────────────
  selectedSkin: 'default',
  setSelectedSkin: (skin) => set({ selectedSkin: skin }),
}))

export default useStore
