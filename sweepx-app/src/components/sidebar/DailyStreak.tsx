import React from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const DailyStreak: React.FC<{ streak?: number }> = ({ streak = 12 }) => {
  const today = new Date().getDay() // 0=Sun
  // mark last `streak` days up to today as active
  const active = new Set<number>()
  for (let i = 0; i < Math.min(streak, 7); i++) {
    active.add((today - i + 7) % 7)
  }

  return (
    <div className="glass-tile-sm w-full p-5">
      <div className="relative z-[2] flex items-center justify-between mb-3 min-w-0">
        <span className="text-2xs uppercase tracking-[0.1em] text-slate-500 font-medium">Daily Streak</span>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Flame size={14} />
          <span className="text-sm font-semibold font-mono">{streak}</span>
          <span className="text-2xs text-slate-500">days</span>
        </div>
      </div>

      <div className="relative z-[2] flex items-end justify-between gap-2 mb-4">
        {DAYS.map((d, i) => {
          const on  = active.has(i)
          const cur = i === today
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="relative w-full flex justify-center">
                {cur && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />}
                <motion.div
                  className={`w-full rounded-md ${cur ? 'shadow-[0_0_12px_rgba(124,58,237,0.5)]' : on ? 'bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.35)]' : 'bg-white/[0.10]'}`}
                  style={{ height: on ? 28 : 20, originY: 1, ...(cur ? { background: '#7c3aed' } : {}) }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className={`text-[11px] font-medium ${on ? 'text-slate-200' : 'text-slate-600'}`}>{d}</span>
            </div>
          )
        })}
      </div>

      <div className="relative z-[2] bg-white/[0.04] rounded-xl p-3 text-center"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[11px] text-slate-400">
          {streak >= 7
            ? <>Keep the streak alive today.</>
            : <>Complete today's mission to maintain your streak.</>}
        </p>
        <p className="text-[11px] text-slate-500 font-semibold mt-1">+50 bonus XP for every 7-day streak</p>
      </div>
    </div>
  )
}
