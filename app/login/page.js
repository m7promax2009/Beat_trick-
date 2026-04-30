'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useStore from '../../store/useStore'
import { authAPI } from '../../lib/api'
import Spinner from '../../components/ui/Spinner'

const NOTES = ['🎵','🎶','🎸','🎹','🥁','🎺','🎻']

export default function LoginPage() {
  const [form,    setForm]    = useState({ username: '', password: '' })
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

    const particles = Array.from({ length: 50 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.5,
      vy:    -Math.random() * 0.8 - 0.2,
      r:     Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.3 + 0.05,
      color: ['#9b4dff','#ff2d78','#00f0ff'][Math.floor(Math.random() * 3)],
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
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
    if (!form.username || !form.password) return toast.error("Barcha maydonlarni to'ldiring!")
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      setAuth(data.user, data.token)
      if (typeof window !== 'undefined') {
        localStorage.setItem('bt_token', data.token)
        localStorage.setItem('bt_user', JSON.stringify(data.user))
      }
      toast.success('Xush kelibsiz!')
      router.push('/intro')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login xatosi!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #040010 0%, #0d0030 40%, #080018 100%)' }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Rotating rings decoration */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
        {[0,1,2,3].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  260 + i * 120,
              height: 260 + i * 120,
              border: `1px solid ${i % 2 === 0 ? '#9b4dff' : '#ff2d78'}`,
              opacity: 0.06 + i * 0.02,
              left: '27%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 18 + i * 6, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Left panel — decorative */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative z-10">
        <div className="text-center px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <motion.div
              className="text-8xl mb-8 inline-block"
              animate={{ y: [-8, 8, -8], rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🎵
            </motion.div>

            <div className="font-display font-black leading-none mb-4">
              <div
                className="text-7xl"
                style={{ color: '#00f0ff', textShadow: '0 0 50px #00f0ff, 0 0 100px rgba(0,240,255,0.3)' }}
              >
                BEAT
              </div>
              <div
                className="text-7xl"
                style={{ color: '#ff2d78', textShadow: '0 0 50px #ff2d78, 0 0 100px rgba(255,45,120,0.3)' }}
              >
                TRICK
              </div>
              <div
                className="text-4xl tracking-[0.3em] mt-1"
                style={{ color: '#ffe135', textShadow: '0 0 30px #ffe135' }}
              >
                WORLDS
              </div>
            </div>

            <p className="text-white/30 text-sm font-body tracking-wider mt-6 max-w-xs mx-auto">
              Musiqa ritmiga mos tugmalarni bos. Trickdan qoch. Rekord qo'y.
            </p>

            <div className="flex gap-3 justify-center mt-8 flex-wrap">
              {['🌿','🌆','🌊','🚀','🌋','🧊','⚡'].map((w, i) => (
                <motion.span
                  key={i}
                  className="text-2xl cursor-default"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.18 }}
                  title={['Forest','Neon City','Ocean','Space','Lava','Ice','Cyber God'][i]}
                >
                  {w}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="font-display font-black text-4xl">
              <span style={{ color: '#00f0ff' }}>BEAT</span>
              <span className="text-white/20 mx-2">·</span>
              <span style={{ color: '#ff2d78' }}>TRICK</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-black text-3xl text-white">Xush kelibsiz!</h2>
            <p className="text-white/40 text-sm font-body mt-1">Hisobingizga kiring va o'ynashni boshlang</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'username', label: 'Username / Email', type: 'text',     placeholder: 'player123' },
              { key: 'password', label: 'Parol',            type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
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
                    background: focused === key ? 'rgba(155,77,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${focused === key ? '#9b4dff' : 'rgba(155,77,255,0.2)'}`,
                  }}
                />
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-xl font-display font-black text-sm tracking-widest mt-2 text-white"
              style={{
                background: 'linear-gradient(135deg, #9b4dff 0%, #ff2d78 100%)',
                boxShadow: '0 0 30px rgba(155,77,255,0.5), 0 0 60px rgba(255,45,120,0.2)',
              }}
            >
              {loading ? <Spinner size="sm" /> : 'KIRISH →'}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs font-display">YOKI</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-display font-bold text-xs tracking-widest text-center transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              YANGI AKKAUNT YARATISH
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
