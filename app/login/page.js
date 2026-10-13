'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CyberAuthCard from '../../components/auth/CyberAuthCard'

export default function LoginPage() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let animId

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.7 - 0.2,
      r: Math.random() * 2 + 0.6,
      alpha: Math.random() * 0.35 + 0.08,
      color: ['#00f0ff', '#ff2d78', '#9b4dff', '#00ff87'][Math.floor(Math.random() * 4)],
    }))

    let hidden = false
    const onVis = () => { hidden = document.hidden }
    document.addEventListener('visibilitychange', onVis)

    const draw = () => {
      if (!hidden) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((p) => {
          p.x += p.vx
          p.y += p.vy
          if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
          if (p.x < 0) p.x = canvas.width
          if (p.x > canvas.width) p.x = 0
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
        })
        ctx.globalAlpha = 1
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 20%, #0d0628 0%, #040110 60%, #020008 100%)',
      }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Ambient background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff2d78]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top back navigation */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-30 flex items-center gap-2 text-white/40 hover:text-white font-display text-xs tracking-wider transition-colors px-3 py-2 rounded-xl backdrop-blur-md"
        style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        ← ASOSIY MENYU
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10 w-full max-w-md"
      >
        <CyberAuthCard initialMode="login" />
      </motion.div>
    </div>
  )
}
