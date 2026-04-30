'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'
import Navbar from '../../components/layout/Navbar'
import GlassCard from '../../components/ui/GlassCard'
import NeonButton from '../../components/ui/NeonButton'
import { LANGUAGES, tFor } from '../../lib/i18n'

function Toggle({ on, onToggle, label, desc }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-display text-sm">{label}</div>
        {desc && <div className="text-white/30 text-xs mt-0.5 font-body">{desc}</div>}
      </div>
      <div onClick={onToggle} className={`relative w-14 h-7 rounded-full cursor-pointer transition-all duration-300 border-2 ${on ? 'bg-[#00f0ff]/15 border-[#00f0ff]' : 'bg-white/5 border-beat-border'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${on ? 'left-7 bg-[#00f0ff]' : 'left-0.5 bg-white/40'}`}
          style={on ? { boxShadow: '0 0 8px #00f0ff' } : {}} />
      </div>
    </div>
  )
}

function RangeSlider({ label, value, onChange, min=0, max=1, step=0.05, color='#00f0ff' }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-display text-sm">{label}</span>
        <span className="font-display text-xs" style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} 0%, ${color} ${value*100}%, rgba(255,255,255,0.1) ${value*100}%, rgba(255,255,255,0.1) 100%)` }} />
    </div>
  )
}

export default function SettingsPage() {
  const { settings, updateSettings, logout, user } = useStore()
  const router = useRouter()
  const t = tFor(settings.language)

  const handleLogout = () => { logout(); toast.success('Chiqildi!'); router.push('/') }

  const sections = [
    {
      title: t('settings.audio').toUpperCase(),
      items: [
        <RangeSlider key="sfx" label={t('settings.sfx')} value={settings.sfxVolume} color="#00f0ff"
          onChange={v => updateSettings({ sfxVolume: v })} />,
        <RangeSlider key="music" label={t('settings.music')} value={settings.musicVolume} color="#ff2d78"
          onChange={v => updateSettings({ musicVolume: v })} />,
      ]
    },
    {
      title: t('settings.visual').toUpperCase(),
      items: [
        <Toggle key="p" on={settings.particles}   label={t('settings.particles')}   desc={t('settings.particlesDesc')} onToggle={() => updateSettings({ particles:  !settings.particles })} />,
        <Toggle key="h" on={settings.showHints}   label={t('settings.hints')} desc={t('settings.hintsDesc')} onToggle={() => updateSettings({ showHints: !settings.showHints })} />,
      ]
    },
    {
      title: t('settings.accessibility').toUpperCase(),
      items: [
        <Toggle key="cb" on={settings.colorblind} label={t('settings.colorblind')} desc={t('settings.colorblindDesc')} onToggle={() => updateSettings({ colorblind: !settings.colorblind })} />,
      ]
    },
    {
      title: t('settings.language').toUpperCase(),
      items: [
        <div key="language">
          <div className="font-display text-sm mb-2">{t('settings.languageLabel')}</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LANGUAGES).map(([code, meta]) => (
              <button
                key={code}
                onClick={() => updateSettings({ language: code })}
                className="rounded-lg px-3 py-2 text-xs font-display text-left transition-all"
                style={{
                  border: `1px solid ${settings.language === code ? '#00f0ff' : 'rgba(255,255,255,0.15)'}`,
                  background: settings.language === code ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color: settings.language === code ? '#00f0ff' : 'rgba(255,255,255,0.75)',
                }}
              >
                {meta.flag} {meta.name}
              </button>
            ))}
          </div>
        </div>,
      ]
    },
  ]

  return (
    <div className="min-h-screen relative z-10">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-lg mx-auto">
        <motion.h1 initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          className="font-display font-black text-4xl text-center tracking-widest mb-8"
          style={{ color:'#00f0ff', textShadow:'0 0 20px #00f0ff' }}>
          ⚙️ {t('settings.title').toUpperCase()}
        </motion.h1>

        <div className="space-y-4">
          {sections.map((sec, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}>
              <div className="font-display text-xs text-white/25 tracking-widest mb-2 px-1">{sec.title}</div>
              <GlassCard className="p-5 space-y-4">
                {sec.items}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {user && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }} className="mt-6">
            <NeonButton onClick={handleLogout} variant="red" fullWidth>{t('settings.logout').toUpperCase()}</NeonButton>
          </motion.div>
        )}

        <div className="text-center text-white/15 text-xs font-display mt-8 tracking-widest">
          Beat Trick: Worlds v1.0.0<br/>
          <span className="text-white/10">Next.js + Tailwind + Express + MongoDB</span>
        </div>
      </div>
    </div>
  )
}
