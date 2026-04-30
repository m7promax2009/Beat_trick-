'use client'
import { motion } from 'framer-motion'

export default function LivesDisplay({ lives, max = 3 }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <motion.div key={i}
          animate={i < lives ? {} : { scale: [1, 1.3, 0.8], opacity: [1, 1, 0.3] }}
          className="w-4 h-4 rounded-full border-2"
          style={{
            borderColor: i < lives ? '#ff2d78' : '#1e1e40',
            background:  i < lives ? '#ff2d78' : 'transparent',
            boxShadow:   i < lives ? '0 0 8px #ff2d78' : 'none',
          }}
        />
      ))}
    </div>
  )
}
