'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

const SHAPE_STYLES = {
  circle:   'rounded-full',
  square:   'rounded-lg',
  diamond:  'rounded-sm rotate-45',
  triangle: 'clip-triangle rounded-none',
  hexagon:  'rounded-[30%]',
}

export default function BeatButton({ button, onClick, worldTheme }) {
  const [hitting, setHitting] = useState(false)
  const [progress, setProgress] = useState(100)
  const rafRef = useRef(null)
  const mountRef = useRef(Date.now())

  // Countdown ring
  useEffect(() => {
    const start = Date.now()
    const duration = button.window
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (pct > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [button.window])

  const handleClick = () => {
    setHitting(true)
    onClick(button.id)
  }

  const isTrick = button.isTrick
  const color   = isTrick ? '#ff3030' : button.color

  // Size varies with shape
  const size = button.shape === 'diamond' ? 52 : 60

  return (
    <button
      onClick={handleClick}
      className={cn(
        'absolute flex items-center justify-center select-none transition-transform',
        'animate-btn-appear cursor-pointer',
        hitting && 'animate-btn-hit',
        SHAPE_STYLES[button.shape] || 'rounded-full'
      )}
      style={{
        width:  size,
        height: size,
        background: `radial-gradient(circle, ${color}44, ${color}18)`,
        border: `2.5px solid ${color}`,
        boxShadow: `0 0 18px ${color}66, inset 0 0 12px ${color}22`,
        // Progress ring overlay via conic gradient on outline
        outline: `3px solid transparent`,
        outlineOffset: '3px',
        // Use SVG ring via pseudo-element workaround in inline style
      }}
    >
      {/* Progress ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50%" cy="50%"
          r={button.shape === 'circle' ? '48%' : '42%'}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.35"
          strokeDasharray={`${(progress / 100) * 2 * Math.PI * (size * 0.45)} 9999`}
          strokeLinecap="round"
        />
      </svg>

      {/* Inner icon */}
      <span className="font-display font-black text-xs relative z-10" style={{ color, fontSize: 9 }}>
        {isTrick ? '✕' : '✓'}
      </span>

      {/* Ripple on click */}
      {hitting && (
        <span
          className="absolute animate-ripple rounded-full pointer-events-none"
          style={{ width: 20, height: 20, background: color, top: '50%', left: '50%' }}
        />
      )}
    </button>
  )
}
