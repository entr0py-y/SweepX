import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomBlurVeil } from '../effects/BottomBlurVeil'

interface DashboardLayoutProps {
  main: React.ReactNode
  sidebar: React.ReactNode
  mainRef?: React.RefObject<HTMLDivElement>
  sidebarOpen: boolean
  onSidebarClose: () => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  main,
  sidebar,
  mainRef,
  sidebarOpen,
  onSidebarClose,
}) => (
  <div className="flex pt-14 min-h-screen bg-s-0 relative">
    {/* ── Main scrollable column — full width always ─────────────────── */}
    <div
      ref={mainRef}
      className="flex-1 min-w-0 overflow-y-auto scroll-smooth relative"
      style={{
        maxHeight: 'calc(100vh - 56px)',
        pointerEvents: sidebarOpen ? 'none' : 'auto',
        userSelect: sidebarOpen ? 'none' : 'auto',
      }}
    >
      {/* Sidebar-open overlay — separate div so no filter on scroll container */}
      {sidebarOpen && (
        <div className="pointer-events-none sticky top-0 left-0 w-full z-40"
          style={{ height: 0 }}>
          <div className="absolute inset-0 w-screen"
            style={{ height: 'calc(100vh - 56px)', backdropFilter: 'blur(6px) brightness(0.6)', WebkitBackdropFilter: 'blur(6px) brightness(0.6)' }} />
        </div>
      )}
      {/* Top fade overlay */}
      <div
        className="pointer-events-none sticky top-0 z-10 h-16 w-full"
        style={{
          background: 'linear-gradient(to bottom, var(--s0) 0%, transparent 100%)',
          marginBottom: '-64px',
        }}
      />
      {main}
      <BottomBlurVeil scrollRef={mainRef as React.RefObject<HTMLElement>} />
    </div>

    {/* ── Backdrop (click to close) ────────────────────────────────── */}
    <AnimatePresence>
      {sidebarOpen && (
        <motion.div
          key="sidebar-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40"
          style={{ top: 56 }}
          onClick={onSidebarClose}
        />
      )}
    </AnimatePresence>

    {/* ── Right slide-in sidebar panel ─────────────────────────────── */}
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          key="sidebar-panel"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed right-0 z-50 flex flex-col gap-5 w-[300px] overflow-y-auto overflow-x-hidden px-4 pb-8 pt-4"
          style={{
            top: 56,
            height: 'calc(100vh - 56px)',
            background: 'linear-gradient(180deg, rgba(15,12,25,0.82) 0%, rgba(10,10,18,0.9) 100%)',
            backdropFilter: 'blur(40px) saturate(160%)',
            WebkitBackdropFilter: 'blur(40px) saturate(160%)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '-8px 0 48px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Pill drag handle */}
          <div className="flex justify-center pb-1 pt-0.5">
            <div className="w-8 h-1 rounded-full bg-white/10" />
          </div>
          {sidebar}
        </motion.aside>
      )}
    </AnimatePresence>
  </div>
)
