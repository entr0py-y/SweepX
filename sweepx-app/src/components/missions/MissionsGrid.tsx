import React from 'react'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { MissionCard } from './MissionCard'
import { SecHead, cn } from '../shared/primitives'
import type { MissionStatus, Difficulty } from '../../types'

const FILTER_OPTS: { label: string; value: string }[] = [
  { label: 'All',        value: 'all'       },
  { label: 'Available',  value: 'available' },
  { label: 'Active',     value: 'active'    },
  { label: 'Completed',  value: 'completed' },
  { label: 'Easy',       value: 'easy'      },
  { label: 'Hard',       value: 'hard'      },
]

export const MissionsGrid: React.FC<{ id?: string }> = ({ id }) => {
  const { missions, filter, setFilter } = useAppStore(s => ({
    missions:  s.missions,
    filter:    s.missionFilter,
    setFilter: s.setMissionFilter,
  }))

  const shown = missions.filter(m => {
    if (filter === 'all') return true
    return m.status === filter || m.difficulty === filter
  })

  return (
    <section id={id} className="px-6 md:px-10 py-10">
      <SecHead
        tag="Missions"
        title="Active"
        accent="Challenges"
        sub="Real-world eco missions near you. Start one, complete it, earn rewards."
      />

      {/* Filter bar — pill style */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter size={12} className="text-slate-500 shrink-0" />
        {FILTER_OPTS.map(f => (
          <button key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3.5 py-1 rounded-full text-2xs font-semibold transition-all duration-200',
              filter === f.value
                ? 'bg-white/[0.08] text-white border border-white/[0.06]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent',
            )}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.length === 0
          ? <div className="col-span-3 text-center py-16 text-slate-600 text-sm">No missions match this filter.</div>
          : shown.map((m, i) => <MissionCard key={m.id} mission={m} index={i} />)
        }
      </div>
    </section>
  )
}
