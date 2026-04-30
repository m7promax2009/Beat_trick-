'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { userAPI, gameAPI } from '../../lib/api'
import useStore from '../../store/useStore'
import { getLevel, getLevelProgress, formatScore } from '../../lib/utils'
import { WORLDS } from '../../lib/worlds'
import Navbar from '../../components/layout/Navbar'
import GlassCard from '../../components/ui/GlassCard'
import StatBadge from '../../components/ui/StatBadge'
import Spinner from '../../components/ui/Spinner'
import ProtectedRoute from '../../components/layout/ProtectedRoute'

function ProfileScreen() {
  const { user, updateUser } = useStore()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, histRes] = await Promise.all([userAPI.profile(user?.username), gameAPI.history(8)])
        updateUser(meRes.data)
        setHistory(histRes.data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const level   = getLevel(user?.totalScore ?? 0)
  const xpPct   = getLevelProgress(user?.totalScore ?? 0)

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-3xl mx-auto">

        {/* Profile card */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
          <GlassCard className="p-6 mb-5" glow glowColor="#00f0ff">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-[#00f0ff]/10 border-2 border-[#00f0ff]/40 flex items-center justify-center text-4xl flex-shrink-0">
                🎵
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-2xl truncate">{user?.username}</div>
                <div className="text-white/40 text-sm mb-2">{user?.email}</div>
                <div className="flex items-center gap-4 text-sm font-display">
                  <span style={{ color:'#00f0ff' }}>Lv.{level}</span>
                  <span className="text-yellow-400">🪙 {user?.coins ?? 0}</span>
                  <span className="text-white/30 text-xs">{formatScore(user?.totalScore ?? 0)} pts</span>
                </div>
                {/* XP bar */}
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width: xpPct + '%' }} transition={{ duration:1.2 }}
                      className="h-full rounded-full" style={{ background:'#00f0ff', boxShadow:'0 0 6px #00f0ff' }} />
                  </div>
                  <div className="text-white/25 text-[0.6rem] mt-1 font-display">{Math.round(xpPct)}% → Lv.{level+1}</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {loading ? (
          <div className="flex justify-center mt-10"><Spinner /></div>
        ) : (
          <>
            {/* Stats */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatBadge label="Jami Ball"   value={formatScore(user?.totalScore ?? 0)} color="#00f0ff" icon="🏆" />
              <StatBadge label="O'yinlar"    value={user?.stats?.totalGames ?? 0}       color="#ff2d78" icon="🎮" />
              <StatBadge label="Avg React."  value={(user?.stats?.avgReaction ?? 0) + 'ms'} color="#00ff87" icon="⚡" />
              <StatBadge label="Max Combo"   value={'x' + (user?.stats?.maxCombo ?? 0)}  color="#ffe135" icon="🔥" />
            </motion.div>

            {/* World progress */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
              <GlassCard className="p-5 mb-5">
                <h3 className="font-display text-xs text-white/30 tracking-widest mb-4 uppercase">Dunyo Progressi</h3>
                {WORLDS.map(w => {
                  const stars    = user?.worldStars?.[w.id] ?? 0
                  const unlocked = (user?.unlockedWorlds ?? []).includes(w.id) || w.id === 'forest'
                  return (
                    <div key={w.id} className="flex items-center gap-3 mb-3">
                      <span className="text-xl w-8">{unlocked ? w.emoji : '🔒'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-display text-xs">{w.name}</span>
                          <span className="text-sm">{'⭐'.repeat(stars)}{'☆'.repeat(3-stars)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: (stars/3*100)+'%', background: w.theme.primary, boxShadow:`0 0 5px ${w.theme.primary}` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </GlassCard>
            </motion.div>

            {/* History */}
            {history.length > 0 && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
                <GlassCard className="p-5">
                  <h3 className="font-display text-xs text-white/30 tracking-widest mb-4 uppercase">So'nggi O'yinlar</h3>
                  {history.map((g, i) => {
                    const w = WORLDS.find(wr => wr.id === g.worldId)
                    return (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b border-beat-border last:border-0">
                        <span className="text-lg">{w?.emoji ?? '🎵'}</span>
                        <div className="flex-1">
                          <div className="font-display text-xs">{w?.name ?? g.worldId} · Lv.{g.level}</div>
                          <div className="text-white/25 text-xs">{new Date(g.createdAt).toLocaleDateString('uz')}</div>
                        </div>
                        <div className="font-display text-[#00f0ff] text-sm">{formatScore(g.score)}</div>
                        <div>{'⭐'.repeat(g.stars ?? 0)}</div>
                      </div>
                    )
                  })}
                </GlassCard>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileScreen /></ProtectedRoute>
}
