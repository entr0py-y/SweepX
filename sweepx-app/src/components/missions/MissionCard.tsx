import React from 'react'
import { Zap } from 'lucide-react'
import type { Mission } from '../../types'
import { useQuestStore } from '../../store/questStore'
import { cn } from '../shared/primitives'
import { GlowWrapper } from '@/components/ui/glow-wrapper'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'

export const MissionCard: React.FC<{
  mission: Mission; index: number
}> = ({ mission, index }) => {
  const { openVerification } = useQuestStore()
  const isDone   = mission.status === 'completed'

  return (
    <GlowWrapper variant="lg">
      <div className={cn(
        'glass-tile h-full',
        isDone ? 'opacity-60' : ''
      )}>
        <div className="relative z-[2] h-full flex flex-col p-6 gap-4">
          <span className="absolute top-5 right-5 inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold text-slate-300 bg-white/[0.06] capitalize">
            {mission.difficulty}
          </span>

          <h3 className="text-base font-semibold text-white leading-tight pr-14">
            {mission.title}
          </h3>

          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
            {mission.description}
          </p>

          <div className="flex-1" />

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2 text-sm text-white font-mono font-semibold">
              <Zap size={14} className="text-white" />
              +{mission.rewardPoints} pts
            </div>
            {!isDone && (
              <InteractiveHoverButton
                text="Start"
                size="sm"
                onClick={() => openVerification(mission)}
              />
            )}
            {isDone && (
              <span className="text-2xs text-slate-400 font-semibold">Completed</span>
            )}
          </div>
        </div>
      </div>
      </GlowWrapper>
  )
}
