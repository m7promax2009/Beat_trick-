'use client'
import { cn } from '../../lib/utils'

export default function GlassCard({ children, className = '', glow = false, glowColor = '#00f0ff' }) {
  return (
    <div
      className={cn('bg-beat-card border border-beat-border rounded-xl backdrop-blur-sm', className)}
      style={glow ? { boxShadow: `0 0 30px ${glowColor}22, inset 0 0 30px ${glowColor}08` } : {}}
    >
      {children}
    </div>
  )
}
