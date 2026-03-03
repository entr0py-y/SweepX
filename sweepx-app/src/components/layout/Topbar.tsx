import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Zap, Menu, X, Map, Trophy, Gift, BarChart3, Users } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { cn } from '../shared/primitives'
import { TubelightNavbar } from '@/components/ui/tubelight-navbar'

const NAV = [
  { name: 'Map',       icon: Map,      id: 'map'         },
  { name: 'Missions',  icon: Zap,      id: 'missions'    },
  { name: 'Stats',     icon: BarChart3,id: 'stats'       },
  { name: 'Rankings',  icon: Trophy,   id: 'leaderboard' },
  { name: 'Community', icon: Users,    id: 'community'   },
  { name: 'Rewards',   icon: Gift,     id: 'rewards'     },
]

interface TopbarProps {
  activeSection: string
  onNav: (id: string) => void
  sidebarOpen?: boolean
  onProfileClick?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({ activeSection, onNav, sidebarOpen = false, onProfileClick }) => {
  const { notifications, toggleNotif, unreadCount } = useAppStore(s => ({
    notifications: s.notifications,
    toggleNotif:   s.toggleNotif,
    unreadCount:   s.notifications.filter(n => !n.read).length,
  }))
  const { markAllRead }   = useAppStore()
  const [mob, setMob]     = useState(false)
  const [notifOpen, setNO] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4 md:px-6 overflow-visible"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'url("#liquid-glass-filter") blur(6px) saturate(150%) brightness(108%)',
        WebkitBackdropFilter: 'blur(40px) saturate(160%) brightness(108%)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        boxShadow: [
          'inset 3px 3px 0.5px -3px rgba(255,255,255,0.14)',
          'inset -3px -3px 0.5px -3px rgba(0,0,0,0.3)',
          'inset 1px 1px 1px -0.5px rgba(255,255,255,0.22)',
          'inset 0 0 8px 6px rgba(255,255,255,0.025)',
          '0 1px 0 rgba(0,0,0,0.2)',
          '0 4px 32px rgba(0,0,0,0.12)',
        ].join(', '),
      }}>

      {/* Logo — liquid glass pill */}
      <div className="flex items-center gap-2.5 mr-6 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.7) 0%, rgba(168,85,247,0.55) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 12px rgba(124,58,237,0.4)',
          }}>
          <Zap size={14} className="text-white fill-white" />
        </div>
        <span className="font-display font-bold text-sm tracking-tight"
          style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          Sweep<span style={{ color: 'rgba(192,132,252,0.95)' }}>X</span>
        </span>
      </div>

      {/* Desktop nav — tubelight style */}
      <div className="hidden md:flex flex-1 justify-center">
        <TubelightNavbar items={NAV} activeId={activeSection} onNav={onNav} />
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notif */}
        <div className="relative">
          <button
            onClick={() => { setNO(o => !o); if (!notifOpen) markAllRead() }}
            className="relative p-2 rounded-xl text-white/60 hover:text-white transition-all duration-200"
            style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
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

        {/* Avatar — liquid glass circle, triggers sidebar */}
        <motion.button
          onClick={onProfileClick}
          whileTap={{ scale: 0.88 }}
          className="relative w-8 h-8 rounded-full cursor-pointer flex items-center justify-center outline-none"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(168,85,247,0.65))',
            border: sidebarOpen ? '1.5px solid rgba(192,132,252,0.8)' : '1px solid rgba(255,255,255,0.28)',
            boxShadow: sidebarOpen
              ? 'inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 4px rgba(168,85,247,0.25), 0 2px 12px rgba(124,58,237,0.5)'
              : 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(124,58,237,0.35)',
            transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
          }}
        >
          {/* Pulsing ring when open */}
          {sidebarOpen && (
            <motion.span
              className="absolute inset-0 rounded-full"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
              style={{ background: 'rgba(168,85,247,0.35)', borderRadius: '50%' }}
            />
          )}
          <span className="text-[10px] font-bold text-white/90 relative z-10">P</span>
        </motion.button>

        {/* Mob toggle */}
        <button className="md:hidden p-1.5 text-white/60 hover:text-white transition-colors" onClick={() => setMob(o => !o)}>
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
            className="absolute top-full inset-x-0 py-2 md:hidden"
            style={{
              background: 'rgba(15,15,22,0.72)',
              backdropFilter: 'blur(40px) saturate(160%)',
              WebkitBackdropFilter: 'blur(40px) saturate(160%)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
            {NAV.map(n => {
              const Icon = n.icon
              return (
                <button key={n.id} onClick={() => { onNav(n.id); setMob(false) }}
                  className="flex items-center gap-2.5 w-full px-5 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-150">
                  <Icon size={14}/>{n.name}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
