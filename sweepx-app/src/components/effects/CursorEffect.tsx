import React, { useEffect, useRef, useState } from 'react'

/**
 * CursorEffect — renders:
 *   1. A rotating transparent purple square with a soft glow that follows the cursor
 *   2. A purple trailing line behind the cursor path
 *
 * The default cursor is hidden via CSS (set in index.css) and replaced with a small purple dot.
 */
export function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPointer, setIsPointer] = useState(false)

  // Detect pointer device after mount (avoids SSR mismatch)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setIsPointer(mq.matches)
  }, [])

  useEffect(() => {
    if (!isPointer) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    let animId: number
    let mouseX = -100
    let mouseY = -100
    // Smoothed position for the square (lagging behind)
    let sqX = -100
    let sqY = -100
    let angle = 0

    // Trail: fixed-size ring buffer sampled every frame for smooth even spacing
    const MAX_TRAIL = 60
    const trail: { x: number; y: number; age: number }[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    let lastTrailX = -999
    let lastTrailY = -999

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ── Sample trail point every frame at even spacing ───────────
      const dx = mouseX - lastTrailX
      const dy = mouseY - lastTrailY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 3) {
        trail.push({ x: mouseX, y: mouseY, age: 1 })
        lastTrailX = mouseX
        lastTrailY = mouseY
      }

      // Age all points and remove dead ones
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age -= 0.018 // ~60 frames × 0.018 ≈ fades in ~55 frames
        if (trail[i].age <= 0) trail.splice(i, 1)
      }
      if (trail.length > MAX_TRAIL) trail.splice(0, trail.length - MAX_TRAIL)

      // ── 1. Purple trailing line ──────────────────────────────────
      if (trail.length > 2) {
        for (let i = 1; i < trail.length; i++) {
          const prev = trail[i - 1]
          const curr = trail[i]
          const alpha = curr.age * 0.4 // max opacity 0.4
          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.lineTo(curr.x, curr.y)
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
          ctx.lineWidth = 2 * curr.age // thinner as it fades
          ctx.lineCap = 'round'
          ctx.stroke()
        }
      }

      // ── 2. Purple dot cursor ─────────────────────────────────────
      ctx.beginPath()
      ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(168, 85, 247, 1)'
      ctx.shadowColor = 'rgba(168, 85, 247, 0.8)'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0

      // ── 3. Rotating transparent purple square with glow ──────────
      // Smooth follow (ease toward mouse)
      sqX += (mouseX - sqX) * 0.08
      sqY += (mouseY - sqY) * 0.08
      angle += 0.012 // rotation speed

      const size = 90 // 36 × 2.5

      ctx.save()
      ctx.translate(sqX, sqY)
      ctx.rotate(angle)

      // Glow
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)'
      ctx.shadowBlur = 20

      // Square
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(-size / 2, -size / 2, size, size)

      // Very subtle fill
      ctx.fillStyle = 'rgba(168, 85, 247, 0.06)'
      ctx.fillRect(-size / 2, -size / 2, size, size)

      ctx.shadowBlur = 0
      ctx.restore()

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [isPointer])

  if (!isPointer) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  )
}
