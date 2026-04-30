'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CountdownOverlay({ onDone, worldColor = '#00f0ff' }) {
  const [step, setStep] = useState(0)
  const steps = ['3', '2', '1', '♪']

  useEffect(() => {
    const advance = () => {
      setStep(s => {
        if (s >= steps.length - 1) { setTimeout(onDone, 300); return s }
        return s + 1
      })
    }
    const t = setInterval(advance, 900)
    return () => clearInterval(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ scale: 2.5, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{   scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
          className="font-display font-black select-none"
          style={{ fontSize: '9rem', color: worldColor, textShadow: `0 0 40px ${worldColor}, 0 0 100px ${worldColor}44` }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
