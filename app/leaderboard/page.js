'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { leaderboardAPI } from '../../lib/api'
import useStore from '../../store/useStore'
import { formatScore } from '../../lib/utils'
import { WORLDS } from '../../lib/worlds'
import Navbar from '../../components/layout/Navbar'
import GlassCard from '../../components/ui/GlassCard'
import Spinner from '../../components/ui/Spinner'

const TABS = [
  { key:'global', label:'GLOBAL' },
  { key:'weekly', label:'HAFTALIK' },
  { key:'daily',  label:'BUGUNGI' },
]

const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' }

const MOCK = [
  { rank:1, username:'BeatGod_UZ',   score:98400, avgReaction:185, flag:'🇺🇿' },
  { rank:2, username:'RhythmKing',   score:87500, avgReaction:201, flag:'🇰🇷' },
  { rank:3, username:'TrickSlayer',  score:79200, avgReaction:218, flag:'🇺🇸' },
  { rank:4, username:'PulseMaster',  score:71000, avgReaction:234, flag:'🇩🇪' },
  { rank:5, username:'NeonBeater',   score:65800, avgReaction:256, flag:'🇯🇵' },
  { rank:6, username:'CyberRhythm',  score:59300, avgReaction:270, flag:'🇷🇺' },
]

export default function LeaderboardPage() {
  const { user } = useStore()
  const [tab,    setTab]    = useState('global')
  const [world,  setWorld]  = useState('all')
  const [data,   setData]   = useState([])
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: d } = await leaderboardAPI[tab === 'daily' ? 'daily' : tab](world !== 'all' ? world : undefined)
        setData(d)
      } catch { setData(MOCK) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [tab, world])

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-2xl mx-auto">
        <motion.h1 initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          className="font-display font-black text-4xl text-center tracking-widest mb-8"
          style={{ color:'#ffe135', textShadow:'0 0 25px rgba(255,225,53,0.5)' }}>
          🏆 LEADERBOARD
        </motion.h1>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`font-display text-xs px-4 py-2 rounded-sm border transition-all ${tab === t.key ? 'border-[#ffe135] text-[#ffe135] bg-[#ffe135]/10' : 'border-beat-border text-white/40 hover:border-white/30'}`}>
              {t.label}
            </button>
          ))}
          <select value={world} onChange={e => setWorld(e.target.value)}
            className="font-display text-xs px-3 py-2 rounded-sm border border-beat-border bg-beat-card text-white/60 ml-auto">
            <option value="all">Barcha Dunyo</option>
            {WORLDS.map(w => <option key={w.id} value={w.id}>{w.emoji} {w.name}</option>)}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center mt-20"><Spinner size="lg" color="#ffe135" /></div>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-2">
            {data.map((entry, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}>
                <GlassCard
                  className={`flex items-center gap-3 px-4 py-3 transition-all ${entry.username === user?.username ? 'border-[#00f0ff]/50' : 'hover:border-white/15'}`}
                  glow={entry.username === user?.username} glowColor="#00f0ff"
                >
                  <div className="w-10 text-center">
                    {MEDALS[entry.rank] ? (
                      <span className="text-xl">{MEDALS[entry.rank]}</span>
                    ) : (
                      <span className="font-display text-sm text-white/30">#{entry.rank}</span>
                    )}
                  </div>
                  <span className="text-lg">{entry.flag || '🌍'}</span>
                  <div className="flex-1">
                    <div className="font-display text-sm font-bold">
                      {entry.username}
                      {entry.username === user?.username && <span className="ml-2 text-[#00f0ff] text-xs">(SEN)</span>}
                    </div>
                    {entry.avgReaction && <div className="text-white/25 text-xs">⚡ {entry.avgReaction}ms</div>}
                  </div>
                  <div className="font-display font-bold" style={{ color:'#00f0ff' }}>{formatScore(entry.score)}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
