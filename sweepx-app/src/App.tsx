import React, { useRef, useCallback, useEffect, useState } from 'react'
// ── Layout
import { Topbar } from './components/layout/Topbar'
import { DashboardLayout } from './components/layout/DashboardLayout'
// ── Auth
import { AuthPage } from './components/auth/AuthPage'
import { useAppStore } from './store/appStore'
// ── Main sections
import { HeroSection } from './components/hero/HeroSection'
import { MissionsGrid } from './components/missions/MissionsGrid'
import { StatsSection } from './components/stats/StatsSection'
import { CommunityPanel } from './components/community/CommunityPanel'
import { RewardsSection } from './components/rewards/RewardsSection'
// ── Sidebar
import { LeaderboardPanel } from './components/sidebar/LeaderboardPanel'
import { UserProgress } from './components/sidebar/UserProgress'
import { DailyStreak } from './components/sidebar/DailyStreak'
import { NotificationsWidget } from './components/sidebar/NotificationsWidget'
// ── Quest Verification
import { QuestVerificationModal } from './components/quest/QuestVerificationModal'

// ─── Section ids ──────────────────────────────────────────────────────────────

const SECTIONS = ['hero', 'missions', 'stats', 'community', 'rewards', 'leaderboard'] as const
type SectionId = typeof SECTIONS[number]

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [authed, setAuthed] = useState(false)
  const setUser = useAppStore(s => s.setUser)

  // scroll-spy via IntersectionObserver
  useEffect(() => {
    if (!authed) return
    const targets = SECTIONS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id as SectionId) })
      },
      { root: mainRef.current, rootMargin: '-40% 0px -55% 0px' },
    )
    targets.forEach(t => obs.observe(t))
    return () => obs.disconnect()
  }, [authed])

  const navigate = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id as SectionId)
    }
  }, [])

  const handleAuth = useCallback((info: { email: string; username: string; id?: string }) => {
    setUser({
      id: info.id ?? 'u1',
      username: info.username,
      displayName: info.username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(info.username)}`,
    })
    setAuthed(true)
  }, [setUser])

  // Auth page no longer blocks — login tile is inline in hero

  const main = (
    <>
      <HeroSection id="hero" onStart={() => navigate('missions')} authed={authed} onAuth={handleAuth} />
      <MissionsGrid id="missions" />
      <StatsSection id="stats" />
      <CommunityPanel id="community" />
      <RewardsSection id="rewards" />
      <footer className="px-10 py-8 border-t border-line flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold text-white font-display">Sweep<span className="text-neo-p">X</span></p>
          <p className="text-2xs text-slate-600 mt-0.5">Sweep the world. Earn the future.</p>
        </div>
        <p className="text-2xs text-slate-700 font-mono">© 2026 SweepX · All impact, all the time.</p>
      </footer>
    </>
  )

  const sidebar = (
    <>
      <UserProgress />
      <DailyStreak streak={12} />
      <LeaderboardPanel />
      <NotificationsWidget />
    </>
  )

  return (
    <div className="min-h-screen bg-s-0 overflow-x-hidden relative">
      {/* Global ambient purple clouds */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-80px] left-[30%] w-[700px] h-[700px] rounded-full blur-[1px]"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 68%)' }} />
        <div className="absolute top-[40%] left-[-8%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)' }} />
        <div className="absolute top-[60%] left-[50%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.07) 0%, transparent 65%)' }} />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />
      </div>
      <Topbar activeSection={activeSection} onNav={navigate} />
      <DashboardLayout main={main} sidebar={sidebar} mainRef={mainRef as any} />
      <QuestVerificationModal />
    </div>
  )
}
