// ─── Framer Motion Variants & Presets ─────────────────────────────────────────

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
})

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  hover: {
    scale: 1.025,
    boxShadow: '0 8px 48px rgba(124,58,237,0.35), 0 0 0 1px rgba(124,58,237,0.4)',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const tiltHover = {
  rest: { rotateX: 0, rotateY: 0, scale: 1 },
  hover: { scale: 1.03 },
}

export const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.04 },
  tap:  { scale: 0.96 },
}

export const panelReveal = {
  hidden: { opacity: 0, y: 36, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

export const listItem = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
}

export const springConfig = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
}

export const smoothConfig = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
}
