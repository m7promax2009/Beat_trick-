'use client'
import { cn } from '../../lib/utils'

const variants = {
  cyan:   'border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black hover:shadow-neon-cyan',
  pink:   'border-[#ff2d78] text-[#ff2d78] hover:bg-[#ff2d78] hover:text-black hover:shadow-neon-pink',
  green:  'border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87] hover:text-black hover:shadow-neon-green',
  yellow: 'border-[#ffe135] text-[#ffe135] hover:bg-[#ffe135] hover:text-black hover:shadow-[0_0_30px_rgba(255,225,53,0.7)]',
  ghost:  'border-white/10 text-white/60 hover:border-white/40 hover:text-white',
  red:    'border-[#ff3030] text-[#ff3030] hover:bg-[#ff3030] hover:text-black hover:shadow-neon-red',
}
const sizes = {
  xs: 'px-3 py-1.5 text-[0.65rem]',
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
}

export default function NeonButton({ children, onClick, variant='cyan', size='md', className='', disabled=false, type='button', fullWidth=false }) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={cn(
        'font-display font-bold tracking-widest uppercase border-2 rounded-sm transition-all duration-200 bg-transparent cursor-pointer',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        variants[variant], sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  )
}
