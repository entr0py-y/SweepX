// ─── Types ────────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme'
export type MissionStatus = 'available' | 'active' | 'completed'
export type LeaderboardRange = 'weekly' | 'monthly' | 'alltime'

export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  level: number
  xp: number
  xpToNext: number
  rank: string
  rankIcon: string
  streak: number
  totalPoints: number
  missionsCompleted: number
  trashCollected: number // kg
  co2Saved: number // kg
  badges: string[]
  city: string
  country: string
}

export interface Mission {
  id: string
  title: string
  description: string
  image: string
  difficulty: Difficulty
  rewardPoints: number
  rewardXP: number
  estimatedTime: number // minutes
  impact: number // kg trash
  co2Offset: number
  location: { lat: number; lng: number; label: string }
  category: string
  status: MissionStatus
  participants: number
  distance: number // km
  tags: string[]
}

export interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  displayName: string
  avatar: string
  points: number
  level: number
  city: string
  country: string
  change: number // rank change
}

export interface FriendActivity {
  id: string
  userId: string
  username: string
  displayName: string
  avatar: string
  action: string
  target: string
  points: number
  timestamp: Date
  type: 'mission' | 'achievement' | 'squad' | 'rank'
}

export interface RewardItem {
  id: string
  name: string
  description: string
  image: string
  type: 'cosmetic' | 'booster' | 'title' | 'seasonal'
  cost: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  owned: boolean
  equipped: boolean
  limitedTime?: boolean
  expiresAt?: Date
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  timestamp: Date
  type: 'message' | 'system' | 'achievement'
}

export interface Notification {
  id: string
  type: 'mission' | 'friend' | 'achievement' | 'system'
  title: string
  body: string
  timestamp: Date
  read: boolean
}
