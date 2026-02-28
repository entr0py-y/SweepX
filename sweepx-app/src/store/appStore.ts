import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  User, Mission, LeaderboardEntry, FriendActivity,
  RewardItem, ChatMessage, Notification, LeaderboardRange,
} from '../types'
import {
  currentUser as initialUser,
  missions as initialMissions,
  leaderboard as initialLeaderboard,
  friendActivity as initialActivity,
  rewards as initialRewards,
  chatMessages as initialChats,
} from '../data/sampleData'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppState {
  // User
  user: User
  activeMission: string | null

  // Missions
  missions: Mission[]
  missionFilter: string

  // Leaderboard
  leaderboard: LeaderboardEntry[]
  leaderboardRange: LeaderboardRange
  leaderboardView: 'global' | 'city'

  // Activity
  friendActivity: FriendActivity[]

  // Rewards
  rewards: RewardItem[]
  userPoints: number

  // Chat
  chatMessages: ChatMessage[]
  chatInput: string
  chatOpen: boolean

  // Notifications
  notifications: Notification[]
  notifOpen: boolean

  // Overlays
  overlayOpen: string | null

  // Loading states
  loadingMissions: Set<string>
  loadingRewards: Set<string>

  // Actions
  startMission: (id: string) => Promise<void>
  completeMission: (id: string) => void
  setMissionFilter: (filter: string) => void

  setLeaderboardRange: (range: LeaderboardRange) => void
  setLeaderboardView: (view: 'global' | 'city') => void

  purchaseReward: (id: string) => Promise<void>
  equipReward: (id: string) => void

  sendChat: (content: string) => void
  setChatInput: (v: string) => void
  toggleChat: () => void

  toggleOverlay: (name: string | null) => void
  toggleNotif: () => void
  markAllRead: () => void

  addXP: (amount: number) => void
  setUser: (patch: Partial<User>) => void
  logout: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // ── Initial state ──────────────────────────────────────────────────────

    user: { ...initialUser },
    activeMission: null,

    missions: [...initialMissions],
    missionFilter: 'all',

    leaderboard: [...initialLeaderboard],
    leaderboardRange: 'weekly',
    leaderboardView: 'global',

    friendActivity: [...initialActivity],

    rewards: [...initialRewards],
    userPoints: initialUser.totalPoints,

    chatMessages: [...initialChats],
    chatInput: '',
    chatOpen: false,

    notifications: [
      { id: 'n1', type: 'mission', title: 'New Mission Available', body: 'Beach Blitz has opened near you.', timestamp: new Date(), read: false },
      { id: 'n2', type: 'friend', title: 'Zero Carbon Z passed you!', body: 'They just hit 398K points.', timestamp: new Date(Date.now() - 15 * 60 * 1000), read: false },
      { id: 'n3', type: 'achievement', title: 'Streak Milestone!', body: '17-day streak. You\'re on fire.', timestamp: new Date(Date.now() - 30 * 60 * 1000), read: true },
    ],
    notifOpen: false,

    overlayOpen: null,
    loadingMissions: new Set<string>(),
    loadingRewards: new Set<string>(),

    // ── Actions ────────────────────────────────────────────────────────────

    startMission: async (id) => {
      set(s => { s.loadingMissions.add(id) })
      await new Promise(r => setTimeout(r, 900)) // simulate API
      set(s => {
        const m = s.missions.find(m => m.id === id)
        if (m && m.status === 'available') {
          m.status = 'active'
          s.activeMission = id
          m.participants += 1
        }
        s.loadingMissions.delete(id)
        s.notifications.unshift({
          id: `n_${Date.now()}`,
          type: 'mission',
          title: 'Mission Started',
          body: `You've joined "${m?.title}". Good luck!`,
          timestamp: new Date(),
          read: false,
        })
      })
    },

    completeMission: (id) => {
      set(s => {
        const m = s.missions.find(m => m.id === id)
        if (!m) return
        m.status = 'completed'
        if (s.activeMission === id) s.activeMission = null
        // Award XP + points
        s.user.xp = Math.min(s.user.xp + m.rewardXP, s.user.xpToNext)
        s.user.totalPoints += m.rewardPoints
        s.user.missionsCompleted += 1
        s.user.trashCollected += m.impact
        s.user.co2Saved += m.co2Offset
        s.userPoints += m.rewardPoints
        // Level up check
        if (s.user.xp >= s.user.xpToNext) {
          s.user.level += 1
          s.user.xp = s.user.xp - s.user.xpToNext
          s.user.xpToNext = Math.floor(s.user.xpToNext * 1.25)
        }
      })
    },

    setMissionFilter: (filter) => set(s => { s.missionFilter = filter }),

    setLeaderboardRange: (range) => set(s => { s.leaderboardRange = range }),

    setLeaderboardView: (view) => set(s => { s.leaderboardView = view }),

    purchaseReward: async (id) => {
      const item = get().rewards.find(r => r.id === id)
      if (!item || item.owned) return
      if (get().userPoints < item.cost) {
        // Insufficient points — add notification
        set(s => {
          s.notifications.unshift({
            id: `n_${Date.now()}`,
            type: 'system',
            title: 'Insufficient Points',
            body: `You need ${item.cost - get().userPoints} more points.`,
            timestamp: new Date(),
            read: false,
          })
        })
        return
      }
      set(s => { s.loadingRewards.add(id) })
      await new Promise(r => setTimeout(r, 800))
      set(s => {
        const r = s.rewards.find(r => r.id === id)
        if (r) {
          r.owned = true
          s.userPoints -= r.cost
          s.user.totalPoints -= r.cost
          s.notifications.unshift({
            id: `n_${Date.now()}`,
            type: 'achievement',
            title: `Unlocked: ${r.name}`,
            body: r.description,
            timestamp: new Date(),
            read: false,
          })
        }
        s.loadingRewards.delete(id)
      })
    },

    equipReward: (id) => {
      set(s => {
        const item = s.rewards.find(r => r.id === id)
        if (!item || !item.owned) return
        // Unequip others of same type
        s.rewards
          .filter(r => r.type === item.type && r.id !== id)
          .forEach(r => { r.equipped = false })
        item.equipped = !item.equipped
      })
    },

    sendChat: (content) => {
      if (!content.trim()) return
      set(s => {
        s.chatMessages.push({
          id: `cm_${Date.now()}`,
          userId: s.user.id,
          username: s.user.username,
          avatar: s.user.avatar,
          content,
          timestamp: new Date(),
          type: 'message',
        })
        s.chatInput = ''
      })
    },

    setChatInput: (v) => set(s => { s.chatInput = v }),
    toggleChat: () => set(s => { s.chatOpen = !s.chatOpen }),

    toggleOverlay: (name) => set(s => { s.overlayOpen = s.overlayOpen === name ? null : name }),
    toggleNotif: () => set(s => { s.notifOpen = !s.notifOpen }),
    markAllRead: () => set(s => { s.notifications.forEach(n => { n.read = true }) }),

    addXP: (amount) => {
      set(s => {
        s.user.xp = Math.min(s.user.xp + amount, s.user.xpToNext)
        if (s.user.xp >= s.user.xpToNext) {
          s.user.level += 1
          s.user.xp = 0
          s.user.xpToNext = Math.floor(s.user.xpToNext * 1.25)
        }
      })
    },

    setUser: (patch) => {
      set(s => {
        Object.assign(s.user, patch)
      })
    },

    logout: () => {
      set(s => {
        Object.assign(s.user, { ...initialUser })
      })
    },
  }))
)
