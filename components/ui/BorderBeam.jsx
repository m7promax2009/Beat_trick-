'use client'
import React, { memo } from 'react'

/**
 * High-performance GPU-composited rotating laser border beam.
 * Memoized and promoted to hardware compositor layer.
 */
function BorderBeam({
  size = 200,
  duration = 6,
  delay = 0,
  colorFrom = '#00f0ff',
  colorTo = '#ff2d78',
  borderWidth = 1.5,
  className = '',
}) {
  return (
    <div
      style={{
        '--size': `${size}px`,
        '--duration': `${duration}s`,
        '--delay': `-${delay}s`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
        '--border-width': `${borderWidth}px`,
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:var(--border-width)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[calc(var(--size))] animate-[laser-spin_var(--duration)_linear_infinite] [animation-delay:var(--delay)]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, var(--color-from) 60deg, var(--color-to) 120deg, transparent 180deg)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateZ(0)',
          willChange: 'transform',
          contain: 'strict',
        }}
      />
    </div>
  )
}

export default memo(BorderBeam)
