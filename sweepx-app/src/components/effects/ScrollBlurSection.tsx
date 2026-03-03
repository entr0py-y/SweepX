import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useScrollContainer } from './ScrollContainerContext'

interface ScrollBlurSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps a section so it blurs + fades when scrolled away from the center of
 * the viewport. Reads the scroll container from ScrollContainerContext.
 */
export const ScrollBlurSection: React.FC<ScrollBlurSectionProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useScrollContainer()

  // Track how far this element has scrolled through the viewport inside the real scroll container
  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef ?? undefined,
    offset: ['start end', 'end start'], // 0 = enters bottom, 1 = leaves top
  })

  // blur: heavy when section just entered from BOTTOM, clears as it reaches center
  const blur = useTransform(
    scrollYProgress,
    [0, 0.25, 0.42, 1],
    [20, 5, 0, 0]
  )

  // opacity: fade-in from bottom entry
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.38, 1],
    [0.2, 0.7, 1, 1]
  )

  // subtle scale-up from bottom entry
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [0.975, 1, 1]
  )

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        filter: useTransform(blur, v => `blur(${v}px)`),
        opacity,
        scale,
        willChange: 'filter, opacity, transform',
        transformOrigin: 'center center',
      }}
    >
      {children}
    </motion.div>
  )
}
