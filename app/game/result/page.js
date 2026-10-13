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
import BorderBeam from '../../../components/ui/BorderBeam'
import MouseSpotlight from '../../../components/ui/MouseSpotlight'
import { generateNeuralDiagnostic } from '../../../lib/aiAgent'

export default function ResultPage() {
  const router = useRouter()
  const { lastResult, currentLevel, setCurrentLevel } = useStore()

  useEffect(() => {
    if (!lastResult) router.replace('/game')
  }, [lastResult, router])

  if (!lastResult) return null

  const world = getWorldByLevel(lastResult.level)
  const totalNotes = (lastResult.hits || 0) + (lastResult.misses || 0) + (lastResult.tricks || 0)
  const accuracy = totalNotes > 0 ? Math.round((lastResult.hits / totalNotes) * 100) : 0
  const stars = accuracy >= 95 ? 3 : accuracy >= 75 ? 2 : accuracy >= 50 ? 1 : 0
  const coinsEarned = Math.floor((lastResult.score || 0) / 25)

  // AI Agent Neural Diagnostic evaluation
  const diagnostic = generateNeuralDiagnostic({
    score: lastResult.score,
    hits: lastResult.hits,
    misses: lastResult.misses,
    tricks: lastResult.tricks,
    maxCombo: lastResult.maxCombo,
    avgReaction: lastResult.avgReaction,
    bpm: lastResult.bpm,
  })

  return (
    <div className="min-h-screen relative z-10 bg-beat-bg pb-12">
      <Navbar />
      <div className="pt-20 pb-10 px-4 flex flex-col items-center">
        {/* Header & Stars */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280 }}
          className="text-center mb-6"
        >
          <div
            className="font-display font-black text-4xl md:text-5xl mb-2"
            style={{
              color: stars > 0 ? '#00ff87' : '#ff3030',
              textShadow: `0 0 35px ${stars > 0 ? '#00ff87' : '#ff3030'}`,
            }}
          >
            {stars > 0 ? "🎉 QOYILMAQOM G'ALABA!" : '💀 YIQILDINGIZ'}
          </div>
          <div className="text-white/50 font-body text-sm">
            {world.emoji} {world.name} · Lv.{lastResult.level}
          </div>

          <div className="flex gap-2 justify-center text-3xl mt-3">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + s * 0.15 }}
              >
                {s <= stars ? '⭐' : '☆'}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* AI Duel Outcome Badge (if Duel mode was active) */}
        {lastResult.aiDuel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-5 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md"
            style={{
              background: lastResult.aiWon ? 'rgba(0, 255, 135, 0.12)' : 'rgba(255, 45, 120, 0.12)',
              border: `1.5px solid ${lastResult.aiWon ? '#00ff87' : '#ff2d78'}`,
              boxShadow: `0 0 20px ${lastResult.aiWon ? 'rgba(0,255,135,0.3)' : 'rgba(255,45,120,0.3)'}`,
            }}
          >
            <span className="text-2xl">{lastResult.aiWon ? '🏆' : '⚔️'}</span>
            <div className="text-left font-display">
              <div className="text-xs font-black text-white">
                {lastResult.aiWon ? 'AI DUEL G\'ALABASI!' : 'AI RIVAL KUCHLIROQ CHIQDI!'}
              </div>
              <div className="text-[0.65rem] text-white/60">
                Siz: {formatScore(lastResult.score)} vs AI: {formatScore(lastResult.aiScore || 0)}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Stats Card with BorderBeam & Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <MouseSpotlight
            spotlightColor={`${world.theme.primary}22`}
            className="p-6 mb-5 rounded-3xl relative backdrop-blur-2xl shadow-2xl"
            style={{
              background: 'rgba(8, 8, 24, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* TikTok Border Beam */}
            <BorderBeam
              size={240}
              duration={5}
              colorFrom={world.theme.primary}
              colorTo={world.theme.secondary}
            />

            {/* Score Display */}
            <div className="text-center mb-6 pb-4 border-b border-white/10 relative z-10">
              <div className="font-display font-black text-5xl md:text-6xl" style={{ color: world.theme.primary }}>
                {formatScore(lastResult.score)}
              </div>
              <div className="text-white/30 text-xs tracking-widest font-display uppercase mt-1">
                JAMI BALL
              </div>
            </div>

            {/* Stat Badges Grid */}
            <div className="grid grid-cols-3 gap-2.5 relative z-10 mb-6">
              <StatBadge label="Aniqlik"   value={accuracy + '%'}           color={world.theme.primary} icon="🎯" />
              <StatBadge label="Hits"      value={lastResult.hits}          color="#00ff87"             icon="✅" />
              <StatBadge label="Max Combo" value={'x' + lastResult.maxCombo} color="#ffe135"            icon="🔥" />
              <StatBadge label="Tricks"    value={lastResult.tricks}        color="#ff3030"             icon="⚠️" />
              <StatBadge label="Miss"      value={lastResult.misses}        color="#ff7c2a"             icon="❌" />
              <StatBadge label="Coin"      value={'🪙 ' + coinsEarned}      color="#ffe135"             icon="💰" />
            </div>

            {/* CYBER-NEO AI Neural Diagnostics Report */}
            <div
              className="p-4 rounded-2xl relative z-10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${diagnostic.reflexColor}44`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧠</span>
                  <span className="font-display font-black text-xs text-white">
                    CYBER-NEO [AI DIAGNOSTIKA]
                  </span>
                </div>
                <div
                  className="px-2.5 py-0.5 rounded-full font-display font-black text-xs"
                  style={{
                    background: `${diagnostic.reflexColor}22`,
                    color: diagnostic.reflexColor,
                    border: `1px solid ${diagnostic.reflexColor}`,
                  }}
                >
                  DARAJA: {diagnostic.reflexGrade}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-display text-white/70 mb-2.5">
                <div>Refleks tezligi: <span className="text-white font-bold">{diagnostic.reflexLatency}ms</span></div>
                <div>Sinxronizatsiya: <span className="text-white font-bold">{diagnostic.neuralSyncRate}%</span></div>
              </div>

              <p className="text-xs text-white/80 font-body leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                💬 <span className="text-white/60">AI Tavsiyasi:</span> {diagnostic.tip}
              </p>
            </div>
          </MouseSpotlight>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            <NeonButton onClick={() => router.push('/game')} variant="cyan">
              ↺ QAYTA O'YNASH
            </NeonButton>
            <NeonButton
              onClick={() => {
                setCurrentLevel(currentLevel + 1)
                router.push('/game')
              }}
              variant="green"
            >
              → KEYINGI BOSQICH
            </NeonButton>
            <NeonButton onClick={() => router.push('/')} variant="ghost">
              🏠 ASOSIY MENYU
            </NeonButton>
            <NeonButton onClick={() => router.push('/leaderboard')} variant="ghost">
              🏆 REYTING
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
