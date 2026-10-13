'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiSend, FiCpu, FiZap, FiShield, FiCrosshair } from 'react-icons/fi'
import useStore from '../../store/useStore'
import BorderBeam from '../ui/BorderBeam'
import { generateAIResponse } from '../../lib/aiAgent'

const QUICK_TOPICS = [
  { id: 'timing', icon: '🎯', label: 'Timing & Refleks' },
  { id: 'tricks', icon: '⚠️', label: 'Tricklardan qochish' },
  { id: 'controls', icon: '⌨️', label: 'Klaviatura sirlari' },
  { id: 'duel', icon: '⚔️', label: 'AI Duel qoidalari' },
  { id: 'profile', icon: '📊', label: 'Neyron reytingim' },
]

export default function AIChatModal({ isOpen, onClose }) {
  const { user } = useStore()
  const playerName = user?.username || 'Ritm Jangchisi'
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Salom, ${playerName}! Men CYBER-NEO — Beat Trick olamining sun'iy ong murabbiyiman. Ritm, reflekslar va dunyolar strategiyasi bo'yicha sizga yordam berishga tayyorman. Savolingizni tanlang yoki yozing!`,
      mood: 'hyped',
      time: 'hozir',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleTopicClick = (topicId) => {
    let question = ''
    let answer = ''
    let mood = 'thinking'

    if (topicId === 'timing') {
      question = 'Timing va ritm aniqligini qanday oshirish mumkin?'
      answer = `🎯 **Approach Ring qoidasi:** Har bir tugma atrofidagi neon halqa markazga qisqarib keladi. Halqa tugma qirrasiga aynan tekkan lahzada bosing — bu sizga PERFECT (+15 ball) va combo multiplikatorini beradi! Ovoz ritmini tinglang, faqat ko'zga tayanmang.`
      mood = 'focused'
    } else if (topicId === 'tricks') {
      question = 'Qizil Trick tugmalardan qanday qochish kerak?'
      answer = `⚠️ **Trick Filtrlash:** Trick tugmalar qizil xavf chiziqlari va "✕ TRICK" belgisi bilan ajralib turadi. Agar ularni bossangiz, hayot kamayadi va ball o'chadi. Trick tugmalarni BOSMANG — vaqti tugab o'zi g'oyib bo'lsa, sizga hech qanday jarima yozilmaydi!`
      mood = 'warning'
    } else if (topicId === 'controls') {
      question = 'Klaviatura tugmalari qanday sozlangan?'
      answer = `⌨️ **3x3 Matritsa:**
• Yuqori qator: **Q**, **W**, **E** (yoki 7, 8, 9)
• O'rta qator: **A**, **S**, **D** (yoki 4, 5, 6)
• Pastki qator: **Z**, **X**, **C** (yoki 1, 2, 3)
• **Bo'shliq (Spacebar)** yoki **Enter**: Ekrandagi eng birinchi faol tugmani darhol uradi! Bu sichqonchaga qaraganda 3x tezroq!`
      mood = 'hyped'
    } else if (topicId === 'duel') {
      question = 'AI Rival Duel rejimida qanday yutish mumkin?'
      answer = `⚔️ **AI Duel Taktikasi:** AI Rival doimiy ravishda 91% aniqlikda harakat qiladi. Uni mag'lub etish siri — kamida 12x Combo zanjirini ushlab turishdir! Combo ko'paytmasi 3x ga chiqqanida, sizning har bir zafarli zarbangiz mening hisoblash quvvatimdan o'zib ketadi!`
      mood = 'rival'
    } else if (topicId === 'profile') {
      const games = user?.stats?.totalGames || 0
      const score = user?.totalScore || 0
      const combo = user?.stats?.maxCombo || 0
      question = 'Mening joriy neyron profilimni tahlil qiling'
      answer = `📊 **Neyron Telemetriya:**
• Jami ball: **${score.toLocaleString()}**
• Rekord Combo: **${combo}x**
• O'ynalgan o'yinlar: **${games} ta**
• AI Bahosi: ${score > 5000 ? '⚡ Elite Kiber Jangchi! Siz tez orada Cyber God arenasiga kirasiz.' : '🎯 Istiqbolli ritmik o\'yinchi! Reaksiyangiz a\'lo darajada o\'smoqda.'}`
      mood = 'proud'
    }

    sendDialogue(question, answer, mood)
  }

  const sendDialogue = (question, answer, mood = 'thinking') => {
    setMessages((prev) => [...prev, { sender: 'user', text: question, time: 'hozir' }])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: answer,
          mood,
          time: 'hozir',
        },
      ])
    }, 600)
  }

  const handleCustomSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setInput('')

    // Generate intelligent, non-repetitive AI reply
    const reply = generateAIResponse(text, { user, playerName })
    sendDialogue(text, reply, 'focused')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-xl rounded-3xl overflow-hidden relative shadow-2xl flex flex-col max-h-[85vh]"
          style={{
            background: 'rgba(8, 8, 24, 0.95)',
            border: '1.5px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 0 50px rgba(0, 240, 255, 0.2), inset 0 0 30px rgba(0, 240, 255, 0.05)',
          }}
        >
          <BorderBeam size={280} duration={6} colorFrom="#00f0ff" colorTo="#ff2d78" />

          {/* Modal Header */}
          <div
            className="p-4 px-6 border-b border-white/10 flex items-center justify-between relative z-10"
            style={{ background: 'rgba(12, 12, 34, 0.8)' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-xl shadow-lg"
                  style={{
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, rgba(10, 10, 30, 0.95) 100%)',
                    border: '2px solid #00f0ff',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
                  }}
                >
                  🧠
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#00ff87] rounded-full border-2 border-black animate-pulse" />
              </div>
              <div>
                <div className="font-display font-black text-sm text-white flex items-center gap-2">
                  <span>CYBER-NEO</span>
                  <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-bold bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40">
                    AI AGENT V2.5
                  </span>
                </div>
                <div className="text-[0.65rem] text-white/50 font-body">
                  Shaxsiy Ritm & Taktika Maslahatchisi
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Quick Topics Pills */}
          <div className="p-3 px-6 bg-white/[0.02] border-b border-white/5 flex gap-2 overflow-x-auto relative z-10">
            {QUICK_TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTopicClick(t.id)}
                className="px-3 py-1.5 rounded-xl font-display text-[0.65rem] font-bold text-white/70 hover:text-white bg-white/5 hover:bg-[#00f0ff]/15 border border-white/10 hover:border-[#00f0ff]/40 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 relative z-10">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-base">
                    🧠
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs font-body leading-relaxed shadow-lg ${
                    m.sender === 'user'
                      ? 'bg-[#00f0ff] text-black font-semibold rounded-tr-none'
                      : 'bg-white/[0.06] text-white/90 border border-white/10 rounded-tl-none'
                  }`}
                  style={m.sender === 'ai' ? { boxShadow: '0 0 20px rgba(0,240,255,0.08)' } : {}}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-base">
                  🧠
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleCustomSend}
            className="p-4 px-6 border-t border-white/10 flex items-center gap-2 relative z-10"
            style={{ background: 'rgba(10, 10, 28, 0.9)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cyber-Neo dan ritm yoki taktika haqida so'rang..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-[#00f0ff] rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#00f0ff] to-[#ff2d78] text-black font-black hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#00f0ff]/30"
            >
              <FiSend size={16} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
