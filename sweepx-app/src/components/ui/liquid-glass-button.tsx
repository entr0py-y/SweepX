"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ── LiquidButton ─────────────────────────────────────────────────────────────

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-white",
        destructive: "text-white",
        ghost: "text-white/70 hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 text-xs gap-1.5 px-4",
        lg: "h-10 px-6",
        xl: "h-12 px-8",
        xxl: "h-12 px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(
        "relative",
        liquidbuttonVariants({ variant, size, className })
      )}
      {...props}
    >
      {/* Liquid glass refraction layer */}
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full"
        style={{ backdropFilter: 'url("#liquid-glass-filter") blur(2px)', WebkitBackdropFilter: 'blur(8px)' }}
      />
      {/* Glass surface with inset shadows */}
      <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full transition-all
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.15),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.4),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.25),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.3),inset_0_0_6px_6px_rgba(255,255,255,0.04),inset_0_0_2px_2px_rgba(255,255,255,0.03),0_0_16px_rgba(168,85,247,0.12)]
          hover:shadow-[0_0_8px_rgba(0,0,0,0.05),0_3px_10px_rgba(0,0,0,0.12),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.22),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.4),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.32),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.3),inset_0_0_6px_6px_rgba(255,255,255,0.06),inset_0_0_2px_2px_rgba(255,255,255,0.04),0_0_24px_rgba(168,85,247,0.22)]"
      />
      <div className="pointer-events-none relative z-10">
        {children}
      </div>
    </Comp>
  )
}

// ── GlassFilter — render once at app root ─────────────────────────────────────
function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id="liquid-glass-filter"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.065 0.065"
            numOctaves="1"
            seed="2"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="55"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export { LiquidButton, liquidbuttonVariants, GlassFilter }
