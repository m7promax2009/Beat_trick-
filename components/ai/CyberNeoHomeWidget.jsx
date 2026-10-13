'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import useStore from '../../store/useStore'
import BorderBeam from '../ui/BorderBeam'
import MouseSpotlight from '../ui/MouseSpotlight'

export default function CyberNeoHomeWidget({ onOpenChat }) {
  const router = useRouter()
  const { user } = useStore()
  const [hovered, setHovered] = useState(false)

  const handleStartDuel = () => {
    router.push('/game')
  }

  return (
    <MouseSpotlight
      spotlightColor="rgba(0, 240, 255, 0.18)"
      className="w-full rounded-3xl p-6 relative backdrop-blur-2xl transition-all duration-300 shadow-2xl overflow-hidden mb-8"
      style={{
        background: 'linear-gradient(135deg, rgba(8, 8, 26, 0.92) 0%, rgba(12, 12, 38, 0.88) 100%)',
        border: '1.5px solid rgba(0, 240, 255, 0.25)',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.12), inset 0 0 20px rgba(0, 240, 255, 0.05)',
      }}
    >
      <BorderBeam size={320} duration={5} colorFrom="#00f0ff" colorTo="#ff2d78" />

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Hologram Avatar Orb */}
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-20 h-20 rounded-3xl flex items-center justify-center font-display text-4xl shadow-2xl relative z-10"
            style={{
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, rgba(5, 5, 20, 0.95) 90%)',
              border: '2px solid #00f0ff',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.3)',
            }}
            animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧠
          </motion.div>

          {/* Hologram pulse rings */}
          <motion.div
            className="absolute -inset-2 rounded-3xl pointer-events-none"
            style={{ border: '1.5px solid rgba(0, 240, 255, 0.4)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[0.6rem] font-black font-display bg-[#00ff87] text-black border-2 border-black z-20">
            AI ONLINE
          </span>
        </div>

        {/* Info & Live Speech */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 flex-wrap">
            <span className="font-display font-black text-lg text-white">CYBER-NEO</span>
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
              SHAXSIY RITM AI AGENT
            </span>
            <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-[#ff2d78]/20 text-[#ff2d78] border border-[#ff2d78]/40">
              NEYRO-SINXRON: 98%
            </span>
          </div>

          <p className="text-white/80 text-xs font-body leading-relaxed max-w-xl">
            "Salom, <span className="text-[#00f0ff] font-bold">{user?.username || 'Ritm Jangchisi'}</span>! Barcha o'yin qadamlaringiz, reflekslaringiz va combo zanjiringizni tahlil qilib boryapman. Ritm sezgirligingiz bugun ajoyib darajada. Sizni yangi musobaqada sinab ko'rishga tayyorman!"
          </p>

          <div className="flex items-center gap-2 mt-4 justify-center md:justify-start flex-wrap">
            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 rounded-xl font-display font-black text-xs tracking-wider text-black bg-gradient-to-r from-[#00f0ff] to-[#00ff87] shadow-lg shadow-[#00f0ff]/30 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>💬 AI BILAN SUHBAT</span>
            </button>
            <button
              onClick={handleStartDuel}
              className="px-4 py-2.5 rounded-xl font-display font-black text-xs tracking-wider text-white bg-white/5 hover:bg-[#ff2d78]/20 border border-[#ff2d78]/50 shadow-lg hover:shadow-neon-pink transition-all cursor-pointer flex items-center gap-2"
            >
              <span>⚔️ AI GHOST DUELGA KIRISH</span>
            </button>
          </div>
        </div>
      </div>
    </MouseSpotlight>
  )
}
