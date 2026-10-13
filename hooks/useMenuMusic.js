'use client'
import { useRef, useCallback, useEffect } from 'react'

// Procedural electronic menu music generator using Web Audio API
export function useMenuMusic() {
  const ctxRef   = useRef(null)
  const runRef   = useRef(false)
  const timerRef = useRef(null)
  const masterRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      masterRef.current = ctxRef.current.createGain()
      masterRef.current.gain.value = 0
      masterRef.current.connect(ctxRef.current.destination)
    }
    return ctxRef.current
  }, [])

  const note = (ctx, dest, freq, time, dur, vol, type = 'sine') => {
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(dest)
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol, time + Math.min(0.02, dur * 0.1))
    gain.gain.setValueAtTime(vol, time + dur * 0.7)
    gain.gain.linearRampToValueAtTime(0, time + dur)
    osc.start(time)
    osc.stop(time + dur + 0.01)
  }

  const noise = (ctx, dest, time, dur, vol, hpFreq = 6000) => {
    const buf  = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src    = ctx.createBufferSource()
    const filter = ctx.createBiquadFilter()
    const gain   = ctx.createGain()
    filter.type = 'highpass'
    filter.frequency.value = hpFreq
    src.buffer = buf
    src.connect(filter); filter.connect(gain); gain.connect(dest)
    gain.gain.setValueAtTime(vol, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    src.start(time); src.stop(time + dur + 0.01)
  }

  const scheduleBar = useCallback((ctx, dest, t, bpm) => {
    const b = 60 / bpm   // beat duration
    const s = b / 2      // 8th note

    // --- Kick: beats 1 and 3 ---
    const kick = (when, v = 0.5) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(160, when)
      o.frequency.exponentialRampToValueAtTime(0.001, when + 0.35)
      o.connect(g); g.connect(dest)
      g.gain.setValueAtTime(v, when)
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.4)
      o.start(when); o.stop(when + 0.41)
    }
    kick(t)
    kick(t + b * 2, 0.4)

    // --- Snare: beats 2 and 4 ---
    noise(ctx, dest, t + b,       0.08, 0.18, 1200)
    noise(ctx, dest, t + b * 3,   0.08, 0.18, 1200)

    // --- Hi-hat: every 8th note ---
    for (let i = 0; i < 8; i++) noise(ctx, dest, t + s * i, 0.04, i % 2 === 0 ? 0.1 : 0.06)

    // --- Bass line (Am pentatonic feel): A2-C3-E3-A3 ---
    const bassLine = [
      [110, b * 0.9], [110, b * 0.1],
      [130.8, b * 0.9], [130.8, b * 0.1],
      [164.8, b * 0.9], [164.8, b * 0.1],
      [130.8, b * 0.9], [130.8, b * 0.1],
    ]
    let bt = t
    bassLine.forEach(([f, d]) => {
      note(ctx, dest, f, bt, d * 0.85, 0.22, 'square')
      bt += d
    })

    // --- Pad chord: Am (A C E) ---
    ;[110, 130.8, 164.8, 220, 261.6, 329.6].forEach(f => {
      note(ctx, dest, f, t, b * 4 * 0.95, 0.022, 'sine')
    })

    // --- Melody arpeggio (every 2 bars — caller controls) ---
  }, [])

  const scheduleArp = useCallback((ctx, dest, t, bpm) => {
    const s = (60 / bpm) / 2
    const arpNotes = [440, 523.3, 659.3, 880, 659.3, 523.3, 440, 392]
    arpNotes.forEach((f, i) => {
      note(ctx, dest, f, t + s * i, s * 0.7, 0.06, 'triangle')
    })
  }, [])

  const start = useCallback(async () => {
    if (runRef.current) return
    const ctx = getCtx()
    if (ctx.state === 'suspended') await ctx.resume()
    runRef.current = true

    // Fade in master volume
    masterRef.current.gain.setValueAtTime(0, ctx.currentTime)
    masterRef.current.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2)

    const bpm       = 120
    const barLen    = (60 / bpm) * 4
    let barStart    = ctx.currentTime + 0.1
    let barCount    = 0

    const schedule = () => {
      if (!runRef.current) return
      while (barStart < ctx.currentTime + 1.5) {
        scheduleBar(ctx, masterRef.current, barStart, bpm)
        if (barCount % 2 === 0) scheduleArp(ctx, masterRef.current, barStart, bpm)
        barStart += barLen
        barCount++
      }
      timerRef.current = setTimeout(schedule, 200)
    }
    schedule()
  }, [getCtx, scheduleBar, scheduleArp])

  const stop = useCallback(() => {
    runRef.current = false
    clearTimeout(timerRef.current)
    timerRef.current = null
    if (ctxRef.current && masterRef.current) {
      try {
        masterRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5)
      } catch {}
    }
    // Close context after a short delay to free resources
    if (ctxRef.current) {
      setTimeout(() => {
        if (!runRef.current && ctxRef.current) {
          try { ctxRef.current.close() } catch {}
          ctxRef.current = null
          masterRef.current = null
        }
      }, 1000)
    }
  }, [])

  const setVolume = useCallback((v) => {
    if (masterRef.current) masterRef.current.gain.value = Math.max(0, Math.min(1, v))
  }, [])

  // Clean up on unmount
  useEffect(() => {
    const ctx = ctxRef.current
    return () => {
      runRef.current = false
      clearTimeout(timerRef.current)
      if (ctx) {
        try {
          // Quick fade
          if (masterRef.current) masterRef.current.gain.value = 0
          ctx.close()
        } catch {}
      }
    }
  }, [])
  return { start, stop, setVolume }
}
