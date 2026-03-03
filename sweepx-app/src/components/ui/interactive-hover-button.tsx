import React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  /** arrow icon on hover (defaults to ArrowRight) */
  arrowIcon?: React.ReactNode
  /** blob fill color class (defaults to bg-neo-v) */
  blobClass?: string
  /** size variant */
  size?: 'xs' | 'sm' | 'md'
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  (
    {
      text = "Button",
      className,
      disabled,
      arrowIcon,
      blobClass = "bg-neo-v",
      size = 'sm',
      ...props
    },
    ref,
  ) => {
    const sizeClass =
      size === 'xs' ? 'h-8 px-4 text-xs'   :
      size === 'md' ? 'h-11 px-6 text-sm'  :
      'h-9 px-5 text-sm'

    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-xl whitespace-nowrap",
          "border border-white/[0.14]",
          "font-semibold text-white",
          sizeClass,
          disabled && "opacity-40 cursor-not-allowed pointer-events-none",
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {/* Liquid glass surface */}
        <div className="absolute inset-0 -z-10 rounded-xl" style={{
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'url("#liquid-glass-filter") blur(2px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: [
            'inset 3px 3px 0.5px -3px rgba(255,255,255,0.18)',
            'inset -3px -3px 0.5px -3px rgba(0,0,0,0.45)',
            'inset 1px 1px 1px -0.5px rgba(255,255,255,0.26)',
            'inset -1px -1px 1px -0.5px rgba(0,0,0,0.3)',
            'inset 0 0 6px 4px rgba(255,255,255,0.025)',
          ].join(', '),
        }} />
        {/* Label — slides out right on hover */}
        <span className="relative z-10 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
          {text}
        </span>

        {/* Hover label + arrow — slides in from right */}
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-1 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <span>{text}</span>
          {arrowIcon ?? <ArrowRight size={11} />}
        </div>

        {/* Growing blob fill */}
        <div
          className={cn(
            "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg transition-all duration-300",
            "group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
            blobClass,
          )}
        />
      </button>
    )
  },
)

InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }
