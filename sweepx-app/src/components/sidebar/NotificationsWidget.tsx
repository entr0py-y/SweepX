import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { cn } from '../shared/primitives'

const TYPE_ICONS: Record<string, string> = {
  achievement: '🏆',
  mission: '⚡',
  friend: '👥',
  reward: '🎁',
  system: '🔔',
}

export const NotificationsWidget: React.FC = () => {
  const { notifications, markAllRead } = useAppStore(s => ({
    notifications: s.notifications,
    markAllRead: s.markAllRead,
  }))

  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="glass-tile-sm w-full p-5">
      <div className="relative z-[2] flex items-center justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 text-slate-300">
          <Bell size={13} />
          <span className="text-2xs uppercase tracking-[0.1em] text-slate-500 font-medium">Notifications</span>
          {unread > 0 && (
            <span className="w-4 h-4 rounded-full bg-white/[0.12] text-[9px] font-bold text-white flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead()}
            className="flex items-center gap-1 text-2xs text-slate-500 hover:text-slate-300 transition-colors">
            <CheckCheck size={10} /> Mark read
          </button>
        )}
      </div>

      <div className="relative z-[2] flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
        <AnimatePresence>
          {notifications.slice(0, 8).map(n => (
            <motion.div key={n.id}
              layout
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className={cn(
                'flex items-start gap-2 px-2.5 py-2 rounded-xl transition-colors overflow-hidden',
                !n.read ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]',
              )}>
              <span className="text-sm shrink-0">{TYPE_ICONS[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('text-2xs leading-snug line-clamp-2', !n.read ? 'text-white' : 'text-slate-400')}>
                  {n.body}
                </p>
                <p className="text-2xs text-slate-600 mt-0.5">
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1 shrink-0" />}
            </motion.div>
          ))}
        </AnimatePresence>
        {notifications.length === 0 && (
          <p className="text-2xs text-slate-600 text-center py-4">No notifications yet.</p>
        )}
      </div>
    </div>
  )
}
