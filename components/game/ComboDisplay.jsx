'use client'
import { motion, AnimatePresence } from 'framer-motion'

export default function ComboDisplay({ combo, worldColor }) {
  if (combo < 2) return null
  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className="flex flex-col items-center"
      >
        <span className="font-display font-black text-4xl leading-none"
          style={{ color: worldColor, textShadow: `0 0 20px ${worldColor}, 0 0 50px ${worldColor}55` }}>
          x{combo}
        </span>
        <span className="text-white/40 text-xs tracking-widest font-display uppercase">COMBO</span>
      </motion.div>
    </AnimatePresence>
  )
}
