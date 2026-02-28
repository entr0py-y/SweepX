/* ── Module-level pipeline helpers avoid private-action pattern ── */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Draft } from 'immer'
import type { Mission } from '../types'
import type { VerificationStep, ImagePhaseState, RejectionCode, XpBreakdown } from '../types/quest'
import { REJECTION_MESSAGES, calculateXP } from '../types/quest'
import type { GpsCoords } from '../lib/location'
import { getCurrentPosition, haversineDistance, isWithinRadius } from '../lib/location'
import { sha256Hash } from '../lib/imageHash'
import { uploadToCloudinary } from '../lib/cloudinary'
import { detectTrash } from '../lib/roboflow'
import { createSession, updateSession, insertQuestImage, getDailyQuestCount, upsertLeaderboard, supabase, SUPABASE_ENABLED } from '../lib/supabase'
import { useAppStore } from './appStore'

export { REJECTION_MESSAGES }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyPhase = (): ImagePhaseState => ({
  imageUrl: null, imageHash: null, trashCount: 0,
  confidence: 0, detections: [], classSummary: {}, coords: null,
})

// ─── Interface ────────────────────────────────────────────────────────────────

interface QuestVerifyState {
  isOpen: boolean
  mission: Mission | null
  sessionId: string | null
  step: VerificationStep
  error: string | null
  userCoords: GpsCoords | null
  distanceToQuest: number | null
  locationValid: boolean
  locationError: string | null
  before: ImagePhaseState
  after: ImagePhaseState
  xpBreakdown: XpBreakdown | null
  rejectionCode: RejectionCode | null
  openVerification:       (m: Mission) => void
  closeVerification:      () => void
  checkLocation:          () => Promise<void>
  advanceToBeforeCapture: () => void
  submitBeforePhoto:      (blob: Blob) => Promise<void>
  proceedToAfterCapture:  () => void
  submitAfterPhoto:       (blob: Blob) => Promise<void>
  retryStep:              () => void
}

// ─── Module-level pipeline (typed, no @ts-ignore needed) ──────────────────────

type SetFn = (recipe: (s: Draft<QuestVerifyState>) => void) => void
type GetFn = () => QuestVerifyState

async function runImagePipeline(phase: 'before' | 'after', blob: Blob, set: SetFn, get: GetFn): Promise<void> {
  const uploadStep = phase === 'before' ? 'uploading_before'  : 'uploading_after'
  const detectStep = phase === 'before' ? 'detecting_before'  : 'detecting_after'
  const nextStep   = phase === 'before' ? ('ready_after' as VerificationStep) : ('validating' as VerificationStep)

  set(s => { s.step = uploadStep; s.error = null })
  const { mission, sessionId, userCoords } = get()
  const app = useAppStore.getState()

  try {
    // 1. Hash — duplicate check before upload saves bandwidth
    const hash = await sha256Hash(blob)
    if (SUPABASE_ENABLED) {
      const { data: dup } = await supabase.from('quest_images').select('id').eq('image_hash', hash).maybeSingle()
      if (dup) { set(s => { s.step = 'rejected'; s.rejectionCode = 'duplicate_image' }); return }
    }

    // 2. Upload to Cloudinary
    let imageUrl: string
    try {
      imageUrl = await uploadToCloudinary(blob, `sweepx/${app.user.id}/quest_${mission!.id}/${phase}`)
    } catch (err) {
      set(s => { s.step = 'rejected'; s.rejectionCode = 'upload_failed'; s.error = (err as Error).message })
      return
    }

    // 3. AI trash detection
    set(s => { s.step = detectStep })
    let detection
    try { detection = await detectTrash(imageUrl) }
    catch (err) {
      set(s => { s.step = 'rejected'; s.rejectionCode = 'detection_failed'; s.error = (err as Error).message })
      return
    }

    // 4. Fresh GPS for capture record (best-effort)
    let captureCoords = userCoords
    try { captureCoords = await getCurrentPosition() } catch { /* ok — use existing */ }

    // 5. Persist to Supabase (server-side duplicate check via UNIQUE constraint)
    const ok = await insertQuestImage({
      session_id: sessionId!, user_id: app.user.id, quest_id: mission!.id, type: phase,
      image_url: imageUrl, image_hash: hash,
      gps_lat: captureCoords?.lat ?? null, gps_lng: captureCoords?.lng ?? null,
      gps_accuracy: captureCoords?.accuracy ?? null,
      trash_count: detection.trashCount, detection_confidence: detection.confidence,
      captured_at: new Date().toISOString(),
    })
    if (!ok) { set(s => { s.step = 'rejected'; s.rejectionCode = 'duplicate_image' }); return }

    // 6. Update session record
    await updateSession(sessionId!, phase === 'before'
      ? { trash_count_before: detection.trashCount, before_image_url: imageUrl }
      : { trash_count_after:  detection.trashCount, after_image_url:  imageUrl })

    // 7. Update local state
    set(s => {
      const t = phase === 'before' ? s.before : s.after
      t.imageUrl = imageUrl; t.imageHash = hash
      t.trashCount = detection.trashCount; t.confidence = detection.confidence
      t.detections = detection.detections; t.classSummary = detection.classSummary
      t.coords = captureCoords ?? null
    })

    if (phase === 'after') {
      set(s => { s.step = 'validating' })
      await runValidation(set, get)
    } else {
      set(s => { s.step = nextStep })
    }
  } catch (err) {
    set(s => { s.error = (err as Error).message; s.step = phase === 'before' ? 'before_capture' : 'after_capture' })
  }
}

async function runValidation(set: SetFn, get: GetFn): Promise<void> {
  const { before, after, locationValid, mission, sessionId } = get()
  const app = useAppStore.getState()

  const doReject = async (code: RejectionCode) => {
    await updateSession(sessionId!, { status: 'rejected', rejection_reason: code, completed_at: new Date().toISOString() })
    set(s => { s.step = 'rejected'; s.rejectionCode = code })
  }

  if (!locationValid)                        { await doReject('location_too_far');   return }
  if (after.trashCount >= before.trashCount) { await doReject('no_trash_reduction'); return }

  const breakdown = calculateXP({
    missionRewardXP:  mission!.rewardXP,
    trashCountBefore: before.trashCount,
    trashCountAfter:  after.trashCount,
    streak:           app.user.streak,
  })

  await updateSession(sessionId!, {
    status: 'completed', xp_awarded: breakdown.totalXP,
    completed_at: new Date().toISOString(),
    trash_count_before: before.trashCount, trash_count_after: after.trashCount,
  })

  await upsertLeaderboard(app.user.id, app.user.username, app.user.xp + breakdown.totalXP, app.user.missionsCompleted + 1)

  useAppStore.getState().completeMission(mission!.id)
  useAppStore.getState().addXP(breakdown.totalXP)

  set(s => { s.xpBreakdown = breakdown; s.step = 'success' })
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useQuestStore = create<QuestVerifyState>()(
  immer((set, get) => ({
    isOpen: false, mission: null, sessionId: null, step: 'idle', error: null,
    userCoords: null, distanceToQuest: null, locationValid: false, locationError: null,
    before: emptyPhase(), after: emptyPhase(), xpBreakdown: null, rejectionCode: null,

    openVerification: (mission) => {
      set(s => {
        s.isOpen          = true
        s.mission         = mission
        s.sessionId       = null
        s.step            = 'starting'
        s.error           = null
        s.userCoords      = null
        s.distanceToQuest = null
        s.locationValid   = false
        s.locationError   = null
        s.before          = emptyPhase()
        s.after           = emptyPhase()
        s.xpBreakdown     = null
        s.rejectionCode   = null
      })
      ;(async () => {
        const m = get().mission
        if (!m) return
        const app = useAppStore.getState()
        const daily = await getDailyQuestCount(app.user.id)
        if (daily >= 5) { set(s => { s.step = 'rejected'; s.rejectionCode = 'daily_limit_reached' }); return }
        const sessionId = await createSession({
          user_id: app.user.id, quest_id: m.id,
          quest_lat: m.location.lat, quest_lng: m.location.lng,
          user_lat: null, user_lng: null, distance_meters: null,
          started_at: new Date().toISOString(), status: 'active',
        })
        set(s => { s.sessionId = sessionId ?? `local-${Date.now()}`; s.step = 'location_check' })
      })()
    },

    closeVerification: () => set(s => { s.isOpen = false; s.step = 'idle' }),
    advanceToBeforeCapture: () => set(s => { s.step = 'before_capture' }),

    checkLocation: async () => {
      set(s => { s.locationError = null; s.userCoords = null; s.distanceToQuest = null })
      const { mission, sessionId } = get()
      if (!mission) return
      try {
        const coords = await getCurrentPosition()
        const dist = haversineDistance(coords, mission.location)
        const valid = isWithinRadius(coords, mission.location, 50)
        set(s => { s.userCoords = coords; s.distanceToQuest = dist; s.locationValid = valid })
        await updateSession(sessionId!, { user_lat: coords.lat, user_lng: coords.lng, distance_meters: dist })
        if (!valid) set(s => { s.locationError = `You are ${Math.round(dist)}m away. Move within 50m.` })
      } catch (err) { set(s => { s.locationError = (err as Error).message }) }
    },

    submitBeforePhoto: async (blob) => runImagePipeline('before', blob, set, get),
    proceedToAfterCapture: () => set(s => { s.step = 'after_capture' }),
    submitAfterPhoto:  async (blob) => runImagePipeline('after',  blob, set, get),

    retryStep: () => set(s => {
      s.step = 'location_check'; s.error = null; s.rejectionCode = null
      s.before = emptyPhase(); s.after = emptyPhase()
    }),
  }))
)
