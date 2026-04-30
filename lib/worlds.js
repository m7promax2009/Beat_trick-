export const WORLDS = [
  {
    id: 'forest',
    name: 'Forest Pulse',
    emoji: '🌿',
    levels: [1, 10],
    bpmRange: [80, 100],
    buttons: 1,
    trickBase: 0,
    difficulty: 'Easy',
    diffColor: 'text-beat-green',
    theme: {
      bg: 'from-[#021209] to-[#04200f]',
      primary: '#00ff87',
      secondary: '#00c85a',
      glow: 'rgba(0,255,135,0.4)',
      particle: 'leaf',
      borderColor: 'border-beat-green',
      glowShadow: 'shadow-neon-green',
    },
    description: 'Tabiat ritmiga qo\'shil. Sekin va aniq.',
    unlockScore: 0,
    // Frontenddagi demo treklari (istalgancha ko'paytirish mumkin)
    tracks: [
      { id: 'forest-1', title: 'Forest Pulse I',  bpm: 90,  url: 'https://example.com/audio/forest_pulse_1.mp3' },
      { id: 'forest-2', title: 'Forest Pulse II', bpm: 96,  url: 'https://example.com/audio/forest_pulse_2.mp3' },
      { id: 'forest-3', title: 'Misty Leaves',    bpm: 88,  url: 'https://example.com/audio/misty_leaves.mp3' },
    ],
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    emoji: '🌆',
    levels: [11, 25],
    bpmRange: [100, 120],
    buttons: 2,
    trickBase: 1,
    difficulty: 'Medium',
    diffColor: 'text-beat-cyan',
    theme: {
      bg: 'from-[#020a18] to-[#050d20]',
      primary: '#00f0ff',
      secondary: '#0080ff',
      glow: 'rgba(0,240,255,0.4)',
      particle: 'light',
      borderColor: 'border-beat-cyan',
      glowShadow: 'shadow-neon-cyan',
    },
    description: 'Shahar neonlari seni chalg\'itadi. Ehtiyot bo\'l!',
    unlockScore: 500,
    tracks: [
      { id: 'neon-1', title: 'City Lights',     bpm: 110, url: 'https://example.com/audio/neon_city_lights.mp3' },
      { id: 'neon-2', title: 'Midnight Drive',  bpm: 118, url: 'https://example.com/audio/midnight_drive.mp3' },
      { id: 'neon-3', title: 'Arcade Dreams',   bpm: 115, url: 'https://example.com/audio/arcade_dreams.mp3' },
      { id: 'neon-4', title: 'Retro Wave',      bpm: 120, url: 'https://example.com/audio/retro_wave.mp3' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean Drive',
    emoji: '🌊',
    levels: [26, 40],
    bpmRange: [120, 140],
    buttons: 2,
    trickBase: 1,
    difficulty: 'Hard',
    diffColor: 'text-blue-400',
    theme: {
      bg: 'from-[#010a18] to-[#021530]',
      primary: '#0088ff',
      secondary: '#00ccff',
      glow: 'rgba(0,136,255,0.4)',
      particle: 'bubble',
      borderColor: 'border-blue-500',
      glowShadow: 'shadow-[0_0_20px_rgba(0,136,255,0.5)]',
    },
    description: 'To\'lqinlar ritmi tez. Sho\'ng\'iy olasanmi?',
    unlockScore: 2000,
    tracks: [
      { id: 'ocean-1', title: 'Wave Rider',     bpm: 128, url: 'https://example.com/audio/wave_rider.mp3' },
      { id: 'ocean-2', title: 'Deep Current',   bpm: 132, url: 'https://example.com/audio/deep_current.mp3' },
      { id: 'ocean-3', title: 'Sea Breeze',     bpm: 124, url: 'https://example.com/audio/sea_breeze.mp3' },
    ],
  },
  {
    id: 'space',
    name: 'Space Warp',
    emoji: '🚀',
    levels: [41, 60],
    bpmRange: [140, 160],
    buttons: 3,
    trickBase: 2,
    difficulty: 'Very Hard',
    diffColor: 'text-beat-purple',
    theme: {
      bg: 'from-[#030010] to-[#0a0020]',
      primary: '#9b4dff',
      secondary: '#cc00ff',
      glow: 'rgba(155,77,255,0.4)',
      particle: 'star',
      borderColor: 'border-beat-purple',
      glowShadow: 'shadow-neon-purple',
    },
    description: '3 ta tugma. Gravity yo\'q. Trick har joyda.',
    unlockScore: 6000,
    tracks: [
      { id: 'space-1', title: 'Warp Tunnel',    bpm: 145, url: 'https://example.com/audio/warp_tunnel.mp3' },
      { id: 'space-2', title: 'Zero Gravity',   bpm: 152, url: 'https://example.com/audio/zero_gravity.mp3' },
      { id: 'space-3', title: 'Starfield',      bpm: 158, url: 'https://example.com/audio/starfield.mp3' },
    ],
  },
  {
    id: 'lava',
    name: 'Lava Core',
    emoji: '🌋',
    levels: [61, 80],
    bpmRange: [160, 180],
    buttons: 3,
    trickBase: 2,
    difficulty: 'Extreme',
    diffColor: 'text-beat-orange',
    theme: {
      bg: 'from-[#180200] to-[#2d0400]',
      primary: '#ff7c2a',
      secondary: '#ff3000',
      glow: 'rgba(255,124,42,0.4)',
      particle: 'lava',
      borderColor: 'border-beat-orange',
      glowShadow: 'shadow-[0_0_20px_rgba(255,124,42,0.6)]',
    },
    description: 'Issiq. Tez. Shafqatsiz. Tirik qolsang baxtlisan.',
    unlockScore: 15000,
    tracks: [
      { id: 'lava-1', title: 'Magma Run',       bpm: 165, url: 'https://example.com/audio/magma_run.mp3' },
      { id: 'lava-2', title: 'Core Heat',       bpm: 172, url: 'https://example.com/audio/core_heat.mp3' },
      { id: 'lava-3', title: 'Volcano Rush',    bpm: 178, url: 'https://example.com/audio/volcano_rush.mp3' },
    ],
  },
  {
    id: 'ice',
    name: 'Ice Dimension',
    emoji: '🧊',
    levels: [81, 100],
    bpmRange: [180, 200],
    buttons: 3,
    trickBase: 3,
    difficulty: 'Insane',
    diffColor: 'text-cyan-300',
    theme: {
      bg: 'from-[#000d1a] to-[#001830]',
      primary: '#80ffff',
      secondary: '#00cccc',
      glow: 'rgba(128,255,255,0.4)',
      particle: 'snow',
      borderColor: 'border-cyan-400',
      glowShadow: 'shadow-[0_0_20px_rgba(128,255,255,0.5)]',
    },
    description: 'Muzday sovuq. Trick shaffof. Reflex 400ms.',
    unlockScore: 35000,
    tracks: [
      { id: 'ice-1', title: 'Frozen Steps',     bpm: 182, url: 'https://example.com/audio/frozen_steps.mp3' },
      { id: 'ice-2', title: 'Crystal Echoes',   bpm: 188, url: 'https://example.com/audio/crystal_echoes.mp3' },
      { id: 'ice-3', title: 'Blizzard Beat',    bpm: 195, url: 'https://example.com/audio/blizzard_beat.mp3' },
    ],
  },
  {
    id: 'cyber-god',
    name: 'Cyber God Mode',
    emoji: '⚡',
    levels: [101, 999],
    bpmRange: [200, 260],
    buttons: 4,
    trickBase: 3,
    difficulty: 'God Mode',
    diffColor: 'text-beat-yellow',
    theme: {
      bg: 'from-[#0a0010] to-[#050018]',
      primary: '#ffe135',
      secondary: '#ff9500',
      glow: 'rgba(255,225,53,0.5)',
      particle: 'glow',
      borderColor: 'border-beat-yellow',
      glowShadow: 'shadow-[0_0_30px_rgba(255,225,53,0.6)]',
    },
    description: 'Sen allaqachon ma\'bud bo\'lding. Yoki yo\'qmi?',
    unlockScore: 80000,
    tracks: [
      { id: 'cyber-1', title: 'God Mode',       bpm: 210, url: 'https://example.com/audio/god_mode.mp3' },
      { id: 'cyber-2', title: 'Neon Fury',      bpm: 220, url: 'https://example.com/audio/neon_fury.mp3' },
      { id: 'cyber-3', title: 'Overclocked',    bpm: 240, url: 'https://example.com/audio/overclocked.mp3' },
      { id: 'cyber-4', title: 'Final Phase',    bpm: 255, url: 'https://example.com/audio/final_phase.mp3' },
    ],
  },
]

export const getWorldByLevel = (level) => {
  return WORLDS.find(w => level >= w.levels[0] && level <= w.levels[1]) || WORLDS[WORLDS.length - 1]
}

export const BUTTON_SHAPES = ['circle', 'square', 'diamond', 'triangle', 'hexagon']
export const SLOT_COUNT = 9  // 3x3 grid of possible positions

export const calcBeatInterval = (bpm) => Math.round(60000 / bpm)

export const calcTrickChance = (level) => Math.min(0.08 + level * 0.004, 0.5)

export const getWorldLevelProgress = (level, world) => {
  const start = world.levels[0]
  const end = world.levels[1]
  const span = Math.max(1, end - start)
  return Math.min(1, Math.max(0, (level - start) / span))
}

export const getPlanetLevel = (level, world) => {
  const start = world.levels[0]
  return Math.max(1, level - start + 1)
}

export const getDifficultyForLevel = (level) => {
  const world = getWorldByLevel(level)
  const progress = getWorldLevelProgress(level, world)
  const bpm = Math.round(world.bpmRange[0] + (world.bpmRange[1] - world.bpmRange[0]) * progress)
  const bonusButtons = progress > 0.8 ? 1 : 0
  const buttonCount = Math.min(4, world.buttons + bonusButtons)
  const trickChance = Math.min(0.55, 0.06 + world.trickBase * 0.07 + progress * 0.14)
  const hitWindowFactor = 1 - progress * 0.18

  return { world, progress, bpm, buttonCount, trickChance, hitWindowFactor }
}

export const SCORE_HIT      =  10
export const SCORE_TRICK    = -5
export const SCORE_MISS     = -3
export const COMBO_MULT     = [1, 1, 1.2, 1.5, 1.8, 2.0, 2.5, 3.0]  // index = combo count
