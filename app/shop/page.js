'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { shopAPI } from '../../lib/api'
import useStore from '../../store/useStore'
import Navbar from '../../components/layout/Navbar'
import GlassCard from '../../components/ui/GlassCard'
import NeonButton from '../../components/ui/NeonButton'
import Spinner from '../../components/ui/Spinner'
import ProtectedRoute from '../../components/layout/ProtectedRoute'

const MOCK_ITEMS = [
  { _id:'skin_neon',   name:'Neon Skin',      emoji:'💜', description:'Neon effektli tugmalar',    price:200, category:'SKIN'   },
  { _id:'skin_fire',   name:'Olov Skin',       emoji:'🔥', description:'Olov effekti',              price:350, category:'SKIN'   },
  { _id:'skin_ice',    name:'Muz Skin',        emoji:'❄️', description:'Sovuq neon ko\'rinish',     price:300, category:'SKIN'   },
  { _id:'bg_galaxy',  name:'Galaktika BG',    emoji:'🌌', description:'Maxsus galaktika orqa fon', price:500, category:'EFFEKT' },
  { _id:'trail',      name:'Trail Effekt',    emoji:'💫', description:'Harakat izi',               price:280, category:'EFFEKT' },
  { _id:'explode',    name:'Portlash',        emoji:'💥', description:'Kattaroq portlash effekti', price:320, category:'EFFEKT' },
  { _id:'music_epic', name:'Epic Soundtrack', emoji:'🎵', description:'10 ta premium musiqa',      price:600, category:'MUSIQA' },
  { _id:'extra_life', name:'Extra Hayot',     emoji:'❤️', description:"+1 hayot har o'yinda",      price:250, category:'KUCH'   },
  { _id:'slow_mo',    name:'Slow Motion',     emoji:'⏱️', description:'Beat 20% sekinlashadi',     price:400, category:'KUCH'   },
  { _id:'double_c',   name:'2x Coin',         emoji:'🪙', description:'Coin 2 baravar',            price:550, category:'KUCH'   },
]

const CATS = ['BARCHASI','SKIN','EFFEKT','MUSIQA','KUCH']

function ShopScreen() {
  const { user, updateUser, ownedItems, setOwnedItems } = useStore()
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [cat,     setCat]     = useState('BARCHASI')
  const [buying,  setBuying]  = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await shopAPI.list()
        setItems(data.items); setOwnedItems(data.owned)
      } catch { setItems(MOCK_ITEMS) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleBuy = async (item) => {
    if (ownedItems.includes(item._id)) return
    if ((user?.coins ?? 0) < item.price) { toast.error(`Yetarli coin yo'q! Kerak: 🪙${item.price}`); return }
    setBuying(item._id)
    try {
      const { data } = await shopAPI.buy(item._id)
      updateUser({ coins: data.coins })
      setOwnedItems([...ownedItems, item._id])
      toast.success(`${item.emoji} ${item.name} sotib olindi!`)
    } catch (e) { toast.error(e.response?.data?.message || 'Xatolik!') }
    finally { setBuying(null) }
  }

  const filtered = cat === 'BARCHASI' ? items : items.filter(i => i.category === cat)

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="font-display font-black text-4xl tracking-widest"
            style={{ color:'#ff2d78', textShadow:'0 0 20px #ff2d78' }}>🛒 SHOP</h1>
          <div className="bg-beat-card border border-[#ffe135]/30 rounded-lg px-4 py-2 font-display text-[#ffe135] text-lg">
            🪙 {user?.coins ?? 0}
          </div>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`font-display text-xs px-4 py-2 rounded-sm border transition-all ${cat === c ? 'border-[#ff2d78] text-[#ff2d78] bg-[#ff2d78]/10' : 'border-beat-border text-white/40 hover:border-white/30'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center mt-20"><Spinner size="lg" color="#ff2d78" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item, i) => {
              const owned = ownedItems.includes(item._id)
              return (
                <motion.div key={item._id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i*0.04 }}>
                  <GlassCard
                    className={`p-4 text-center transition-all hover:-translate-y-1 ${owned ? 'border-[#00ff87]/40 bg-[#00ff87]/[0.03]' : 'hover:border-[#ff2d78]/40'}`}
                    glow={owned} glowColor="#00ff87"
                  >
                    <div className="text-4xl mb-2">{item.emoji}</div>
                    <div className="font-display font-bold text-xs mb-1 text-white">{item.name}</div>
                    <div className="text-white/30 text-xs mb-3 font-body leading-snug">{item.description}</div>
                    <div className="font-display text-[#ffe135] text-sm mb-3">🪙 {item.price}</div>
                    {owned ? (
                      <div className="font-display text-xs text-[#00ff87]">✓ BOUGHT</div>
                    ) : (
                      <button onClick={() => handleBuy(item)} disabled={buying === item._id}
                        className="w-full font-display text-xs py-1.5 rounded-sm border-2 border-[#ff2d78] text-[#ff2d78] hover:bg-[#ff2d78] hover:text-black transition-all disabled:opacity-30">
                        {buying === item._id ? '...' : 'SOTIB OL'}
                      </button>
                    )}
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ShopPage() {
  return <ProtectedRoute><ShopScreen /></ProtectedRoute>
}
