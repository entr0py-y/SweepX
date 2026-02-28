import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Star, Trophy } from 'lucide-react'
import { cn } from '../shared/primitives'
import type { XpBreakdown } from '../../types/quest'

interface Props {
  breakdown: XpBreakdown
  username: string
  missionTitle: string
}

interface Particle {
  id: number; x: number; y: number; vx: number; vy: number
  size: number; color: string; life: number; maxLife: number
}

const COLORS = ['#a855f7', '#7c3aed', '#c084fc', '#ffffff', '#e9d5ff']

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(-1)
  let idCounter = 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const spawnBurst = () => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 5
        particlesRef.current.push({
          id: idCounter++,
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size:    3 + Math.random() * 5,
          color:   COLORS[Math.floor(Math.random() * COLORS.length)],
          life:    0,
          maxLife: 60 + Math.floor(Math.random() * 40),
        })
      }
    }

    spawnBurst()
    setTimeout(spawnBurst, 300)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife)
      particlesRef.current.forEach(p => {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        const alpha = 1 - p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.5), 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

const XpRow: React.FC<{ label: string; amount: number; delay: number; icon: React.ReactNode }> = ({ label, amount, delay, icon }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center justify-between text-sm"
  >
    <div className="flex items-center gap-2 text-slate-400 min-w-0">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
    <span className="font-mono font-bold text-neo-p shrink-0 ml-3 tabular-nums">
      +{amount} XP
    </span>
  </motion.div>
)

export const XPRewardAnimation: React.FC<Props> = ({ breakdown, username, missionTitle }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Particle canvas + big XP number */}
      <div className="relative w-full h-48 flex items-center justify-center">
        <ParticleCanvas />

        <motion.div
          className="relative z-10 flex flex-col items-center gap-2"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex items-center gap-3">
            <Trophy size={28} className="text-neo-p" />
            <span className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-neo-v via-neo-p to-neo-s">
              +{breakdown.totalXP}
            </span>
            <Zap size={28} className="text-neo-s fill-neo-s" />
          </div>
          <span className="text-sm font-semibold text-neo-s tracking-wide">XP EARNED</span>
        </motion.div>
      </div>

      {/* Mission title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-center"
      >
        <p className="text-white font-semibold truncate max-w-xs">{missionTitle}</p>
        <p className="text-2xs text-slate-500 mt-0.5">completed by {username}</p>
      </motion.div>

      {/* XP breakdown */}
      <motion.div
        className="w-full bg-surface-3 rounded-2xl p-4 border border-white/8 flex flex-col gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <p className="text-2xs text-slate-500 font-semibold tracking-wide uppercase mb-1">XP Breakdown</p>
        <XpRow label="Mission reward"         amount={breakdown.baseXP}         delay={0.55} icon={<Star size={13} className="text-neo-p" />} />
        {breakdown.reductionBonus > 0 && (
          <XpRow label={`Trash removed (×${breakdown.trashReduced})`} amount={breakdown.reductionBonus} delay={0.65} icon={<Zap size={13} className="text-neo-s" />} />
        )}
        {breakdown.streakBonus > 0 && (
          <XpRow label="Streak bonus 🔥"        amount={breakdown.streakBonus}    delay={0.75} icon={<span className="text-xs">🔥</span>} />
        )}
        <div className="h-px bg-line mt-1" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-between font-bold"
        >
          <span className="text-sm text-white">Total</span>
          <span className="text-sm font-mono text-neo-p">+{breakdown.totalXP} XP</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
