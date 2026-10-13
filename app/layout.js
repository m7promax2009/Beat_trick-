import { Orbitron, Exo_2 } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-display', weight: ['400','600','700','900'] })
const exo2 = Exo_2({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600'] })

export const metadata = {
  title: 'Beat Trick: Worlds',
  description: 'Musiqaga mos tugmalarni bos — trickdan qoch!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${orbitron.variable} ${exo2.variable}`}>
      <head>
        {/* Platform SDKs (Non-blocking, deferred) */}
        <script src="https://yandex.ru/games/sdk/v2" defer></script>
        <script src="https://telegram.org/js/telegram-web-app.js" defer></script>
      </head>
      <body className="bg-beat-bg text-white font-body antialiased overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.15) 2px, rgba(0,240,255,0.15) 4px)' }} />
        </div>
        {children}
        <Toaster position="top-center" toastOptions={{
          style: { background: '#12122a', color: '#fff', border: '1px solid #1e1e40', fontFamily: 'var(--font-body)' }
        }} />
      </body>
    </html>
  )
}
