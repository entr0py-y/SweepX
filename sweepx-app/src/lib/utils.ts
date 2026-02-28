import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Difficulty } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatPoints(n: number): string {
  return n.toLocaleString()
}

export function formatTime(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function xpPercent(xp: number, xpToNext: number): number {
  return Math.min(100, (xp / xpToNext) * 100)
}

export function difficultyLabel(d: Difficulty) {
  const map: Record<Difficulty, string> = {
    easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme',
  }
  return map[d]
}

export function difficultyClass(d: Difficulty) {
  const map: Record<Difficulty, string> = {
    easy: 'diff-easy', medium: 'diff-medium', hard: 'diff-hard', extreme: 'diff-extreme',
  }
  return map[d]
}

export function rarityColor(rarity: string): string {
  const map: Record<string, string> = {
    common:    'text-slate-300',
    rare:      'text-blue-400',
    epic:      'text-neon-purple',
    legendary: 'text-neon-amber',
  }
  return map[rarity] ?? 'text-slate-300'
}

export function rarityGlow(rarity: string): string {
  const map: Record<string, string> = {
    common:    '',
    rare:      'shadow-[0_0_16px_rgba(96,165,250,0.4)]',
    epic:      'shadow-glow-sm',
    legendary: 'shadow-glow-amber',
  }
  return map[rarity] ?? ''
}

export function rankRingColor(rank: number): string {
  if (rank === 1) return '#ffb627'
  if (rank === 2) return '#c0c0c0'
  if (rank === 3) return '#b07b55'
  return 'rgba(255,255,255,0.2)'
}

export function flagEmoji(country: string): string {
  const codePoints = [...country.toUpperCase()].map(
    c => 127397 + c.charCodeAt(0)
  )
  return String.fromCodePoint(...codePoints)
}
