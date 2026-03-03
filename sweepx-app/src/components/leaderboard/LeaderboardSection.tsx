import React from 'react'
import { Trophy, Crown, Medal, TrendingUp } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { Counter, cn } from '../shared/primitives'
import { GlowWrapper } from '@/components/ui/glow-wrapper'

const RANGE_OPTS = ['weekly', 'monthly', 'alltime'] as const

interface LeaderboardSectionProps { id?: string }

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ id }) => {
  const { leaderboard, range, setRange, userId } = useAppStore(s => ({
    leaderboard: s.leaderboard,
    range: s.leaderboardRange,
    setRange: s.setLeaderboardRange,
    userId: s.user.id,
  }))

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3, 20)

  return (
    <section id={id} className="px-6 md:px-10 py-12 md:py-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy size={18} className="text-neo-p" />
            <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
              Global <span className="text-neo-p">Rankings</span>
            </h2>
          </div>
          <p className="text-sm text-slate-500">Top eco-warriors making a real-world impact</p>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 rounded-xl p-1"
          style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'url("#liquid-glass-filter") blur(2px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: [
              'inset 3px 3px 0.5px -3px rgba(255,255,255,0.14)',
              'inset -3px -3px 0.5px -3px rgba(0,0,0,0.4)',
              'inset 1px 1px 1px -0.5px rgba(255,255,255,0.20)',
              'inset 0 0 4px 4px rgba(255,255,255,0.02)',
            ].join(', '),
          }}>
          {RANGE_OPTS.map(r => (
            <button key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200',
                range === r
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              style={range === r ? {
                background: 'linear-gradient(180deg, rgba(168,85,247,0.35) 0%, rgba(124,58,237,0.25) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
              } : {}}>
              {r === 'alltime' ? 'All Time' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Podium top 3 ── */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
        {/* 2nd */}
        {top3[1] && (
          <div
            className="flex flex-col items-center gap-2 pt-6"
          >
            <GlowWrapper variant="sm" className="w-full">
              <div className="glass-tile-sm w-full p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(148,163,184,0.3), rgba(100,116,139,0.2))',
                    border: '1px solid rgba(148,163,184,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}>🥈</div>
                <p className="text-xs font-bold text-white truncate w-full text-center">{top3[1].username}</p>
                <p className="text-xs font-mono text-slate-400"><Counter to={top3[1].points} duration={1000} /> pts</p>
                <div className="text-xs text-slate-500 font-semibold">#2</div>
              </div>
            </GlowWrapper>
          </div>
        )}

        {/* 1st — elevated */}
        {top3[0] && (
          <div
            className="flex flex-col items-center gap-2 -mt-4"
          >
            <GlowWrapper variant="sm" className="w-full">
              <div className="glass-tile-sm w-full p-4 flex flex-col items-center gap-2"
                style={{
                  background: 'linear-gradient(160deg, rgba(124,58,237,0.18) 0%, rgba(10,10,15,0.85) 100%)',
                }}>
                <Crown size={14} className="text-yellow-400 mb-0.5" />
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.35), rgba(202,138,4,0.2))',
                    border: '1px solid rgba(234,179,8,0.35)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 20px rgba(234,179,8,0.2)',
                  }}>🥇</div>
                <p className="text-sm font-bold text-white truncate w-full text-center">{top3[0].username}</p>
                <p className="text-xs font-mono text-neo-p font-bold"><Counter to={top3[0].points} duration={1000} /> pts</p>
                <div className="text-xs text-yellow-400/80 font-bold">#1 Champion</div>
              </div>
            </GlowWrapper>
          </div>
        )}

        {/* 3rd */}
        {top3[2] && (
          <div
            className="flex flex-col items-center gap-2 pt-6"
          >
            <GlowWrapper variant="sm" className="w-full">
              <div className="glass-tile-sm w-full p-4 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(180,83,9,0.3), rgba(146,64,14,0.2))',
                    border: '1px solid rgba(180,83,9,0.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}>🥉</div>
                <p className="text-xs font-bold text-white truncate w-full text-center">{top3[2].username}</p>
                <p className="text-xs font-mono text-slate-400"><Counter to={top3[2].points} duration={1000} /> pts</p>
                <div className="text-xs text-slate-500 font-semibold">#3</div>
              </div>
            </GlowWrapper>
          </div>
        )}
      </div>

      {/* ── Full table ── */}
      <GlowWrapper variant="lg" className="w-full">
        <div className="glass-tile w-full p-0 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.05]">
            <span className="w-8 text-[10px] uppercase tracking-widest text-slate-600 font-semibold text-center">#</span>
            <span className="flex-1 text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Player</span>
            <span className="w-20 text-right text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Score</span>
            <span className="w-12 text-right text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Rank</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.03]">
            {rest.map((entry, i) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-4 px-5 py-3 transition-colors duration-150',
                  entry.id === userId
                    ? 'bg-neo-v/10 border-l-2 border-neo-p'
                    : 'hover:bg-white/[0.025]'
                )}
              >
                <div className="w-8 text-center">
                  <span className="text-[12px] font-mono text-slate-500">#{entry.rank}</span>
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs"
                    style={{
                      background: `hsl(${(entry.rank * 37) % 360}, 50%, 25%)`,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  <p className={cn('text-[13px] font-semibold truncate', entry.id === userId ? 'text-neo-p' : 'text-slate-200')}>
                    {entry.username}
                    {entry.id === userId && <span className="ml-1.5 text-[10px] text-neo-p/70 font-normal">(you)</span>}
                  </p>
                </div>

                <div className="w-20 text-right">
                  <span className="text-[13px] font-mono font-semibold text-white">
                    <Counter to={entry.points} duration={600} />
                  </span>
                  <span className="text-[10px] text-slate-600 ml-0.5">pts</span>
                </div>

                <div className="w-12 text-right">
                  <div className="inline-flex items-center gap-0.5">
                    <TrendingUp size={9} className="text-emerald-500" />
                    <span className="text-[11px] font-mono text-emerald-500">+{Math.floor(Math.random() * 5) + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlowWrapper>
    </section>
  )
}
