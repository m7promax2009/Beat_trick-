'use client'
import { useEffect, useRef } from 'react'

export default function WorldBackground({ worldId, isActive }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (!isActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    let particles = []

    const configs = {
      forest:    { color: '#00ff87', type: 'leaf',   count: 25 },
      'neon-city': { color: '#00f0ff', type: 'light',  count: 40 },
      ocean:     { color: '#0088ff', type: 'bubble', count: 30 },
      space:     { color: '#9b4dff', type: 'star',   count: 60 },
      lava:      { color: '#ff7c2a', type: 'spark',  count: 35 },
      ice:       { color: '#80ffff', type: 'snow',   count: 50 },
      'cyber-god': { color: '#ffe135', type: 'glow',   count: 45 },
    }

    const cfg = configs[worldId] || configs.space

    // Init particles
    for (let i = 0; i < cfg.count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: cfg.type === 'snow' || cfg.type === 'leaf' ? Math.random() * 0.8 + 0.2 : (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
        life: Math.random(),
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life += 0.003
        if (p.y > canvas.height) p.y = -5
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height

        ctx.beginPath()
        if (cfg.type === 'star') {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = cfg.color
          ctx.globalAlpha = Math.abs(Math.sin(p.life)) * 0.7 + 0.1
        } else {
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = cfg.color
          ctx.globalAlpha = p.alpha
        }
        ctx.fill()
      })
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [worldId, isActive])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
