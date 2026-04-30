'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '../../components/layout/ProtectedRoute'

const WORLDS_LIST = [
  { emoji: '🌿', name: 'Forest Pulse',   color: '#00ff87' },
  { emoji: '🌆', name: 'Neon City',      color: '#00f0ff' },
  { emoji: '🌊', name: 'Ocean Drive',    color: '#0088ff' },
  { emoji: '🚀', name: 'Space Warp',     color: '#9b4dff' },
  { emoji: '🌋', name: 'Lava Core',      color: '#ff7c2a' },
  { emoji: '🧊', name: 'Ice Dimension',  color: '#80ffff' },
  { emoji: '⚡', name: 'Cyber God Mode', color: '#ffe135' },
]

// Cinematic music synced to animation steps
function playCinematicMusic(ctx) {
  const t = ctx.currentTime

  const n = (freq, start, dur, vol, type = 'sine') => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    o.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0, t + start)
    g.gain.linearRampToValueAtTime(vol, t + start + Math.min(0.05, dur * 0.15))
    g.gain.setValueAtTime(vol, t + start + dur * 0.75)
    g.gain.linearRampToValueAtTime(0, t + start + dur)
    o.start(t + start); o.stop(t + start + dur + 0.02)
  }

  const noize = (start, dur, vol, hp = 4000) => {
    const buf  = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    const flt = ctx.createBiquadFilter()
    const g   = ctx.createGain()
    flt.type = 'highpass'; flt.frequency.value = hp
    src.buffer = buf
    src.connect(flt); flt.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(vol, t + start)
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur)
    src.start(t + start); src.stop(t + start + dur + 0.02)
  }

  // ── Phase 1: BEAT TRICK WORLDS logo (0.3s → 1.5s) ─────────────────────
  // Deep rumble drone
  n(40,  0.3, 1.0, 0.12, 'sawtooth')
  n(55,  0.3, 1.2, 0.08, 'sine')
  // BEAT flash (cyan)
  n(220, 0.35, 0.5, 0.10, 'triangle')
  n(440, 0.35, 0.4, 0.06, 'sine')
  // TRICK flash (pink)
  n(165, 0.7,  0.5, 0.10, 'triangle')
  n(330, 0.7,  0.4, 0.06, 'sine')
  // WORLDS text
  n(110, 1.05, 0.5, 0.08, 'sawtooth')

  // ── Phase 2: Worlds reveal (1.5s → 3.0s) ──────────────────────────────
  // Rising arpeggio over 7 beats (one per world)
  const arpNotes = [261.6, 329.6, 392, 440, 523.3, 659.3, 880]
  arpNotes.forEach((f, i) => {
    n(f, 1.5 + i * 0.22, 0.5, 0.07, 'triangle')
    n(f / 2, 1.5 + i * 0.22, 0.4, 0.04, 'sine')
  })
  // Build-up noise swell
  noize(1.5, 1.4, 0.04, 8000)

  // ── Phase 3: Tips (3.0s → 4.4s) ───────────────────────────────────────
  // Pulse beat: kick + snare x 4
  ;[0, 0.375, 0.75, 1.125].forEach((off) => {
    // kick
    const ko = ctx.createOscillator()
    const kg = ctx.createGain()
    ko.type = 'sine'
    ko.frequency.setValueAtTime(160, t + 3.0 + off)
    ko.frequency.exponentialRampToValueAtTime(0.001, t + 3.0 + off + 0.3)
    ko.connect(kg); kg.connect(ctx.destination)
    kg.gain.setValueAtTime(0.35, t + 3.0 + off)
    kg.gain.exponentialRampToValueAtTime(0.001, t + 3.0 + off + 0.35)
    ko.start(t + 3.0 + off); ko.stop(t + 3.0 + off + 0.36)
  })
  ;[0.1875, 0.5625, 0.9375, 1.3125].forEach((off) => {
    noize(3.0 + off, 0.08, 0.15, 1500)
  })
  // Chord pad: Am
  ;[110, 130.8, 164.8, 220, 261.6].forEach(f => n(f, 3.0, 1.3, 0.028, 'sine'))

  // ── Phase 4: TAYYOR! big hit (4.4s → 6.0s) ───────────────────────────
  // Impact: frequency sweep down
  const imp = ctx.createOscillator()
  const impG = ctx.createGain()
  imp.type = 'sawtooth'
  imp.frequency.setValueAtTime(1200, t + 4.4)
  imp.frequency.exponentialRampToValueAtTime(80, t + 4.4 + 0.6)
  imp.connect(impG); impG.connect(ctx.destination)
  impG.gain.setValueAtTime(0.5, t + 4.4)
  impG.gain.exponentialRampToValueAtTime(0.001, t + 4.4 + 0.8)
  imp.start(t + 4.4); imp.stop(t + 4.4 + 0.81)

  // Impact noise burst
  noize(4.4, 0.2, 0.3, 2000)

  // Victory fanfare ascending chord
  ;[440, 554.4, 659.3, 880].forEach((f, i) => {
    n(f, 4.45 + i * 0.06, 1.2 - i * 0.1, 0.08, 'triangle')
  })

  // Reverb tail pad
  ;[110, 220, 330, 440, 659.3].forEach(f => n(f, 4.5, 1.4, 0.025, 'sine'))
}

// Timing for each step (ms)
const STEP_TIMES = [300, 1500, 3000, 4400, 5800]

function IntroScreen() {
  const router  = useRouter()
  const [step,  setStep]  = useState(0)
  const ctxRef  = useRef(null)

  const startAudio = useCallback(async () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ctxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()
      playCinematicMusic(ctx)
    } catch {}
  }, [])

  useEffect(() => {
    startAudio()
    const timers = STEP_TIMES.map((ms, i) => setTimeout(() => setStep(i + 1), ms))
    timers.push(setTimeout(() => router.push('/'), 6000))
    return () => {
      timers.forEach(clearTimeout)
      ctxRef.current?.close()
    }
  }, [])

  // Gradient bg color per step
  const bgGradient = [
    'radial-gradient(ellipse at 50% 50%, #000010 0%, #000 100%)',
    'radial-gradient(ellipse at 30% 40%, #001020 0%, #000 80%)',
    'radial-gradient(ellipse at 60% 50%, #0a0020 0%, #000 80%)',
    'radial-gradient(ellipse at 50% 60%, #100010 0%, #000 80%)',
    'radial-gradient(ellipse at 50% 50%, #201000 0%, #000 80%)',
  ]

  return (
    <motion.div className="fixed inset-0 overflow-hidden flex items-center justify-center"
      animate={{ background: bgGradient[Math.min(step, bgGradient.length - 1)] }}
      transition={{ duration: 0.8 }}>

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 3px)' }} />

      {/* ── Step 1: Logo ── */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="logo"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.3, filter: 'blur(20px)' }}
            transition={{ enter: { duration: 0.5, type: 'spring', bounce: 0.3 }, exit: { duration: 0.4 } }}
            className="text-center">
            <div className="font-display font-black leading-none" style={{ fontSize: 'clamp(5rem, 17vw, 11rem)' }}>
              <motion.div
                style={{ color: '#00f0ff', textShadow: '0 0 40px #00f0ff' }}
                animate={{ textShadow: ['0 0 40px #00f0ff','0 0 90px #00f0ff, 0 0 140px rgba(0,240,255,0.5)','0 0 40px #00f0ff'] }}
                transition={{ duration: 0.7, repeat: Infinity }}>BEAT</motion.div>
              <motion.div
                style={{ color: '#ff2d78', textShadow: '0 0 40px #ff2d78' }}
                animate={{ textShadow: ['0 0 40px #ff2d78','0 0 90px #ff2d78, 0 0 140px rgba(255,45,120,0.5)','0 0 40px #ff2d78'] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.35 }}>TRICK</motion.div>
            </div>
            <motion.div className="font-display font-black tracking-[0.5em] mt-3"
              style={{ fontSize: 'clamp(1.2rem, 4vw, 2.5rem)', color: '#ffe135', textShadow: '0 0 25px #ffe135' }}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              ⚡ WORLDS ⚡
            </motion.div>
          </motion.div>
        )}

        {/* ── Step 2: Worlds ── */}
        {step === 2 && (
          <motion.div key="worlds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4">
            <motion.p className="font-display text-white/30 tracking-[0.4em] text-xs uppercase mb-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              7 TA DUNYO SENI KUTMOQDA
            </motion.p>
            <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
              {WORLDS_LIST.map((w, i) => (
                <motion.div key={w.name}
                  initial={{ opacity: 0, y: 25, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.14, type: 'spring', bounce: 0.35 }}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl"
                  style={{ background: `${w.color}10`, border: `1px solid ${w.color}44`, minWidth: 90 }}>
                  <motion.span className="text-4xl"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12 }}>{w.emoji}</motion.span>
                  <span className="font-display font-bold text-xs" style={{ color: w.color }}>{w.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Tips ── */}
        {step === 3 && (
          <motion.div key="tips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm px-6">
            <motion.p className="font-display text-white/30 tracking-[0.4em] text-xs uppercase text-center mb-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>QO'LLANMA</motion.p>
            <div className="space-y-3">
              {[
                { icon: '🎵', text: 'Musiqa ritmiga mos tugmalarni bos',   color: '#00f0ff' },
                { icon: '⚠️', text: "Qizil TRICK tugmalardan SAQLAN!",     color: '#ff3030' },
                { icon: '⚡', text: "Combo = ko'proq ball!",               color: '#ffe135' },
              ].map((tip, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -35 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.18, type: 'spring', stiffness: 200 }}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl"
                  style={{ background: `${tip.color}0c`, border: `1px solid ${tip.color}33` }}>
                  <span className="text-3xl flex-shrink-0">{tip.icon}</span>
                  <span className="font-body text-sm" style={{ color: tip.color }}>{tip.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 4: TAYYOR! ── */}
        {step === 4 && (
          <motion.div key="go"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center">
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [1.2, 0.95, 1.05, 1], opacity: 1 }}
              transition={{ duration: 0.5, times: [0, 0.4, 0.7, 1] }}
              className="font-display font-black"
              style={{ fontSize: 'clamp(4.5rem, 16vw, 10rem)', color: '#ffe135', textShadow: '0 0 60px #ffe135, 0 0 120px rgba(255,225,53,0.6)' }}>
              TAYYOR!
            </motion.div>
            {/* Stars burst */}
            {[...Array(8)].map((_, i) => (
              <motion.div key={i}
                className="absolute text-2xl pointer-events-none"
                style={{
                  left: '50%', top: '50%',
                  transformOrigin: 'center',
                }}
                initial={{ x: '-50%', y: '-50%', scale: 0, opacity: 1 }}
                animate={{
                  x: `calc(-50% + ${Math.cos(i * 45 * Math.PI / 180) * 120}px)`,
                  y: `calc(-50% + ${Math.sin(i * 45 * Math.PI / 180) * 120}px)`,
                  scale: [0, 1.3, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.8, delay: 0.1 }}>
                ⭐
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div className="h-full"
          style={{ background: 'linear-gradient(90deg, #00f0ff, #9b4dff, #ff2d78, #ffe135)' }}
          initial={{ width: '0%' }} animate={{ width: '100%' }}
          transition={{ duration: 6, ease: 'linear' }} />
      </div>

      {/* Step dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {[1,2,3,4].map(s => (
          <motion.div key={s} className="rounded-full"
            style={{ background: step >= s ? '#ffe135' : 'rgba(255,255,255,0.15)', height: 6 }}
            animate={{ width: step === s ? 22 : 6 }}
            transition={{ duration: 0.3 }} />
        ))}
      </div>

      {/* Skip */}
      <button onClick={() => router.push('/')}
        className="absolute bottom-5 right-5 font-display text-xs text-white/20 hover:text-white/50 transition-colors tracking-widest">
        O'TKAZIB YUBORISH →
      </button>
    </motion.div>
  )
}

export default function IntroPage() {
  return <ProtectedRoute><IntroScreen /></ProtectedRoute>
}
