'use client'
import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BeatButton from './BeatButton'
import BorderBeam from '../ui/BorderBeam'

// Optimized 3x3 Grid Matrix inside the central stage
export const ARENA_SLOTS = [
  { id: 0, key: 'Q', x: 22, y: 26 },
  { id: 1, key: 'W', x: 50, y: 26 },
  { id: 2, key: 'E', x: 78, y: 26 },
  { id: 3, key: 'A', x: 22, y: 52 },
  { id: 4, key: 'S', x: 50, y: 52 },
  { id: 5, key: 'D', x: 78, y: 52 },
  { id: 6, key: 'Z', x: 22, y: 78 },
  { id: 7, key: 'X', x: 50, y: 78 },
  { id: 8, key: 'C', x: 78, y: 78 },
]

/**
 * World-Class Holographic Cyber Arena
 * Inspired by Geometry Dash pacing: dynamic 0%-100% progress, wave escalation,
 * and high-voltage interactive feedback.
 */
function CyberPlayfield({
  buttons = [],
  onButtonClick,
  worldTheme,
  isPulsing = false,
  activeKey = null,
  songProgress = 0, // 0 to 100
  timeLeft = 65,
  currentWave = 1, // 1: Warmup, 2: Bass Drop, 3: Demon Rush
  hasShield = false,
  bestPercent = 0,
}) {
  const primaryColor = worldTheme?.primary || '#00f0ff'
  const secondaryColor = worldTheme?.secondary || '#ff2d78'

  return (
    <div className="relative w-full max-w-2xl h-[520px] md:h-[560px] mx-auto flex items-center justify-center p-2 md:p-4 select-none">
      {/* Central Arena Hologram Frame */}
      <motion.div
        className="relative w-full h-full rounded-3xl backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(14, 16, 42, 0.88) 0%, rgba(6, 6, 18, 0.96) 100%)',
          border: `1.5px solid ${currentWave === 3 ? '#ff2d78' : primaryColor}55`,
          boxShadow: `0 0 60px ${currentWave === 3 ? '#ff2d78' : primaryColor}20, inset 0 0 40px ${primaryColor}0a`,
        }}
        animate={{
          scale: isPulsing ? 1.015 : 1,
        }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        {/* Animated Laser Border Beam */}
        <BorderBeam
          size={340}
          duration={currentWave === 3 ? 2.5 : 4.5}
          colorFrom={currentWave === 3 ? '#ff2d78' : primaryColor}
          colorTo={currentWave === 3 ? '#ffe135' : secondaryColor}
        />

        {/* ── Background Cyber Scenery & Concentric Sound Rings ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Concentric sound radar rings */}
          <div
            className="absolute w-72 h-72 rounded-full border border-dashed opacity-20"
            style={{ borderColor: primaryColor }}
          />
          <div
            className="absolute w-96 h-96 rounded-full border opacity-15"
            style={{ borderColor: secondaryColor }}
          />
          <div
            className="absolute w-[480px] h-[480px] rounded-full border border-dotted opacity-10"
            style={{ borderColor: primaryColor }}
          />

          {/* Central crosshair reticle */}
          <div
            className="absolute w-6 h-6 border-t-2 border-b-2 border-l-2 border-r-2 opacity-30 rounded-full"
            style={{ borderColor: primaryColor }}
          />
          <div
            className="absolute w-12 h-[1px] opacity-20"
            style={{ background: primaryColor }}
          />
          <div
            className="absolute h-12 w-[1px] opacity-20"
            style={{ background: primaryColor }}
          />
        </div>

        {/* ── TOP ARENA HUD: Geometry Dash Style Progress & Wave Info ── */}
        <div className="relative z-10 px-5 pt-3.5 pb-2.5 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            {/* Left: Wave status / Shield */}
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{
                  background: currentWave === 3 ? '#ff2d78' : currentWave === 2 ? '#ffe135' : primaryColor,
                }}
              />
              <span className="font-display font-black text-xs tracking-wider uppercase text-white">
                {currentWave === 3 ? '🔥 WAVE 3: DEMON RUSH' : currentWave === 2 ? '⚡ WAVE 2: BASS DROP' : '🟢 WAVE 1: WARMUP'}
              </span>
              {hasShield && (
                <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-black bg-[#00ff87]/20 text-[#00ff87] border border-[#00ff87]/40 animate-pulse">
                  🛡️ SHIELD FAOL
                </span>
              )}
            </div>

            {/* Center / Right: Geometry Dash Iconic Progress Percentage */}
            <div className="flex items-center gap-3">
              {bestPercent > 0 && (
                <span className="hidden sm:inline font-mono text-[0.68rem] font-bold text-white/50">
                  👑 Rekord: {bestPercent}%
                </span>
              )}
              <div
                className="px-3 py-1 rounded-xl font-display font-black text-sm tracking-widest text-black flex items-center gap-1 shadow-lg"
                style={{
                  background: songProgress > 70
                    ? 'linear-gradient(135deg, #ff2d78 0%, #ff3030 100%)'
                    : songProgress > 35
                    ? 'linear-gradient(135deg, #ffe135 0%, #ff8c00 100%)'
                    : 'linear-gradient(135deg, #00f0ff 0%, #00ff87 100%)',
                  boxShadow: `0 0 16px ${songProgress > 70 ? '#ff2d78' : '#00f0ff'}88`,
                }}
              >
                <span>{songProgress}%</span>
              </div>
            </div>
          </div>

          {/* Geometry Dash Neon Progress Line */}
          <div className="w-full h-1.5 rounded-full bg-white/10 relative overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${songProgress}%`,
                background: songProgress > 70
                  ? 'linear-gradient(90deg, #ff2d78, #ff3030)'
                  : songProgress > 35
                  ? 'linear-gradient(90deg, #00f0ff, #ffe135)'
                  : 'linear-gradient(90deg, #00ff87, #00f0ff)',
                boxShadow: `0 0 10px ${songProgress > 70 ? '#ff3030' : '#00f0ff'}`,
              }}
            />
          </div>
        </div>

        {/* ── 3x3 Dynamic Sensory Launchpad Nodes ── */}
        <div className="relative flex-1 w-full h-full">
          {ARENA_SLOTS.map((slot) => {
            const hasActiveButton = buttons.some((b) => b.slot === slot.id)
            const isPressed = activeKey === slot.key

            return (
              <div
                key={slot.id}
                className="absolute pointer-events-none flex flex-col items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 86,
                  height: 86,
                  border: hasActiveButton
                    ? `1.5px solid ${currentWave === 3 ? '#ff2d78' : primaryColor}`
                    : `1px solid rgba(255, 255, 255, 0.08)`,
                  background: isPressed
                    ? `${primaryColor}40`
                    : hasActiveButton
                    ? `radial-gradient(circle, ${primaryColor}22 0%, rgba(10, 10, 26, 0.7) 100%)`
                    : 'rgba(255, 255, 255, 0.03)',
                  boxShadow: hasActiveButton
                    ? `0 0 25px ${currentWave === 3 ? '#ff2d78' : primaryColor}40, inset 0 0 15px ${primaryColor}20`
                    : 'none',
                }}
              >
                {/* Sleek Corner Brackets */}
                <div className="absolute top-1 left-1.5 font-mono text-[0.5rem] opacity-25 text-white pointer-events-none">
                  ┌
                </div>
                <div className="absolute top-1 right-1.5 font-mono text-[0.5rem] opacity-25 text-white pointer-events-none">
                  ┐
                </div>
                <div className="absolute bottom-1 left-1.5 font-mono text-[0.5rem] opacity-25 text-white pointer-events-none">
                  └
                </div>
                <div className="absolute bottom-1 right-1.5 font-mono text-[0.5rem] opacity-25 text-white pointer-events-none">
                  ┘
                </div>

                {/* Slot Key Badge when inactive */}
                {!hasActiveButton && (
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="font-display font-black text-sm tracking-wider select-none opacity-40 transition-opacity"
                      style={{ color: isPressed ? primaryColor : '#fff' }}
                    >
                      {slot.key}
                    </span>
                    <span className="font-mono text-[0.5rem] text-white/20 mt-0.5">PAD {slot.id + 1}</span>
                  </div>
                )}
              </div>
            )
          })}

          {/* ── Active Buttons Layer (z-30 pointer-events-auto ensures 100% click registration) ── */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            <AnimatePresence>
              {buttons.map((btn) => {
                const slot = ARENA_SLOTS[btn.slot] ?? ARENA_SLOTS[4]

                return (
                  <div
                    key={btn.id}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <BeatButton
                      button={btn}
                      onClick={onButtonClick}
                      worldTheme={worldTheme}
                    />
                  </div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── BOTTOM ARENA FOOTER: Controls & Life Recovery Reminder ── */}
        <div className="relative z-10 px-4 py-2.5 flex items-center justify-between border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white/60 text-[0.68rem] font-display">
            <span>⌨️ Klaviatura:</span>
            <span className="text-white/90 font-bold">Q W E / A S D / Z X C</span>
            <span className="text-white/40 hidden md:inline">|</span>
            <span className="text-[#00f0ff] font-bold hidden md:inline">Bo'shliq (Space):</span>
            <span className="text-white/70 hidden md:inline">Tezkor zarba</span>
          </div>

          <div className="flex items-center gap-2.5 text-[0.65rem] font-display">
            <span className="text-[#ffe135] font-bold">🌟 +50 Yulduz</span>
            <span className="text-[#00ff87] font-bold">🛡️ Qalqon</span>
            <span className="text-[#ff3030] font-bold">✕ Trick (Bosmang)</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default memo(CyberPlayfield)
