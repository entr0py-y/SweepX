import type {
  User, Mission, LeaderboardEntry, FriendActivity,
  RewardItem, ChatMessage, Notification
} from '../types'

// ─── Current User ─────────────────────────────────────────────────────────────

export const currentUser: User = {
  id: 'u1',
  username: 'apex_cleaner',
  displayName: 'Apex Cleaner',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apex',
  level: 42,
  xp: 8740,
  xpToNext: 10000,
  rank: 'Solar Guardian',
  rankIcon: '☀️',
  streak: 17,
  totalPoints: 284500,
  missionsCompleted: 183,
  trashCollected: 2340,
  co2Saved: 1870,
  badges: ['🌍', '♻️', '⚡', '🏆', '🔥'],
  city: 'Copenhagen',
  country: 'DK',
}

// ─── Missions ─────────────────────────────────────────────────────────────────

export const missions: Mission[] = [
  {
    id: 'm1',
    title: 'Harbor Front Sweep',
    description: "Clear the harbor's plastic-heavy shoreline before the tide comes in. High-impact zone, heavy rewards.",
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=600&q=80',
    difficulty: 'hard',
    rewardPoints: 1200,
    rewardXP: 340,
    estimatedTime: 90,
    impact: 18.5,
    co2Offset: 12.3,
    location: { lat: 55.676, lng: 12.568, label: 'Copenhagen Harbour' },
    category: 'Coastal',
    status: 'available',
    participants: 7,
    distance: 1.2,
    tags: ['coastal', 'plastic', 'high-impact'],
  },
  {
    id: 'm2',
    title: 'City Park Restoration',
    description: 'Community park needs a deep clean after weekend events. Family-friendly mission with solid XP gain.',
    image: 'https://images.unsplash.com/photo-1585974738771-84483dd9f89f?w=600&q=80',
    difficulty: 'easy',
    rewardPoints: 450,
    rewardXP: 120,
    estimatedTime: 35,
    impact: 6.2,
    co2Offset: 4.1,
    location: { lat: 55.682, lng: 12.571, label: 'Fælledparken' },
    category: 'Urban',
    status: 'available',
    participants: 14,
    distance: 0.8,
    tags: ['park', 'family', 'community'],
  },
  {
    id: 'm3',
    title: 'Industrial Canal Protocol',
    description: 'Industrial runoff debris clogging the canal ecosystem. Requires specialist kit. Max rewards.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
    difficulty: 'extreme',
    rewardPoints: 2800,
    rewardXP: 780,
    estimatedTime: 180,
    impact: 42.0,
    co2Offset: 28.7,
    location: { lat: 55.665, lng: 12.580, label: 'Sydhavn Canal' },
    category: 'Industrial',
    status: 'available',
    participants: 3,
    distance: 3.4,
    tags: ['industrial', 'specialist', 'canal'],
  },
  {
    id: 'm4',
    title: 'Forest Edge Reclaim',
    description: 'Illegal dumping at the forest boundary. Clear it before it spreads into the protected zone.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    difficulty: 'medium',
    rewardPoints: 820,
    rewardXP: 220,
    estimatedTime: 60,
    impact: 14.0,
    co2Offset: 9.5,
    location: { lat: 55.700, lng: 12.530, label: 'Dyrehaven Edge' },
    category: 'Forest',
    status: 'active',
    participants: 5,
    distance: 8.1,
    tags: ['forest', 'illegal-dump', 'urgent'],
  },
  {
    id: 'm5',
    title: 'Beach Blitz — Dawn Run',
    description: 'Speed mission at sunrise. 50-minute window to maximise collection before the beach fills up.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    difficulty: 'medium',
    rewardPoints: 680,
    rewardXP: 180,
    estimatedTime: 50,
    impact: 9.8,
    co2Offset: 6.6,
    location: { lat: 55.644, lng: 12.560, label: 'Amager Beach' },
    category: 'Coastal',
    status: 'available',
    participants: 11,
    distance: 4.7,
    tags: ['beach', 'speed', 'sunrise'],
  },
  {
    id: 'm6',
    title: 'Rooftop Garden Reset',
    description: 'Urban rooftop farm needs debris cleared post-storm. Unique location, exclusive cosmetic reward.',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80',
    difficulty: 'easy',
    rewardPoints: 380,
    rewardXP: 100,
    estimatedTime: 25,
    impact: 3.5,
    co2Offset: 2.3,
    location: { lat: 55.673, lng: 12.564, label: 'Nørrebro Rooftop' },
    category: 'Urban',
    status: 'available',
    participants: 2,
    distance: 0.4,
    tags: ['rooftop', 'unique', 'exclusive'],
  },
]

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const leaderboard: LeaderboardEntry[] = [
  { id: 'l1', rank: 1, username: 'verdant_void', displayName: 'Verdant Void', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=void', points: 412800, level: 67, city: 'Oslo', country: 'NO', change: 0 },
  { id: 'l2', rank: 2, username: 'zero_carbon_z', displayName: 'Zero Carbon Z', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zero', points: 398200, level: 64, city: 'Stockholm', country: 'SE', change: 2 },
  { id: 'l3', rank: 3, username: 'apex_cleaner', displayName: 'Apex Cleaner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apex', points: 284500, level: 42, city: 'Copenhagen', country: 'DK', change: -1 },
  { id: 'l4', rank: 4, username: 'eco_nova', displayName: 'Eco Nova', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', points: 241700, level: 38, city: 'Helsinki', country: 'FI', change: 3 },
  { id: 'l5', rank: 5, username: 'phantom_sweep', displayName: 'Phantom Sweep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phantom', points: 218900, level: 35, city: 'Berlin', country: 'DE', change: 1 },
  { id: 'l6', rank: 6, username: 'storm_curator', displayName: 'Storm Curator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=storm', points: 192300, level: 31, city: 'Amsterdam', country: 'NL', change: -2 },
  { id: 'l7', rank: 7, username: 'terra_flux', displayName: 'Terra Flux', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=terra', points: 176500, level: 29, city: 'Vienna', country: 'AT', change: 4 },
  { id: 'l8', rank: 8, username: 'ocean_drifter', displayName: 'Ocean Drifter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ocean', points: 165400, level: 27, city: 'Reykjavik', country: 'IS', change: 1 },
  { id: 'l9', rank: 9, username: 'circuit_breaker', displayName: 'Circuit Breaker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=circuit', points: 154200, level: 26, city: 'London', country: 'GB', change: -1 },
  { id: 'l10', rank: 10, username: 'solar_flare', displayName: 'Solar Flare', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=solar', points: 148900, level: 25, city: 'Madrid', country: 'ES', change: 0 },
  { id: 'l11', rank: 11, username: 'wind_walker', displayName: 'Wind Walker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wind', points: 132100, level: 23, city: 'Dublin', country: 'IE', change: 2 },
  { id: 'l12', rank: 12, username: 'river_runner', displayName: 'River Runner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=river', points: 121500, level: 21, city: 'Paris', country: 'FR', change: -3 },
  { id: 'l13', rank: 13, username: 'urban_forager', displayName: 'Urban Forager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=urban', points: 110900, level: 19, city: 'Rome', country: 'IT', change: 5 },
  { id: 'l14', rank: 14, username: 'neon_scout', displayName: 'Neon Scout', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon', points: 95400, level: 17, city: 'Warsaw', country: 'PL', change: 0 },
  { id: 'l15', rank: 15, username: 'green_weaver', displayName: 'Green Weaver', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=green', points: 88200, level: 16, city: 'Prague', country: 'CZ', change: 1 },
]

// ─── Friend Activity ──────────────────────────────────────────────────────────

export const friendActivity: FriendActivity[] = [
  { id: 'f1', userId: 'l2', username: 'zero_carbon_z', displayName: 'Zero Carbon Z', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zero', action: 'completed', target: 'Harbor Front Sweep', points: 1200, timestamp: new Date(Date.now() - 8 * 60 * 1000), type: 'mission' },
  { id: 'f2', userId: 'l4', username: 'eco_nova', displayName: 'Eco Nova', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', action: 'unlocked', target: '🏆 Centurion Badge', points: 500, timestamp: new Date(Date.now() - 22 * 60 * 1000), type: 'achievement' },
  { id: 'f3', userId: 'l5', username: 'phantom_sweep', displayName: 'Phantom Sweep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phantom', action: 'started squad mission', target: 'Industrial Canal Protocol', points: 0, timestamp: new Date(Date.now() - 45 * 60 * 1000), type: 'squad' },
  { id: 'f4', userId: 'l6', username: 'storm_curator', displayName: 'Storm Curator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=storm', action: 'reached rank', target: 'Solar Guardian', points: 2000, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'rank' },
  { id: 'f5', userId: 'l7', username: 'terra_flux', displayName: 'Terra Flux', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=terra', action: 'completed', target: 'City Park Restoration', points: 450, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), type: 'mission' },
]

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const rewards: RewardItem[] = [
  { id: 'r1', name: 'Vanguard Trail', description: 'Spectral cyan particle trail follows your avatar on the map.', image: '🌊', type: 'cosmetic', cost: 1200, rarity: 'epic', owned: false, equipped: false },
  { id: 'r2', name: 'Void Frame', description: 'Deep space profile border with animated nebula edge.', image: '🪐', type: 'cosmetic', cost: 800, rarity: 'rare', owned: true, equipped: true },
  { id: 'r3', name: 'XP Surge ×2', description: 'Double XP on all missions for 24 hours.', image: '⚡', type: 'booster', cost: 600, rarity: 'common', owned: false, equipped: false },
  { id: 'r4', name: '"Apex" Title', description: 'Exclusive title displayed under your name.', image: '👑', type: 'title', cost: 2000, rarity: 'legendary', owned: false, equipped: false },
  { id: 'r5', name: 'Season I Artifact', description: 'Commemorative Season 1 badge. Never returning.', image: '🌍', type: 'seasonal', cost: 3500, rarity: 'legendary', owned: false, equipped: false, limitedTime: true, expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  { id: 'r6', name: 'Ghost Mode', description: 'Invisible to leaderboards for one day.', image: '👻', type: 'booster', cost: 450, rarity: 'rare', owned: true, equipped: false },
  { id: 'r7', name: 'Aurora Banner', description: 'Full-width profile banner with northern lights animation.', image: '🌌', type: 'cosmetic', cost: 950, rarity: 'epic', owned: false, equipped: false },
  { id: 'r8', name: 'Point Magnet', description: '+20% bonus points on your next 5 missions.', image: '🧲', type: 'booster', cost: 300, rarity: 'common', owned: false, equipped: false },
]

// ─── Chat Messages ─────────────────────────────────────────────────────────────

export const chatMessages: ChatMessage[] = [
  { id: 'c1', userId: 'l1', username: 'verdant_void', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=void', content: "Harbor sweep tomorrow at 06:00. Who's in? 🌊", timestamp: new Date(Date.now() - 4 * 60 * 1000), type: 'message' },
  { id: 'c2', userId: 'l2', username: 'zero_carbon_z', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zero', content: 'Count me in. Bringing the industrial kit.', timestamp: new Date(Date.now() - 3 * 60 * 1000), type: 'message' },
  { id: 'c3', userId: 'l4', username: 'eco_nova', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', content: 'Same. Canal protocol was insane rewards last time', timestamp: new Date(Date.now() - 2 * 60 * 1000), type: 'message' },
  { id: 'c4', userId: 'system', username: 'SweepX', avatar: '', content: '⚡ Zero Carbon Z just crossed 400K points!', timestamp: new Date(Date.now() - 60 * 1000), type: 'system' },
  { id: 'c5', userId: 'l5', username: 'phantom_sweep', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phantom', content: 'Need a fourth for squad canal run, anyone free?', timestamp: new Date(Date.now() - 30 * 1000), type: 'message' },
]

// ─── Map Quest Markers ─────────────────────────────────────────────────────────

export const mapMarkers = missions.map(m => ({
  id: m.id,
  lat: m.location.lat,
  lng: m.location.lng,
  label: m.location.label,
  difficulty: m.difficulty,
  points: m.rewardPoints,
  status: m.status,
}))
