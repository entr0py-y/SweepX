import React, { useEffect, useRef } from 'react'

const RATE = 1 / 60 // 1 second full change at 60fps

// Simple ease-in curve for opacity application
const easeIn = (t: number) => t * t

interface Props {
  scrollRef: React.RefObject<HTMLElement>
}

export const BottomBlurVeil: React.FC<Props> = ({ scrollRef }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track linear progress (0 to 1) instead of opacity directly
  const progress = useRef(0)
  const isScrolling = useRef(false)
  const rafId = useRef(0)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tick = useRef(() => {
    // Linear change in progress
    if (isScrolling.current) {
      progress.current = Math.min(1, progress.current + RATE)
    } else {
      progress.current = Math.max(0, progress.current - RATE)
    }

    // Apply eased progress to opacity
    if (containerRef.current) {
      containerRef.current.style.opacity = String(easeIn(progress.current))
    }

    // Keep loop running if there's any state left to animate
    if (progress.current > 0 || isScrolling.current) {
      rafId.current = requestAnimationFrame(tick.current)
    }
  })

  useEffect(() => {
    const tryAttach = () => {
      const el = scrollRef.current
      if (!el) return false

      el.addEventListener('scroll', () => {
        isScrolling.current = true

        // Start if not running
        if (!rafId.current) {
          rafId.current = requestAnimationFrame(tick.current)
        }

        // Extremely short debounce to detect when scroll stops (no delay)
        if (scrollTimer.current) clearTimeout(scrollTimer.current)
        scrollTimer.current = setTimeout(() => {
          isScrolling.current = false
        }, 50)
      }, { passive: true })

      return true
    }

    if (!tryAttach()) {
      const id = setInterval(() => { if (tryAttach()) clearInterval(id) }, 100)
      setTimeout(() => clearInterval(id), 5000)
    }
  }, [scrollRef])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        marginTop: -200,
        zIndex: 50,
        pointerEvents: 'none',
        opacity: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.04) 12%, rgba(0,0,0,0.12) 24%, rgba(0,0,0,0.25) 36%, rgba(0,0,0,0.42) 48%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0.92) 84%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.04) 12%, rgba(0,0,0,0.12) 24%, rgba(0,0,0,0.25) 36%, rgba(0,0,0,0.42) 48%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0.92) 84%, black 100%)',
        }}
      />
    </div>
  )
}

