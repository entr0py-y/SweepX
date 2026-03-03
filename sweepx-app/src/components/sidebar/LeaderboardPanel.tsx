import React from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { Counter, cn } from '../shared/primitives'
import { GlowWrapper } from '@/components/ui/glow-wrapper'

const RANGE_OPTS = ['weekly', 'monthly', 'alltime'] as const

const MEDALS: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

export const LeaderboardPanel: React.FC = () => {
  const { leaderboard, range, setRange, userId } = useAppStore(s => ({
    leaderboard: s.leaderboard,
    range: s.leaderboardRange,
    setRange: s.setLeaderboardRange,
    userId: s.user.id,
  }))

  const shown = leaderboard.slice(0, 15)

  return (
    <GlowWrapper variant="sm" className="w-full">
    <div className="glass-tile-sm w-full p-5">
      <div className="relative z-[2] flex items-center justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-slate-400" />
          <span className="text-2xs uppercase tracking-[0.1em] text-slate-500 font-medium">Leaderboard</span>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1">
          {RANGE_OPTS.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={cn('px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors',
                range === r ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300')}>
              {r === 'alltime' ? 'All' : r.slice(0, 2).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-[2] flex flex-col gap-1">
        {shown.map((entry, i) => (
          <motion.div key={entry.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors min-w-0 overflow-hidden',
              entry.id === userId ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
            )}>
            <div className="w-6 text-[11px] text-slate-500 shrink-0 text-center">#{entry.rank}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate">{entry.username}</p>
            </div>
            <div className="text-right text-[12px] font-mono font-semibold text-white">
              <Counter to={entry.points} duration={800} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    </GlowWrapper>
  )
}
