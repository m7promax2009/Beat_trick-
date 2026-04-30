/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        beat: {
          bg:      '#06060f',
          surface: '#0d0d1e',
          card:    '#12122a',
          border:  '#1e1e40',
          cyan:    '#00f0ff',
          pink:    '#ff2d78',
          green:   '#00ff87',
          orange:  '#ff7c2a',
          purple:  '#9b4dff',
          yellow:  '#ffe135',
          red:     '#ff3030',
        },
      },
      boxShadow: {
        'neon-cyan':   '0 0 15px rgba(0,240,255,0.6), 0 0 40px rgba(0,240,255,0.3)',
        'neon-pink':   '0 0 15px rgba(255,45,120,0.6), 0 0 40px rgba(255,45,120,0.3)',
        'neon-green':  '0 0 15px rgba(0,255,135,0.6), 0 0 40px rgba(0,255,135,0.3)',
        'neon-red':    '0 0 15px rgba(255,48,48,0.7), 0 0 50px rgba(255,48,48,0.4)',
        'neon-purple': '0 0 15px rgba(155,77,255,0.6), 0 0 40px rgba(155,77,255,0.3)',
      },
      keyframes: {
        'beat-pulse': {
          '0%,100%': { transform: 'scale(1)',    boxShadow: '0 0 15px currentColor' },
          '50%':     { transform: 'scale(1.08)', boxShadow: '0 0 40px currentColor, 0 0 80px currentColor' },
        },
        'btn-appear': {
          '0%':   { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '70%':  { transform: 'scale(1.12) rotate(3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)',   opacity: '1' },
        },
        'btn-hit': {
          '0%':   { transform: 'scale(1)' },
          '30%':  { transform: 'scale(0.88)' },
          '60%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'score-float': {
          '0%':   { transform: 'translateY(0) scale(1)',    opacity: '1' },
          '100%': { transform: 'translateY(-70px) scale(0.7)', opacity: '0' },
        },
        'shake': {
          '0%,100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-6px, 4px)' },
          '40%': { transform: 'translate(6px,-4px)' },
          '60%': { transform: 'translate(-4px,-6px)' },
          '80%': { transform: 'translate(4px, 6px)' },
        },
        'ripple': {
          '0%':   { transform: 'translate(-50%,-50%) scale(0)', opacity: '0.8' },
          '100%': { transform: 'translate(-50%,-50%) scale(4)', opacity: '0' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'scanline': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      animation: {
        'beat-pulse':  'beat-pulse 0.6s ease-in-out infinite',
        'btn-appear':  'btn-appear 0.25s cubic-bezier(.34,1.56,.64,1) forwards',
        'btn-hit':     'btn-hit 0.2s ease-out forwards',
        'score-float': 'score-float 0.85s ease-out forwards',
        'shake':       'shake 0.35s ease-in-out',
        'ripple':      'ripple 0.6s ease-out forwards',
        'glow-pulse':  'glow-pulse 2s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s ease-out forwards',
        'scanline':    'scanline 8s linear infinite',
      },
    },
  },
  plugins: [],
}
