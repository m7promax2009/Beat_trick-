'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import { getDifficultyForLevel, getPlanetLevel, calcBeatInterval } from '../../lib/worlds'
import { formatScore, generateSlots, msToBar } from '../../lib/utils'
import { gameAPI } from '../../lib/api'
import { useAudio } from '../../hooks/useAudio'
import { tFor } from '../../lib/i18n'
import BeatButton from '../../components/game/BeatButton'
import ComboDisplay from '../../components/game/ComboDisplay'
import LivesDisplay from '../../components/game/LivesDisplay'
import ScorePopup from '../../components/game/ScorePopup'
import CountdownOverlay from '../../components/game/CountdownOverlay'
import WorldBackground from '../../components/game/WorldBackground'
import BeatVisualizer from '../../components/game/BeatVisualizer'
import MusicSearch from '../../components/music/MusicSearch'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import Spinner from '../../components/ui/Spinner'

const GRID_POSITIONS = [
  { x: 12, y: 15 }, { x: 50, y: 15 }, { x: 88, y: 15 },
  { x: 12, y: 50 }, { x: 50, y: 50 }, { x: 88, y: 50 },
  { x: 12, y: 85 }, { x: 50, y: 85 }, { x: 88, y: 85 },
]
const SHAPES       = ['circle', 'square', 'diamond', 'triangle', 'hexagon']
const BTN_STAGGER  = 500

const WORLD_QUERY = {
  'forest':    'nature ambient relaxing',
  'neon-city': 'synthwave electronic',
  'ocean':     'deep house ocean waves',
  'space':     'space ambient electronic',
  'lava':      'hard dubstep bass',
  'ice':       'trance crystal',
  'cyber-god': 'drum and bass fast',
}

async function fetchRandomTrack(worldId) {
  const query = WORLD_QUERY[worldId] || 'electronic music'
  try {
    const res  = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50&country=us`
    )
    const data = await res.json()
    const pool = (data.results || []).filter(r => r.previewUrl)
    if (!pool.length) return null
    const picked = pool[Math.floor(Math.random() * pool.length)]
    return {
      title:   `${picked.trackName} — ${picked.artistName}`,
      url:     picked.previewUrl,
      artwork: picked.artworkUrl100,
      artist:  picked.artistName,
    }
  } catch {
    return null
  }
}

function GameScreen() {
  const router  = useRouter()
  const { user, currentLevel, setLastResult, settings, addHit: storeAddHit, addMiss: storeAddMiss, addTrick: storeAddTrick, resetSession } = useStore()
  const { loadAndPlay, stop, playSFX, getFrequencyData } = useAudio()

  const { world, bpm, buttonCount, trickChance, hitWindowFactor } = getDifficultyForLevel(currentLevel)
  const planetLevel = getPlanetLevel(currentLevel, world)
  const t = tFor(settings?.language)

  // phase: ready | search | countdown | playing | ended
  const [phase,      setPhase]      = useState('ready')
  const [track,      setTrack]      = useState(null)
  const [trackLoading, setTrackLoading] = useState(true)
  const [buttons,    setButtons]    = useState([])
  const [score,      setScore]      = useState(0)
  const [combo,      setCombo]      = useState(0)
  const [maxCombo,   setMaxCombo]   = useState(0)
  const [lives,      setLives]      = useState(3)
  const [popups,     setPopups]     = useState([])
  const [flash,      setFlash]      = useState(null)
  const [shaking,    setShaking]    = useState(false)
  const [helpOpen,   setHelpOpen]   = useState(false)

  const livesRef   = useRef(3)
  const comboRef   = useRef(0)
  const scoreRef   = useRef(0)
  const hitsRef    = useRef(0)
  const missRef    = useRef(0)
  const trickRef   = useRef(0)
  const runRef     = useRef(false)
  const beatRef    = useRef(null)
  const pendingRef = useRef([])

  const beatInterval = calcBeatInterval(bpm)

  // Auto-load random track on mount
  useEffect(() => {
    resetSession()
    setTrackLoading(true)
    fetchRandomTrack(world.id).then(t => {
      setTrack(t)
      setTrackLoading(false)
    })
  }, [world.id])

  const doFlash = (type) => {
    setFlash(type)
    setTimeout(() => setFlash(null), 280)
  }

  const addPopup = (text, grade, slot) => {
    const pos = GRID_POSITIONS[slot] ?? GRID_POSITIONS[4]
    const id  = Date.now() + Math.random()
    setPopups(p => [...p, { id, text, grade, x: `${pos.x}%`, y: `${pos.y}%` }])
  }

  const removePopup = useCallback((id) => setPopups(p => p.filter(pp => pp.id !== id)), [])

  const endGame = useCallback(async () => {
    runRef.current = false
    clearTimeout(beatRef.current)
    pendingRef.current.forEach(clearTimeout)
    pendingRef.current = []
    stop()
    setPhase('ended')
    const result = { worldId: world.id, level: currentLevel, score: scoreRef.current,
      hits: hitsRef.current, misses: missRef.current, tricks: trickRef.current, maxCombo, bpm }
    setLastResult(result)
    try { await gameAPI.saveResult(result) } catch {}
  }, [world, currentLevel, maxCombo, bpm, stop, setLastResult])

  const spawnBeat = useCallback(() => {
    if (!runRef.current) return
    const trickCount  = Math.random() < trickChance ? 1 : 0
    const slots       = generateSlots(buttonCount + trickCount, 9)

    slots.forEach((slot, i) => {
      const isTrick = i >= buttonCount
      const btn = {
        id: `b-${Date.now()}-${i}`, slot, isTrick,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: isTrick ? world.theme.secondary : world.theme.primary,
        window: Math.round(beatInterval * 0.82 * hitWindowFactor),
      }
      const spawnTimer = setTimeout(() => {
        if (!runRef.current) return
        const actualBtn = { ...btn, appearedAt: Date.now() }
        setButtons(prev => [...prev, actualBtn])
        if (!actualBtn.isTrick) {
          const expireTimer = setTimeout(() => {
            setButtons(prev => {
              if (!prev.find(b => b.id === actualBtn.id)) return prev
              livesRef.current = Math.max(0, livesRef.current - 1)
              setLives(livesRef.current); comboRef.current = 0; setCombo(0)
              doFlash('miss'); playSFX('miss', settings.sfxVolume)
              storeAddMiss(); missRef.current++
              if (livesRef.current <= 0) endGame()
              return prev.filter(b => b.id !== actualBtn.id)
            })
          }, actualBtn.window)
          pendingRef.current.push(expireTimer)
        } else {
          const expireTimer = setTimeout(
            () => setButtons(prev => prev.filter(b => b.id !== actualBtn.id)),
            actualBtn.window
          )
          pendingRef.current.push(expireTimer)
        }
      }, i * BTN_STAGGER)
      pendingRef.current.push(spawnTimer)
    })
  }, [buttonCount, trickChance, hitWindowFactor, world, beatInterval, playSFX, settings.sfxVolume, storeAddMiss, endGame])

  const startBeatLoop = useCallback(() => {
    const tick = () => {
      if (!runRef.current) return
      spawnBeat()
      beatRef.current = setTimeout(tick, beatInterval)
    }
    beatRef.current = setTimeout(tick, Math.round(beatInterval * 0.4))
  }, [spawnBeat, beatInterval])

  const handleCountdownDone = useCallback(async () => {
    setPhase('playing')
    runRef.current = true
    livesRef.current = 3; comboRef.current = 0; scoreRef.current = 0
    hitsRef.current = 0; missRef.current = 0; trickRef.current = 0
    setLives(3); setCombo(0); setScore(0)
    if (track?.url) await loadAndPlay(track.url, settings.musicVolume)
    startBeatLoop()
  }, [track, loadAndPlay, settings.musicVolume, startBeatLoop])

  const handleBtnClick = useCallback((btnId) => {
    setButtons(prev => {
      const btn = prev.find(b => b.id === btnId)
      if (!btn) return prev
      const timing = msToBar(Date.now() - btn.appearedAt)
      if (btn.isTrick) {
        scoreRef.current = Math.max(0, scoreRef.current - 5)
        livesRef.current = Math.max(0, livesRef.current - 1)
        comboRef.current = 0; trickRef.current++
        setScore(scoreRef.current); setLives(livesRef.current); setCombo(0)
        doFlash('trick'); setShaking(true); setTimeout(() => setShaking(false), 380)
        playSFX('trick', settings.sfxVolume); storeAddTrick()
        addPopup('−5 TRICK!', 'trick', btn.slot)
        if (livesRef.current <= 0) { endGame(); return prev.filter(b => b.id !== btnId) }
      } else {
        comboRef.current++
        const mult   = [1,1,1.2,1.5,1.8,2,2.5,3][Math.min(comboRef.current, 7)]
        const earned = Math.round(timing.score * mult)
        scoreRef.current += earned; hitsRef.current++
        setScore(scoreRef.current); setCombo(comboRef.current)
        setMaxCombo(m => Math.max(m, comboRef.current))
        playSFX(comboRef.current >= 5 ? 'combo' : 'hit', settings.sfxVolume)
        doFlash('hit'); storeAddHit()
        addPopup(`+${earned}`, timing.grade, btn.slot)
      }
      return prev.filter(b => b.id !== btnId)
    })
  }, [playSFX, settings.sfxVolume, storeAddHit, storeAddTrick, endGame])

  const handleTrackSelect = useCallback((selectedTrack) => {
    setTrack(selectedTrack)
    setPhase('countdown')
  }, [])

  const handleStartGame = useCallback(() => {
    setPhase('countdown')
  }, [])

  const handleNewRandom = useCallback(() => {
    setTrackLoading(true)
    fetchRandomTrack(world.id).then(t => {
      setTrack(t)
      setTrackLoading(false)
    })
  }, [world.id])

  useEffect(() => {
    if (phase === 'ended') {
      const t = setTimeout(() => router.push('/game/result'), 1200)
      return () => clearTimeout(t)
    }
  }, [phase, router])

  return (
    <div className={`fixed inset-0 select-none ${shaking ? 'animate-shake' : ''}`}
      style={{ background: `linear-gradient(135deg, ${world.theme.bg.split(' ')[0].replace('from-[','').replace(']','')}, ${world.theme.bg.split(' ')[1].replace('to-[','').replace(']','')})` }}>
      <WorldBackground worldId={world.id} isActive={phase === 'playing'} />

      {/* Ready screen */}
      {phase === 'ready' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ background: 'rgba(6,6,15,0.95)', backdropFilter: 'blur(20px)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
            <motion.div className="text-7xl mb-4" animate={{ y: [0,-8,0] }} transition={{ duration: 2, repeat: Infinity }}>
              {world.emoji}
            </motion.div>
            <div className="font-display font-black text-2xl mb-1" style={{ color: world.theme.primary }}>
              {world.name}
            </div>
            <p className="text-white/40 font-body text-sm mb-8">{world.bpmRange[0]}–{world.bpmRange[1]} BPM · {world.difficulty}</p>

            {/* Track info */}
            <div className="mb-6 p-4 rounded-2xl" style={{ background: `${world.theme.primary}10`, border: `1px solid ${world.theme.primary}30` }}>
              <div className="text-white/30 font-display text-xs tracking-widest uppercase mb-2">{t('game.music')}</div>
              {trackLoading ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Spinner size="sm" /> <span className="text-white/40 text-sm font-body">{t('common.loading')}</span>
                </div>
              ) : track ? (
                <div className="flex items-center gap-3">
                  {track.artwork && (
                    <img src={track.artwork} alt="" className="w-12 h-12 rounded-lg flex-shrink-0 object-cover"
                      style={{ boxShadow: `0 0 12px ${world.theme.primary}44` }} />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-display font-bold text-sm text-white truncate">{track.title}</div>
                    <div className="text-white/40 text-xs font-body mt-0.5">{t('game.preview')}</div>
                  </div>
                </div>
              ) : (
                <div className="text-white/30 text-sm font-body">Musiqa yuklanmadi — ovoz bo'lmaydi</div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <motion.button onClick={handleStartGame} disabled={trackLoading}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-xl font-display font-black text-base tracking-wider disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${world.theme.primary}, ${world.theme.secondary})`, color: '#000', boxShadow: `0 0 30px ${world.theme.primary}50` }}>
                ▶ {t('game.start').toUpperCase()}
              </motion.button>

              <div className="flex gap-2">
                <motion.button onClick={handleNewRandom} disabled={trackLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-xl font-display text-xs tracking-wider transition-all disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                  🔀 {t('game.random')}
                </motion.button>
                <motion.button onClick={() => setPhase('search')}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 rounded-xl font-display text-xs tracking-wider transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${world.theme.primary}44`, color: world.theme.primary }}>
                  🔍 {t('game.search')}
                </motion.button>
              </div>

              <motion.button onClick={() => setHelpOpen(true)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-display text-xs tracking-wider transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                ❓ {t('game.help').toUpperCase()}
              </motion.button>

              <button onClick={() => router.push('/')}
                className="text-white/25 hover:text-white/50 font-display text-xs tracking-widest transition-colors w-full py-2">
                ← {t('common.back').toUpperCase()}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search overlay */}
      {phase === 'search' && (
        <div className="fixed inset-0 z-50">
          <MusicSearch onSelect={handleTrackSelect} worldTheme={world.theme} />
          <button onClick={() => setPhase('ready')}
            className="fixed top-4 left-4 z-50 text-white/40 hover:text-white font-display text-xs tracking-wider transition-colors px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ← {t('common.back').toUpperCase()}
          </button>
        </div>
      )}

      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div key={flash} initial={{ opacity: 0.35 }} animate={{ opacity: 0 }}
            className="fixed inset-0 z-30 pointer-events-none"
            style={{ background: flash === 'hit' ? 'rgba(0,255,135,0.2)' : flash === 'trick' ? 'rgba(255,48,48,0.3)' : 'rgba(255,45,120,0.2)' }} />
        )}
      </AnimatePresence>

      {/* HUD */}
      {(phase === 'playing' || phase === 'countdown') && (
        <div className="fixed top-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-4"
          style={{ background:'rgba(6,6,15,0.7)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(30,30,64,0.6)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => { runRef.current = false; stop(); router.push('/') }}
              className="text-white/30 hover:text-white font-display text-xs tracking-wider transition-colors">
              ← {t('game.exit').toUpperCase()}
            </button>
            <div className="flex items-center gap-2">
              {track?.artwork && <img src={track.artwork} alt="" className="w-7 h-7 rounded-md object-cover opacity-80" />}
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs" style={{ color: world.theme.primary }}>{world.emoji} {world.name}</span>
                <span className="text-white/30 text-[0.6rem] truncate max-w-[140px]">{track?.title || '...'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-display font-black text-xl leading-none" style={{ color: world.theme.primary }}>{formatScore(score)}</div>
              <div className="text-white/25 text-[0.6rem] tracking-widest">{t('game.score').toUpperCase()}</div>
            </div>
            <div className="text-center">
              <div className="font-display font-black text-xl leading-none text-white">Lv.{currentLevel}</div>
              <div className="text-white/25 text-[0.6rem] tracking-widest">{t('common.level').toUpperCase()}</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="font-display font-black text-xl leading-none text-white">{planetLevel}</div>
              <div className="text-white/25 text-[0.6rem] tracking-widest">PLANET</div>
            </div>
            <LivesDisplay lives={lives} />
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-3 pt-2" style={{ background:'rgba(6,6,15,0.5)' }}>
          <BeatVisualizer getFrequencyData={getFrequencyData} color={world.theme.primary} isActive />
        </div>
      )}

      {phase === 'playing' && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
          <ComboDisplay combo={combo} worldColor={world.theme.primary} />
        </div>
      )}

      <div className="fixed inset-0 top-14 bottom-16 z-10">
        <AnimatePresence>
          {buttons.map(btn => {
            const pos = GRID_POSITIONS[btn.slot] ?? GRID_POSITIONS[4]
            return (
              <div key={btn.id} style={{ position:'absolute', left:`calc(${pos.x}% - 30px)`, top:`calc(${pos.y}% - 30px)` }}>
                <BeatButton button={btn} onClick={handleBtnClick} worldTheme={world.theme} />
              </div>
            )
          })}
        </AnimatePresence>
      </div>

      {popups.map(p => <ScorePopup key={p.id} {...p} onDone={removePopup} />)}

      {phase === 'countdown' && (
        <CountdownOverlay onDone={handleCountdownDone} worldColor={world.theme.primary} />
      )}

      <AnimatePresence>
        {phase === 'ended' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="font-display font-black text-6xl" style={{ color:'#ff3030', textShadow:'0 0 40px #ff3030' }}>
              {t('game.gameOver').toUpperCase()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {helpOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/70">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl p-6"
              style={{ background: 'rgba(9,9,20,0.95)', border: `1px solid ${world.theme.primary}44` }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="font-display font-black text-xl" style={{ color: world.theme.primary }}>
                  {t('game.helpTitle')}
                </h3>
                <button onClick={() => setHelpOpen(false)} className="text-white/60 hover:text-white text-sm">✕</button>
              </div>
              <div className="space-y-3 text-sm text-white/80 font-body">
                <p>• {t('game.helpWin')}</p>
                <p>• {t('game.helpPlanets')}</p>
                <p>• {t('game.helpTrick')}</p>
                <p>• {t('game.helpDifficulty')}</p>
                <p>• {t('game.helpPlanetLevel')}</p>
              </div>
              <div className="mt-4 p-3 rounded-lg text-xs font-display text-white/70"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                BPM: {bpm} | Buttons: {buttonCount} | Trick: {Math.round(trickChance * 100)}%
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GamePage() {
  return <ProtectedRoute><GameScreen /></ProtectedRoute>
}
