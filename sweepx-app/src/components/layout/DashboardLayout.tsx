import React, { useRef } from 'react'

interface DashboardLayoutProps {
  main: React.ReactNode
  sidebar: React.ReactNode
  mainRef?: React.RefObject<HTMLDivElement>
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ main, sidebar, mainRef }) => (
  <div className="flex pt-12 min-h-screen bg-s-0">
    {/* ── Left scrollable main column ───────────────────────────────── */}
    <div
      ref={mainRef}
      className="flex-1 min-w-0 overflow-y-auto scroll-smooth"
      style={{ maxHeight: 'calc(100vh - 48px)' }}
    >
      {main}
    </div>

    {/* ── Right sticky sidebar ──────────────────────────────────────── */}
    <aside
      className="hidden xl:flex flex-col gap-5 w-[340px] shrink-0 overflow-y-auto overflow-x-hidden px-5 pb-8 pt-2"
      style={{ height: 'calc(100vh - 48px)', position: 'sticky', top: 48 }}
    >
      {sidebar}
    </aside>
  </div>
)
