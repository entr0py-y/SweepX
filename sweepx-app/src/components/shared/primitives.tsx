import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── cn ────────────────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

// ── Animated number counter ───────────────────────────────────────────────────
export const Counter: React.FC<{
  to: number; duration?: number; suffix?: string; prefix?: string
  className?: string; decimals?: number
}> = ({ to, duration = 1200, suffix = '', prefix = '', className = '', decimals = 0 }) => {
  const [val, setVal] = useState(0)
  const start = useRef(0); const ts = useRef<number|null>(null); const raf = useRef(-1)
  useEffect(() => {
    start.current = 0; ts.current = null
    const step = (now: number) => {
      if (!ts.current) ts.current = now
      const p = Math.min((now - ts.current) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(decimals > 0 ? parseFloat((to * e).toFixed(decimals)) : Math.round(to * e))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [to, duration]) // eslint-disable-line
  return <span className={className}>{prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}{suffix}</span>
}

// ── XP Bar ────────────────────────────────────────────────────────────────────
export const XPBar: React.FC<{ xp: number; max: number; className?: string }> = ({ xp, max, className = '' }) => {
  const pct = Math.min(100, (xp / max) * 100)
  return (
    <div className={cn('xp-track', className)}>
      <motion.div
        className="xp-fill"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </div>
  )
}

// ── Glow Button ───────────────────────────────────────────────────────────────
interface GBProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'sm' | 'danger'
  loading?: boolean; icon?: React.ReactNode; iconRight?: React.ReactNode
}
export const GlowBtn: React.FC<GBProps> = ({
  children, variant = 'primary', loading, icon, iconRight, className, disabled, ...rest
}) => {
  const cls  = variant === 'ghost' ? 'btn-ghost' : variant === 'sm' ? 'btn-sm' : variant === 'danger' ? 'btn-primary bg-gradient-to-r from-red-700 to-red-500 shadow-glow-v' : 'btn-primary'
  const blobColor = variant === 'ghost' ? 'bg-white/[0.15]' : variant === 'danger' ? 'bg-red-600' : 'bg-neo-v'
  const isDisabled = disabled || loading
  return (
    <motion.button
      className={cn(cls, 'group relative overflow-hidden', isDisabled && 'opacity-40 cursor-not-allowed', className)}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.12 }}
      disabled={isDisabled}
      {...rest as any}
    >
      {loading ? (
        <svg className="animate-spin w-3.5 h-3.5 relative z-10" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      ) : (
        <>
          {/* Static label — slides out right on hover */}
          <span className="relative z-10 inline-flex items-center gap-2 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
            {icon}{children}{iconRight}
          </span>
          {/* Hover label — slides in from right */}
          <span className="absolute inset-0 z-10 flex items-center justify-center gap-1.5 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            {icon ?? <ArrowRight size={13} />}{children}
          </span>
          {/* Growing blob */}
          {!isDisabled && (
            <span className={cn(
              'absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300',
              'group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]',
              blobColor,
            )} />
          )}
        </>
      )}
    </motion.button>
  )
}

// ── Tilt Card ─────────────────────────────────────────────────────────────────
export const TiltCard: React.FC<{
  children: React.ReactNode; className?: string
  intensity?: number; glowColor?: string
}> = ({ children, className = '', intensity = 10, glowColor = 'rgba(124,58,237,0.4)' }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({})
  const [glowPos, setGlowPos] = useState({ x: '50%', y: '50%' })
  const [hovered, setHovered] = useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r  = ref.current.getBoundingClientRect()
    const nx = (e.clientX - r.left)  / r.width  - 0.5
    const ny = (e.clientY - r.top)   / r.height - 0.5
    setStyle({ transform: `perspective(900px) rotateX(${-ny * intensity}deg) rotateY(${nx * intensity}deg) scale(1.02) translateY(-4px)` })
    setGlowPos({ x: `${(nx + 0.5) * 100}%`, y: `${(ny + 0.5) * 100}%` })
  }
  const onLeave = () => { setStyle({ transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)' }); setHovered(false) }
  const onEnter = () => setHovered(true)

  return (
    <div
      ref={ref}
      className={cn('relative transition-transform duration-200 ease-out', className)}
      style={{
        ...style,
        transition: hovered
          ? 'transform 0.15s ease-out, box-shadow 0.15s ease-out'
          : 'transform 0.4s ease-out, box-shadow 0.4s ease-out',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)' : undefined,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseEnter={onEnter}
    >
      {hovered && (
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10 opacity-60 transition-opacity"
          style={{ background: `radial-gradient(circle at ${glowPos.x} ${glowPos.y}, ${glowColor}, transparent 65%)` }}
        />
      )}
      {children}
    </div>
  )
}

// ── Section label/header ──────────────────────────────────────────────────────
export const SecLabel: React.FC<{ tag: string; className?: string }> = ({ tag, className = '' }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 label-xs font-semibold px-3 py-1.5 rounded-full',
    'bg-surface-4 border border-line text-slate-400',
    className,
  )}>
    <span className="w-1.5 h-1.5 rounded-full bg-neo-v inline-block" />
    {tag}
  </span>
)

export const SecHead: React.FC<{
  tag?: string; title: string; accent?: string; sub?: string
  action?: React.ReactNode; className?: string
}> = ({ tag, title, accent, sub, action, className = '' }) => (
  <div className={cn('flex flex-col gap-2.5 mb-8', className)}>
    {tag && <SecLabel tag={tag} />}
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="heading-section text-white">
          {title}{' '}
          {accent && (
            <span
              className="text-shimmer"
              style={{ textShadow: '0 0 32px rgba(124,58,237,0.3), 0 0 60px rgba(0,229,255,0.15)' }}
            >
              {accent}
            </span>
          )}
        </h2>
        {sub && <p className="text-sm text-slate-500 mt-1.5 max-w-lg leading-relaxed">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
)

// ── Diff badge ────────────────────────────────────────────────────────────────
import type { Difficulty } from '../../types'
export const DiffBadge: React.FC<{ d: Difficulty; className?: string }> = ({ d, className = '' }) => {
  const map: Record<Difficulty, { cls: string; label: string }> = {
    easy:    { cls: 'diff-easy',    label: 'Easy' },
    medium:  { cls: 'diff-medium',  label: 'Medium' },
    hard:    { cls: 'diff-hard',    label: 'Hard' },
    extreme: { cls: 'diff-extreme', label: 'Extreme' },
  }
  const { cls, label } = map[d]
  return <span className={cn('inline-block text-2xs font-mono font-bold px-2 py-0.5 rounded-full', cls, className)}>{label}</span>
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
export const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-s-3 border border-line rounded-lg text-2xs text-slate-300 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
      {text}
    </div>
  </div>
)
