import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => twMerge(clsx(inputs))

export const formatScore = (n) => n?.toLocaleString() ?? '0'

export const getLevel = (totalScore) => Math.max(1, Math.floor(totalScore / 300) + 1)

export const getLevelProgress = (totalScore) => {
  const pointsPerLevel = 300
  return (totalScore % pointsPerLevel) / pointsPerLevel * 100
}

export const msToBar = (ms) => {
  if (ms < 200) return { grade: 'PERFECT', color: '#ffe135', score: 15 }
  if (ms < 400) return { grade: 'GREAT',   color: '#00ff87', score: 10 }
  if (ms < 600) return { grade: 'GOOD',    color: '#00f0ff', score: 5 }
  return              { grade: 'LATE',    color: '#ff7c2a', score: 2 }
}

// Generate random slot positions (no overlaps)
export const generateSlots = (count, total = 9) => {
  const indices = Array.from({ length: total }, (_, i) => i)
  const shuffled = indices.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export const sleep = (ms) => new Promise(r => setTimeout(r, ms))
