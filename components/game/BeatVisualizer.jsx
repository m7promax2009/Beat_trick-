'use client'
import { useEffect, useRef } from 'react'

export default function BeatVisualizer({ getFrequencyData, color = '#00f0ff', isActive }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (!isActive) { cancelAnimationFrame(rafRef.current); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const draw = () => {
      const data = getFrequencyData()
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const bars = 32
      const barW = W / bars
      for (let i = 0; i < bars; i++) {
        const v = (data[Math.floor(i * data.length / bars)] || 0) / 255
        const h = v * H * 0.9
        const alpha = 0.3 + v * 0.7
        ctx.fillStyle = color
        ctx.globalAlpha = alpha
        ctx.fillRect(i * barW + 1, H - h, barW - 2, h)
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, getFrequencyData, color])

  return (
    <canvas ref={canvasRef} width={300} height={40}
      className="w-full opacity-70 rounded-sm" />
  )
}
