'use client'
import { useRef, useCallback } from 'react'

/**
 * High-Performance GPU-Accelerated Mouse Spotlight.
 * Directly updates CSS custom properties on the DOM container to achieve 120 FPS
 * with ZERO React re-renders on mousemove.
 */
export default function MouseSpotlight({
  children,
  className = '',
  spotlightColor = 'rgba(0, 240, 255, 0.15)',
  radius = 350,
  style = {},
}) {
  const containerRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--spotlight-opacity', '1')
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    el.style.setProperty('--spotlight-opacity', '0')
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        '--mouse-x': '-1000px',
        '--mouse-y': '-1000px',
        '--spotlight-opacity': '0',
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 will-change-[opacity]"
        style={{
          opacity: 'var(--spotlight-opacity, 0)',
          background: `radial-gradient(${radius}px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}
