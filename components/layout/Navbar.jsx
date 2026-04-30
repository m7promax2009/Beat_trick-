'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useStore from '../../store/useStore'
import { FiHome, FiUser, FiShoppingCart, FiSettings, FiLogOut } from 'react-icons/fi'
import { GiTrophy } from 'react-icons/gi'
import { HiMusicNote } from 'react-icons/hi'

const NAV_LINKS = [
  { href: '/',            icon: <FiHome size={15} />,        label: 'Menu' },
  { href: '/leaderboard', icon: <GiTrophy size={15} />,      label: 'Ranking' },
  { href: '/shop',        icon: <FiShoppingCart size={15} />, label: 'Shop' },
  { href: '/profile',     icon: <FiUser size={15} />,        label: 'Profil' },
  { href: '/settings',    icon: <FiSettings size={15} />,    label: 'Sozlama' },
]

export default function Navbar() {
  const { user, logout } = useStore()
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = () => { logout(); router.push('/') }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-8"
      style={{ background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,30,64,0.8)' }}>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <HiMusicNote className="text-[#00f0ff] group-hover:text-[#ff2d78] transition-colors" size={18} />
        <span className="font-display font-black text-sm tracking-widest"
          style={{ color: '#00f0ff', textShadow: '0 0 15px #00f0ff' }}>
          BEAT TRICK
        </span>
      </Link>

      {/* Nav links — only if logged in */}
      {user ? (
        <div className="flex items-center gap-1">
          {/* Score badge */}
          <div className="hidden md:flex items-center gap-3 bg-beat-card border border-beat-border rounded px-3 py-1.5 mr-2 text-xs font-display">
            <span style={{ color: '#ffe135' }}>🪙 {user.coins ?? 0}</span>
            <span className="text-beat-border">|</span>
            <span style={{ color: '#00f0ff' }}>Lv.{user.level ?? 1}</span>
          </div>

          {NAV_LINKS.map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`w-9 h-9 flex items-center justify-center rounded transition-all tooltip-group relative
                ${pathname === href ? 'text-[#00f0ff] bg-[#00f0ff]/10' : 'text-white/30 hover:text-white/80 hover:bg-white/5'}`}>
              {icon}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded text-white/30 hover:text-[#ff3030] hover:bg-[#ff3030]/10 transition-all">
            <FiLogOut size={15} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Link href="/login"
            className="font-display text-xs text-[#00f0ff] border border-[#00f0ff]/30 hover:border-[#00f0ff] rounded px-3 py-1.5 transition-all">
            KIRISH
          </Link>
          <Link href="/register"
            className="font-display text-xs bg-[#00f0ff] text-black rounded px-3 py-1.5 font-bold hover:shadow-neon-cyan transition-all">
            ROYXAT
          </Link>
        </div>
      )}
    </nav>
  )
}
