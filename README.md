# 🎵 Beat Trick: Worlds — Frontend

**Next.js 14 + Tailwind CSS + Framer Motion + Zustand**

---

## 📁 Loyiha Arxitekturasi

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.js                  # Root layout (fonts, toaster)
│   ├── globals.css                # Tailwind + custom CSS vars
│   ├── page.js                    # / — Landing page (HomePage)
│   ├── login/page.js              # /login
│   ├── register/page.js           # /register
│   ├── game/
│   │   ├── page.js                # /game — Main game screen
│   │   └── result/page.js         # /game/result — Score screen
│   ├── leaderboard/page.js        # /leaderboard
│   ├── shop/page.js               # /shop
│   ├── profile/page.js            # /profile
│   └── settings/page.js           # /settings
│
├── components/
│   ├── ui/
│   │   ├── NeonButton.jsx         # Reusable neon button (variants: cyan/pink/green/yellow/ghost/red)
│   │   ├── GlassCard.jsx          # Glassmorphism card
│   │   ├── Spinner.jsx            # Loading spinner
│   │   └── StatBadge.jsx          # Stat display card
│   ├── game/
│   │   ├── BeatButton.jsx         # Interactive beat button (normal + trick)
│   │   ├── ComboDisplay.jsx       # Animated combo counter
│   │   ├── LivesDisplay.jsx       # Hearts display
│   │   ├── ScorePopup.jsx         # Floating score popup (+10 PERFECT etc)
│   │   ├── CountdownOverlay.jsx   # 3-2-1-♪ countdown
│   │   ├── BeatVisualizer.jsx     # Audio frequency canvas visualizer
│   │   └── WorldBackground.jsx    # Particle effects per world
│   └── layout/
│       ├── Navbar.jsx             # Top nav bar
│       └── ProtectedRoute.jsx     # Auth guard wrapper
│
├── hooks/
│   ├── useAudio.js                # Web Audio API hook (load/play/sfx)
│   └── useBeatEngine.js           # Beat timing engine (spawn, expire, score)
│
├── lib/
│   ├── api.js                     # Axios instance + all API calls
│   ├── worlds.js                  # World configs, BPM calc, trick chance
│   └── utils.js                   # cn(), formatScore, msToBar, etc.
│
└── store/
    └── useStore.js                # Zustand global state (auth, game, settings)
```

---

## 🚀 Ishga Tushirish

```bash
npm install
cp .env.local.example .env.local   # API URL ni sozlang
npm run dev                         # http://localhost:3000
```

---

## 🌐 Backend API Endpoints (kerak bo'ladi)

| Method | Route | Tavsif |
|--------|-------|--------|
| POST | /api/auth/register | Ro'yxatdan o'tish |
| POST | /api/auth/login | Kirish |
| GET | /api/users/me | O'z profil |
| GET | /api/users/:username | Boshqa profil |
| GET | /api/tracks/random?level=N | Random musiqa + BPM |
| POST | /api/game/result | O'yin natijasini saqlash |
| GET | /api/game/history | O'yin tarixi |
| GET | /api/leaderboard?type=global|weekly|daily | Rating |
| GET | /api/shop | Shop itemlari |
| POST | /api/shop/buy | Item sotib olish |

### Track Response Format
```json
{
  "id": "track_123",
  "title": "Forest Pulse",
  "url": "https://your-cdn.com/tracks/forest.mp3",
  "bpm": 92,
  "worldId": "forest",
  "levelMin": 1,
  "levelMax": 10
}
```

---

## 🎮 O'yin Mexanikasi

- **beatInterval** = `60000 / BPM` ms
- Tugmalar har beatda chiqadi
- **Normal tugma** → bosilmasa hayot kamayadi
- **Trick tugma** → bosilsa hayot kamayadi (bosilmasa — xavfsiz)
- **Timing grading:**
  - `< 200ms` → PERFECT (+15)
  - `< 400ms` → GREAT (+10)
  - `< 600ms` → GOOD (+5)
  - rest → LATE (+2)
- **Combo multiplier:** 1x → 1.2x → 1.5x → 1.8x → 2x → 2.5x → 3x

---

## 🎨 Design

**Dark Cyberpunk Neon** uslubi:
- Font: **Orbitron** (display) + **Exo 2** (body)
- Asosiy rang: `#00f0ff` (cyan)
- Aksent: `#ff2d78` (pink)
- Background: `#06060f`
- Har dunyo o'z rang palitrasiga ega

---

## 🔧 Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
