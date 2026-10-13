'use client'
import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

const SHAPE_STYLES = {
  circle:   'rounded-full',
  square:   'rounded-2xl',
  diamond:  'rounded-lg rotate-45',
  triangle: 'clip-triangle rounded-none',
  hexagon:  'rounded-[28%]',
}

// Key mapping for 3x3 grid slots
const SLOT_KEYS = ['Q', 'W', 'E', 'A', 'S', 'D', 'Z', 'X', 'C']

function BeatButton({ button, onClick, worldTheme }) {
  const [hitting, setHitting] = useState(false)
  const [particles, setParticles] = useState([])

  const isTrick  = button.isTrick
  const isGold   = button.isGold
  const isShield = button.isShield
  const isBurst  = button.isBurst

  let color = button.color || worldTheme?.primary || '#00f0ff'
  if (isTrick) color = '#ff2525'
  else if (isGold) color = '#ffe135'
  else if (isShield) color = '#00ff87'
  else if (isBurst) color = '#ff2d78'

  const keyLabel = button.slot !== undefined ? SLOT_KEYS[button.slot] : ''
  const duration = button.window || 1100

  const handleClick = (e) => {
    e?.stopPropagation?.()
    if (hitting) return
    setHitting(true)

    // Trigger juicy spark particle burst (TikTok effect)
    const particleCount = isGold ? 14 : 8
    const newParticles = Array.from({ length: particleCount }, (_, i) => {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
      const dist = (isGold ? 45 : 35) + Math.random() * 30
      return {
        id: `p-${Date.now()}-${i}`,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        color: isTrick ? '#ff3030' : color,
      }
    })
    setParticles(newParticles)

    onClick(button.id)
  }

  // Large, comfortable sizes for high clickability & touch responsiveness
  const size = button.shape === 'diamond' ? 70 : 78
  const hitAreaSize = 104 // Generous invisible touch target to prevent missed clicks!

  // Approach ring calculation
  const ringRadius = size * 0.44
  const circumference = 2 * Math.PI * ringRadius

  return (
    <div
      onClick={handleClick}
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{
        width: hitAreaSize,
        height: hitAreaSize,
        touchAction: 'manipulation',
      }}
    >
      {/* Outer rhythm approach ring (shrinks toward the button rim with 100% GPU compositor) */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: size,
          height: size,
          border: `2.5px ${isTrick ? 'dashed' : 'solid'} ${color}`,
          boxShadow: `0 0 16px ${color}aa`,
          animation: `approach-ring-shrink ${duration}ms linear forwards`,
          willChange: 'transform, opacity',
        }}
      />

      {/* Main button core */}
      <button
        type="button"
        tabIndex={-1}
        className={cn(
          'relative flex items-center justify-center transition-transform active:scale-90',
          'animate-btn-appear cursor-pointer shadow-lg',
          hitting && 'animate-btn-hit',
          SHAPE_STYLES[button.shape] || 'rounded-full'
        )}
        style={{
          width: size,
          height: size,
          background: isTrick
            ? 'radial-gradient(circle, rgba(255, 37, 37, 0.45) 0%, rgba(20, 0, 0, 0.9) 100%)'
            : isGold
            ? 'radial-gradient(circle, rgba(255, 225, 53, 0.55) 0%, rgba(40, 30, 0, 0.95) 100%)'
            : isShield
            ? 'radial-gradient(circle, rgba(0, 255, 135, 0.45) 0%, rgba(0, 30, 15, 0.95) 100%)'
            : `radial-gradient(circle, ${color}45 0%, rgba(10, 10, 24, 0.9) 100%)`,
          border: `3px solid ${color}`,
          boxShadow: isTrick
            ? '0 0 24px rgba(255, 37, 37, 0.8), inset 0 0 15px rgba(255, 37, 37, 0.4)'
            : isGold
            ? '0 0 35px rgba(255, 225, 53, 0.9), inset 0 0 20px rgba(255, 225, 53, 0.6)'
            : isShield
            ? '0 0 30px rgba(0, 255, 135, 0.8), inset 0 0 16px rgba(0, 255, 135, 0.5)'
            : `0 0 25px ${color}88, inset 0 0 16px ${color}33`,
        }}
      >
        {/* Progress SVG countdown arc inside rim (GPU CSS transition) */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeOpacity="0.45"
            strokeDasharray={circumference}
            style={{
              '--circ': `${circumference}px`,
              animation: `countdown-arc ${duration}ms linear forwards`,
            }}
            strokeLinecap="round"
          />
        </svg>

        {/* Inner symbol / icon */}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
          {isTrick ? (
            <>
              <span className="font-display font-black text-sm text-[#ff3030] leading-none animate-pulse">
                ✕
              </span>
              <span className="font-display font-black text-[0.55rem] tracking-tighter text-[#ff5050] uppercase mt-0.5">
                TRICK
              </span>
            </>
          ) : isGold ? (
            <>
              <span className="font-display font-black text-base text-[#ffe135] leading-none animate-bounce">
                ★
              </span>
              <span className="font-display font-black text-[0.55rem] tracking-tight text-[#ffe135] uppercase mt-0.5">
                +50 FEVER
              </span>
            </>
          ) : isShield ? (
            <>
              <span className="font-display font-black text-sm text-[#00ff87] leading-none">
                🛡️
              </span>
              <span className="font-display font-black text-[0.55rem] tracking-tight text-[#00ff87] uppercase mt-0.5">
                QALQON
              </span>
            </>
          ) : isBurst ? (
            <>
              <span className="font-display font-black text-base text-[#ff2d78] leading-none">
                ⚡
              </span>
              <span className="font-display font-black text-[0.55rem] tracking-tight text-[#ff2d78] uppercase mt-0.5">
                RUSH
              </span>
            </>
          ) : (
            <>
              <span className="font-display font-black text-base leading-none" style={{ color }}>
                ♪
              </span>
              <span className="font-display font-black text-[0.6rem] tracking-wider text-white/80 uppercase">
                HIT
              </span>
            </>
          )}
        </div>

        {/* Keyboard shortcut hint badge on top corner */}
        {keyLabel && (
          <div
            className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md font-display font-black text-[0.6rem] text-black shadow-md z-20"
            style={{
              background: isTrick ? '#ff5050' : isGold ? '#ffe135' : isShield ? '#00ff87' : '#00f0ff',
              boxShadow: `0 0 10px ${color}`,
            }}
          >
            {keyLabel}
          </div>
        )}

        {/* Click ripple animation */}
        {hitting && (
          <span
            className="absolute animate-ripple rounded-full pointer-events-none"
            style={{
              width: 30,
              height: 30,
              background: color,
              top: '50%',
              left: '50%',
            }}
          />
        )}
      </button>

      {/* Particle sparks burst on hit (TikTok animation) */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: 0.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute rounded-full pointer-events-none z-30"
            style={{
              width: 8,
              height: 8,
              background: p.color,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default memo(BeatButton)
