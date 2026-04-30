'use client'
import { useRef, useCallback, useEffect } from 'react'

export function useAudio() {
  const audioCtxRef  = useRef(null)
  const audioElRef   = useRef(null)
  const mediaNodeRef = useRef(null)
  const gainRef      = useRef(null)
  const analyserRef  = useRef(null)

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      gainRef.current     = audioCtxRef.current.createGain()
      analyserRef.current = audioCtxRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      gainRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioCtxRef.current.destination)
    }
    return audioCtxRef.current
  }, [])

  const stop = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current.src = ''
      audioElRef.current = null
    }
    if (mediaNodeRef.current) {
      try { mediaNodeRef.current.disconnect() } catch {}
      mediaNodeRef.current = null
    }
  }, [])

  const loadAndPlay = useCallback(async (url, volume = 0.7) => {
    if (!url) return
    const ctx = getCtx()
    if (ctx.state === 'suspended') await ctx.resume()
    stop()
    gainRef.current.gain.value = Math.max(0, Math.min(1, volume))
    try {
      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.src = url
      audio.loop = true
      const node = ctx.createMediaElementSource(audio)
      node.connect(gainRef.current)
      audioElRef.current   = audio
      mediaNodeRef.current = node
      await audio.play()
      return node
    } catch (err) {
      console.warn('[useAudio] HTMLAudioElement failed, trying buffer:', err)
      try {
        const res     = await fetch(url)
        const buf     = await res.arrayBuffer()
        const decoded = await ctx.decodeAudioData(buf)
        const source  = ctx.createBufferSource()
        source.buffer = decoded
        source.connect(gainRef.current)
        source.loop = true
        source.start(0)
        audioElRef.current = { pause: () => { try { source.stop() } catch {} }, src: '' }
        return source
      } catch (bufErr) {
        console.warn('[useAudio] Buffer fallback also failed:', bufErr)
      }
    }
  }, [getCtx, stop])

  const setVolume = useCallback((v) => {
    if (gainRef.current) gainRef.current.gain.value = Math.max(0, Math.min(1, v))
  }, [])

  const getFrequencyData = useCallback(() => {
    if (!analyserRef.current) return new Uint8Array(0)
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    return data
  }, [])

  const playSFX = useCallback((type = 'hit', volume = 0.5) => {
    try {
      const ctx  = getCtx()
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      if (type === 'hit') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(volume, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      } else if (type === 'trick') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(volume, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      } else if (type === 'miss') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      } else if (type === 'combo') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1100, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.25)
    } catch {}
  }, [getCtx])

  useEffect(() => () => stop(), [stop])

  return { loadAndPlay, stop, setVolume, playSFX, getFrequencyData, analyser: analyserRef }
}
