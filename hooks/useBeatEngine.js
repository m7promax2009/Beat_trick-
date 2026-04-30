'use client'
import { useRef, useCallback, useEffect, useState } from 'react'
import { calcBeatInterval, calcTrickChance, generateSlots, BUTTON_SHAPES, COMBO_MULT, SCORE_HIT, SCORE_TRICK, SCORE_MISS, msToBar } from '../lib/worlds'

/**
 * Core beat engine.
 * Drives button spawning, timing windows, scoring.
 *
 * Returns: { buttons, score, combo, lives, phase, startEngine, stopEngine, handleButtonClick }
 */
export function useBeatEngine({ level, bpm, worldTheme, onScoreUpdate, onMiss, onTrick, onHit, onGameEnd }) {
  const beatInterval = calcBeatInterval(bpm)
  const trickChance  = calcTrickChance(level)

  const [buttons,   setButtons]   = useState([])   // active on-screen buttons
  const [combo,     setCombo]     = useState(0)
  const [lives,     setLives]     = useState(3)
  const [phase,     setPhase]     = useState('idle')  // idle | countdown | playing | ended

  const timerRef    = useRef(null)
  const beatCountRef = useRef(0)
  const livesRef    = useRef(3)
  const comboRef    = useRef(0)
  const scoreRef    = useRef(0)
  const runningRef  = useRef(false)
  const pendingRef  = useRef([])   // buttons waiting to expire

  const clearButtonTimers = useCallback(() => {
    pendingRef.current.forEach(t => clearTimeout(t))
    pendingRef.current = []
  }, [])

  const spawnBeat = useCallback(() => {
    if (!runningRef.current) return
    beatCountRef.current++

    // How many normal buttons this beat
    const world = { buttons: Math.min(1 + Math.floor(level / 12), 4) }
    const normalCount = world.buttons
    const trickCount  = Math.floor(Math.random() + trickChance)

    const totalCount  = normalCount + trickCount
    const slots       = generateSlots(totalCount)
    const shapes      = Array.from({ length: totalCount }, () => BUTTON_SHAPES[Math.floor(Math.random() * BUTTON_SHAPES.length)])

    const newButtons = slots.map((slot, i) => {
      const isTrick = i >= normalCount
      return {
        id:        `btn-${beatCountRef.current}-${i}-${Date.now()}`,
        slot,
        shape:     shapes[i],
        isTrick,
        appearedAt: Date.now(),
        window:    beatInterval * 0.85,   // must click within ~1 beat
        color:     isTrick ? worldTheme.secondary : worldTheme.primary,
      }
    })

    setButtons(prev => [...prev, ...newButtons])

    // Auto-expire each button
    newButtons.forEach(btn => {
      const t = setTimeout(() => {
        setButtons(prev => {
          const still = prev.find(b => b.id === btn.id)
          if (still && !still.clicked && !still.isTrick) {
            // Missed normal button
            livesRef.current = Math.max(0, livesRef.current - 1)
            setLives(livesRef.current)
            comboRef.current = 0
            setCombo(0)
            onMiss?.()
            if (livesRef.current <= 0) { runningRef.current = false; setPhase('ended'); onGameEnd?.() }
          }
          return prev.filter(b => b.id !== btn.id)
        })
      }, btn.window)
      pendingRef.current.push(t)
    })
  }, [level, bpm, trickChance, beatInterval, worldTheme, onMiss, onGameEnd])

  const startEngine = useCallback(async () => {
    setPhase('countdown')
    // 3-2-1 countdown
    await new Promise(r => setTimeout(r, 3200))
    setPhase('playing')
    livesRef.current  = 3
    comboRef.current  = 0
    scoreRef.current  = 0
    beatCountRef.current = 0
    runningRef.current = true
    setLives(3)
    setCombo(0)
    setButtons([])
    // Kick off beat loop
    const tick = () => {
      if (!runningRef.current) return
      spawnBeat()
      timerRef.current = setTimeout(tick, beatInterval)
    }
    timerRef.current = setTimeout(tick, beatInterval * 0.5)  // slight lead-in
  }, [spawnBeat, beatInterval])

  const stopEngine = useCallback(() => {
    runningRef.current = false
    clearTimeout(timerRef.current)
    clearButtonTimers()
    setButtons([])
    setPhase('idle')
  }, [clearButtonTimers])

  const handleButtonClick = useCallback((buttonId) => {
    setButtons(prev => {
      const btn = prev.find(b => b.id === buttonId)
      if (!btn || btn.clicked) return prev

      const rt = Date.now() - btn.appearedAt
      const timing = msToBar(rt)

      if (btn.isTrick) {
        // Clicked a trick button — penalty
        const penalty = SCORE_TRICK
        scoreRef.current = Math.max(0, scoreRef.current + penalty)
        onScoreUpdate?.(penalty, 'trick', btn.slot)
        onTrick?.()
        comboRef.current = 0
        setCombo(0)
        livesRef.current = Math.max(0, livesRef.current - 1)
        setLives(livesRef.current)
        if (livesRef.current <= 0) { runningRef.current = false; setPhase('ended'); onGameEnd?.() }
      } else {
        // Normal hit
        comboRef.current++
        const mult = COMBO_MULT[Math.min(comboRef.current, COMBO_MULT.length - 1)] || 3
        const earned = Math.round(timing.score * mult)
        scoreRef.current += earned
        setCombo(comboRef.current)
        onScoreUpdate?.(earned, 'hit', btn.slot, timing.grade, comboRef.current)
        onHit?.()
      }

      return prev.map(b => b.id === buttonId ? { ...b, clicked: true, isTrick: btn.isTrick } : b)
        .filter(b => b.id !== buttonId || true) // keep briefly for animation
    })

    // Remove after animation
    setTimeout(() => setButtons(prev => prev.filter(b => b.id !== buttonId)), 200)
  }, [onScoreUpdate, onHit, onTrick, onGameEnd])

  useEffect(() => () => { stopEngine() }, [stopEngine])

  return { buttons, combo, lives, phase, startEngine, stopEngine, handleButtonClick }
}
