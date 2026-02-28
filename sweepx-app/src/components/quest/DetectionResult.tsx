import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Eye, TrendingDown, Info } from 'lucide-react'
import { cn } from '../shared/primitives'
import type { ImagePhaseState } from '../../types/quest'

interface Props {
  before: ImagePhaseState
  after:  ImagePhaseState
}

const ConfidenceBar: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-2xs text-slate-500">
      <span>{label}</span>
      <span className="font-mono text-neo-s">{Math.round(value * 100)}%</span>
    </div>
    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-neo-v to-neo-p rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  </div>
)

export const DetectionResult: React.FC<Props> = ({ before, after }) => {
  const reduced = before.trashCount - after.trashCount
  const hasReduction = reduced > 0

  const beforeSummaryEntries = Object.entries(before.classSummary)
  const afterSummaryEntries  = Object.entries(after.classSummary)

  return (
    <div className="flex flex-col gap-4">
      {/* Reduction headline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'flex items-center gap-3 rounded-2xl p-4 border',
          hasReduction
            ? 'bg-neo-v/10 border-neo-v/30'
            : 'bg-red-500/10 border-red-500/30',
        )}>
        <TrendingDown size={22} className={hasReduction ? 'text-neo-s' : 'text-red-400'} />
        <div>
          <p className={cn('text-sm font-bold', hasReduction ? 'text-white' : 'text-red-300')}>
            {hasReduction
              ? `${reduced} trash ${reduced === 1 ? 'item' : 'items'} removed!`
              : 'No reduction detected'}
          </p>
          <p className="text-2xs text-slate-500 mt-0.5">
            Before: {before.trashCount} items &rarr; After: {after.trashCount} items
          </p>
        </div>
      </motion.div>

      {/* Image comparison */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { phase: 'Before', state: before, accent: 'border-slate-600' },
          { phase: 'After',  state: after,  accent: 'border-neo-v/40' },
        ].map(({ phase, state, accent }) => (
          <div key={phase} className={cn('rounded-2xl overflow-hidden border', accent)}>
            {state.imageUrl && (
              <img
                src={state.imageUrl}
                alt={`${phase} photo`}
                className="w-full aspect-video object-cover"
              />
            )}
            <div className="p-2.5 bg-surface-3">
              <p className="text-2xs font-semibold text-slate-400">{phase}</p>
              <p className="text-xs font-bold font-mono text-neo-p">{state.trashCount} items</p>
              {Object.entries(state.classSummary).length > 0 && (
                <p className="text-2xs text-slate-600 mt-0.5">
                  {Object.entries(state.classSummary).map(([c, n]) => `${n}× ${c}`).join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confidence meters */}
      <div className="flex flex-col gap-2.5 bg-surface-3 rounded-2xl p-4 border border-white/8">
        <div className="flex items-center gap-1.5 mb-1">
          <Eye size={12} className="text-neo-p" />
          <span className="text-2xs font-semibold text-slate-400">AI Detection Confidence</span>
        </div>
        {before.confidence > 0 && (
          <ConfidenceBar value={before.confidence} label="Before photo" />
        )}
        {after.confidence > 0 && (
          <ConfidenceBar value={after.confidence} label="After photo" />
        )}
        {before.confidence === 0 && after.confidence === 0 && (
          <p className="text-2xs text-slate-600">No trash detected in either photo.</p>
        )}
      </div>

      {/* Class summary detail */}
      {(beforeSummaryEntries.length > 0 || afterSummaryEntries.length > 0) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Trash2 size={12} className="text-slate-500" />
            <span className="text-2xs text-slate-500">Detected object types</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {beforeSummaryEntries.map(([cls, count]) => (
              <span key={cls} className="text-2xs px-2 py-0.5 bg-surface-4 border border-white/10 rounded-full text-slate-400">
                {count}× {cls}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2 text-2xs text-slate-600">
        <Info size={11} className="shrink-0 mt-0.5" />
        <span>Detection powered by Roboflow AI. Results may vary based on image quality and lighting.</span>
      </div>
    </div>
  )
}
