'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiUser,
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiKey,
  FiCheckCircle,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi'
import useStore from '../../store/useStore'
import { authAPI } from '../../lib/api'
import Spinner from '../ui/Spinner'
import BorderBeam from '../ui/BorderBeam'
import MouseSpotlight from '../ui/MouseSpotlight'

/**
 * TikTok @code_candy style Cyberpunk Glassmorphic Auth Card.
 * Unified sliding tab interface for Login, Register & Instant Password Recovery.
 */
export default function CyberAuthCard({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  // Forms state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', confirm: '' })

  // Forgot Password state
  const [forgotStep, setForgotStep] = useState(1) // 1: identify, 2: verify & reset
  const [forgotForm, setForgotForm] = useState({
    identifier: '',
    code: '',
    newPassword: '',
    confirm: '',
  })
  const [receivedCode, setReceivedCode] = useState('')

  const { setAuth } = useStore()
  const router = useRouter()

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!loginForm.username || !loginForm.password) {
      return toast.error("Barcha maydonlarni to'ldiring!")
    }
    if (loginForm.password.length < 6) {
      return toast.error("Parol kamida 6 ta belgi bo'lishi kerak!")
    }
    setLoading(true)
    try {
      const { data } = await authAPI.login(loginForm)
      setAuth(data.user, data.token)
      toast.success(`Xush kelibsiz, ${data.user.username}! 🎧`)
      router.push('/intro')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login xatosi! Parol yoki username noto\'g\'ri.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    if (!regForm.username || !regForm.email || !regForm.password) {
      return toast.error("Barcha maydonlarni to'ldiring!")
    }
    if (regForm.username.length < 3) {
      return toast.error("Foydalanuvchi nomi kamida 3 ta belgi bo'lishi kerak!")
    }
    if (regForm.password.length < 6) {
      return toast.error("Parol kamida 6 ta belgi bo'lishi kerak!")
    }
    if (regForm.password !== regForm.confirm) {
      return toast.error("Parollar mos kelmadi!")
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register({
        username: regForm.username,
        email: regForm.email,
        password: regForm.password,
      })
      setAuth(data.user, data.token)
      toast.success(`Akkaunt yaratildi! Xush kelibsiz, ${data.user.username}! 🚀`)
      router.push('/intro')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik!')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!forgotForm.identifier.trim()) {
      return toast.error("Email yoki usernameni kiriting!")
    }
    setLoading(true)
    try {
      const { data } = await authAPI.forgotPassword({ identifier: forgotForm.identifier.trim() })
      setReceivedCode(data.code || '')
      setForgotForm((p) => ({ ...p, code: data.code || '' }))
      setForgotStep(2)
      toast.success(data.message || 'Tasdiqlash kodi yaratildi!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Akkaunt topilmadi!')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!forgotForm.code || !forgotForm.newPassword || !forgotForm.confirm) {
      return toast.error("Barcha maydonlarni to'ldiring!")
    }
    if (forgotForm.newPassword.length < 6) {
      return toast.error("Yangi parol kamida 6 ta belgi bo'lishi kerak!")
    }
    if (forgotForm.newPassword !== forgotForm.confirm) {
      return toast.error("Yangi parollar bir-biriga mos kelmadi!")
    }
    setLoading(true)
    try {
      const { data } = await authAPI.resetPassword({
        identifier: forgotForm.identifier.trim(),
        code: forgotForm.code.trim(),
        newPassword: forgotForm.newPassword,
      })
      if (data.token && data.user) {
        setAuth(data.user, data.token)
        toast.success("Parol muvaffaqiyatli yangilandi! Xush kelibsiz! ⚡")
        router.push('/intro')
      } else {
        toast.success("Parol yangilandi! Endi tizimga kiring.")
        setMode('login')
        setForgotStep(1)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kodni tekshirishda xatolik!')
    } finally {
      setLoading(false)
    }
  }

  const getThemeColor = () => {
    if (mode === 'register') return '#00ff87'
    if (mode === 'forgot') return '#ffe135'
    return '#00f0ff'
  }

  return (
    <MouseSpotlight
      spotlightColor={
        mode === 'register'
          ? 'rgba(0, 255, 135, 0.22)'
          : mode === 'forgot'
          ? 'rgba(255, 225, 53, 0.2)'
          : 'rgba(0, 240, 255, 0.22)'
      }
      className="w-full max-w-md rounded-3xl p-8 relative backdrop-blur-2xl transition-all duration-500 shadow-2xl"
      style={{
        background: 'rgba(8, 8, 22, 0.88)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow:
          mode === 'register'
            ? '0 0 50px rgba(0, 255, 135, 0.15), inset 0 0 30px rgba(0, 255, 135, 0.05)'
            : mode === 'forgot'
            ? '0 0 50px rgba(255, 225, 53, 0.15), inset 0 0 30px rgba(255, 225, 53, 0.05)'
            : '0 0 50px rgba(0, 240, 255, 0.15), inset 0 0 30px rgba(0, 240, 255, 0.05)',
      }}
    >
      {/* Animated Rotating Laser Border (TikTok effect) */}
      <BorderBeam
        size={280}
        duration={5}
        colorFrom={getThemeColor()}
        colorTo={mode === 'forgot' ? '#ff2d78' : mode === 'register' ? '#00f0ff' : '#ff2d78'}
      />

      {/* Header & Logo */}
      <div className="text-center mb-6 relative z-10">
        <motion.div
          className="text-5xl inline-block mb-3"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {mode === 'login' ? '⚡' : mode === 'register' ? '🚀' : '🔑'}
        </motion.div>
        <h2 className="font-display font-black text-2xl tracking-wider text-white">
          BEAT TRICK <span style={{ color: getThemeColor() }}>WORLDS</span>
        </h2>
        <p className="text-white/40 text-xs font-body mt-1">
          {mode === 'login'
            ? 'Musiqa olamiga kiring va reflekslaringizni sinang'
            : mode === 'register'
            ? "Yangi ritm jangchisi bo'lib ro'yxatdan o'ting"
            : 'Akkaunt parolini 6 xonali kod bilan xavfsiz tiklash'}
        </p>
      </div>

      {/* TikTok Segmented Toggle Switch (if in forgot mode, shows back to login pill) */}
      {mode === 'forgot' ? (
        <div className="flex items-center justify-between mb-7 px-1 z-10 relative">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setForgotStep(1)
            }}
            className="flex items-center gap-2 text-xs font-display font-bold text-white/60 hover:text-white transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/10"
          >
            <FiArrowLeft size={14} />
            <span>KIRISHGA QAYTISH</span>
          </button>
          <span className="text-[0.65rem] font-display font-bold text-[#ffe135] bg-[#ffe135]/10 px-2.5 py-1 rounded-full border border-[#ffe135]/30">
            {forgotStep === 1 ? '1-BOSQICH: EMAIL' : '2-BOSQICH: YANGI PAROL'}
          </span>
        </div>
      ) : (
        <div
          className="relative flex p-1.5 rounded-2xl mb-7 z-10"
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`relative flex-1 py-3 text-xs font-display font-black tracking-widest rounded-xl transition-colors duration-200 z-10 ${
              mode === 'login' ? 'text-black' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="auth-active-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff 0%, #00b4d8 100%)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10">KIRISH</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('register')}
            className={`relative flex-1 py-3 text-xs font-display font-black tracking-widest rounded-xl transition-colors duration-200 z-10 ${
              mode === 'register' ? 'text-black' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="auth-active-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #00ff87 0%, #00f0ff 100%)',
                  boxShadow: '0 0 20px rgba(0, 255, 135, 0.6)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10">RO'YXATDAN O'TISH</span>
          </button>
        </div>
      )}

      {/* Forms Area */}
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleLoginSubmit}
            className="space-y-4 relative z-10"
          >
            {/* Username / Email */}
            <div>
              <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1.5">
                Username yoki Email
              </label>
              <div
                className="relative rounded-xl transition-all duration-300"
                style={{
                  background: focusedField === 'login-user' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${focusedField === 'login-user' ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                  boxShadow: focusedField === 'login-user' ? '0 0 16px rgba(0, 240, 255, 0.3)' : 'none',
                }}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <FiUser size={16} />
                </div>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                  onFocus={() => setFocusedField('login-user')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="player123"
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50">
                  Parol
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setForgotStep(1)
                  }}
                  className="text-[0.68rem] font-display text-[#00f0ff]/80 hover:text-[#00f0ff] hover:underline transition-colors cursor-pointer"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <div
                className="relative rounded-xl transition-all duration-300"
                style={{
                  background: focusedField === 'login-pass' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${focusedField === 'login-pass' ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                  boxShadow: focusedField === 'login-pass' ? '0 0 16px rgba(0, 240, 255, 0.3)' : 'none',
                }}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <FiLock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                  onFocus={() => setFocusedField('login-pass')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full bg-transparent pl-11 pr-11 py-3.5 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-display font-black text-sm tracking-widest uppercase mt-4 text-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #ff2d78 100%)',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(255, 45, 120, 0.25)',
              }}
            >
              {loading ? (
                <Spinner size="sm" color="#000" />
              ) : (
                <>
                  <span>KIRISH</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </motion.button>
          </motion.form>
        ) : mode === 'register' ? (
          <motion.form
            key="register-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleRegSubmit}
            className="space-y-3.5 relative z-10"
          >
            {/* Username */}
            <div>
              <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                Foydalanuvchi nomi
              </label>
              <div
                className="relative rounded-xl transition-all duration-300"
                style={{
                  background: focusedField === 'reg-user' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${focusedField === 'reg-user' ? '#00ff87' : 'rgba(255, 255, 255, 0.1)'}`,
                  boxShadow: focusedField === 'reg-user' ? '0 0 16px rgba(0, 255, 135, 0.3)' : 'none',
                }}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <FiUser size={16} />
                </div>
                <input
                  type="text"
                  value={regForm.username}
                  onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))}
                  onFocus={() => setFocusedField('reg-user')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="BeatMaster_UZ"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                Email
              </label>
              <div
                className="relative rounded-xl transition-all duration-300"
                style={{
                  background: focusedField === 'reg-email' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${focusedField === 'reg-email' ? '#00ff87' : 'rgba(255, 255, 255, 0.1)'}`,
                  boxShadow: focusedField === 'reg-email' ? '0 0 16px rgba(0, 255, 135, 0.3)' : 'none',
                }}
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <FiMail size={16} />
                </div>
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                  onFocus={() => setFocusedField('reg-email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="player@mail.com"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                  Parol
                </label>
                <div
                  className="relative rounded-xl transition-all duration-300"
                  style={{
                    background: focusedField === 'reg-pass' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1.5px solid ${focusedField === 'reg-pass' ? '#00ff87' : 'rgba(255, 255, 255, 0.1)'}`,
                  }}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regForm.password}
                    onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                    onFocus={() => setFocusedField('reg-pass')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3 py-3 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                  Tasdiqlang
                </label>
                <div
                  className="relative rounded-xl transition-all duration-300"
                  style={{
                    background: focusedField === 'reg-conf' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1.5px solid ${focusedField === 'reg-conf' ? '#00ff87' : 'rgba(255, 255, 255, 0.1)'}`,
                  }}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regForm.confirm}
                    onChange={(e) => setRegForm((p) => ({ ...p, confirm: e.target.value }))}
                    onFocus={() => setFocusedField('reg-conf')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full bg-transparent px-3 py-3 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-display font-black text-sm tracking-widest uppercase mt-4 text-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #00ff87 0%, #00f0ff 100%)',
                boxShadow: '0 0 30px rgba(0, 255, 135, 0.5), 0 0 60px rgba(0, 240, 255, 0.25)',
              }}
            >
              {loading ? (
                <Spinner size="sm" color="#000" />
              ) : (
                <>
                  <span>RO'YXATDAN O'TISH</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          /* Forgot Password View */
          <motion.div
            key="forgot-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 relative z-10"
          >
            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-[#ffe135] mb-1.5">
                    Email yoki Foydalanuvchi nomi
                  </label>
                  <div
                    className="relative rounded-xl transition-all duration-300"
                    style={{
                      background: 'rgba(255, 225, 53, 0.05)',
                      border: '1.5px solid rgba(255, 225, 53, 0.4)',
                    }}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffe135]/60">
                      <FiMail size={16} />
                    </div>
                    <input
                      type="text"
                      value={forgotForm.identifier}
                      onChange={(e) => setForgotForm((p) => ({ ...p, identifier: e.target.value }))}
                      placeholder="player@mail.com yoki username"
                      className="w-full bg-transparent pl-11 pr-4 py-3.5 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[0.7rem] text-white/60 font-body">
                  💡 Akkauntga biriktirilgan email yoki usernameni kiritsangiz, tizim sizga 6 xonali maxsus tiklash kodini taqdim etadi.
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl font-display font-black text-sm tracking-widest uppercase text-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #ffe135 0%, #ff8c00 100%)',
                    boxShadow: '0 0 30px rgba(255, 225, 53, 0.4)',
                  }}
                >
                  {loading ? (
                    <Spinner size="sm" color="#000" />
                  ) : (
                    <>
                      <span>TIKLASH KODINI OLISH</span>
                      <FiArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3.5">
                {/* Code notification card */}
                {receivedCode && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 rounded-2xl flex items-center justify-between"
                    style={{
                      background: 'rgba(255, 225, 53, 0.12)',
                      border: '1.5px solid rgba(255, 225, 53, 0.4)',
                    }}
                  >
                    <div>
                      <div className="text-[0.65rem] font-display font-bold text-[#ffe135]">
                        TASDIQLASH KODI:
                      </div>
                      <div className="font-mono text-xl font-black tracking-widest text-white mt-0.5">
                        {receivedCode}
                      </div>
                    </div>
                    <div className="text-[0.65rem] text-right text-white/60 font-body">
                      15 daqiqa davomida<br />amal qiladi
                    </div>
                  </motion.div>
                )}

                {/* Code Input */}
                <div>
                  <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-[#ffe135] mb-1">
                    6 xonali tasdiqlash kodi
                  </label>
                  <div
                    className="relative rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid rgba(255, 225, 53, 0.3)',
                    }}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffe135]/60">
                      <FiKey size={16} />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotForm.code}
                      onChange={(e) => setForgotForm((p) => ({ ...p, code: e.target.value }))}
                      placeholder="Masalan: 489201"
                      className="w-full bg-transparent pl-11 pr-4 py-3 text-white text-sm font-mono tracking-widest focus:outline-none"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                    Yangi Parol
                  </label>
                  <div
                    className="relative rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <FiLock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={forgotForm.newPassword}
                      onChange={(e) => setForgotForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Kamida 6 ta belgi"
                      className="w-full bg-transparent pl-11 pr-11 py-3 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[0.65rem] font-display font-bold uppercase tracking-widest text-white/50 mb-1">
                    Yangi Parolni Tasdiqlang
                  </label>
                  <div
                    className="relative rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1.5px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <FiLock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={forgotForm.confirm}
                      onChange={(e) => setForgotForm((p) => ({ ...p, confirm: e.target.value }))}
                      placeholder="Yangi parolni qayta kiriting"
                      className="w-full bg-transparent pl-11 pr-4 py-3 text-white text-sm font-body focus:outline-none placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-display flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <FiRefreshCw size={13} />
                    <span>Qayta kod</span>
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl font-display font-black text-xs tracking-wider uppercase text-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #ffe135 0%, #ff8c00 100%)',
                      boxShadow: '0 0 25px rgba(255, 225, 53, 0.4)',
                    }}
                  >
                    {loading ? (
                      <Spinner size="sm" color="#000" />
                    ) : (
                      <>
                        <FiCheckCircle size={15} />
                        <span>TIKLASH VA KIRISH</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 text-center text-white/30 text-[0.7rem] font-body">
        Beat Trick: Worlds • Cyberpunk Rhythm Odyssey © 2026
      </div>
    </MouseSpotlight>
  )
}
