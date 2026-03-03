import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { BarChart3, TrendingUp, Leaf, Droplets, Recycle, Wind } from 'lucide-react'
import { SecHead, Counter, cn } from '../shared/primitives'
import { GlowWrapper } from '@/components/ui/glow-wrapper'

const AREA_DATA = [
  { date: 'Mon', pts: 120 }, { date: 'Tue', pts: 300 }, { date: 'Wed', pts: 180 },
  { date: 'Thu', pts: 420 }, { date: 'Fri', pts: 290 }, { date: 'Sat', pts: 510 },
  { date: 'Sun', pts: 640 },
]

const PIE_DATA = [
  { name: 'Beach',     val: 32, color: '#a855f7' },
  { name: 'Park',      val: 28, color: '#7c3aed' },
  { name: 'Trail',     val: 22, color: '#c084fc' },
  { name: 'Urban',     val: 18, color: '#6d28d9' },
]

const IMPACT_CARDS = [
  { icon: Leaf,     color: 'text-neo-s', bg: 'bg-neo-s/10', label: 'Trees Equivalent', val: 47,   suffix: ' trees' },
  { icon: Droplets, color: 'text-neo-p', bg: 'bg-neo-p/10', label: 'Water Saved',       val: 2400, suffix: ' L'    },
  { icon: Recycle,  color: 'text-neo-v', bg: 'bg-neo-v/10', label: 'Waste Removed',     val: 38,   suffix: ' kg'   },
  { icon: Wind,     color: 'text-neo-p', bg: 'bg-neo-p/10', label: 'CO₂ Offset',        val: 14,   suffix: ' kg'   },
]

const TooltipContent: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-s-2 border border-line rounded-xl px-3 py-2">
      <p className="text-2xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-xs font-bold text-neo-p font-mono">+{payload[0].value} pts</p>
    </div>
  )
}

export const StatsSection: React.FC<{ id?: string }> = ({ id }) => (
  <section id={id} className="px-6 md:px-10 py-10">
    <SecHead tag="Stats" title="Your" accent="Impact" sub="Track your real-world environmental contribution." />

    {/* Impact cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {IMPACT_CARDS.map((c, i) => {
        const Icon = c.icon
        return (
          <div key={c.label}>
            <GlowWrapper variant="sm">
            <div className="glass-tile-sm p-5 flex flex-col gap-3">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-12 rounded-t-[20px]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)' }} />
            <div className={cn('relative z-[2] w-9 h-9 rounded-2xl flex items-center justify-center', c.bg)}>
              <Icon size={16} className={c.color} />
            </div>
            <div className="relative z-[2]">
              <p className={cn('text-xl font-bold font-mono', c.color)}>
                <Counter to={c.val} duration={1200} suffix={c.suffix} />
              </p>
              <p className="text-2xs text-slate-500 mt-0.5 leading-relaxed">{c.label}</p>
            </div>
          </div>
          </GlowWrapper>
          </div>
        )
      })}
    </div>

    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Area chart — 2/3 */}
      <GlowWrapper variant="lg" className="lg:col-span-2">
      <div className="glass-tile p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[20px]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)' }} />
        <div className="relative z-[2] flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-neo-p" />
            <span className="text-xs font-semibold text-white">Weekly Points</span>
          </div>
          <span className="label-xs text-neo-s font-mono">
            +<Counter to={640} duration={1000} /> this week
          </span>
        </div>
        <ResponsiveContainer className="relative z-[2]" width="100%" height={160}>
          <AreaChart data={AREA_DATA} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#7c3aed" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
            <YAxis    tick={{ fontSize: 10, fill: '#4b5563' }} axisLine={false} tickLine={false} />
            <RTooltip content={<TooltipContent />} cursor={{ stroke: 'rgba(124,58,237,0.3)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="pts" stroke="#7c3aed" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#a855f7', stroke: '#1A1A24' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      </GlowWrapper>

      {/* Pie — 1/3 */}
      <GlowWrapper variant="lg">
      <div className="glass-tile p-5 flex flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 rounded-t-[20px]" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)' }} />
        <div className="relative z-[2] flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-neo-p" />
          <span className="text-xs font-semibold text-white">Mission Types</span>
        </div>
        <div className="relative z-[2] flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                paddingAngle={3} dataKey="val" stroke="none">
                {PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-[2] grid grid-cols-2 gap-1.5">
          {PIE_DATA.map(d => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-2xs text-slate-400">{d.name}</span>
              <span className="text-2xs font-mono text-white ml-auto">{d.val}%</span>
            </div>
          ))}
        </div>
      </div>
      </GlowWrapper>
    </div>
  </section>
)
