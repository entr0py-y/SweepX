import React from 'react'
import { CheckCircle, MapPin, Camera, Trash2, ShieldCheck } from 'lucide-react'
import { cn } from '../shared/primitives'
import type { VerificationStep } from '../../types/quest'
import { ORDERED_DISPLAY_STEPS } from '../../types/quest'

const STEP_META = [
  { id: 'location_check',  label: 'Location',     icon: MapPin },
  { id: 'before_capture',  label: 'Before Photo',  icon: Camera },
  { id: 'ready_after',     label: 'Clean Up',      icon: Trash2 },
  { id: 'after_capture',   label: 'After Photo',   icon: Camera },
  { id: 'validating',      label: 'Verify',        icon: ShieldCheck },
] as const

type DisplayStep = typeof ORDERED_DISPLAY_STEPS[number]

function resolveDisplayStep(step: VerificationStep): DisplayStep {
  const overrides: Partial<Record<VerificationStep, DisplayStep>> = {
    uploading_before: 'before_capture',
    detecting_before: 'before_capture',
    uploading_after:  'after_capture',
    detecting_after:  'after_capture',
  }
  return (overrides[step] ?? step) as DisplayStep
}

function isStepComplete(stepId: DisplayStep, currentDisplay: DisplayStep): boolean {
  const order: DisplayStep[] = [...ORDERED_DISPLAY_STEPS]
  return order.indexOf(stepId) < order.indexOf(currentDisplay)
}

interface Props {
  step: VerificationStep
  success?: boolean
  rejected?: boolean
}

export const StepIndicator: React.FC<Props> = ({ step, success, rejected }) => {
  const currentDisplay = resolveDisplayStep(step)

  return (
    <div className="flex items-center justify-between px-1">
      {STEP_META.map((meta, i) => {
        const isActive   = meta.id === currentDisplay && !success && !rejected
        const isDone     = isStepComplete(meta.id, currentDisplay) || success
        const isRejected = rejected && meta.id === currentDisplay
        const Icon = meta.icon

        return (
          <React.Fragment key={meta.id}>
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                isDone     && !isRejected && 'bg-neo-v border-2 border-neo-p shadow-glow-v',
                isActive   && 'bg-neo-v/20 border-2 border-neo-p ring-2 ring-neo-p/30 animate-pulse',
                isRejected && 'bg-red-500/20 border-2 border-red-500',
                !isDone && !isActive && !isRejected && 'bg-surface-3 border border-white/10',
              )}>
                {isDone && !isRejected
                  ? <CheckCircle size={14} className="text-white" />
                  : isRejected
                    ? <span className="text-xs text-red-400">✕</span>
                    : <Icon size={13} className={isActive ? 'text-neo-p' : 'text-slate-500'} />
                }
              </div>
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap',
                isDone     && 'text-neo-s',
                isActive   && 'text-white',
                isRejected && 'text-red-400',
                !isDone && !isActive && !isRejected && 'text-slate-600',
              )}>
                {meta.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_META.length - 1 && (
              <div className={cn(
                'h-[2px] flex-1 mx-1 rounded-full transition-all duration-500',
                isStepComplete(meta.id, currentDisplay) || success
                  ? 'bg-gradient-to-r from-neo-v to-neo-p'
                  : 'bg-surface-3',
              )} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
