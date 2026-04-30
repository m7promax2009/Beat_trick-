'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'
import { authAPI } from '../../lib/api'
import Spinner from '../../components/ui/Spinner'

const FIELDS = [
  { key: 'username', label: 'Foydalanuvchi nomi', type: 'text',     placeholder: 'BeatMaster_UZ' },
  { key: 'email',    label: 'Email',               type: 'email',    placeholder: 'you@mail.com' },
  { key: 'password', label: 'Parol',               type: 'password', placeholder: '••••••••' },
  { key: 'confirm',  label: 'Parolni tasdiqlang',  type: 'password', placeholder: '••••••••' },
]

export default function RegisterPage() {
  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const { setAuth } = useStore()
  const router = useRouter()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    let animId
    const particles = Array.from({ length: 60 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.6,
      vy:    -Math.random() * 0.7 - 0.3,
      r:     Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.35 + 0.05,
      color: ['#00f0ff','#ff2d78','#00ff87'][Math.floor(Math.random() * 3)],
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill()
      })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize) }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) return toast.error("Barcha maydonlarni to'ldiring!")
    if (form.password !== form.confirm) return toast.error('Parollar mos kelmadi!')
    if (form.password.length < 6) return toast.error('Parol kamida 6 ta belgi!')
    setLoading(true)
    try {
      const { data } = await authAPI.register({ username: form.username, email: form.email, password: form.password })
      setAuth(data.user, data.token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('bt_token', data.token)
        localStorage.setItem('bt_user', JSON.stringify(data.user))
      }
      toast.success("Xush kelibsiz, yangi o'yinchi!")
      router.push('/intro')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #001510 0%, #002830 40%, #000d18 100%)' }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Hexagon grid decoration */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[0,1,2].map(i => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width:  300 + i * 200,
              height: 300 + i * 200,
              border: `1px solid ${i % 2 === 0 ? '#00ff87' : '#00f0ff'}`,
              borderRadius: '30%',
              opacity: 0.04 + i * 0.02,
              right: '28%',
              top: '50%',
              transform: 'translate(50%, -50%)',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 20 + i * 8, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex w-1/2 order-2 items-center justify-center relative z-10">
        <div className="text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <div className="relative inline-block mb-8">
              <motion.div
                className="text-8xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎮
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2 text-3xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚡
              </motion.div>
            </div>

            <div className="font-display font-black leading-none mb-4">
              <div
                className="text-5xl tracking-widest"
                style={{ color: '#00ff87', textShadow: '0 0 40px #00ff87' }}
              >
                YANGI
              </div>
              <div
                className="text-5xl tracking-widest"
                style={{ color: '#00f0ff', textShadow: '0 0 40px #00f0ff' }}
              >
                O'YINCHI
              </div>
            </div>

            <p className="text-white/30 text-sm font-body tracking-wider mt-4 max-w-xs mx-auto">
              Ro'yxatdan o'ting va 7 ta dunyo sirini kashf eting
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs mx-auto">
              {[
                { icon: '🎵', text: 'Beat Sync' },
                { icon: '⚠️', text: 'Trick System' },
                { icon: '🌍', text: '7 ta Dunyo' },
                { icon: '🏆', text: 'Leaderboard' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(0,255,135,0.06)',
                    border: '1px solid rgba(0,255,135,0.15)',
                  }}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="font-display text-xs text-white/60">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10 order-1">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="font-display font-black text-4xl">
              <span style={{ color: '#00ff87' }}>YANGI</span>
              <span className="text-white/20 mx-2">·</span>
              <span style={{ color: '#00f0ff' }}>O'YINCHI</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-black text-3xl text-white">Akkaunt yarating</h2>
            <p className="text-white/40 text-sm font-body mt-1">Dunyolarga sayohatni boshlash uchun ro'yxatdan o'ting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block font-display text-xs text-white/40 tracking-widest uppercase mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  className="w-full px-4 py-4 rounded-xl text-white font-body focus:outline-none transition-all placeholder:text-white/20"
                  style={{
                    background: focused === key ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${focused === key ? '#00ff87' : 'rgba(0,255,135,0.2)'}`,
                  }}
                />
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-xl font-display font-black text-sm tracking-widest mt-2 text-black"
              style={{
                background: 'linear-gradient(135deg, #00ff87 0%, #00f0ff 100%)',
                boxShadow: '0 0 30px rgba(0,255,135,0.5), 0 0 60px rgba(0,240,255,0.2)',
              }}
            >
              {loading ? <Spinner size="sm" color="#000" /> : "RO'YXATDAN O'T →"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs font-display">YOKI</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-display font-bold text-xs tracking-widest text-center cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              AKKAUNTIM BOR — KIRISH
            </motion.div>
          </Link>

          <p className="text-center text-white/20 text-xs mt-6 font-body">
            Beat Trick: Worlds © 2025
          </p>
        </motion.div>
      </div>
    </div>
  )
}
