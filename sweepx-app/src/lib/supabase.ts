import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Offline/dev mode when env vars are not configured
export const SUPABASE_ENABLED = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

if (!SUPABASE_ENABLED) {
  console.warn('[SweepX] Supabase env vars not set – running in offline mock mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable.')
}

export const supabase = createClient(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY ?? 'placeholder-key',
)

// ── Quest Sessions ────────────────────────────────────────────────────────────

export interface QuestSessionRow {
  id: string
  user_id: string
  quest_id: string
  quest_lat: number
  quest_lng: number
  user_lat: number | null
  user_lng: number | null
  distance_meters: number | null
  started_at: string
  completed_at: string | null
  status: 'active' | 'completed' | 'rejected'
  rejection_reason: string | null
  trash_count_before: number
  trash_count_after: number
  before_image_url: string | null
  after_image_url: string | null
  xp_awarded: number
}

export interface QuestImageRow {
  id?: string
  session_id: string
  user_id: string
  quest_id: string
  type: 'before' | 'after'
  image_url: string
  image_hash: string
  gps_lat: number | null
  gps_lng: number | null
  gps_accuracy: number | null
  trash_count: number
  detection_confidence: number
  captured_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a new quest session record. Returns null in offline mode. */
export async function createSession(data: Omit<QuestSessionRow, 'id' | 'completed_at' | 'rejection_reason' | 'trash_count_before' | 'trash_count_after' | 'before_image_url' | 'after_image_url' | 'xp_awarded'>): Promise<string | null> {
  if (!SUPABASE_ENABLED) {
    return `offline-session-${Date.now()}`
  }
  const { data: row, error } = await supabase
    .from('quest_sessions')
    .insert({ ...data, status: 'active', trash_count_before: 0, trash_count_after: 0, xp_awarded: 0 })
    .select('id')
    .single()
  if (error) { console.error('[Supabase] createSession error:', error); return null }
  return row?.id ?? null
}

/** Update an existing session with before/after data or final status. */
export async function updateSession(id: string, patch: Partial<Omit<QuestSessionRow, 'id' | 'user_id' | 'quest_id' | 'started_at'>>): Promise<void> {
  if (!SUPABASE_ENABLED) return
  const { error } = await supabase.from('quest_sessions').update(patch).eq('id', id)
  if (error) console.error('[Supabase] updateSession error:', error)
}

/** Insert an image record. Checks for duplicate hash first. Returns false if duplicate. */
export async function insertQuestImage(data: QuestImageRow): Promise<boolean> {
  if (!SUPABASE_ENABLED) return true
  // Duplicate check
  const { data: existing } = await supabase
    .from('quest_images')
    .select('id')
    .eq('image_hash', data.image_hash)
    .maybeSingle()
  if (existing) return false
  const { error } = await supabase.from('quest_images').insert(data)
  if (error) { console.error('[Supabase] insertQuestImage error:', error); throw error }
  return true
}

/** Count how many quests a user has completed today. */
export async function getDailyQuestCount(userId: string): Promise<number> {
  if (!SUPABASE_ENABLED) return 0
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('quest_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('started_at', `${today}T00:00:00.000Z`)
    .lt('started_at', `${today}T23:59:59.999Z`)
  return count ?? 0
}

/** Upsert leaderboard entry for user. */
export async function upsertLeaderboard(userId: string, username: string, xp: number, missionsCompleted: number): Promise<void> {
  if (!SUPABASE_ENABLED) return
  const { error } = await supabase.from('leaderboard').upsert(
    { user_id: userId, username, xp, missions_completed: missionsCompleted, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  )
  if (error) console.error('[Supabase] upsertLeaderboard error:', error)
}

/** Compute trust score (completed / total * 100). */
export async function getUserTrustScore(userId: string): Promise<number> {
  if (!SUPABASE_ENABLED) return 100
  const { data, error } = await supabase
    .from('quest_sessions')
    .select('status')
    .eq('user_id', userId)
  if (error || !data) return 100
  if (data.length === 0) return 100
  const completed = data.filter(r => r.status === 'completed').length
  return Math.round((completed / data.length) * 100)
}
