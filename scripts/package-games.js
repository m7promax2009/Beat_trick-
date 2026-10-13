#!/usr/bin/env node
/**
 * Automated Multi-Platform Packaging Engine
 * Generates ready-to-upload bundles and metadata for:
 * - Yandex Games (Яндекс Игры)
 * - itch.io
 * - CrazyGames / GameJolt / Poki
 * - Vercel & Web Portals
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const FRONTEND_DIR = path.resolve(__dirname, '..')
const OUT_DIR = path.join(FRONTEND_DIR, 'out')
const DIST_ROOT = path.resolve(FRONTEND_DIR, '..', 'dist')

console.log('🚀 Starting Multi-Platform Packaging Pipeline...')

// 1. Ensure fresh export
if (!fs.existsSync(OUT_DIR) || !fs.existsSync(path.join(OUT_DIR, 'index.html'))) {
  console.log('📦 Generating fresh static export...')
  execSync('npm run export', { cwd: FRONTEND_DIR, stdio: 'inherit' })
}

// 2. Prepare output directories
const platforms = [
  { id: 'yandex-games', name: 'Yandex Games', zipName: 'beat-trick-worlds-yandex.zip' },
  { id: 'itch-io', name: 'itch.io', zipName: 'beat-trick-worlds-itch.zip' },
  { id: 'crazygames', name: 'CrazyGames & Web Portals', zipName: 'beat-trick-worlds-web.zip' },
]

if (!fs.existsSync(DIST_ROOT)) fs.mkdirSync(DIST_ROOT, { recursive: true })

platforms.forEach((p) => {
  const pDir = path.join(DIST_ROOT, p.id)
  if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true })

  const zipPath = path.join(pDir, p.zipName)
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

  console.log(`📦 Creating ${p.name} bundle: ${p.zipName}...`)
  // Zip out directory contents into root of zip
  execSync(`cd "${OUT_DIR}" && zip -r -q "${zipPath}" .`, { stdio: 'inherit' })
  const stats = fs.statSync(zipPath)
  const mb = (stats.size / (1024 * 1024)).toFixed(2)
  console.log(`✅ ${p.name} bundle ready: ${mb} MB (${zipPath})`)
})

// 3. Write Yandex Games Developer Submission Manifest & Guide
const yandexManifest = {
  app_id: 'beat-trick-worlds',
  name_uz: 'Beat Trick: Worlds — Kiber Ritm O\'yini',
  name_ru: 'Beat Trick: Worlds — Кибер Ритм Игра',
  name_en: 'Beat Trick: Worlds — Cyber Rhythm Game',
  category: 'arcade',
  subcategories: ['music', 'skill', 'action'],
  age_rating: '6+',
  orientation: 'landscape_and_portrait',
  supported_platforms: ['desktop', 'mobile', 'tablet'],
  description_uz: `🔥 Beat Trick: Worlds — kiberpank uslubidagi hayajonli ritm va refleks o'yini!
Geometry Dash uslubidagi kuchli adrenalin, tezlashuvchi to'lqinlar (Bass Drop va Demon Rush), Oltin Yulduzlar (+50 ball) va himoyalovchi Aegis qalqonlari!
Sun'iy ong murabbiyi CYBER-NEO sizga har bir harakatda maslahat beradi va AI Duelda kuch sinashadi!

Xususiyatlar:
• 7 xil betakror musiqiy dunyo (Forest Pulse dan Cyber God Mode gacha)
• 0% dan 100% gacha bo'lgan to'liq trek progressi
• Oltin Yulduz 🌟 va Qalqon 🛡️ mexanikasi
• Q, W, E / A, S, D / Z, X, C yoki Bo'shliq (Spacebar) orqali klaviatura boshqaruvi
• Spacebar orqali bir zumda qayta boshlash (Instant Respawn)`,
  description_ru: `🔥 Beat Trick: Worlds — захватывающий киберпанк ритм-раннер и тест на реакцию в стиле Geometry Dash!
Прокачивайте свои рефлексы под мощные электронные треки: от спокойных волн до безумного Demon Rush!
Ваш персональный нейро-наставник CYBER-NEO подскажет лучшую тактику и сразится с вами в режиме AI Duel!

Особенности игры:
• 7 уникальных неоновых миров с нарастающим BPM
• Прогресс трека от 0% до 100% с волнами Bass Drop
• Золотые бонусные звёзды 🌟 (+50 очков) и щиты Aegis 🛡️
• Полное управление клавишами Q, W, E / A, S, D / Space
• Мгновенный перезапуск по клавише Пробел (Instant Respawn)`,
  controls: {
    desktop: 'Klaviatura (Q, W, E / A, S, D / Z, X, C), Sichqoncha yoki Bo\'shliq (Spacebar)',
    mobile: 'Ekrandagi neon ritm tugmalarini bosish',
  },
}

fs.writeFileSync(
  path.join(DIST_ROOT, 'yandex-games', 'yandex-submission-info.json'),
  JSON.stringify(yandexManifest, null, 2),
  'utf8'
)

// 4. Write itch.io Submission Guide
const itchGuide = `# Beat Trick: Worlds — itch.io Release Guide

## 🎮 Game Info
- **Title:** Beat Trick: Worlds
- **Genre:** Rhythm / Music / Cyberpunk Arcade
- **Engine / Tech:** HTML5 / React 18 / Next.js Static WebGL
- **Embed Dimensions:** 1280 x 720 (Responsive, Aspect Ratio 16:9)
- **Viewport Options:** "Fullscreen button" ENABLED, "Mobile friendly" ENABLED

## 📦 How to Upload to itch.io:
1. Go to https://itch.io/game/new
2. Title: **Beat Trick: Worlds**
3. Classification: **Games**
4. Kind of project: **HTML (You have a ZIP file that plays in the browser)**
5. Upload file: Select \`dist/itch-io/beat-trick-worlds-itch.zip\`
6. Check **"This file will be played in the browser"**
7. Set viewport: 1280 x 720 (or Responsive)
8. Paste Description from \`dist/DISTRIBUTION_KIT.md\`
9. Click **Save & View Page**!
`
fs.writeFileSync(path.join(DIST_ROOT, 'itch-io', 'README.md'), itchGuide, 'utf8')

// 5. Write Universal Distribution Kit (Press Kit & Social Broadcast Copy)
const distributionKit = `# 🚀 BEAT TRICK: WORLDS — UNIVERSAL DISTRIBUTION & MARKETING KIT

## 📦 Generated Release Archives:
1. **Yandex Games Archive:** \`dist/yandex-games/beat-trick-worlds-yandex.zip\`
2. **itch.io Archive:** \`dist/itch-io/beat-trick-worlds-itch.zip\`
3. **CrazyGames / Generic Web Archive:** \`dist/crazygames/beat-trick-worlds-web.zip\`

---

## 📢 Telegram Post (O'zbekcha) — Tayyor Matn:
\`\`\`markdown
🔥 **Yangi O'zbek Kiberpank O'yini Chiqdi: BEAT TRICK: WORLDS! 🎧⚡**

Do'stlar, Geometry Dash va Beat Saber uslubidagi o'ta hayajonli ritm o'yini tayyor bo'ldi!

🎮 **O'yinda nimalar bor:**
• 🎵 7 ta kiber dunyo (80 BPM dan 260 BPM Cyber God darajasigacha)
• ⚡ 0% dan 100% gacha to'liq trek progressi & Bass Drop to'lqinlari
• 🌟 Oltin Yulduzlar (+50 Fever) va 🛡️ Aegis qalqonlari
• 🧠 O'yindagi sun'iy ong murabbiyi CYBER-NEO bilan jonli duel!
• ⌨️ Spacebar va klaviatura yordamida tezkor boshqaruv

👉 **Hoziroq bepul o'ynab ko'ring va o'z rekordingizni izohlarda qoldiring:**
[O'yinga kirish](https://beat-trick-worlds.vercel.app/game)

Siz necha foizga yetib borda olasiz? 💀
\`\`\`

---

## 📢 Telegram Post (Русский) — Готовый Текст:
\`\`\`markdown
🔥 **Встречайте BEAT TRICK: WORLDS — Адреналиновый Киберпанк Ритм-Раннер! 🎧⚡**

Любите Geometry Dash и динамичные музыкальные аркады? Мы создали игру, которая испытает ваши пальцы и реакцию на 100%!

🎮 **Фичи игры:**
• 7 уникальных неоновых миров с нарастающим BPM
• Прогресс трека 0% → 100% с волнами Bass Drop и Demon Rush
• Бонусные звёзды 🌟 (+50 очков) и защитные щиты 🛡️
• Встроенный ИИ-наставник CYBER-NEO с режимом дуэли
• Мгновенный перезапуск на Пробел (Instant Respawn)

👉 **Играйте прямо в браузере (ПК и смартфон):**
[Играть в Beat Trick](https://beat-trick-worlds.vercel.app/game)

Попробуйте дойти до 100% и делитесь вашим лучшим процентом в комментариях! 👑
\`\`\`

---

## 🌐 Publishing Checklist:
- [x] HTML5 Static Bundle Export (\`index.html\` at root)
- [x] Yandex Games SDK Bridge v2 (Interstitial & Leaderboard)
- [x] Telegram WebApp SDK Integration
- [x] itch.io 16:9 Responsive Viewport Optimization
- [x] Zero-Downtime Vercel Live Deployment
`
fs.writeFileSync(path.join(DIST_ROOT, 'DISTRIBUTION_KIT.md'), distributionKit, 'utf8')

console.log('🎉 Multi-Platform Packaging Pipeline Completed Successfully!')
console.log(`📁 All distribution packages ready in: ${DIST_ROOT}`)
