import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Flame, ChevronRight, MapPin, Star } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { GlowBtn, XPBar, Counter, cn } from '../shared/primitives'
import { MapModal } from '../ui/MapModal'
import { LoginTile, type LoginTileUserInfo } from '../auth/LoginTile'

interface HeroProps {
  id?: string
  onStart?: () => void
  authed?: boolean
  onAuth?: (info: LoginTileUserInfo) => void
}

export const HeroSection: React.FC<HeroProps> = ({ id, onStart, authed, onAuth }) => {
  const user = useAppStore(s => s.user)
  const heroRef = useRef<HTMLDivElement>(null)
  const [mapOpen, setMapOpen] = useState(false)

  const streak = user?.streak ?? 12
  const level  = user?.level  ?? 14
  const xp     = user?.xp     ?? 3240
  const xpMax  = user?.xpToNext ?? 10000

  return (
    <section id={id} ref={heroRef} className="relative overflow-hidden min-h-0 md:min-h-[420px] flex items-center">

      {/* BG layers */}
      <div className="absolute inset-0 bg-void-base" />
      <div className="absolute inset-0 bg-hero-grain opacity-60" />

      {/* Content — two-column: left copy + right tile */}
      <div className="relative z-10 w-full px-6 md:px-10 py-6 md:py-14 flex items-center justify-between gap-12">

        {/* ── Left copy ── */}
        <motion.div className="flex flex-col gap-4 md:gap-5 max-w-lg flex-shrink-0"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>

          {/* Streak pill */}
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}>
            <Flame size={12} className="text-neo-p fill-neo-p" />
            <span className="text-2xs font-semibold text-slate-200">{streak}-Day Sweep Streak</span>
            <span className="text-2xs text-slate-500">🔥</span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="heading-hero text-white leading-[1.1]">
              Sweep the
            </h1>
            <h1 className="heading-hero text-shimmer leading-[1.1]">
              Planet.
            </h1>
            <h1 className="heading-hero text-white leading-[1.1]">
              Earn Glory.
            </h1>
          </div>

          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Join <strong className="text-white">47,000+</strong> eco-warriors completing real-world missions. 
            Clean up, level up, and claim rare rewards.
          </p>

          {/* CTA row */}
          <div className="flex items-center gap-3 flex-wrap">
            <GlowBtn icon={<Zap size={13} className="fill-white" />} iconRight={<ChevronRight size={13} />}
              onClick={onStart} className="gap-2">
              Start Sweeping
            </GlowBtn>
            <GlowBtn variant="ghost" className="gap-1.5" onClick={() => setMapOpen(true)}>
              <MapPin size={12} /> Find Nearby
            </GlowBtn>
          </div>

          {/* XP + stats (only when authed, stays under CTAs on left) */}
          {authed && (
            <>
              <div className="glass-tile-sm relative mt-1 p-3.5 max-w-xs">
                <div className="relative z-[2] flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neo-v to-neo-p flex items-center justify-center text-sm font-bold text-white shadow-glow-v">
                      {level}
                    </div>
                    <div>
                      <p className="text-2xs text-slate-400 leading-none">Level</p>
                      <p className="text-xs font-semibold text-white mt-0.5">EcoChampion</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-slate-500">XP</p>
                    <p className="text-xs font-mono text-neo-p">
                      <Counter to={xp} duration={1000} /> / {xpMax.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="relative z-[2]">
                  <XPBar xp={xp} max={xpMax} />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-1">
                {[
                  { label: 'Missions',  val: 38,   icon: <Zap size={11} className="text-neo-p" /> },
                  { label: 'Points',    val: 12400, icon: <Star size={11} className="text-neo-s" /> },
                  { label: 'Rank',      val: '#12', icon: '' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    {s.icon}
                    <div>
                      <div className="text-xs font-bold text-white font-mono">
                        {typeof s.val === 'number' ? <Counter to={s.val} duration={1200} /> : s.val}
                      </div>
                      <div className="text-2xs text-slate-500">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* ── Right side: Login tile (or nothing when authed) ── */}
        {!authed && onAuth && (
          <motion.div
            className="hidden md:flex flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <LoginTile onAuth={onAuth} />
          </motion.div>
        )}
      </div>

      {/* Bottom edge fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--s-0), transparent)' }} />

      {/* Map modal */}
      <MapModal open={mapOpen} onClose={() => setMapOpen(false)} />
    </section>
  )
}
