import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Leaf, ArrowRight, RotateCcw, XCircle } from 'lucide-react'
import { cn, GlowBtn } from '../shared/primitives'
import { useQuestStore, REJECTION_MESSAGES } from '../../store/questStore'
import { useAppStore } from '../../store/appStore'
import { StepIndicator }    from './StepIndicator'
import { LocationValidator } from './LocationValidator'
import { CameraCapture }     from './CameraCapture'
import { DetectionResult }   from './DetectionResult'
import { XPRewardAnimation } from './XPRewardAnimation'
import type { GpsCoords } from '../../lib/location'

// ─── Loading screen for async steps ──────────────────────────────────────────

const LoadingStep: React.FC<{ label: string; sub?: string }> = ({ label, sub }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-10">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full bg-neo-v/20 animate-ping" />
      <div className="relative w-full h-full rounded-full bg-neo-v/10 border border-neo-v/30 flex items-center justify-center">
        <Loader2 size={24} className="text-neo-p animate-spin" />
      </div>
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-white">{label}</p>
      {sub && <p className="text-2xs text-slate-500 mt-1">{sub}</p>}
    </div>
  </div>
)

// ─── "Ready to clean up" interstitial ────────────────────────────────────────

const ReadyAfterScreen: React.FC<{ onProceed: () => void }> = ({ onProceed }) => (
  <div className="flex flex-col items-center gap-6 py-4">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative w-24 h-24"
    >
      <div className="absolute inset-0 rounded-full bg-neo-v/20 animate-pulse" />
      <div className="relative w-full h-full rounded-full bg-neo-v/10 border-2 border-neo-v/40 flex items-center justify-center">
        <Leaf size={36} className="text-neo-p" />
      </div>
    </motion.div>

    <div className="text-center">
      <h3 className="text-xl font-bold text-white mb-2">Before photo captured!</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
        Now go clean up the area. When you're done, come back here to take your <span className="text-neo-p font-semibold">after photo</span> to verify the impact.
      </p>
    </div>

    <div className="w-full bg-surface-3 rounded-2xl p-4 border border-white/8">
      <p className="text-2xs text-slate-500 mb-3 font-semibold uppercase tracking-wide">Tips</p>
      <ul className="flex flex-col gap-2">
        {[
          'Collect as much trash as possible',
          'Stay in the quest area (50m radius)',
          'Take the after photo from a similar angle',
          'Both photos must be taken during this session',
        ].map(tip => (
          <li key={tip} className="flex items-start gap-2 text-2xs text-slate-400">
            <span className="text-neo-p shrink-0 mt-0.5">•</span> {tip}
          </li>
        ))}
      </ul>
    </div>

    <GlowBtn variant="primary" onClick={onProceed} className="w-full gap-2">
      <ArrowRight size={14} /> I'm Done Cleaning — Take After Photo
    </GlowBtn>
  </div>
)

// ─── Rejection screen ─────────────────────────────────────────────────────────

const RejectedScreen: React.FC<{
  rejectionCode: string | null
  error: string | null
  onClose: () => void
  onRetry: () => void
}> = ({ rejectionCode, error, onClose, onRetry }) => {
  const message = (rejectionCode && REJECTION_MESSAGES[rejectionCode as keyof typeof REJECTION_MESSAGES])
    ?? error
    ?? 'Quest validation failed. Please try again.'

  const isDailyLimit = rejectionCode === 'daily_limit_reached'

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center"
      >
        <XCircle size={36} className="text-red-400" />
      </motion.div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-red-300 mb-2">Quest Not Verified</h3>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{message}</p>
      </div>

      <div className="w-full bg-red-500/5 rounded-2xl p-4 border border-red-500/20">
        <p className="text-2xs text-slate-500 mb-2 font-semibold">Rejection reason</p>
        <p className="text-xs text-red-400 font-mono">{rejectionCode ?? 'unknown'}</p>
      </div>

      <div className="flex gap-3 w-full">
        <GlowBtn variant="ghost" onClick={onClose} className="flex-1">
          Close
        </GlowBtn>
        {!isDailyLimit && (
          <GlowBtn variant="primary" onClick={onRetry} className="flex-1 gap-1.5">
            <RotateCcw size={13} /> Try Again
          </GlowBtn>
        )}
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export const QuestVerificationModal: React.FC = () => {
  const {
    isOpen, mission, step, error,
    before, after,
    xpBreakdown, rejectionCode,
    locationValid,
    closeVerification, proceedToAfterCapture,
    submitBeforePhoto, submitAfterPhoto,
    retryStep,
  } = useQuestStore()

  const user = useAppStore(s => s.user)

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !mission) return null

  // ── Step content router ───────────────────────────────────────────────────

  const renderBody = () => {
    switch (step) {
      case 'starting':
        return <LoadingStep label="Starting quest session…" sub="Validating your account" />

      case 'location_check':
        return (
          <div className="flex flex-col gap-4">
            <LocationValidator />
            {locationValid && (
              <GlowBtn
                variant="primary"
                onClick={() => useQuestStore.getState().advanceToBeforeCapture()}
                className="w-full gap-2"
              >
                <ArrowRight size={14} /> Location Confirmed — Take Before Photo
              </GlowBtn>
            )}
          </div>
        )

      case 'before_capture':
        return (
          <CameraCapture
            label="Take a BEFORE photo showing the trash"
            hint="Include as much of the area and trash as possible"
            onCapture={(blob: Blob, _coords: GpsCoords) => submitBeforePhoto(blob)}
          />
        )

      case 'uploading_before':
        return <LoadingStep label="Uploading before photo…" sub="Checking for duplicates" />

      case 'detecting_before':
        return <LoadingStep label="Detecting trash in photo…" sub="AI is counting items — this may take a moment" />

      case 'ready_after':
        return <ReadyAfterScreen onProceed={proceedToAfterCapture} />

      case 'after_capture':
        return (
          <CameraCapture
            label="Take an AFTER photo of the clean area"
            hint="Capture from the same angle as the before photo"
            onCapture={(blob: Blob, _coords: GpsCoords) => submitAfterPhoto(blob)}
          />
        )

      case 'uploading_after':
        return <LoadingStep label="Uploading after photo…" sub="Checking for duplicates" />

      case 'detecting_after':
        return <LoadingStep label="Detecting trash in after photo…" sub="Verifying the cleanup" />

      case 'validating':
        return <LoadingStep label="Validating your quest…" sub="Checking location, trash reduction, and session integrity" />

      case 'success':
        return xpBreakdown ? (
          <div className="flex flex-col gap-4">
            <XPRewardAnimation
              breakdown={xpBreakdown}
              username={user.username}
              missionTitle={mission.title}
            />
            <DetectionResult before={before} after={after} />
            <GlowBtn variant="primary" onClick={closeVerification} className="w-full">
              🎉 Return to Dashboard
            </GlowBtn>
          </div>
        ) : null

      case 'rejected':
        return (
          <RejectedScreen
            rejectionCode={rejectionCode}
            error={error}
            onClose={closeVerification}
            onRetry={retryStep}
          />
        )

      default:
        return null
    }
  }

  // ── Step title ────────────────────────────────────────────────────────────

  const STEP_TITLES: Partial<Record<typeof step, string>> = {
    starting:         'Quest Starting',
    location_check:   'Verify Location',
    before_capture:   'Before Photo',
    uploading_before: 'Processing Photo',
    detecting_before: 'AI Analysis',
    ready_after:      'Clean Up!',
    after_capture:    'After Photo',
    uploading_after:  'Processing Photo',
    detecting_after:  'AI Analysis',
    validating:       'Validating Quest',
    success:          'Quest Complete! 🎉',
    rejected:         'Verification Failed',
  }

  const canClose = !['uploading_before', 'detecting_before', 'uploading_after', 'detecting_after', 'validating', 'starting'].includes(step)

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={canClose ? closeVerification : undefined}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          className={cn(
            'relative z-10 w-full sm:max-w-md bg-s-1 border border-line rounded-t-3xl sm:rounded-3xl',
            'flex flex-col overflow-hidden shadow-elev-2',
          )}
          style={{ maxHeight: 'calc(100dvh - 32px)' }}
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line shrink-0">
            <div className="min-w-0">
              <p className="text-2xs text-slate-500 font-medium truncate">{mission.title}</p>
              <h2 className="text-base font-bold text-white mt-0.5">{STEP_TITLES[step] ?? 'Quest Verification'}</h2>
            </div>
            <button
              onClick={canClose ? closeVerification : undefined}
              disabled={!canClose}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center border border-line transition-colors ml-3 shrink-0',
                canClose ? 'hover:bg-surface-3 text-slate-400 hover:text-white' : 'opacity-30 cursor-not-allowed text-slate-600',
              )}
            >
              <X size={14} />
            </button>
          </div>

          {/* Step indicator */}
          {!['starting', 'success', 'rejected'].includes(step) && (
            <div className="px-5 py-3 border-b border-line shrink-0">
              <StepIndicator step={step} />
            </div>
          )}

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderBody()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  )
}
