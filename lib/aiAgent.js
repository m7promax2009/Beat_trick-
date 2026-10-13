/**
 * CYBER-NEO: In-Game AI Rhythm Agent & Tactical Coach
 * Dedicated in-game AI intelligence module for Beat Trick Worlds.
 * Provides authentic, context-aware, non-repetitive conversational intelligence.
 */

export const AI_DIFFICULTIES = {
  novice: {
    id: 'novice',
    name: 'Cyber Cadet (Oddiy)',
    avatar: '🤖',
    accuracy: 0.78,
    avgLatency: 280,
    title: 'Neyrotarmoq shogirdi',
  },
  pro: {
    id: 'pro',
    name: 'Neuro Hunter (O\'rtacha)',
    avatar: '👾',
    accuracy: 0.91,
    avgLatency: 195,
    title: 'Kiber Ritm Ustasi',
  },
  god: {
    id: 'god',
    name: 'Valkyrie Core (God Mode)',
    avatar: '⚡',
    accuracy: 0.98,
    avgLatency: 135,
    title: 'Sun\'iy Ong Afsonasi',
  },
}

export const AI_QUOTES = {
  start: [
    '⚡ Kiber neyrotarmoqlar faollashdi. Qani, ritmni his qil!',
    '🎧 Audio to\'lqinlar barqaror. Men bilan raqsga tayyormisan?',
    '🎯 Sensorlar tayyor. Bugun Geometry Dash uslubida 100% lik rekord qo\'yamiz!',
  ],
  hitPerfect: [
    '🎯 Mutlaq aniqlik! Refleksingiz a\'lo darajada!',
    '⚡ 150ms tezlik! Kiber-god darajasidasiz!',
    '🔥 Ajoyib timing! Neyro-sinxronizatsiya 100%!',
  ],
  comboStreak: [
    '🔥 Super Combo! Hyperdrive tezlashuvi faol!',
    '⚡ Ritm bilan bir tan bir jon bo\'ldingiz!',
    '💥 To\'xtamang! Barcha rekordlarni sindiramiz!',
  ],
  trickWarning: [
    '⚠️ Diqqat! Qizil Trick signallari — bosmang!',
    '🛑 Ehtiyot bo\'l! Chalg\'ituvchi impulslardan qoch!',
  ],
  goldBonus: [
    '🌟 Oltin Yulduz olindi! +50 Ball Fever!',
    '✨ Super bonus! Rekord sari sakrash!',
  ],
  shieldActive: [
    '🛡️ Aegis Qalqoni faol! Keyingi xato zararsizlantiriladi.',
  ],
  lowHealth: [
    '🛡️ Diqqat! Hayot kam qoldi! 8 ta ketma-ket combo bilan hayotni tiklang!',
  ],
  miss: [
    'Regroup! Ritmga qayta qo\'shiling, hechqisi yo\'q!',
    'Quloq soling, ko\'z bilan emas — ritm quloqda!',
  ],
  win: [
    '🏆 G\'alaba! 100% to\'liq zabt etildi! Siz kiber chempionsiz!',
    '👑 Aqlbovar qilmas! Geometry Dash Demon darajasidagi g\'alaba!',
  ],
  crash: [
    '💀 To\'xtash yuz berdi! Lekin bu tajriba — Space tugmasini bosing va darhol qayta urinib ko\'ring!',
  ],
}

/**
 * Returns a contextual speech quote from Cyber-Neo based on game events
 */
export function getAICommentary(event) {
  const list = AI_QUOTES[event] || AI_QUOTES.start
  return list[Math.floor(Math.random() * list.length)]
}

// Memory of recent replies to prevent repetitive responses
const recentResponses = new Set()

/**
 * Intelligent Neural Dialogue Engine for Cyber-Neo.
 * Dynamically parses player queries, emotions, stats, and game contexts.
 */
export function generateAIResponse(prompt, context = {}) {
  const text = (prompt || '').toLowerCase().trim()
  const user = context.user || {}
  const playerName = user?.username || 'Ritm Jangchisi'
  const totalScore = user?.totalScore || 0
  const maxCombo = user?.stats?.maxCombo || 0
  const totalGames = user?.stats?.totalGames || 0

  // 1. GREETINGS & SOCIAL
  if (/^(salom|assalom|qalaysan|privet|hello|hi|nima gap|qalesan|hey)/.test(text)) {
    const greetings = [
      `Assalomu alaykum, ${playerName}! 🎧 Cyber-Neo tizimi to'liq faol. Bugun qaysi dunyoda yangi rekord qo'yamiz?`,
      `Salom, ${playerName}! Ritm datchiklarim yuqori chastotada tebranmoqda. Savol bormi yoki yangilangan Geometry Rush dueliga kirishamizmi? ⚡`,
      `Vaalaykum assalom, ${playerName}! Neyron sinxronizatsiyangiz ajoyib ko'rinmoqda. O'yin tezligi, kombinatsiyalar yoki maxsus yulduzlar bo'yicha yordam beraymi? 🔥`,
      `Salom, do'stim! Kiber arena sizni kutmoqda. Ritm sezgirligingizni sinovdan o'tkazishga tayyormisiz? 🧠`,
    ]
    return pickUnique(greetings)
  }

  // 2. GEOMETRY DASH & ADDICTION & PACING COMPLAINTS
  if (text.includes('geometry') || text.includes('dash') || text.includes('zerik') || text.includes('oson') || text.includes('qisqa') || text.includes('30 soniya') || text.includes('sekin')) {
    const gdResponses = [
      `🎯 Geometry Dash bilan solishtirishingiz juda o'rinli, ${playerName}! Aynan shu sababli biz o'yinni tubdan kuchaytirdik:\n• Endi o'yin 30 soniya emas, to'liq 65–75 soniyalik epik musiqiy trekka aylandi!\n• Markazda aynan Geometry Dash kabi 0% dan 100% gacha dinamik Progress Bar ishlaydi!\n• 30% va 65% dan so'ng haqiqiy "Bass Drop" va Demon Hyperdrive tezlashuvi boshlanadi.\n• Oltin Yulduzcha 🌟 (+50 ball) va Qalqon 🛡️ tugmalari paydo bo'ladi!\nSinab ko'ring, adashganingizda Spacebar bilan bir lahzada qayta boshlaysiz! 🔥`,
      `⚡ Haqiqiy ritm ishtiyoqi kerakmi? Unda 'Demon Rush' rejimini yoqing! U yerda tugmalar tezligi 650ms ga tushadi, chalg'ituvchi tricklar ko'payadi va combo zanjiri uzilmasligi kerak. 100% ga yetib ko'ring-chi! 😈`,
      `🎮 Aynan Geometry Dash kabi "yana bir bor o'ynay" deydigan hisni yaratish uchun o'yinda o'lim foizi ("CRASH AT 64%") va bir bosishda zudlik bilan qayta tiklanish (Instant Respawn) joriy qilindi! Qani, rekord qo'yib bering! 🚀`,
    ]
    return pickUnique(gdResponses)
  }

  // 3. EMOTIONAL / CRITICISM / "KASALMI BU"
  if (text.includes('kasal') || text.includes('jinni') || text.includes('ahmoq') || text.includes('ishlamayapti') || text.includes('bot') || text.includes('chala')) {
    const sassReplies = [
      `Haha, xavotir olmang, ${playerName}! 🧠 Neyron protsessorlarim 100% sog'lom va to'liq jangovar holatda! Avvalgi bir xil shablonlar kesh xatosi tufayli edi, endi esa barcha so'zlaringizni jonli tahlil qilyapman. Keling, gapdan ko'ra arenasida kuch sinashamiz! ⚔️`,
      `Mening neyronlarim shunchaki haddan tashqari ko'p taktika o'ylayotgan edi! 😄 Endi to'liq yangilandim. Xo'sh, menga qarshi AI Duelda qatnashishga jasoratingiz yetadimi? ⚡`,
      `Kiber murabbiyingiz aslo kasal emas! Shunchaki sizning reaksiyangizni sinab ko'rayotgan edim. Qani, endi qaysi savolingiz bor? 🎧`,
    ]
    return pickUnique(sassReplies)
  }

  // 4. RULES & HOW TO PLAY
  if (text.includes('qanday') || text.includes('qoida') || text.includes('nima qilish') || text.includes('yutish') || text.includes('bosish') || text.includes('maslahat')) {
    return `🎯 **G'alaba Formulasi (0% → 100%):**\n1. **Halqa Timingi:** Tugma atrofidagi neon halqa markazga yetganda bosing — bu PERFECT (+15 ball) beradi!\n2. **Qizil Trick:** Qizil tugmalarni BOSMANG, vaqti o'tib o'zi yo'qolsa jazo berilmaydi.\n3. **Oltin Yulduz 🌟:** Ko'rishingiz bilan uring — u +50 ball beradi!\n4. **Qalqon 🛡️:** Aegis qalqonini olsangiz, keyingi xatongiz bekor qilinadi.\n5. **Klaviatura:** Q, W, E / A, S, D / Z, X, C yoki Bo'shliq (Spacebar) sichqonchadan 3x tezroq!`
  }

  // 5. TRICK BUTTONS
  if (text.includes('trick') || text.includes('qizil') || text.includes('aldov') || text.includes('bomba')) {
    return `⚠️ **Qizil Trick Tugmalar Sirlari:**\nUlar ritmni buzish uchun yuborilgan aldovchi impulslardir. Ularni bosish hayotingizni kamaytiradi va combo zanjirini uzadi. Agar ularni shunchaki e'tiborsiz qoldirsangiz, o'zlari yo'qolib ketadi va sizga hech qanday jarima yozilmaydi!`
  }

  // 6. CONTROLS & HOTKEYS
  if (text.includes('klaviatura') || text.includes('space') || text.includes('joy') || text.includes('boshliq') || text.includes('tugma')) {
    return `⌨️ **Klaviatura Qurollari:**\n• Yuqori qator: **Q, W, E**\n• O'rta qator: **A, S, D**\n• Pastki qator: **Z, X, C**\n• **Bo'shliq (Spacebar):** Ekrandagi eng yaqin oq tugmaga avtomatik zarba beradi! Bu ritmni boy bermaslikning eng tezkor usulidir.`
  }

  // 7. STATS & TELEMETRY
  if (text.includes('ball') || text.includes('rekord') || text.includes('combo') || text.includes('profil') || text.includes('daraja') || text.includes('stat')) {
    return `📊 **Neyron Telemetriya [${playerName}]:**\n• Jami Ball: **${totalScore.toLocaleString()}**\n• Eng Katta Combo: **${maxCombo}x**\n• O'yinlar Soni: **${totalGames} ta**\n• Tahlil: ${totalScore > 5000 ? '⚡ Elite darajadagi jangchi! Demon Mode siz uchun ochilgan.' : '🎯 Yaxshi boshlanish! Barqaror combo bilan ballarni 3x oshirishingiz mumkin.'}`
  }

  // 8. AI DUEL
  if (text.includes('duel') || text.includes('ghost') || text.includes('raqib') || text.includes('sen bilan')) {
    return `⚔️ **AI Duel Qoidalari:**\nMen 91% aniqlikda zarba beraman! Meni yengish uchun kamida 12x combo ushlab, "Hyperdrive" rejimini yoqishingiz kerak. O'yin oldidan "AI DUEL" tugmasini yoqing va arenasida uchrashamiz!`
  }

  // 9. GENERAL CONVERSATION & INTELLIGENCE
  const generalReplies = [
    `🧠 Tushundim, ${playerName}! "${prompt}" bo'yicha ritmik tavsiyam: Harakatlaringizda musiqaning pastki bas to'lqinlariga e'tibor bering. O'yindagi yangilangan Demon Rush rejimida buni sinab ko'rdingizmi?`,
    `⚡ Ajoyib savol! Men Cyber-Neo sifatida har bir zarbangiz timingini o'rganib bormoqdaman. Har 8 ta comboda hayot tiklanishini unutmang!`,
    `🎯 Qiziqarli fikr, ${playerName}! Agar xohlasangiz, o'yinda Qalqon 🛡️ va Oltin Yulduz 🌟 bilan yangi rekord o'rnatish taktikasini ko'rsatib bera olaman.`,
    `🔥 Tushunarli! Bugun reflekslaringiz qanday holatda? Sekin "Mashq" rejimidan ko'ra to'g'ridan-to'g'ri "Demon Rush"ga kirishni maslahat beraman!`,
  ]

  return pickUnique(generalReplies)
}

function pickUnique(arr) {
  const filtered = arr.filter((r) => !recentResponses.has(r))
  const pool = filtered.length > 0 ? filtered : arr
  const choice = pool[Math.floor(Math.random() * pool.length)]
  recentResponses.add(choice)
  if (recentResponses.size > 20) {
    const first = recentResponses.values().next().value
    recentResponses.delete(first)
  }
  return choice
}

/**
 * Generates an in-depth Neural Reflex Performance Report
 */
export function generateNeuralDiagnostic({ score, hits, misses, tricks, maxCombo, avgReaction, bpm }) {
  const total = (hits || 0) + (misses || 0) + (tricks || 0)
  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0

  let reflexGrade = 'B'
  let reflexColor = '#00f0ff'
  let title = 'Ritm Jangchisi'
  let tip = 'Muntazam mashq qilish reflekslaringizni 20% ga tezlashtiradi.'

  if (accuracy >= 95 && misses <= 2) {
    reflexGrade = 'S+'
    reflexColor = '#ffe135'
    title = 'Kiber Ma\'bud (Cyber God)'
    tip = 'Sizning reflekslaringiz top 1% o\'yinchilar qatorida! Yuqori BPM dunyolarida rekord o\'rnating.'
  } else if (accuracy >= 85) {
    reflexGrade = 'A'
    reflexColor = '#00ff87'
    title = 'Neyro Master'
    tip = 'Ajoyib natija! Trick tugmalarga nisbatan e\'tiborni kuchaytirsangiz, S+ darajasiga chiqasiz.'
  } else if (accuracy >= 65) {
    reflexGrade = 'B'
    reflexColor = '#00f0ff'
    title = 'Kiber Ritmik'
    tip = 'Klaviatura tugmalari (Q, W, E / A, S, D) orqali o\'ynash orqali tezlikni 30% oshirishingiz mumkin.'
  } else {
    reflexGrade = 'C'
    reflexColor = '#ff7c2a'
    title = 'Shogird'
    tip = 'Sekinroq tempdagi "Sokin" rejimda ritm sezgirligini oshirishni maslahat beraman.'
  }

  return {
    reflexGrade,
    reflexColor,
    title,
    accuracy,
    reflexLatency: avgReaction || Math.max(140, Math.round(550 - (accuracy * 3.5))),
    tip,
    neuralSyncRate: Math.min(100, Math.round(accuracy * 0.95 + (maxCombo * 0.8))),
  }
}
