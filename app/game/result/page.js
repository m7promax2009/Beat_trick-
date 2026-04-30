'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import useStore from '../../../store/useStore'
import { getWorldByLevel } from '../../../lib/worlds'
import { formatScore } from '../../../lib/utils'
import NeonButton from '../../../components/ui/NeonButton'
import StatBadge from '../../../components/ui/StatBadge'
import GlassCard from '../../../components/ui/GlassCard'
import Navbar from '../../../components/layout/Navbar'

export default function ResultPage() {
  const router = useRouter()
  const { lastResult, currentLevel, setCurrentLevel } = useStore()

  useEffect(() => {
    if (!lastResult) router.replace('/game')
  }, [lastResult, router])

  if (!lastResult) return null
  const world = getWorldByLevel(lastResult.level)
  const accuracy = lastResult.hits > 0 ? Math.round(lastResult.hits / (lastResult.hits + lastResult.misses + lastResult.tricks) * 100) : 0
  const stars = accuracy >= 95 ? 3 : accuracy >= 75 ? 2 : accuracy >= 50 ? 1 : 0
  const coinsEarned = Math.floor(lastResult.score / 25)

  return (
    <div className="min-h-screen relative z-10 bg-beat-bg">
      <Navbar />
      <div className="pt-20 pb-10 px-4 flex flex-col items-center">
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:280 }} className="text-center mb-6">
          <div className="font-display font-black text-5xl mb-3"
            style={{ color: stars > 0 ? '#00ff87' : '#ff3030', textShadow:`0 0 30px ${stars > 0 ? '#00ff87' : '#ff3030'}` }}>
            {stars > 0 ? "🎉 ZO'R!" : '💀 YIQILDINGIZ'}
          </div>
          <div className="text-white/50 font-body">{world.emoji} {world.name} · Lv.{lastResult.level}</div>
          <div className="flex gap-1 justify-center text-3xl mt-3">
            {[1,2,3].map(s => (
              <motion.span key={s} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.4 + s*0.15 }}>
                {s <= stars ? '⭐' : '☆'}
              </motion.span>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="w-full max-w-md">
          <GlassCard className="p-6 mb-5" glow glowColor={world.theme.primary}>
            <div className="text-center mb-5 pb-4 border-b border-beat-border">
              <div className="font-display font-black text-5xl" style={{ color: world.theme.primary }}>{formatScore(lastResult.score)}</div>
              <div className="text-white/30 text-xs tracking-widest font-display uppercase mt-1">JAMI BALL</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatBadge label="Aniqlik"   value={accuracy + '%'}          color={world.theme.primary} icon="🎯" />
              <StatBadge label="Hits"      value={lastResult.hits}          color="#00ff87"             icon="✅" />
              <StatBadge label="Max Combo" value={'x' + lastResult.maxCombo} color="#ffe135"            icon="🔥" />
              <StatBadge label="Tricks"    value={lastResult.tricks}        color="#ff3030"             icon="⚠️" />
              <StatBadge label="Miss"      value={lastResult.misses}        color="#ff7c2a"             icon="❌" />
              <StatBadge label="Coin"      value={'🪙 ' + coinsEarned}      color="#ffe135"             icon="💰" />
            </div>
          </GlassCard>
          <div className="flex flex-wrap gap-3 justify-center">
            <NeonButton onClick={() => router.push('/game')} variant="cyan">↺ QAYTA</NeonButton>
            <NeonButton onClick={() => { setCurrentLevel(currentLevel + 1); router.push('/game') }} variant="green">→ KEYINGI</NeonButton>
            <NeonButton onClick={() => router.push('/')} variant="ghost">🏠 MENU</NeonButton>
            <NeonButton onClick={() => router.push('/leaderboard')} variant="ghost">🏆 RATING</NeonButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
