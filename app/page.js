'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
import Navbar from '../components/layout/Navbar'
import NeonButton from '../components/ui/NeonButton'
import GlassCard from '../components/ui/GlassCard'
import BorderBeam from '../components/ui/BorderBeam'
import CyberNeoHomeWidget from '../components/ai/CyberNeoHomeWidget'
import AIChatModal from '../components/ai/AIChatModal'
import { WORLDS, getPlanetLevel } from '../lib/worlds'
import { useMenuMusic } from '../hooks/useMenuMusic'
import { tFor } from '../lib/i18n'

const FEATURES = [
  { icon: '🧠', title: 'Cyber-Neo AI', desc: 'Real-vaqt AI murabbiy va ghost duel rejimi' },
  { icon: '🎵', title: 'Beat Sync',    desc: 'Musiqa ritmiga mos approach ringlar' },
  { icon: '⌨️', title: 'Klaviatura',  desc: 'Q W E / A S D / Z X C yoki Sensor bilan' },
  { icon: '⚠️', title: 'Trick System', desc: "Qizil yolg'on tugmalardan ehtiyot bo'ling" },
]

function Dashboard() {
  const router = useRouter()
  const { user, currentLevel, setCurrentLevel, settings } = useStore()
  const canvasRef = useRef(null)
  const [musicOn, setMusicOn] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const { start: startMusic, stop: stopMusic } = useMenuMusic()

  const currentWorld = WORLDS.find(w => currentLevel >= w.levels[0] && currentLevel <= w.levels[1]) || WORLDS[0]
  const t = tFor(settings?.language)
  const planetLevel = getPlanetLevel(currentLevel, currentWorld)

  // Start music on first user interaction (browser autoplay policy)
  useEffect(() => {
    const tryStart = async () => {
      if (musicOn) return
      await startMusic()
      setMusicOn(true)
    }
    window.addEventListener('pointerdown', tryStart, { once: true })
    return () => {
      window.removeEventListener('pointerdown', tryStart)
      stopMusic()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let animId
    let hidden = false
    const onVis = () => { hidden = document.hidden }
    document.addEventListener('visibilitychange', onVis)
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
      color: ['#00f0ff','#ff2d78','#9b4dff','#00ff87','#ffe135'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.3 + 0.05,
    }))
    const draw = () => {
      if (!hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill()
        })
        ctx.globalAlpha = 1
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    let resizeTimer
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }, 150) }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(160deg, #06060f 0%, #0a0820 50%, #060614 100%)' }}>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <Navbar />

      <div className="relative z-10 pt-20 pb-16 px-4 max-w-5xl mx-auto">

        {/* Music hint */}
        {!musicOn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-lg font-display text-xs text-white/30 pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            🎵 Musiqa uchun bosing
          </motion.div>
        )}

        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/30 font-display text-xs tracking-widest uppercase mb-1">{t('dash.welcome')}</p>
              <h1 className="font-display font-black text-3xl md:text-4xl text-white">
                {user?.username ?? "O'yinchi"} <span style={{ color: currentWorld.theme.primary }}>!</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-xl text-center"
                style={{ background: 'rgba(255,225,53,0.08)', border: '1px solid rgba(255,225,53,0.2)' }}>
                <div className="font-display font-black text-xl" style={{ color: '#ffe135' }}>{user?.coins ?? 0}</div>
                <div className="text-white/30 text-xs font-body">tanga</div>
              </div>
              <div className="px-4 py-2 rounded-xl text-center"
                style={{ background: `${currentWorld.theme.primary}10`, border: `1px solid ${currentWorld.theme.primary}30` }}>
                <div className="font-display font-black text-xl" style={{ color: currentWorld.theme.primary }}>Lv.{currentLevel}</div>
                <div className="text-white/30 text-xs font-body">{t('common.level').toLowerCase()}</div>
              </div>
              <div className="px-4 py-2 rounded-xl text-center"
                style={{ background: 'rgba(155,77,255,0.1)', border: '1px solid rgba(155,77,255,0.25)' }}>
                <div className="font-display font-black text-xl" style={{ color: '#9b4dff' }}>{planetLevel}</div>
                <div className="text-white/30 text-xs font-body">{t('dash.planetLevel').toLowerCase()}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Prominent AI Agent Sensei Widget */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <CyberNeoHomeWidget onOpenChat={() => setChatOpen(true)} />
        </motion.div>

        {/* Current world + Play button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl overflow-hidden relative shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${currentWorld.theme.primary}12, ${currentWorld.theme.secondary}08)`, border: `1px solid ${currentWorld.theme.primary}30` }}>
          <BorderBeam colorFrom={currentWorld.theme.primary} colorTo={currentWorld.theme.secondary} size={300} duration={5} />
          <div className="p-6 flex items-center justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <motion.div className="text-6xl" animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                {currentWorld.emoji}
              </motion.div>
              <div>
                <div className="font-display text-xs text-white/40 tracking-widest uppercase mb-1">{t('dash.currentWorld')}</div>
                <div className="font-display font-black text-2xl" style={{ color: currentWorld.theme.primary }}>
                  {currentWorld.name}
                </div>
                <div className="text-white/40 text-sm font-body mt-1">
                  {currentWorld.bpmRange[0]}–{currentWorld.bpmRange[1]} BPM · {currentWorld.difficulty}
                </div>
              </div>
            </div>
            <Link href="/game">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-display font-black text-lg tracking-wider cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${currentWorld.theme.primary}, ${currentWorld.theme.secondary})`,
                  color: '#000',
                  boxShadow: `0 0 30px ${currentWorld.theme.primary}60`,
                }}>
                ▶ {t('dash.play').toUpperCase()}
              </motion.button>
            </Link>
          </div>
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${currentWorld.theme.primary}, ${currentWorld.theme.secondary}, transparent)` }} />
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Umumiy ball',    value: user?.totalScore?.toLocaleString() ?? '0', color: '#00f0ff' },
            { label: "Eng ko'p combo", value: user?.stats?.maxCombo ?? '0',              color: '#ffe135' },
            { label: "Jami o'yin",     value: user?.stats?.totalGames ?? '0',            color: '#9b4dff' },
            { label: 'Jami hit',       value: user?.stats?.totalHits?.toLocaleString() ?? '0', color: '#00ff87' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <GlassCard className="p-4 text-center">
                <div className="font-display font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
                <div className="text-white/30 text-xs font-body mt-1">{s.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* World selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-display text-white/30 tracking-[0.3em] text-xs uppercase mb-4">{t('dash.worldSelect')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WORLDS.map((w, i) => {
              const isActive   = w.id === currentWorld.id
              const isUnlocked = (user?.totalScore ?? 0) >= w.unlockScore || w.unlockScore === 0
              return (
                <motion.div key={w.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  onClick={() => {
                    if (!isUnlocked) return
                    setCurrentLevel(w.levels[0])
                    router.push('/game')
                  }}
                  className={`relative rounded-xl p-4 flex items-center gap-3 transition-all ${isUnlocked ? 'cursor-pointer hover:scale-[1.02]' : 'opacity-40 cursor-not-allowed'}`}
                  style={{
                    background:  isActive ? `${w.theme.primary}15` : 'rgba(255,255,255,0.03)',
                    border:      `1px solid ${isActive ? w.theme.primary : 'rgba(255,255,255,0.08)'}`,
                    boxShadow:   isActive ? `0 0 20px ${w.theme.primary}20` : 'none',
                  }}>
                  <span className="text-3xl">{w.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm truncate" style={{ color: w.theme.primary }}>{w.name}</div>
                    <div className="text-white/30 text-xs font-body">{w.bpmRange[0]}–{w.bpmRange[1]} BPM · {w.difficulty}</div>
                  </div>
                  {isActive   && <div className="font-display text-xs px-2 py-1 rounded-full" style={{ background: `${w.theme.primary}22`, color: w.theme.primary }}>ACTIVE</div>}
                  {!isUnlocked && <div className="text-white/30 text-sm">🔒</div>}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3 mt-8">
          <Link href="/leaderboard"><NeonButton variant="ghost" size="sm">🏆 RATING</NeonButton></Link>
          <Link href="/profile"><NeonButton variant="ghost" size="sm">👤 PROFIL</NeonButton></Link>
          <Link href="/shop"><NeonButton variant="ghost" size="sm">🛒 DO'KON</NeonButton></Link>
        </motion.div>
      </div>

      <AIChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

function LandingPage() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let animId
    let hidden = false
    const onVisLand = () => { hidden = document.hidden }
    document.addEventListener('visibilitychange', onVisLand)
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.4,
      color: ['#00f0ff','#ff2d78','#9b4dff','#00ff87','#ffe135'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.4 + 0.1,
    }))
    const draw = () => {
      if (!hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill()
        })
        ctx.globalAlpha = 1
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    let resizeTimer
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }, 150) }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); document.removeEventListener('visibilitychange', onVisLand); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="min-h-screen relative z-10">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 flex flex-col items-center text-center px-4">
        <motion.div initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
          <motion.div className="text-6xl mb-6" animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}>🎵</motion.div>
          <motion.h1 className="font-display font-black leading-none mb-2"
            style={{ fontSize: 'clamp(3.5rem, 11vw, 8rem)' }}>
            <span style={{ color: '#00f0ff', textShadow: '0 0 30px #00f0ff, 0 0 80px rgba(0,240,255,0.3)' }}>BEAT</span>
            <span className="text-white/20 mx-3">·</span>
            <span style={{ color: '#ff2d78', textShadow: '0 0 30px #ff2d78, 0 0 80px rgba(255,45,120,0.3)' }}>TRICK</span>
          </motion.h1>
          <motion.div className="font-display text-[#ffe135] tracking-[0.5em] text-2xl mb-4"
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
            ⚡ WORLDS ⚡
          </motion.div>
          <p className="text-white/40 tracking-widest text-sm font-body max-w-md mx-auto mb-10">
            Musiqa ritmiga mos tugmalarni bos — trickdan qoch — rekord qo'y
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><NeonButton variant="cyan" size="xl">BOSHLASH</NeonButton></Link>
            <Link href="/login"><NeonButton variant="ghost" size="xl">KIRISH</NeonButton></Link>
            <Link href="/leaderboard"><NeonButton variant="ghost" size="xl">🏆 RATING</NeonButton></Link>
          </div>
        </motion.div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl w-full"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.6 + i*0.1 }}>
              <GlassCard className="p-5 text-center hover:border-[#00f0ff]/30 transition-all hover:-translate-y-1 cursor-default">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="font-display font-bold text-sm text-white mb-1">{f.title}</div>
                <div className="text-white/40 text-xs font-body">{f.desc}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
        <motion.div className="mt-16 max-w-5xl w-full" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}>
          <h2 className="font-display text-white/30 tracking-[0.4em] text-sm uppercase mb-6">Dunyo Xaritasi</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {WORLDS.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay: 0.9 + i*0.07 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-display font-bold ${w.theme.borderColor} bg-beat-card/50`}
                style={{ color: w.theme.primary }}>
                <span>{w.emoji}</span><span>{w.name}</span>
                <span className="text-white/20 text-[0.6rem]">{w.bpmRange[0]}–{w.bpmRange[1]} BPM</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="mt-16 text-white/10 text-xs font-display tracking-widest">v1.0.0 • BEAT TRICK: WORLDS</div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useStore()
  return user ? <Dashboard /> : <LandingPage />
}
