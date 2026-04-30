'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MusicSearch({ onSelect, worldTheme }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const debounceRef = useRef(null)
  const primary = worldTheme?.primary || '#00f0ff'

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=20&country=us`
      )
      const data = await res.json()
      setResults((data.results || []).filter(r => r.previewUrl))
    } catch {
      setError("Qidirishda xatolik. Internet aloqasini tekshiring.")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 600)
  }

  const handleSelect = (track) => {
    onSelect({
      title:   `${track.trackName} — ${track.artistName}`,
      url:     track.previewUrl,
      artwork: track.artworkUrl100,
      artist:  track.artistName,
      bpm:     null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-start pt-12 px-4 pb-4 overflow-y-auto"
      style={{ background: 'rgba(6,6,15,0.97)', backdropFilter: 'blur(24px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-5xl mb-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎵
          </motion.div>
          <h2 className="font-display font-black text-2xl text-white">Musiqa Tanlang</h2>
          <p className="text-white/40 text-sm font-body mt-1">
            Istalgan qo'shiqni qidiring va o'ynang
          </p>
          <div
            className="inline-block mt-2 px-3 py-1 rounded-full font-display text-xs tracking-widest"
            style={{ background: `${primary}18`, color: primary, border: `1px solid ${primary}44` }}
          >
            iTunes · 30 soniyalik preview · Bepul
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg pointer-events-none">
            {loading ? '⏳' : '🔍'}
          </span>
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Qo'shiq yoki ijrochi nomi..."
            autoFocus
            className="w-full pl-11 pr-5 py-4 rounded-2xl text-white font-body focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${primary}33`,
            }}
            onFocus={e => (e.target.style.borderColor = primary)}
            onBlur={e => (e.target.style.borderColor = `${primary}33`)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm text-center py-4 font-body bg-red-500/10 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && results.length === 0 && !query.trim() && (
          <div className="text-center py-10">
            <p className="text-white/25 font-body text-sm">Yoqimli musiqangizni qidiring</p>
            <p className="text-white/15 font-display text-xs mt-2 tracking-widest">30 SONIYALIK PREVIEW BILAN O'YNANG</p>
          </div>
        )}

        {!loading && !error && results.length === 0 && query.trim() && (
          <div className="text-center py-10 text-white/30 font-body text-sm">
            Natija topilmadi. Boshqa so'z kiriting.
          </div>
        )}

        {/* Results */}
        <div className="space-y-2">
          <AnimatePresence>
            {results.map((track, i) => (
              <motion.button
                key={track.trackId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${primary}66`
                  e.currentTarget.style.background = `${primary}0f`
                  e.currentTarget.style.transform = 'scale(1.01)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                <img
                  src={track.artworkUrl60 || track.artworkUrl100}
                  alt=""
                  className="w-12 h-12 rounded-lg flex-shrink-0 object-cover"
                  style={{ boxShadow: `0 0 12px ${primary}44` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm text-white truncate">
                    {track.trackName}
                  </div>
                  <div className="text-white/50 text-xs font-body truncate">
                    {track.artistName}
                  </div>
                  <div className="text-white/25 text-[0.6rem] font-body mt-0.5">
                    {track.primaryGenreName} · {track.collectionName}
                  </div>
                </div>
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all"
                  style={{ background: `${primary}22`, color: primary }}
                >
                  ▶
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
