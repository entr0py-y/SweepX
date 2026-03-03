import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { SecHead, cn } from '../shared/primitives'
import { GlowWrapper } from '@/components/ui/glow-wrapper'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'

export const RewardsSection: React.FC<{ id?: string }> = ({ id }) => {
  const { rewards, purchaseReward, equipReward, loadingRewards, pts } = useAppStore(s => ({
    rewards:       s.rewards,
    purchaseReward:s.purchaseReward,
    equipReward:   s.equipReward,
    loadingRewards:s.loadingRewards,
    pts:           s.userPoints,
  }))

  const [modal, setModal] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const selected = rewards.find(r => r.id === modal)

  const [featured, secondary] = useMemo(() => {
    if (!rewards || rewards.length === 0) return [null, [] as typeof rewards]
    const feat = rewards[0]
    const rest = rewards.slice(1, showAll ? undefined : 4)
    return [feat, rest]
  }, [rewards, showAll])

  return (
    <section id={id} className="relative px-6 md:px-10 pt-20 pb-24 overflow-hidden">
      {/* STEP 5 — Local ambient radial behind featured area */}
      <div
        className="pointer-events-none absolute top-32 left-1/4 -translate-x-1/2 w-[600px] h-[500px] rounded-full opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)' }}
      />

      <SecHead
        title="Claim Rewards"
        sub="Curated drops to convert your points into premium perks."
        action={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/[0.06] text-slate-200 text-xs font-mono font-semibold">
            <span>{pts.toLocaleString()} pts</span>
          </div>
        }
        className="relative z-10 mb-10"
      />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="text-2xs uppercase tracking-[0.12em] text-slate-500">Featured Reward</div>
        <InteractiveHoverButton
          text={showAll ? 'Collapse' : 'View All'}
          size="sm"
          onClick={() => setShowAll(prev => !prev)}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* ── Featured card ── */}
        {featured && (
          <GlowWrapper variant="lg" className="lg:col-span-2">
          <motion.div
            key={featured.id}
            className="glass-tile p-9 flex flex-col gap-6 cursor-pointer h-full"
            whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
            onClick={() => setModal(featured.id)}>
            <div className="relative z-[2] flex items-start justify-between gap-3">
              <div className="text-5xl select-none">{featured.image}</div>
              <span className="text-2xs px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 capitalize">{featured.rarity}</span>
            </div>
            <div className="relative z-[2] space-y-2">
              <h3 className="text-lg font-semibold text-white leading-tight">{featured.name}</h3>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{featured.description}</p>
            </div>
            <div className="relative z-[2] mt-auto flex items-center justify-between pt-3">
              <span className="text-sm font-mono font-semibold text-white/90">{featured.cost.toLocaleString()} pts</span>
              <InteractiveHoverButton
                text={featured.owned ? 'Owned' : 'Buy'}
                size="sm"
                disabled={featured.owned || pts < featured.cost || loadingRewards.has(featured.id)}
                blobClass={featured.owned ? 'bg-white/10' : 'bg-neo-v'}
                onClick={e => { e.stopPropagation(); if (!featured.owned && pts >= featured.cost) purchaseReward(featured.id) }}
              />
            </div>
          </motion.div>
          </GlowWrapper>
        )}

        {/* ── Secondary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-7">
          {secondary.map((r, i) => {
            const loading = loadingRewards.has(r.id)
            const canBuy  = !r.owned && pts >= r.cost
            return (
              <div key={r.id}
                onClick={() => setModal(r.id)}>
                <GlowWrapper variant="sm">
                <motion.div
                  className="glass-tile-sm p-6 flex flex-col gap-4 cursor-pointer"
                  whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}>
                <div className="relative z-[2] flex items-start justify-between gap-3">
                  <span className="text-4xl select-none">{r.image}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 capitalize">{r.rarity}</span>
                </div>
                <div className="relative z-[2] space-y-1.5">
                  <h4 className="text-sm font-semibold text-white leading-tight">{r.name}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{r.description}</p>
                </div>
                <div className="relative z-[2] mt-auto flex items-center justify-between pt-1">
                  <span className="text-sm font-mono font-semibold text-white/90">{r.cost.toLocaleString()} pts</span>
                  <InteractiveHoverButton
                    text={r.owned ? 'Owned' : 'Buy'}
                    size="xs"
                    disabled={!canBuy || loading}
                    blobClass={r.owned ? 'bg-white/10' : 'bg-neo-v'}
                    onClick={e => { e.stopPropagation(); if (canBuy) purchaseReward(r.id) }}
                  />
                </div>
                </motion.div>
                </GlowWrapper>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(null)}>
            <div className="absolute inset-0 bg-s-0/80 backdrop-blur-sm" />
            <motion.div
              className="relative max-w-sm w-full z-10"
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 8 }}
              onClick={e => e.stopPropagation()}>

              <GlowWrapper variant="lg">
              <div className="glass-tile p-7">
              <button onClick={() => setModal(null)} className="relative z-[2] absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                <X size={14} />
              </button>
              <div className="relative z-[2] h-44 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-5 overflow-hidden">
                <span className="text-7xl">{selected.image}</span>
              </div>
              <h3 className="relative z-[2] text-base font-bold text-white mb-1.5">{selected.name}</h3>
              <p className="relative z-[2] text-sm text-slate-400 mb-5 leading-relaxed">{selected.description}</p>
              <div className="relative z-[2] flex items-center justify-between gap-3">
                <span className="text-sm font-mono font-bold text-white/90">{selected.cost.toLocaleString()} pts</span>
                {selected.owned
                  ? selected.type !== 'title'
                    ? <InteractiveHoverButton
                        text={selected.equipped ? 'Unequip' : 'Equip'}
                        size="sm"
                        blobClass="bg-white/20"
                        onClick={() => { equipReward(selected.id); setModal(null) }}
                      />
                    : <span className="text-neo-s text-sm font-semibold flex items-center gap-1"><CheckCircle size={14} /> Owned</span>
                  : <InteractiveHoverButton
                      text={loadingRewards.has(selected.id) ? '...' : 'Purchase'}
                      size="md"
                      disabled={pts < selected.cost || loadingRewards.has(selected.id)}
                      onClick={() => purchaseReward(selected.id)}
                    />
                }
              </div>
            </div>
            </GlowWrapper>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
