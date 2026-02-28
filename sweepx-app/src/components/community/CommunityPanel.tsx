import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Users } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { SecHead, cn } from '../shared/primitives'

const ACTIVITY_ICONS: Record<string, string> = {
  mission:     '✅',
  achievement: '🏆',
  squad:       '👥',
  rank:        '⭐',
}

function timeAgo(ts: Date): string {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export const CommunityPanel: React.FC<{ id?: string }> = ({ id }) => {
  const { friendActivity, chatMessages, chatInput, sendChat, setChatInput, userId } = useAppStore(s => ({
    friendActivity: s.friendActivity,
    chatMessages:   s.chatMessages,
    chatInput:      s.chatInput,
    sendChat:       s.sendChat,
    setChatInput:   s.setChatInput,
    userId:         s.user.id,
  }))

  const chatContainer = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTo({
        top: chatContainer.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [chatMessages.length])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    sendChat(chatInput.trim())
  }

  return (
    <section id={id} className="px-6 md:px-10 py-10">
      <SecHead tag="Community" title="Friend" accent="Activity" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity feed — 3/5 */}
        <div className="lg:col-span-3 glass-tile p-5 flex flex-col gap-2">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[28px]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)' }} />
          <div className="relative z-[2] flex items-center gap-2 mb-2">
            <Users size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-white">Live Feed</span>
            <span className="ml-auto flex items-center gap-1 text-2xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse inline-block" /> Live
            </span>
          </div>
          <div className="relative z-[2] flex flex-col gap-2 max-h-72 overflow-y-auto pr-0.5">
            {friendActivity.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-2.5 p-2.5 rounded-2xl hover:bg-white/[0.03] transition-colors">
                <img src={a.avatar} alt={a.username} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-2xs text-white leading-snug">
                    <span className="font-semibold">{a.displayName}</span>
                    {' '}
                    <span className="text-slate-400">{a.action}</span>
                    {a.target && <span className="text-neo-p ml-1 font-medium">{a.target}</span>}
                  </p>
                  <p className="text-2xs text-slate-600 mt-0.5">{timeAgo(a.timestamp)}</p>
                </div>
                <span className="text-base shrink-0">{ACTIVITY_ICONS[a.type] ?? '🌿'}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat — 2/5 */}
        <div className="lg:col-span-2 glass-tile p-0 flex flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[28px] z-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)' }} />
          <div className="relative z-[2] px-4 py-3 border-b border-white/[0.08] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
            <span className="text-xs font-semibold text-white">Mission Chat</span>
          </div>

          <div ref={chatContainer} className="relative z-[2] flex-1 flex flex-col gap-1.5 p-3 overflow-y-auto max-h-56">
            <AnimatePresence initial={false}>
              {chatMessages.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={cn('flex flex-col', m.userId === userId ? 'items-end' : 'items-start')}>
                  <div className={cn('px-3 py-1.5 rounded-2xl max-w-[80%] text-2xs leading-snug',
                    m.userId === userId ? 'bg-white/[0.08] text-white rounded-br-sm' : 'bg-white/[0.04] text-slate-300 rounded-bl-sm')}>
                    {m.userId !== userId && <span className="block text-2xs text-neo-p font-semibold mb-0.5">{m.username}</span>}
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <form onSubmit={onSubmit} className="relative z-[2] px-3 pb-3 flex items-center gap-2">
            <input
              className="flex-1 bg-white/[0.04] border border-white/[0.10] rounded-2xl px-3 py-1.5 text-2xs text-white placeholder-slate-600 outline-none focus:border-white/[0.18] transition-colors"
              placeholder="Send a message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              maxLength={200}
            />
            <button type="submit" className="glass-btn px-2.5 py-1.5 rounded-xl shrink-0 transition-all duration-200 ease-out hover:scale-[1.03]">
              <Send size={10} className="text-white" />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
