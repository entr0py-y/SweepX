import React from 'react'
import { Star, Zap, Award } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { Counter, XPBar } from '../shared/primitives'

export const UserProgress: React.FC = () => {
  const u = useAppStore(s => s.user)
  if (!u) return null

  const xpMax = u.xpToNext
  const xpPct = Math.round((u.xp / xpMax) * 100)

  const stats = [
    { label: 'Total Points',  val: u.totalPoints,      icon: <Star size={11}  className="text-neo-p" />, color: 'text-neo-p' },
    { label: 'Missions Done', val: u.missionsCompleted, icon: <Zap size={11}   className="text-neo-s" />, color: 'text-neo-s' },
    { label: 'Badges',        val: u.badges.length ?? 0, icon: <Award size={11} className="text-neo-v" />, color: 'text-neo-v' },
  ]

  return (
    <div className="glass-tile-sm w-full p-5">
      <div className="relative z-[2] flex items-center gap-2 mb-3">
        <span className="text-2xs uppercase tracking-[0.1em] text-slate-500 font-medium">Your Progress</span>
      </div>

      <div className="relative z-[2] flex items-center gap-3 mb-3 min-w-0">
        <div className="relative w-11 h-11 shrink-0 rounded-full bg-white/[0.06] flex items-center justify-center text-sm font-bold text-white"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)' }}>
          {u.level}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{u.username}</p>
          <p className="text-2xs text-slate-500 mb-1">{u.rank ?? 'EcoChampion'}</p>
          <XPBar xp={u.xp} max={xpMax} className="h-1.5" />
          <p className="text-2xs font-mono text-slate-500 mt-1">
            <Counter to={u.xp} duration={900} /> / {xpMax.toLocaleString()} XP
          </p>
        </div>
      </div>

      <div className="relative z-[2] grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div key={s.label} className="bg-white/[0.04] rounded-xl p-2 text-center flex flex-col items-center gap-1"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-center text-slate-300">{s.icon}</div>
            <p className="text-[12px] font-semibold font-mono text-slate-100">
              <Counter to={s.val} duration={1000} />
            </p>
            <p className="text-[10px] text-slate-500 leading-tight truncate w-full text-center">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
