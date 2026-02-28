import React, { useEffect, useRef } from 'react'

interface Pt { x: number; y: number; vx: number; vy: number; r: number; a: number; color: string }

const PALETTE = ['#7c3aed', '#a855f7', '#c084fc', '#6d28d9', '#8b5cf6']

export const ParticleCanvas: React.FC<{ className?: string; count?: number; connected?: boolean }> = ({
  className = '', count = 55, connected = true,
}) => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number
    let pts: Pt[] = []

    const init = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      pts = Array.from({ length: count }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    (Math.random() - 0.5) * 0.28,
        vy:    (Math.random() - 0.5) * 0.28,
        r:     Math.random() * 1.6 + 0.5,
        a:     Math.random() * 0.55 + 0.15,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      }))
    }

    const tick = () => {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(p.a * 255).toString(16).padStart(2, '0')
        ctx.fill()
      })

      if (connected) {
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x
            const dy = pts[i].y - pts[j].y
            const d  = Math.sqrt(dx * dx + dy * dy)
            if (d < 85) {
              ctx.beginPath()
              ctx.moveTo(pts[i].x, pts[i].y)
              ctx.lineTo(pts[j].x, pts[j].y)
              ctx.strokeStyle = `rgba(124,58,237,${0.07 * (1 - d / 85)})`
              ctx.lineWidth = 0.6
              ctx.stroke()
            }
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }

    init(); tick()
    const ro = new ResizeObserver(init)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [count, connected])

  return <canvas ref={ref} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} />
}
