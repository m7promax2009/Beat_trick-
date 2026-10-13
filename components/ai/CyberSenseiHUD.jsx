'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

/**
 * Holographic In-Game AI Companion & Ghost Rival Widget
 */
export default function CyberSenseiHUD({
  speech = '',
  event = 'idle',
  rivalMode = false,
  rivalData = null,
  playerScore = 0,
  worldColor = '#00f0ff',
}) {
  const [displayedSpeech, setDisplayedSpeech] = useState(speech)

  useEffect(() => {
    if (speech) {
      setDisplayedSpeech(speech)
    }
  }, [speech])

  // Rival score calculation for duel
  const aiScore = rivalData?.score || 0
  const isWinning = playerScore >= aiScore

  return (
    <div className="flex items-center gap-3 select-none pointer-events-none">
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {displayedSpeech && (
          <motion.div
            key={displayedSpeech}
            initial={{ opacity: 0, scale: 0.85, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 10 }}
            className="max-w-[220px] md:max-w-[280px] px-3.5 py-2 rounded-2xl backdrop-blur-md text-left text-xs font-body leading-tight shadow-xl"
            style={{
              background: 'rgba(8, 8, 24, 0.88)',
              border: `1.5px solid ${worldColor}55`,
              color: '#fff',
              boxShadow: `0 0 20px ${worldColor}25`,
            }}
          >
            <div className="flex items-center gap-1.5 font-display text-[0.6rem] font-black tracking-wider uppercase mb-1" style={{ color: worldColor }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: worldColor }} />
              CYBER-NEO [AI AGENT]
            </div>
            <p className="text-white/90 text-[0.7rem]">{displayedSpeech}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hologram Avatar Orb */}
      <div className="relative flex items-center justify-center pointer-events-auto cursor-pointer">
        {/* Pulsing holographic rings */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 48,
            height: 48,
            border: `1.5px solid ${worldColor}`,
            boxShadow: `0 0 15px ${worldColor}`,
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.2, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg relative z-10 shadow-lg backdrop-blur-md"
          style={{
            background: `radial-gradient(circle, ${worldColor}33 0%, #060614 90%)`,
            border: `2px solid ${worldColor}`,
          }}
        >
          {rivalMode ? '⚔️' : '🧠'}
        </div>
      </div>

      {/* AI Rival Duel Progress Bar (if Rival Mode active) */}
      {rivalMode && (
        <div
          className="hidden sm:flex flex-col gap-1 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-lg"
          style={{
            background: 'rgba(6, 6, 18, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex justify-between text-[0.6rem] font-display font-black tracking-wider text-white/70">
            <span style={{ color: isWinning ? '#00ff87' : '#fff' }}>Siz: {playerScore}</span>
            <span style={{ color: !isWinning ? '#ff2d78' : '#fff' }}>AI Rival: {aiScore}</span>
          </div>
          <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, (playerScore / Math.max(1, playerScore + aiScore)) * 100))}%`,
                background: '#00ff87',
              }}
            />
            <div
              className="h-full transition-all duration-300"
              style={{
                flex: 1,
                background: '#ff2d78',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
