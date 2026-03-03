import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  id: string
  icon: LucideIcon
}

interface TubelightNavbarProps {
  items: NavItem[]
  activeId: string
  onNav: (id: string) => void
  className?: string
}

export function TubelightNavbar({ items, activeId, onNav, className }: TubelightNavbarProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className={cn("flex items-center", className)}>
      {/* No outer container — only the active-item bubble shows */}
      <div className="flex items-center gap-0.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeId === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={cn(
                "relative cursor-pointer text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-200",
                isActive ? "text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {/* Desktop: label */}
              <span className="hidden md:inline relative z-10 tracking-wide">{item.name}</span>
              {/* Mobile: icon */}
              <span className="md:hidden relative z-10">
                <Icon size={16} strokeWidth={2.5} />
              </span>

              {/* Active underline dot only */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neo-p"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
