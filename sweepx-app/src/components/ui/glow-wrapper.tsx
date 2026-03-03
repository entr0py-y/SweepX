import React from 'react'
import { GlowingEffect } from '@/components/ui/glowing-effect'

/**
 * Outer wrapper that pairs with an inner card (glass-tile / glass-tile-sm).
 * The glow renders on this transparent shell; the actual card sits inside.
 */
export const GlowWrapper: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'lg' | 'sm'
}> = ({ children, className = '', variant = 'lg' }) => {
  // outer radius = inner radius + 8px (p-2 padding)
  const radius = variant === 'lg' ? 'rounded-[1.75rem]' : 'rounded-[1.5rem]'
  return (
    <div className={`relative ${radius} p-2 border border-white/[0.07] ${className}`}>
      <GlowingEffect
        spread={40}
        glow
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      {children}
    </div>
  )
}
