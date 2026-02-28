import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Zap, Menu, X, Map, Trophy, Gift, BarChart3, Users } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { cn } from '../shared/primitives'

const NAV = [
  { label: 'Map',       icon: Map,      id: 'map'      },
  { label: 'Missions',  icon: Zap,      id: 'missions' },
  { label: 'Stats',     icon: BarChart3,id: 'stats'    },
  { label: 'Community', icon: Users,    id: 'community'},
  { label: 'Rewards',   icon: Gift,     id: 'rewards'  },
  { label: 'Rankings',  icon: Trophy,   id: 'leaderboard'},
]

interface TopbarProps { activeSection: string; onNav: (id: string) => void }

export const Topbar: React.FC<TopbarProps> = ({ activeSection, onNav }) => {
  const { notifications, toggleNotif, unreadCount } = useAppStore(s => ({
    notifications: s.notifications,
    toggleNotif:   s.toggleNotif,
    unreadCount:   s.notifications.filter(n => !n.read).length,
  }))
  const { markAllRead }   = useAppStore()
  const [mob, setMob]     = useState(false)
  const [notifOpen, setNO] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-12 flex items-center px-4 md:px-6"
      style={{ background: 'rgba(10,10,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-6 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neo-v to-neo-p flex items-center justify-center shadow-glow-v">
          <Zap size={14} className="text-white fill-white" />
        </div>
        <span className="font-display font-bold text-sm tracking-tight text-white">Sweep<span className="text-neo-p">X</span></span>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-0.5 flex-1">
        {NAV.map(n => {
          const Icon    = n.icon
          const active  = activeSection === n.id
          return (
            <button key={n.id} onClick={() => onNav(n.id)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-2xs font-medium transition-all duration-150 relative',
                active
                  ? 'bg-surface-4 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-surface-3'
              )}>
              <Icon size={12} className={active ? 'text-neo-p' : ''} />
              {n.label}
              {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-surface-4 -z-10" />}
            </button>
          )
        })}
      </nav>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notif */}
        <div className="relative">
          <button
            onClick={() => { setNO(o => !o); if (!notifOpen) markAllRead() }}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-3 transition-all duration-150">
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-neo-p text-[9px] font-bold text-white flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-72 panel p-0 overflow-hidden z-50">
                <div className="px-3.5 py-2.5 border-b border-line flex items-center justify-between">
                  <span className="label-xs font-semibold text-white">Notifications</span>
                  <button onClick={() => markAllRead()} className="text-2xs text-neo-p hover:underline">Mark all read</button>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-line">
                  {notifications.slice(0, 6).map(n => (
                    <div key={n.id} className={cn('px-3.5 py-2.5 hover:bg-surface-3 transition-colors', !n.read && 'bg-surface-3/50')}>
                      <p className={cn('text-2xs leading-snug', n.read ? 'text-slate-400' : 'text-white')}>{n.body}</p>
                      <p className="text-2xs text-slate-600 mt-0.5">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neo-v to-neo-p ring-1 ring-white/20 cursor-pointer" />

        {/* Mob toggle */}
        <button className="md:hidden p-1.5 text-slate-400 hover:text-white" onClick={() => setMob(o => !o)}>
          {mob ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mob && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full inset-x-0 bg-s-1 border-b border-line py-2 md:hidden">
            {NAV.map(n => {
              const Icon = n.icon
              return (
                <button key={n.id} onClick={() => { onNav(n.id); setMob(false) }}
                  className="flex items-center gap-2.5 w-full px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-surface-3">
                  <Icon size={14}/>{n.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
