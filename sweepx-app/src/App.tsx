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
import { LeaderboardSection } from './components/leaderboard/LeaderboardSection'
import { CommunityPanel } from './components/community/CommunityPanel'
import { RewardsSection } from './components/rewards/RewardsSection'
// ── Sidebar (hidden until profile button tapped)
import { UserProgress } from './components/sidebar/UserProgress'
import { DailyStreak } from './components/sidebar/DailyStreak'
import { NotificationsWidget } from './components/sidebar/NotificationsWidget'
// ── Quest Verification
import { QuestVerificationModal } from './components/quest/QuestVerificationModal'

// ── Glowing Features Grid
import { GlowingEffectDemo } from './components/ui/glowing-effect-demo'
// ── Cursor Effect
import { CursorEffect } from './components/effects/CursorEffect'
import { ScrollContainerContext } from './components/effects/ScrollContainerContext'
import { BottomBlurVeil } from './components/effects/BottomBlurVeil'
// ── Map Modal
import { MapModal } from './components/ui/MapModal'
// ── Liquid Glass Filter (render once at root)
import { GlassFilter } from './components/ui/liquid-glass-button'

// ─── Section ids ──────────────────────────────────────────────────────────────
const SECTIONS = ['hero', 'missions', 'stats', 'leaderboard', 'community', 'rewards'] as const
type SectionId = typeof SECTIONS[number]

export default function App() {
  const mainRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const [authed, setAuthed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const setUser = useAppStore(s => s.setUser)

  // scroll-spy via scroll listener
  useEffect(() => {
    if (!authed) return
    const container = mainRef.current
    if (!container) return
    const handleScroll = () => {
      const offset = container.scrollTop + container.clientHeight * 0.3
      let active: SectionId = SECTIONS[0]
      for (const id of SECTIONS) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.offsetTop <= offset) active = id as SectionId
      }
      setActiveSection(active)
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [authed])

  const navigate = useCallback((id: string) => {
    if (id === 'map') {
      setMapOpen(true)
      return
    }
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id as SectionId)
    }
    // close sidebar when navigating
    setSidebarOpen(false)
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

  const main = (
    <ScrollContainerContext.Provider value={mainRef as any}>
      <HeroSection id="hero" onStart={() => navigate('missions')} authed={authed} onAuth={handleAuth} />

      {/* ── Why SweepX features ── */}
      <section className="px-6 md:px-10 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
            Why <span className="text-neo-p">SweepX</span>?
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">Everything you need to make an impact and get rewarded.</p>
        </div>
        <GlowingEffectDemo />
      </section>

      {/* ── Sections in order ── */}
      <MissionsGrid id="missions" />
      <StatsSection id="stats" />
      <LeaderboardSection id="leaderboard" />
      <CommunityPanel id="community" />
      <RewardsSection id="rewards" />

      <footer className="px-10 py-8 border-t border-line flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-bold text-white font-display">Sweep<span className="text-neo-p">X</span></p>
          <p className="text-2xs text-slate-600 mt-0.5">Sweep the world. Earn the future.</p>
        </div>
        <p className="text-2xs text-slate-700 font-mono">© 2026 SweepX · All impact, all the time.</p>
      </footer>
    </ScrollContainerContext.Provider>
  )

  const sidebar = (
    <>
      <UserProgress />
      <DailyStreak streak={12} />
      <NotificationsWidget />
    </>
  )

  return (
    <div className="min-h-screen bg-s-0 overflow-x-hidden relative">
      <GlassFilter />
      <CursorEffect />
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
      <Topbar
        activeSection={activeSection}
        onNav={navigate}
        sidebarOpen={sidebarOpen}
        onProfileClick={() => setSidebarOpen(o => !o)}
      />
      <DashboardLayout
        main={main}
        sidebar={sidebar}
        mainRef={mainRef as any}
        sidebarOpen={sidebarOpen}
        onSidebarClose={() => setSidebarOpen(false)}
      />
      <QuestVerificationModal />
      <MapModal open={mapOpen} onClose={() => setMapOpen(false)} />
    </div>
  )
}
