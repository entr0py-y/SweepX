import type { RoboflowPrediction } from '../lib/roboflow'
import type { GpsCoords } from '../lib/location'

// ── Verification Flow Steps ───────────────────────────────────────────────────

export type VerificationStep =
  | 'idle'
  | 'starting'
  | 'location_check'
  | 'before_capture'
  | 'uploading_before'
  | 'detecting_before'
  | 'ready_after'
  | 'after_capture'
  | 'uploading_after'
  | 'detecting_after'
  | 'validating'
  | 'success'
  | 'rejected'

export const STEP_LABELS: Record<Exclude<VerificationStep, 'idle' | 'starting'>, string> = {
  location_check:   'Location',
  before_capture:   'Before',
  uploading_before: 'Before',
  detecting_before: 'Before',
  ready_after:      'Clean Up',
  after_capture:    'After',
  uploading_after:  'After',
  detecting_after:  'After',
  validating:       'Verify',
  success:          'Done',
  rejected:         'Done',
}

export const ORDERED_DISPLAY_STEPS = [
  'location_check',
  'before_capture',
  'ready_after',
  'after_capture',
  'validating',
] as const

// ── Image Phase State ─────────────────────────────────────────────────────────

export interface ImagePhaseState {
  imageUrl: string | null
  imageHash: string | null
  trashCount: number
  confidence: number
  detections: RoboflowPrediction[]
  classSummary: Record<string, number>
  coords: GpsCoords | null
}

// ── Rejection Reasons ─────────────────────────────────────────────────────────

export type RejectionCode =
  | 'location_too_far'
  | 'no_trash_reduction'
  | 'duplicate_image'
  | 'daily_limit_reached'
  | 'upload_failed'
  | 'detection_failed'
  | 'session_error'

export const REJECTION_MESSAGES: Record<RejectionCode, string> = {
  location_too_far:     'You are too far from the quest location. Move within 50m and try again.',
  no_trash_reduction:   'No significant trash reduction was detected. The after photo must show fewer items than the before photo.',
  duplicate_image:      'This image has already been submitted. Please capture a new, original photo.',
  daily_limit_reached:  'You have completed 5 quests today — the maximum allowed. Come back tomorrow!',
  upload_failed:        'Image upload failed. Check your internet connection and try again.',
  detection_failed:     'Trash detection failed. The image may be too dark or blurry. Please retake.',
  session_error:        'Quest session error. Please restart and try again.',
}

// ── XP Calculation ────────────────────────────────────────────────────────────

export interface XpBreakdown {
  baseXP:           number
  reductionBonus:   number
  streakBonus:      number
  totalXP:          number
  trashReduced:     number
}

export function calculateXP(params: {
  missionRewardXP: number
  trashCountBefore: number
  trashCountAfter: number
  streak: number
}): XpBreakdown {
  const { missionRewardXP, trashCountBefore, trashCountAfter, streak } = params
  const trashReduced = Math.max(0, trashCountBefore - trashCountAfter)
  const baseXP = missionRewardXP
  const reductionBonus = trashReduced * 10
  const streakBonus = streak >= 7 ? 50 : streak >= 3 ? 20 : 0
  return {
    baseXP,
    reductionBonus,
    streakBonus,
    totalXP: baseXP + reductionBonus + streakBonus,
    trashReduced,
  }
}
