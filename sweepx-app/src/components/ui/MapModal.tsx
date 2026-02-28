import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Navigation, Zap, Users, Target, Crosshair } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { GlowBtn, cn } from '../shared/primitives'

// ── Mock missions on a pseudo-map ─────────────────────────────────────────────
const MAP_POINTS = [
  { id: 1, x: 22, y: 34, label: 'Harbor Cleanup', pts: 450, diff: 'hard', icon: '🌊', active: true, radius: 14 },
  { id: 2, x: 48, y: 55, label: 'Central Park', pts: 320, diff: 'medium', icon: '🌳', active: true, radius: 10 },
  { id: 3, x: 62, y: 28, label: 'Beach Sprint', pts: 160, diff: 'easy', icon: '🏖️', active: false, radius: 8 },
  { id: 4, x: 35, y: 70, label: 'Trail Restore', pts: 280, diff: 'medium', icon: '🌲', active: false, radius: 10 },
  { id: 5, x: 75, y: 48, label: 'Urban Canopy', pts: 390, diff: 'hard', icon: '♻️', active: true, radius: 12 },
  { id: 6, x: 14, y: 62, label: 'River Ridge', pts: 220, diff: 'easy', icon: '💧', active: false, radius: 8 },
  { id: 7, x: 55, y: 78, label: 'Meadow Sprint', pts: 140, diff: 'easy', icon: '🌻', active: false, radius: 7 },
  { id: 8, x: 82, y: 22, label: 'Summit Sweep', pts: 620, diff: 'extreme', icon: '🏔️', active: false, radius: 12 },
]

const DIFF_COLORS: Record<string, string> = {
  easy: '#c084fc', medium: '#a855f7', hard: '#8b5cf6', extreme: '#ffffff',
}

// User marker — pulsing dot
const UserMarker: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle r="16" fill="rgba(168,85,247,0.06)" className="origin-center animate-[pulse-ring_1.8s_ease-out_infinite]" />
    <circle r="8" fill="rgba(168,85,247,0.15)" />
    <circle r="4" fill="#a855f7" />
    <circle r="2" fill="#fff" />
  </g>
)

// Mission marker
const MissionMarker: React.FC<{
  point: typeof MAP_POINTS[0]
  selected: boolean
  onClick: () => void
}> = ({ point, selected, onClick }) => {
  const c = DIFF_COLORS[point.diff]
  return (
    <g
      transform={`translate(${point.x}%, ${point.y}%)`}
      className="cursor-pointer"
      onClick={onClick}
      style={{ willChange: 'transform' }}
    >
      {/* Pulse ring for active missions */}
      {point.active && (
        <motion.circle
          r={point.radius + 8}
          fill="none"
          stroke={c}
          strokeWidth="1"
          opacity={0.35}
          animate={{ r: [point.radius + 4, point.radius + 18], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {/* Outer ring */}
      <circle r={selected ? point.radius + 4 : point.radius} fill={`${c}22`} stroke={c}
        strokeWidth={selected ? 2 : 1.5} style={{ transition: 'r .2s, stroke-width .2s' }} />
      {/* Inner dot */}
      <circle r={point.radius * 0.45} fill={c} opacity={0.9} />
      {/* Icon */}
      <foreignObject x={-(point.radius)} y={-(point.radius)} width={point.radius * 2} height={point.radius * 2}>
        <div className="w-full h-full flex items-center justify-center text-[9px] leading-none select-none">
          {point.icon}
        </div>
      </foreignObject>
    </g>
  )
}

// ── MapModal ──────────────────────────────────────────────────────────────────
export const MapModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  const missions = useAppStore(s => s.missions)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [userPos] = React.useState({ x: 45, y: 50 })

  const handleClose = useCallback(() => {
    setSelected(null)
    onClose()
  }, [onClose])

  // ESC key handler
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const selectedPoint = MAP_POINTS.find(p => p.id === selected)
  const missionMatch = selectedPoint
    ? missions.find(m => m.title.toLowerCase().includes(selectedPoint.label.split(' ')[0].toLowerCase()))
    : null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-5xl h-[calc(100vh-2rem)] max-h-[700px] flex flex-col rounded-[24px] overflow-hidden"
            style={{ background: 'var(--s2)', boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 60px rgba(124,58,237,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-s-1/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-neo-p/30 to-neo-v/30 border border-neo-p/25 flex items-center justify-center">
                  <MapPin size={13} className="text-neo-p" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-display leading-none">Nearby Missions</p>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    <span className="text-neo-s font-mono">{MAP_POINTS.filter(p => p.active).length} active</span>
                    {' · '}{MAP_POINTS.length} total in range
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neo-p/10 border border-neo-p/20 text-2xs text-neo-p">
                  <Navigation size={9} />
                  <span className="font-mono">Copenhagen, DK</span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-surface-4 border border-line text-slate-400 hover:text-white hover:bg-surface-5 transition-all"
                  aria-label="Close map"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Map + Sidebar */}
            <div className="flex flex-1 min-h-0">
              {/* Map canvas */}
              <div className="relative flex-1 overflow-hidden bg-s-0">
                {/* Grid pattern — dark map base */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="map-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    </pattern>
                    <pattern id="map-grid-lg" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
                    </pattern>
                    <radialGradient id="map-glow-v" cx="45%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(124,58,237,0.14)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="map-glow-p" cx="75%" cy="40%" r="40%">
                      <stop offset="0%" stopColor="rgba(168,85,247,0.08)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Base fills */}
                  <rect width="100%" height="100%" fill="#060610" />
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                  <rect width="100%" height="100%" fill="url(#map-grid-lg)" />
                  <rect width="100%" height="100%" fill="url(#map-glow-v)" />
                  <rect width="100%" height="100%" fill="url(#map-glow-p)" />

                  {/* Simulated road lines */}
                  <g stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none">
                    <path d="M 0,45% Q 25%,40% 50%,50% T 100%,45%" />
                    <path d="M 30%,0 Q 35%,35% 40%,100%" />
                    <path d="M 65%,0 Q 68%,30% 72%,100%" />
                    <path d="M 0,72% Q 40%,68% 100%,74%" />
                  </g>
                  {/* Wider road highlights */}
                  <g stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="none">
                    <path d="M 0,45% Q 25%,40% 50%,50% T 100%,45%" />
                    <path d="M 30%,0 Q 35%,35% 40%,100%" />
                  </g>
                  {/* Zone areas */}
                  <ellipse cx="15%" cy="30%" rx="14%" ry="10%" fill="rgba(124,58,237,0.07)" stroke="rgba(124,58,237,0.12)" strokeWidth="1" />
                  <ellipse cx="87%" cy="75%" rx="10%" ry="8%" fill="rgba(124,58,237,0.05)" stroke="rgba(124,58,237,0.10)" strokeWidth="1" />
                </svg>

                {/* Scan line overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="map-scan" />
                </div>

                {/* Mission markers — use percentage-based positioning */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                  <defs>
                    {MAP_POINTS.map(p => (
                      <radialGradient key={`grd-${p.id}`} id={`mgrd-${p.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={`${DIFF_COLORS[p.diff]}40`} />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    ))}
                  </defs>
                  {/* Radius area glows */}
                  {MAP_POINTS.map(p => (
                    <ellipse key={`glow-${p.id}`}
                      cx={`${p.x}%`} cy={`${p.y}%`} rx="4%" ry="3%"
                      fill={`url(#mgrd-${p.id})`} opacity={selected === p.id ? 1 : 0.55}
                      style={{ transition: 'opacity .25s' }}
                    />
                  ))}
                  {/* User position glow */}
                  <ellipse cx={`${userPos.x}%`} cy={`${userPos.y}%`} rx="5%" ry="4%" fill="rgba(168,85,247,0.08)" />
                </svg>

                {/* Clickable markers (absolute positioned) */}
                <div className="absolute inset-0">
                  {MAP_POINTS.map(point => (
                    <motion.button
                      key={point.id}
                      className={cn(
                        'absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 group z-10',
                      )}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                      onClick={() => setSelected(selected === point.id ? null : point.id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.93 }}
                    >
                      {/* Pulse ring */}
                      {point.active && (
                        <motion.div
                          className="absolute rounded-full border"
                          style={{ borderColor: DIFF_COLORS[point.diff], width: point.radius * 2 + 16, height: point.radius * 2 + 16 }}
                          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      {/* Marker circle */}
                      <div
                        className="relative rounded-full flex items-center justify-center transition-all duration-200"
                        style={{
                          width: point.radius * 2,
                          height: point.radius * 2,
                          background: `${DIFF_COLORS[point.diff]}22`,
                          border: `${selected === point.id ? 2.5 : 1.5}px solid ${DIFF_COLORS[point.diff]}`,
                          boxShadow: selected === point.id
                            ? `0 0 16px ${DIFF_COLORS[point.diff]}55, 0 0 40px ${DIFF_COLORS[point.diff]}22`
                            : `0 0 8px ${DIFF_COLORS[point.diff]}33`,
                        }}
                      >
                        <span className="text-[9px] leading-none select-none">{point.icon}</span>
                      </div>
                      {/* Label (visible on hover or selected) */}
                      <div className={cn(
                        'absolute bottom-full mb-2 px-2 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap pointer-events-none transition-all duration-200',
                        'bg-s-2/90 backdrop-blur-sm border border-line text-white',
                        selected === point.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
                      )}>
                        {point.label}
                        <span className="ml-1 font-mono" style={{ color: DIFF_COLORS[point.diff] }}>+{point.pts}</span>
                      </div>
                    </motion.button>
                  ))}

                  {/* User position */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
                  >
                    <motion.div
                      className="absolute rounded-full border border-neo-p/40 -translate-x-1/2 -translate-y-1/2"
                      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                      style={{ width: 24, height: 24 }}
                    />
                    <div className="w-5 h-5 rounded-full bg-neo-p/20 border-2 border-neo-p flex items-center justify-center"
                      style={{ boxShadow: '0 0 16px rgba(168,85,247,0.5)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-neo-p" />
                    </div>
                  </div>
                </div>

                {/* Bottom toolbar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-s-2/90 border border-line backdrop-blur-sm">
                  <Crosshair size={11} className="text-neo-p" />
                  <span className="text-2xs text-slate-400 font-mono">55.6761° N, 12.5683° E · Copenhagen</span>
                </div>

                {/* Zoom hint */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  {['+', '−'].map(btn => (
                    <button key={btn} className="w-7 h-7 rounded-xl bg-s-2/80 border border-line text-slate-400 hover:text-white text-sm font-mono flex items-center justify-center transition-colors">
                      {btn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side panel */}
              <div className="w-64 shrink-0 border-l border-line bg-s-1/50 flex flex-col overflow-hidden">
                {selectedPoint ? (
                  <motion.div
                    key={selectedPoint.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col h-full"
                  >
                    {/* Mission header */}
                    <div className="p-4 border-b border-line">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{selectedPoint.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white leading-tight truncate">{selectedPoint.label}</p>
                          <p className="text-2xs mt-0.5 font-mono capitalize" style={{ color: DIFF_COLORS[selectedPoint.diff] }}>
                            {selectedPoint.diff}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="panel-inset rounded-xl p-2.5 text-center">
                          <p className="text-xs font-bold text-neo-p font-mono">+{selectedPoint.pts}</p>
                          <p className="text-2xs text-slate-500 mt-0.5">Points</p>
                        </div>
                        <div className="panel-inset rounded-xl p-2.5 text-center">
                          <p className={cn('text-xs font-bold', selectedPoint.active ? 'text-neo-s' : 'text-slate-400')}>
                            {selectedPoint.active ? 'Active' : 'Available'}
                          </p>
                          <p className="text-2xs text-slate-500 mt-0.5">Status</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
                      <div className="flex items-center gap-2 text-2xs text-slate-400">
                        <Target size={10} className="text-neo-v shrink-0" />
                        <span className="truncate">1.2 km away · ~18 min walk</span>
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-slate-400">
                        <Users size={10} className="text-neo-p shrink-0" />
                        <span>24 participants nearby</span>
                      </div>
                      <div className="flex items-center gap-2 text-2xs text-slate-400">
                        <Zap size={10} className="text-neo-p shrink-0" />
                        <span>+{selectedPoint.pts} pts · +{Math.round(selectedPoint.pts * 0.8)} XP</span>
                      </div>

                      <div className="w-sep my-1" />

                      <p className="text-2xs text-slate-500 leading-relaxed">
                        An eco-mission focused on environmental restoration in the local area. Join other sweepers to make an impact.
                      </p>
                    </div>

                    <div className="p-4 border-t border-line">
                      <GlowBtn className="w-full justify-center gap-1.5" icon={<Navigation size={12} />}>
                        Navigate &amp; Start
                      </GlowBtn>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-line">
                      <p className="text-xs font-semibold text-white mb-3">All Nearby</p>
                      <div className="flex flex-col gap-1">
                        {MAP_POINTS.map(p => (
                          <motion.button
                            key={p.id}
                            onClick={() => setSelected(p.id)}
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-surface-3 transition-colors text-left w-full group"
                          >
                            <span className="text-sm shrink-0">{p.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-2xs font-semibold text-white truncate group-hover:text-neo-p transition-colors">{p.label}</p>
                              <p className="text-2xs font-mono mt-0.5" style={{ color: DIFF_COLORS[p.diff] }}>+{p.pts} pts</p>
                            </div>
                            {p.active && (
                              <div className="w-1.5 h-1.5 rounded-full bg-neo-p shrink-0" style={{ boxShadow: '0 0 6px rgba(168,85,247,0.7)' }} />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 mt-auto">
                      <div className="panel-inset rounded-2xl p-3 text-center">
                        <MapPin size={16} className="text-neo-v mx-auto mb-2 opacity-60" />
                        <p className="text-2xs text-slate-500 leading-relaxed">Click a marker on the map or select a mission above.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
