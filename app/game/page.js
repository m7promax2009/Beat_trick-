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
import Spinner from '../../components/ui/Spinner'
import CyberSenseiHUD from '../../components/ai/CyberSenseiHUD'
import AIChatModal from '../../components/ai/AIChatModal'
import BorderBeam from '../../components/ui/BorderBeam'
import CyberPlayfield, { ARENA_SLOTS } from '../../components/game/CyberPlayfield'
import { getAICommentary, AI_DIFFICULTIES } from '../../lib/aiAgent'
import { initYandexSDK, submitYandexScore } from '../../lib/yandexSdk'

const GRID_POSITIONS = [
  { x: 16, y: 18 }, { x: 50, y: 18 }, { x: 84, y: 18 },
  { x: 16, y: 50 }, { x: 50, y: 50 }, { x: 84, y: 50 },
  { x: 16, y: 82 }, { x: 50, y: 82 }, { x: 84, y: 82 },
]
const SHAPES       = ['circle', 'square', 'diamond', 'triangle', 'hexagon']
const MAX_LIVES    = 5
const COMBO_MULT   = [1, 1, 1.2, 1.5, 1.8, 2, 2.5, 3]

const WORLD_QUERY = {
  'forest':    'nature ambient relaxing',
  'neon-city': 'synthwave electronic',
  'ocean':     'deep house ocean waves',
  'space':     'space ambient electronic',
  'lava':      'hard dubstep bass',
  'ice':       'trance crystal',
  'cyber-god': 'drum and bass fast',
}

async function fetchRandomTrack(worldId, retries = 2) {
  const query = WORLD_QUERY[worldId] || 'electronic music'
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50&country=us`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const pool = (data.results || []).filter(r => r.previewUrl)
      if (!pool.length) continue
      const picked = pool[Math.floor(Math.random() * pool.length)]
      return {
        title:   `${picked.trackName} — ${picked.artistName}`,
        url:     picked.previewUrl,
        artwork: picked.artworkUrl100,
        artist:  picked.artistName,
      }
    } catch {
      if (attempt >= retries) return null
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)))
    }
  }
  return null
}

function GameScreen() {
  const router  = useRouter()
  const { user, currentLevel, setLastResult, settings, addHit: storeAddHit, addMiss: storeAddMiss, addTrick: storeAddTrick, resetSession } = useStore()
  const { loadAndPlay, stop, playSFX, getFrequencyData } = useAudio()

  // Pacing mode: 'relaxed' (50s) | 'normal' (65s) | 'rush' (75s Demon Mode)
  const [pacing, setPacing] = useState('normal')
  const [aiDuel, setAiDuel] = useState(false)
  const [aiRivalState, setAiRivalState] = useState({ score: 0, combo: 0 })
  const [aiSpeech, setAiSpeech] = useState(getAICommentary('start'))

  const { world, bpm, buttonCount, trickChance, hitWindowFactor } = getDifficultyForLevel(currentLevel, pacing)
  const planetLevel = getPlanetLevel(currentLevel, world)
  const t = tFor(settings?.language)

  // phase: ready | search | countdown | playing | ended
  const [phase,        setPhase]        = useState('ready')
  const [track,        setTrack]        = useState(null)
  const [trackLoading, setTrackLoading] = useState(true)
  const [buttons,      setButtons]      = useState([])
  const [score,        setScore]        = useState(0)
  const [combo,        setCombo]        = useState(0)
  const [maxCombo,     setMaxCombo]     = useState(0)
  const [lives,        setLives]        = useState(MAX_LIVES)
  const [popups,       setPopups]       = useState([])
  const [flash,        setFlash]        = useState(null)
  const [shaking,      setShaking]      = useState(false)
  const [helpOpen,     setHelpOpen]     = useState(false)
  const [pressedKey,   setPressedKey]   = useState(null)
  const [aiModalOpen,  setAiModalOpen]  = useState(false)

  // Geometry Dash Pacing & Wave System
  const ROUND_DURATION = pacing === 'rush' ? 75 : pacing === 'relaxed' ? 50 : 65
  const [timeLeft,     setTimeLeft]     = useState(ROUND_DURATION)
  const [isVictory,    setIsVictory]    = useState(false)
  const [hasShield,    setHasShield]    = useState(false)
  const [bestPercent,  setBestPercent]  = useState(0)
  const [deathPercent, setDeathPercent] = useState(0)

  const hasShieldRef   = useRef(false)
  hasShieldRef.current = hasShield
  const timeLeftRef    = useRef(timeLeft)
  timeLeftRef.current  = timeLeft
  const currentWaveRef = useRef(1)

  // Geometry Dash dynamic 0%-100% progress & waves
  const currentPercent = Math.min(100, Math.floor(((ROUND_DURATION - timeLeft) / ROUND_DURATION) * 100))
  const currentWave    = currentPercent >= 65 ? 3 : currentPercent >= 30 ? 2 : 1
  currentWaveRef.current = currentWave

  // Platform SDK Initialization
  useEffect(() => {
    initYandexSDK()
  }, [])

  // ── Mutable game refs ──
  const gs = useRef({
    lives: MAX_LIVES,
    combo: 0,
    score: 0,
    hits: 0,
    misses: 0,
    tricks: 0,
    latencies: [],
    aiScore: 0,
  })
  const runRef       = useRef(false)
  const beatRef      = useRef(null)
  const pendingRef   = useRef([])
  const endGameRef   = useRef(null)
  const endedRef     = useRef(false)
  const buttonsRef   = useRef([])
  buttonsRef.current = buttons

  const beatInterval = calcBeatInterval(bpm)

  // Dynamic button lifetime: responsive and adrenaline-inducing
  const buttonLifetime = Math.max(780, Math.round(beatInterval * 1.8 * hitWindowFactor))

  const scheduleSideEffect = (fn) => {
    setTimeout(fn, 0)
  }

  const doFlash = useCallback((type) => {
    setFlash(type)
    setTimeout(() => setFlash(null), 260)
  }, [])

  const addPopup = useCallback((text, grade, slot) => {
    const pos = GRID_POSITIONS[slot] ?? GRID_POSITIONS[4]
    const id  = Date.now() + Math.random()
    setPopups(p => [...p, { id, text, grade, x: `${pos.x}%`, y: `${pos.y}%` }])
  }, [])

  const removePopup = useCallback((id) => setPopups(p => p.filter(pp => pp.id !== id)), [])

  // ── End game (Supports Geometry Dash Crash vs 100% Victory) ──
  const endGame = useCallback((isWin = false) => {
    if (endedRef.current) return
    endedRef.current = true
    runRef.current = false
    clearTimeout(beatRef.current)
    pendingRef.current.forEach((id) => {
      clearTimeout(id)
      clearInterval(id)
    })
    pendingRef.current = []
    stop()

    const percent = Math.min(100, Math.floor(((ROUND_DURATION - timeLeftRef.current) / ROUND_DURATION) * 100))
    setDeathPercent(percent)
    setBestPercent((prev) => Math.max(prev, percent))
    setIsVictory(isWin)
    if (isWin) {
      playSFX('combo', settings.sfxVolume)
      setAiSpeech(getAICommentary('win'))
    } else {
      setAiSpeech(getAICommentary('crash'))
    }

    scheduleSideEffect(() => {
      setPhase('ended')
      const avgReaction = gs.current.latencies.length
        ? Math.round(gs.current.latencies.reduce((a, b) => a + b, 0) / gs.current.latencies.length)
        : 190

      const result = {
        worldId: world.id, level: currentLevel,
        score: gs.current.score, hits: gs.current.hits,
        misses: gs.current.misses, tricks: gs.current.tricks,
        maxCombo, bpm, avgReaction,
        aiDuel, aiScore: gs.current.aiScore,
        aiWon: aiDuel ? gs.current.score >= gs.current.aiScore : null,
        isVictory: isWin,
        progressPercent: percent,
      }
      setLastResult(result)
      gameAPI.saveResult(result).catch(() => {})
      submitYandexScore('global_score', gs.current.score)
    })
  }, [world.id, currentLevel, maxCombo, bpm, stop, setLastResult, aiDuel, playSFX, settings.sfxVolume, ROUND_DURATION])

  endGameRef.current = endGame

  // ── Track loading ──
  const fetchIdRef = useRef(0)
  const loadTrack = useCallback(async (worldId) => {
    const id = ++fetchIdRef.current
    setTrackLoading(true)
    const tData = await fetchRandomTrack(worldId)
    if (id === fetchIdRef.current) {
      setTrack(tData)
      setTrackLoading(false)
    }
  }, [])

  useEffect(() => {
    resetSession()
    endedRef.current = false
    gs.current = { lives: MAX_LIVES, combo: 0, score: 0, hits: 0, misses: 0, tricks: 0, latencies: [], aiScore: 0 }
    loadTrack(world.id)
    return () => {
      fetchIdRef.current++
      runRef.current = false
      clearTimeout(beatRef.current)
      pendingRef.current.forEach((id) => {
        clearTimeout(id)
        clearInterval(id)
      })
      pendingRef.current = []
      stop()
    }
  }, [world.id])

  // ── Spawn Beat Cadence (Escalating Waves & Special Beats) ──
  const spawnBeat = useCallback(() => {
    if (!runRef.current) return
    const isRunning = () => runRef.current

    // Number of active buttons on screen right now
    const currentActive = buttonsRef.current
    const occupiedSlots = new Set(currentActive.map(b => b.slot))

    // Dynamic wave scaling
    const wave = currentWaveRef.current || 1
    const count = wave === 3 ? (Math.random() < 0.6 ? 2 : 1) : wave === 2 ? (Math.random() < 0.35 ? 2 : 1) : 1
    const availableSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(s => !occupiedSlots.has(s))
    if (!availableSlots.length) return

    // Shuffle available slots
    const chosenSlots = availableSlots.sort(() => Math.random() - 0.5).slice(0, count)
    const hasTrick = Math.random() < trickChance

    chosenSlots.forEach((slot, i) => {
      const isTrick  = hasTrick && i === chosenSlots.length - 1
      const isGold   = !isTrick && Math.random() < 0.12
      const isShield = !isTrick && !isGold && !hasShieldRef.current && Math.random() < 0.08
      const isBurst  = !isTrick && !isGold && !isShield && wave >= 2 && Math.random() < 0.15

      // Wave-adjusted window: faster in later waves for true Geometry Dash rush
      const waveSpeed = wave === 3 ? 0.75 : wave === 2 ? 0.88 : 1.0
      const btnLifetime = isBurst
        ? Math.round(buttonLifetime * 0.65)
        : Math.round(buttonLifetime * waveSpeed)

      const btn = {
        id: `btn-${Date.now()}-${i}-${slot}`,
        slot,
        isTrick,
        isGold,
        isShield,
        isBurst,
        shape: isGold ? 'circle' : isShield ? 'hexagon' : SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: isTrick ? '#ff2525' : isGold ? '#ffe135' : isShield ? '#00ff87' : isBurst ? '#ff2d78' : world.theme.primary,
        window: btnLifetime,
      }

      const staggerMs = i * Math.round(beatInterval * 0.5)
      const spawnTimer = setTimeout(() => {
        if (!isRunning()) return
        const actualBtn = { ...btn, appearedAt: Date.now() }
        setButtons(prev => [...prev, actualBtn])

        // Expiry timer
        const expireTimer = setTimeout(() => {
          setButtons(prev => {
            const exists = prev.find(b => b.id === actualBtn.id)
            if (!exists) return prev

            // Missed normal/special button
            if (!actualBtn.isTrick) {
              if (hasShieldRef.current) {
                hasShieldRef.current = false
                scheduleSideEffect(() => {
                  setHasShield(false)
                  addPopup('🛡️ QALQON HIMOYA QILDI!', 'GREAT', actualBtn.slot)
                  playSFX('hit', settings.sfxVolume)
                })
              } else {
                gs.current.lives = Math.max(0, gs.current.lives - 1)
                gs.current.combo = 0
                gs.current.misses++
                scheduleSideEffect(() => {
                  storeAddMiss()
                  setLives(gs.current.lives)
                  setCombo(0)
                  doFlash('miss')
                  playSFX('miss', settings.sfxVolume)
                  setAiSpeech(getAICommentary('miss'))
                  if (gs.current.lives <= 2) {
                    setAiSpeech(getAICommentary('lowHealth'))
                  }
                  if (gs.current.lives <= 0) endGameRef.current?.(false)
                })
              }
            }
            return prev.filter(b => b.id !== actualBtn.id)
          })
        }, actualBtn.window)

        pendingRef.current.push(expireTimer)
      }, staggerMs)

      pendingRef.current.push(spawnTimer)
    })

    // Simulated AI Rival score accumulation (if Duel Mode active)
    if (aiDuel && runRef.current) {
      const aiAcc = AI_DIFFICULTIES.pro.accuracy
      if (Math.random() < aiAcc) {
        const aiEarned = Math.round(12 * (1 + Math.min(gs.current.combo, 5) * 0.2))
        gs.current.aiScore += aiEarned
        setAiRivalState({ score: gs.current.aiScore, combo: 5 })
      }
    }
  }, [buttonLifetime, beatInterval, world.theme.primary, playSFX, settings.sfxVolume, storeAddMiss, doFlash, aiDuel, trickChance, addPopup])

  const startBeatLoop = useCallback(() => {
    clearTimeout(beatRef.current)
    const tick = () => {
      if (!runRef.current) return
      spawnBeat()
      const wave = currentWaveRef.current || 1
      const factor = wave === 3 ? 0.8 : wave === 2 ? 1.05 : 1.4
      const measureInterval = Math.max(460, Math.round(beatInterval * factor))
      beatRef.current = setTimeout(tick, measureInterval)
    }
    beatRef.current = setTimeout(tick, Math.round(beatInterval * 0.7))
  }, [spawnBeat, beatInterval])

  // ── Start playing ──
  const handleCountdownDone = useCallback(async () => {
    runRef.current = true
    endedRef.current = false
    gs.current = { lives: MAX_LIVES, combo: 0, score: 0, hits: 0, misses: 0, tricks: 0, latencies: [], aiScore: 0 }
    setLives(MAX_LIVES)
    setCombo(0)
    setScore(0)
    setMaxCombo(0)
    setButtons([])
    setHasShield(false)
    hasShieldRef.current = false
    setTimeLeft(ROUND_DURATION)
    setIsVictory(false)
    setPhase('playing')
    setAiSpeech(getAICommentary('start'))

    if (track?.url) {
      try { await loadAndPlay(track.url, settings.musicVolume) } catch {}
    }
    startBeatLoop()

    // ⏱️ Stage Survival Countdown
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval)
          endGameRef.current?.(true) // 100% Complete!
          return 0
        }
        return prev - 1
      })
    }, 1000)
    pendingRef.current.push(timerInterval)
  }, [track, loadAndPlay, settings.musicVolume, startBeatLoop, ROUND_DURATION])

  // ── Instant Restart (Geometry Dash respawn flow) ──
  const handleRestart = useCallback(() => {
    runRef.current = false
    clearTimeout(beatRef.current)
    pendingRef.current.forEach((id) => {
      clearTimeout(id)
      clearInterval(id)
    })
    pendingRef.current = []
    stop()
    setPhase('countdown')
  }, [stop])

  // ── Button Hit Handler ──
  const handleBtnClick = useCallback((btnId) => {
    let clickResult = null

    setButtons(prev => {
      const btn = prev.find(b => b.id === btnId)
      if (!btn) return prev

      const latency = Date.now() - (btn.appearedAt || Date.now())
      const timing = msToBar(latency)
      gs.current.latencies.push(latency)
      clickResult = { btn, timing, latency }

      if (btn.isTrick) {
        if (hasShieldRef.current) {
          hasShieldRef.current = false
          scheduleSideEffect(() => {
            setHasShield(false)
            addPopup('🛡️ QALQON HIMOYA QILDI!', 'GREAT', btn.slot)
            playSFX('hit', settings.sfxVolume)
          })
        } else {
          gs.current.score = Math.max(0, gs.current.score - 5)
          gs.current.lives = Math.max(0, gs.current.lives - 1)
          gs.current.combo = 0
          gs.current.tricks++
        }
      } else if (btn.isGold) {
        gs.current.combo++
        gs.current.score += 50
        gs.current.hits++
      } else if (btn.isShield) {
        gs.current.combo++
        gs.current.score += 15
        gs.current.hits++
        hasShieldRef.current = true
      } else {
        gs.current.combo++
        const mult = COMBO_MULT[Math.min(gs.current.combo, COMBO_MULT.length - 1)]
        const bonus = btn.isBurst ? 1.5 : 1.0
        gs.current.score += Math.round(timing.score * mult * bonus)
        gs.current.hits++

        // 🛡️ Combo Life Recovery: Every 8 consecutive combo hits restores +1 Life!
        if (gs.current.combo % 8 === 0 && gs.current.lives < MAX_LIVES) {
          gs.current.lives = Math.min(MAX_LIVES, gs.current.lives + 1)
        }
      }
      return prev.filter(b => b.id !== btnId)
    })

    if (!clickResult) return
    const { btn, timing } = clickResult

    if (btn.isTrick) {
      if (!hasShieldRef.current) {
        storeAddTrick()
        scheduleSideEffect(() => {
          setScore(gs.current.score)
          setLives(gs.current.lives)
          setCombo(0)
          doFlash('trick')
          setShaking(true)
          setTimeout(() => setShaking(false), 380)
          playSFX('trick', settings.sfxVolume)
          addPopup('−5 TRICK!', 'trick', btn.slot)
          setAiSpeech(getAICommentary('trickWarning'))
          if (gs.current.lives <= 0) endGameRef.current?.(false)
        })
      }
    } else if (btn.isGold) {
      storeAddHit()
      scheduleSideEffect(() => {
        setScore(gs.current.score)
        setCombo(gs.current.combo)
        setMaxCombo(m => Math.max(m, gs.current.combo))
        doFlash('hit')
        playSFX('combo', settings.sfxVolume)
        addPopup('+50 🌟 FEVER!', 'PERFECT', btn.slot)
        setAiSpeech(getAICommentary('goldBonus'))
      })
    } else if (btn.isShield) {
      storeAddHit()
      scheduleSideEffect(() => {
        setHasShield(true)
        setScore(gs.current.score)
        setCombo(gs.current.combo)
        setMaxCombo(m => Math.max(m, gs.current.combo))
        doFlash('hit')
        playSFX('hit', settings.sfxVolume)
        addPopup('🛡️ AEGIS QALQON!', 'GREAT', btn.slot)
        setAiSpeech(getAICommentary('shieldActive'))
      })
    } else {
      storeAddHit()
      const comboIdx = Math.min(gs.current.combo, COMBO_MULT.length - 1)
      const bonus = btn.isBurst ? 1.5 : 1.0
      const earned = Math.round(timing.score * COMBO_MULT[comboIdx] * bonus)
      scheduleSideEffect(() => {
        setScore(gs.current.score)
        setLives(gs.current.lives)
        setCombo(gs.current.combo)
        setMaxCombo(m => Math.max(m, gs.current.combo))
        doFlash('hit')
        playSFX(gs.current.combo >= 5 ? 'combo' : 'hit', settings.sfxVolume)
        addPopup(`+${earned}${btn.isBurst ? ' ⚡RUSH' : ''}`, timing.grade, btn.slot)

        if (gs.current.combo % 8 === 0) {
          addPopup('+1 ❤️ HAYOT TIKLANDI!', 'GREAT', btn.slot)
          setAiSpeech(getAICommentary('comboStreak'))
        } else if (timing.grade === 'PERFECT') {
          if (Math.random() < 0.4) setAiSpeech(getAICommentary('hitPerfect'))
        }
      })
    }
  }, [playSFX, settings.sfxVolume, storeAddHit, storeAddTrick, doFlash, addPopup])

  // ── Full Keyboard Controls: Q W E / A S D / Z X C / Spacebar (Instant Retry on End) ──
  useEffect(() => {
    const keyMap = {
      'q': 0, 'w': 1, 'e': 2,
      'a': 3, 's': 4, 'd': 5,
      'z': 6, 'x': 7, 'c': 8,
      '7': 0, '8': 1, '9': 2,
      '4': 3, '5': 4, '6': 5,
      '1': 6, '2': 7, '3': 8,
    }

    const onKeyDown = (e) => {
      // Instant Retry on Crash or Game End
      if (phase === 'ended') {
        if (e.key === ' ' || e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
          e.preventDefault()
          handleRestart()
        }
        return
      }

      if (phase !== 'playing') return

      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'enter') {
        e.preventDefault()
        const target = buttonsRef.current.find(b => !b.isTrick)
        if (target) handleBtnClick(target.id)
        return
      }

      const slot = keyMap[key]
      if (slot !== undefined) {
        e.preventDefault()
        setPressedKey(key.toUpperCase())
        setTimeout(() => setPressedKey(null), 130)
        const target = buttonsRef.current.find(b => b.slot === slot)
        if (target) handleBtnClick(target.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [phase, handleBtnClick, handleRestart])

  const handleTrackSelect = useCallback((selectedTrack) => {
    setTrack(selectedTrack)
    setPhase('countdown')
  }, [])

  const handleExit = useCallback(() => {
    runRef.current = false
    clearTimeout(beatRef.current)
    pendingRef.current.forEach((id) => {
      clearTimeout(id)
      clearInterval(id)
    })
    pendingRef.current = []
    stop()
    router.push('/')
  }, [stop, router])

  return (
    <div
      className={`fixed inset-0 select-none ${shaking ? 'animate-shake' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${world.theme.bg.split(' ')[0].replace('from-[','').replace(']','')}, ${world.theme.bg.split(' ')[1].replace('to-[','').replace(']','')})`,
      }}
    >
      <WorldBackground worldId={world.id} isActive={phase === 'playing'} />

      {/* Ready Screen */}
      {phase === 'ready' && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4 overflow-y-auto py-8"
          style={{ background: 'rgba(6, 6, 18, 0.94)', backdropFilter: 'blur(24px)' }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center my-auto">
            <motion.div className="text-6xl mb-3" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              {world.emoji}
            </motion.div>
            <div className="font-display font-black text-2xl mb-0.5" style={{ color: world.theme.primary }}>
              {world.name}
            </div>
            <p className="text-white/40 font-body text-xs mb-5">
              {world.bpmRange[0]}–{world.bpmRange[1]} BPM · {world.difficulty}
            </p>

            {/* Geometry Dash Style Pacing Selector */}
            <div className="mb-4 p-3 rounded-2xl text-left" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="text-white/40 font-display text-[0.65rem] tracking-widest uppercase mb-2">
                🎮 REJİM VA TEZLIK (GEOMETRY DASH PACING)
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'relaxed', label: '🐢 Sokin (50s)', desc: 'Mashq qilish' },
                  { id: 'normal',  label: '⚡ Standart (65s)', desc: 'Bass Drop + Stars' },
                  { id: 'rush',    label: '👹 Demon (75s)', desc: 'Haqiqiy Rush x2' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPacing(p.id)}
                    className={`py-2 px-1 rounded-xl text-center font-display transition-all ${
                      pacing === p.id ? 'border-2 text-black font-black' : 'text-white/50 hover:text-white bg-white/5'
                    }`}
                    style={pacing === p.id ? { background: world.theme.primary, borderColor: world.theme.primary, boxShadow: `0 0 14px ${world.theme.primary}66` } : {}}
                  >
                    <div className="text-xs font-black">{p.label}</div>
                    <div className="text-[0.55rem] opacity-75">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Rival Duel Toggle */}
            <div className="mb-4 p-3 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(155, 77, 255, 0.08)', border: '1px solid rgba(155, 77, 255, 0.25)' }}>
              <div className="text-left">
                <div className="font-display font-black text-xs text-[#9b4dff] flex items-center gap-1.5">
                  <span>🧠 CYBER-NEO [AI DUEL]</span>
                </div>
                <div className="text-white/40 text-[0.65rem] font-body">Sun'iy ong bilan real vaqtda musobaqa</div>
              </div>
              <button
                type="button"
                onClick={() => setAiDuel(d => !d)}
                className={`px-3 py-1.5 rounded-xl font-display text-xs font-black transition-all ${
                  aiDuel ? 'bg-[#9b4dff] text-white shadow-neon-purple' : 'bg-white/10 text-white/40'
                }`}
              >
                {aiDuel ? 'YOQILGAN ✓' : 'O\'CHIQ'}
              </button>
            </div>

            {/* Track Info Card */}
            <div className="mb-4 p-3.5 rounded-2xl" style={{ background: `${world.theme.primary}10`, border: `1px solid ${world.theme.primary}30` }}>
              <div className="text-white/30 font-display text-[0.65rem] tracking-widest uppercase mb-1.5">{t('game.music')}</div>
              {trackLoading ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Spinner size="sm" /> <span className="text-white/40 text-xs font-body">{t('common.loading')}</span>
                </div>
              ) : track ? (
                <div className="flex items-center gap-3">
                  {track.artwork && (
                    <img src={track.artwork} alt="" className="w-10 h-10 rounded-lg flex-shrink-0 object-cover" style={{ boxShadow: `0 0 12px ${world.theme.primary}44` }} />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-display font-bold text-xs text-white truncate">{track.title}</div>
                    <div className="text-white/40 text-[0.65rem] font-body mt-0.5">{t('game.preview')}</div>
                  </div>
                </div>
              ) : (
                <div className="text-white/30 text-xs font-body">Sintezator ritmi faol (Audio avtomatik)</div>
              )}
            </div>

            {/* Quick Game Guide Box (Explains rules clearly) */}
            <div className="mb-4 p-3 rounded-2xl text-left bg-black/40 border border-white/10">
              <div className="text-[0.65rem] font-display font-black text-white/80 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span>🎯</span>
                <span>GEOMETRY RUSH QOIDALARI (0% → 100%):</span>
              </div>
              <ul className="text-[0.68rem] font-body text-white/70 space-y-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#00f0ff] font-bold">1.</span>
                  <span><strong>Halqa yetganda bosing:</strong> Neon halqa tugmaga yetganda bossangiz, PERFECT (+15 ball)!</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ffe135] font-bold">2.</span>
                  <span><strong>Oltin Yulduz 🌟 va Qalqon 🛡️:</strong> +50 ball bonus va keyingi xatodan himoya beradi.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#ff3030] font-bold">3.</span>
                  <span><strong>Qizil Trick tugmalarni BOSMANG:</strong> Ular o'tib ketguncha kuting, jazo bo'lmaydi.</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <motion.button
                onClick={() => setPhase('countdown')}
                disabled={trackLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-display font-black text-sm tracking-wider uppercase disabled:opacity-50 cursor-pointer text-black"
                style={{
                  background: `linear-gradient(135deg, ${world.theme.primary}, ${world.theme.secondary})`,
                  boxShadow: `0 0 30px ${world.theme.primary}50`,
                }}
              >
                ▶ {t('game.start').toUpperCase()}
              </motion.button>

              <div className="flex gap-2">
                <button
                  onClick={() => loadTrack(world.id)}
                  disabled={trackLoading}
                  className="flex-1 py-2.5 rounded-xl font-display text-xs tracking-wider text-white/60 hover:text-white bg-white/5 border border-white/10"
                >
                  🔀 YANGI TREK
                </button>
                <button
                  onClick={() => setPhase('search')}
                  className="flex-1 py-2.5 rounded-xl font-display text-xs tracking-wider border"
                  style={{ borderColor: `${world.theme.primary}44`, color: world.theme.primary, background: 'rgba(255,255,255,0.04)' }}
                >
                  🔍 QIDIRUV
                </button>
              </div>

              <button
                onClick={handleExit}
                className="text-white/30 hover:text-white/60 font-display text-xs tracking-widest w-full py-2"
              >
                ← ORQAGA
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Music Search */}
      {phase === 'search' && (
        <div className="fixed inset-0 z-50">
          <MusicSearch onSelect={handleTrackSelect} worldTheme={world.theme} />
          <button
            onClick={() => setPhase('ready')}
            className="fixed top-4 left-4 z-50 text-white/50 hover:text-white font-display text-xs tracking-wider px-3 py-2 rounded-lg bg-white/5 border border-white/10"
          >
            ← ORQAGA
          </button>
        </div>
      )}

      {/* Hit / Miss Screen Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            className="fixed inset-0 z-30 pointer-events-none"
            style={{
              background: flash === 'hit' ? 'rgba(0,255,135,0.22)' : flash === 'trick' ? 'rgba(255,48,48,0.35)' : 'rgba(255,45,120,0.22)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top HUD */}
      {(phase === 'playing' || phase === 'countdown') && (
        <div
          className="fixed top-0 left-0 right-0 z-20 h-16 flex items-center justify-between px-4 md:px-8"
          style={{ background: 'rgba(6, 6, 18, 0.82)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          {/* Left: Exit & World info */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleExit}
              className="text-white/30 hover:text-white font-display text-xs tracking-wider transition-colors"
            >
              ← CHIQISH
            </button>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{world.emoji}</span>
              <div className="flex flex-col">
                <span className="font-display font-black text-xs" style={{ color: world.theme.primary }}>{world.name}</span>
                <span className="text-white/30 text-[0.65rem] truncate max-w-[120px] md:max-w-[180px]">{track?.title || 'Beat Ritm'}</span>
              </div>
            </div>
          </div>

          {/* Center: Cyber-Sensei AI Companion HUD (Clickable to open AI Tactics) */}
          <div
            onClick={() => setAiModalOpen(true)}
            className="cursor-pointer pointer-events-auto hover:opacity-90 transition-opacity"
            title="Cyber-Neo AI Taktika va Maslahatlari"
          >
            <CyberSenseiHUD
              speech={aiSpeech}
              rivalMode={aiDuel}
              rivalData={aiRivalState}
              playerScore={score}
              worldColor={world.theme.primary}
            />
          </div>

          {/* Right: Scores & Lives */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-display font-black text-xl leading-none" style={{ color: world.theme.primary }}>{formatScore(score)}</div>
              <div className="text-white/25 text-[0.55rem] tracking-widest uppercase">BALL</div>
            </div>
            <div className="text-center hidden sm:block">
              <div className="font-display font-black text-xl leading-none text-white">Lv.{currentLevel}</div>
              <div className="text-white/25 text-[0.55rem] tracking-widest uppercase">DARAJA</div>
            </div>
            <LivesDisplay lives={lives} maxLives={MAX_LIVES} />
          </div>

          {/* Neon Song Progress bar under Top HUD */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full transition-all duration-300"
              style={{
                background: currentPercent > 70
                  ? 'linear-gradient(90deg, #ff2d78, #ff3030)'
                  : currentPercent > 35
                  ? 'linear-gradient(90deg, #00f0ff, #ffe135)'
                  : 'linear-gradient(90deg, #00ff87, #00f0ff)',
                boxShadow: `0 0 10px ${currentPercent > 70 ? '#ff3030' : '#00f0ff'}`,
                width: `${currentPercent}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Combo Display */}
      {phase === 'playing' && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <ComboDisplay combo={combo} worldColor={world.theme.primary} />
        </div>
      )}

      {/* Centered Cyber Arena Stage (Holographic Launchpad, 100% click registration) */}
      {(phase === 'playing' || phase === 'countdown') && (
        <div className="fixed inset-0 top-16 bottom-14 flex items-center justify-center p-3 z-20 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            <CyberPlayfield
              buttons={buttons}
              onButtonClick={handleBtnClick}
              worldTheme={world.theme}
              activeKey={pressedKey}
              songProgress={currentPercent}
              timeLeft={timeLeft}
              currentWave={currentWave}
              hasShield={hasShield}
              bestPercent={bestPercent}
            />
          </div>
        </div>
      )}

      {/* Bottom Beat Visualizer (pointer-events-none ensures it NEVER blocks clicks!) */}
      {phase === 'playing' && (
        <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none px-4 pb-1 pt-1 opacity-70">
          <BeatVisualizer getFrequencyData={getFrequencyData} color={world.theme.primary} isActive />
        </div>
      )}

      {/* Score Popups */}
      {popups.map(p => (
        <ScorePopup key={p.id} {...p} onDone={removePopup} />
      ))}

      {/* Countdown 3-2-1 */}
      {phase === 'countdown' && (
        <CountdownOverlay onDone={handleCountdownDone} worldColor={world.theme.primary} />
      )}

      {/* Geometry Dash Style Crash / Victory Screen */}
      <AnimatePresence>
        {phase === 'ended' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
          >
            <div
              className="text-center max-w-md w-full p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(14, 16, 42, 0.95) 0%, rgba(6, 6, 18, 0.98) 100%)',
                border: `1.5px solid ${isVictory ? '#00ff87' : '#ff2d78'}66`,
                boxShadow: `0 0 50px ${isVictory ? '#00ff87' : '#ff2d78'}33`,
              }}
            >
              <BorderBeam
                size={280}
                duration={3}
                colorFrom={isVictory ? '#00ff87' : '#ff2d78'}
                colorTo={isVictory ? '#00f0ff' : '#ffe135'}
              />

              {/* Title & Status */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                className="font-display font-black text-4xl md:text-5xl mb-2"
                style={{
                  color: isVictory ? '#00ff87' : '#ff3030',
                  textShadow: `0 0 30px ${isVictory ? '#00ff87' : '#ff3030'}`,
                }}
              >
                {isVictory ? '👑 100% COMPLETE!' : `💀 CRASH AT ${deathPercent}%`}
              </motion.div>

              <div className="font-display text-xs text-white/70 mb-4">
                {isVictory
                  ? 'Barcha to\'lqinlar muvaffaqiyatli zabt etildi! Afsonaviy ritm!'
                  : deathPercent >= bestPercent && deathPercent > 0
                  ? '🎉 Yangi shaxsiy rekord o\'rnatildi!'
                  : `Eng yaxshi natijangiz: ${bestPercent}%`}
              </div>

              {/* Progress bar preview */}
              <div className="mb-5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between text-[0.65rem] font-display text-white/50 mb-1.5">
                  <span>TREK PROGRESSI</span>
                  <span className="font-bold text-white">{deathPercent}% / 100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${deathPercent}%`,
                      background: isVictory
                        ? 'linear-gradient(90deg, #00ff87, #00f0ff)'
                        : 'linear-gradient(90deg, #ff2d78, #ff3030)',
                      boxShadow: `0 0 10px ${isVictory ? '#00ff87' : '#ff3030'}`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3 text-xs font-display">
                  <span className="text-white/60">Ball: <strong className="text-white">{formatScore(gs.current.score)}</strong></span>
                  <span className="text-white/60">Combo: <strong style={{ color: world.theme.primary }}>{maxCombo}x</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestart}
                  className="w-full py-3.5 rounded-xl font-display font-black text-xs tracking-wider uppercase text-black cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff 0%, #00ff87 100%)',
                    boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
                  }}
                >
                  <span>🔄 QAYTA BOSHLASH [SPACE]</span>
                </motion.button>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/game/result')}
                    className="flex-1 py-2.5 rounded-xl font-display text-xs tracking-wider text-white bg-white/10 hover:bg-white/15 border border-white/10"
                  >
                    📊 STATISTIKA
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex-1 py-2.5 rounded-xl font-display text-xs tracking-wider text-white/50 hover:text-white bg-white/5 border border-white/10"
                  >
                    ← MENYU
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-Game AI Tactics Dialogue Modal */}
      <AIChatModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  )
}

export default function GamePage() {
  return <GameScreen />
}
