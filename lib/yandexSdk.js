/**
 * Yandex Games SDK Bridge (v2)
 * Provides seamless integration with Yandex Games platform:
 * - SDK initialization
 * - Interstitial & Rewarded Ads
 * - Leaderboard score reporting
 * - Safe fallback in normal web / itch.io environments
 */

let ysdkInstance = null
let playerInstance = null
let leaderboardInstance = null

export async function initYandexSDK() {
  if (typeof window === 'undefined') return null
  if (ysdkInstance) return ysdkInstance

  if (typeof window.YaGames !== 'undefined') {
    try {
      ysdkInstance = await window.YaGames.init()
      console.log('🎮 [Yandex Games] SDK initialized successfully')
      
      try {
        playerInstance = await ysdkInstance.getPlayer({ scopes: false })
      } catch (err) {
        console.warn('🎮 [Yandex Games] Player not authorized yet:', err)
      }

      try {
        leaderboardInstance = await ysdkInstance.getLeaderboards()
      } catch (err) {
        console.warn('🎮 [Yandex Games] Leaderboard service unavailable:', err)
      }

      return ysdkInstance
    } catch (err) {
      console.warn('🎮 [Yandex Games] Failed to initialize YaGames:', err)
    }
  }
  return null
}

export function isYandexEnvironment() {
  return typeof window !== 'undefined' && Boolean(window.ysdk || ysdkInstance)
}

/**
 * Show Fullscreen Interstitial Ad (e.g. between rounds or upon game over)
 */
export async function showFullscreenAd({ onOpen, onClose, onError } = {}) {
  const ysdk = ysdkInstance || window.ysdk
  if (!ysdk || !ysdk.adv) {
    onClose?.(false)
    return
  }

  try {
    ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: () => {
          onOpen?.()
        },
        onClose: (wasShown) => {
          onClose?.(wasShown)
        },
        onError: (err) => {
          console.warn('🎮 [Yandex Games] Ad error:', err)
          onError?.(err)
          onClose?.(false)
        },
      },
    })
  } catch (err) {
    console.warn('🎮 [Yandex Games] showFullscreenAdv failed:', err)
    onClose?.(false)
  }
}

/**
 * Show Rewarded Video Ad (gives +1 Life or +100 Coins)
 */
export async function showRewardedAd({ onRewarded, onClose, onError } = {}) {
  const ysdk = ysdkInstance || window.ysdk
  if (!ysdk || !ysdk.adv) {
    onError?.(new Error('SDK not available'))
    return
  }

  try {
    ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => {},
        onRewarded: () => {
          onRewarded?.()
        },
        onClose: () => {
          onClose?.()
        },
        onError: (err) => {
          onError?.(err)
          onClose?.()
        },
      },
    })
  } catch (err) {
    onError?.(err)
  }
}

/**
 * Submit score to Yandex Games Leaderboard
 */
export async function submitYandexScore(leaderboardName = 'global_score', score = 0) {
  try {
    const ysdk = ysdkInstance || window.ysdk
    if (!ysdk) return
    const lb = leaderboardInstance || (await ysdk.getLeaderboards())
    if (lb) {
      await lb.setLeaderboardScore(leaderboardName, score)
      console.log(`🎮 [Yandex Games] Score ${score} saved to leaderboard ${leaderboardName}`)
    }
  } catch (err) {
    console.warn('🎮 [Yandex Games] Failed to submit score:', err)
  }
}
