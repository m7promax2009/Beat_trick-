'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────
      user:  null,
      token: null,
      setAuth:    (user, token) => set({ user, token }),
      updateUser: (data)        => set(s => ({ user: { ...s.user, ...data } })),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bt_token')
          localStorage.removeItem('bt_user')
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
    }),
    {
      name: 'beat-trick-store',
      partialize: s => ({ user: s.user, token: s.token, settings: s.settings, ownedItems: s.ownedItems, selectedSkin: s.selectedSkin, currentLevel: s.currentLevel }),
    }
  )
)

export default useStore
