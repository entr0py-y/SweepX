import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react'
import { cn, GlowBtn } from '../shared/primitives'
import { formatDistance } from '../../lib/location'
import { useQuestStore } from '../../store/questStore'

export const LocationValidator: React.FC = () => {
  const {
    mission, userCoords, distanceToQuest, locationValid, locationError,
    checkLocation, step,
  } = useQuestStore()

  const [fetching, setFetching] = useState(false)

  const runCheck = async () => {
    setFetching(true)
    await checkLocation()
    setFetching(false)
  }

  // Auto-run location check when we enter this step
  useEffect(() => {
    if (step === 'location_check' && !userCoords && !fetching) {
      runCheck()
    }
  }, [step]) // eslint-disable-line

  const statusIcon = fetching
    ? <Loader2 size={20} className="text-neo-p animate-spin" />
    : locationValid
      ? <CheckCircle2 size={20} className="text-neo-s" />
      : locationError
        ? <XCircle size={20} className="text-red-400" />
        : <Navigation size={20} className="text-slate-500" />

  const statusText = fetching
    ? 'Detecting your location…'
    : locationValid
      ? 'You are within range! ✅'
      : locationError ?? 'Press the button to check your location.'

  const distanceText = distanceToQuest !== null
    ? `${formatDistance(distanceToQuest)} from quest site`
    : null

  return (
    <div className="flex flex-col gap-5">
      {/* Quest pin info */}
      <div className="flex items-start gap-3 bg-surface-3 rounded-2xl p-4 border border-white/8">
        <MapPin size={18} className="text-neo-p mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{mission?.location.label}</p>
          <p className="text-2xs text-slate-500 font-mono mt-0.5">
            {mission?.location.lat.toFixed(5)}, {mission?.location.lng.toFixed(5)}
          </p>
          <p className="text-2xs text-slate-500 mt-1">Required radius: 50 metres</p>
        </div>
      </div>

      {/* Status card */}
      <motion.div
        key={String(locationValid) + String(!!locationError)}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center gap-3 rounded-2xl p-4 border transition-colors',
          locationValid  && 'bg-neo-v/10 border-neo-v/30',
          locationError  && !locationValid && 'bg-red-500/10 border-red-500/30',
          !locationValid && !locationError  && 'bg-surface-3 border-white/8',
        )}>
        <div className="shrink-0">{statusIcon}</div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            locationValid  && 'text-neo-s',
            locationError && !locationValid && 'text-red-400',
            !locationValid && !locationError  && 'text-slate-400',
          )}>
            {statusText}
          </p>
          {distanceText && (
            <p className="text-2xs text-slate-500 mt-0.5 font-mono">{distanceText}</p>
          )}
          {userCoords?.accuracy && (
            <p className="text-2xs text-slate-600 mt-0.5">
              GPS accuracy: ±{Math.round(userCoords.accuracy)}m
            </p>
          )}
        </div>
      </motion.div>

      {/* Accuracy note */}
      {!locationValid && !fetching && (
        <p className="text-2xs text-slate-600 text-center px-2">
          Make sure you are physically at the quest location with GPS enabled. Indoor GPS can be inaccurate.
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <GlowBtn
          variant="ghost"
          onClick={runCheck}
          disabled={fetching}
          className="flex-1 gap-2"
        >
          <RefreshCw size={13} className={fetching ? 'animate-spin' : ''} />
          {fetching ? 'Checking...' : 'Retry Location'}
        </GlowBtn>
      </div>
    </div>
  )
}
