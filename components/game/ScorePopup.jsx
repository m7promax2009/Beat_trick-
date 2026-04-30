'use client'
import { useEffect, useState } from 'react'

const COLORS = {
  PERFECT: '#ffe135',
  GREAT:   '#00ff87',
  GOOD:    '#00f0ff',
  LATE:    '#ff7c2a',
  trick:   '#ff3030',
  miss:    '#ff3030',
}

export default function ScorePopup({ id, text, grade, x, y, onDone }) {
  const color = COLORS[grade] || COLORS[text] || '#fff'

  useEffect(() => {
    const t = setTimeout(() => onDone(id), 900)
    return () => clearTimeout(t)
  }, [id, onDone])

  return (
    <div
      className="fixed pointer-events-none z-50 font-display font-black animate-score-float whitespace-nowrap"
      style={{ left: x, top: y, color, textShadow: `0 0 12px ${color}`, fontSize: '1.25rem' }}
    >
      {text}{grade && grade !== 'miss' && grade !== 'trick' && ` ${grade}`}
    </div>
  )
}
