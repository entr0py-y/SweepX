import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-4 w-4" />}
        title="Sweep the city"
        description="Complete real-world quests by finding and photographing litter around you."
      />
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Settings className="h-4 w-4" />}
        title="AI-powered verification"
        description="Our computer vision model validates your cleanups instantly — no manual review needed."
      />
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-4 w-4" />}
        title="Earn XP & climb the ranks"
        description="Every verified sweep earns you XP. Compete on leaderboards and unlock unique rewards."
      />
      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Sparkles className="h-4 w-4" />}
        title="Daily streak bonuses"
        description="Stay consistent and multiply your XP gains with streak multipliers."
      />
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Search className="h-4 w-4" />}
        title="New quests dropping soon"
        description="Timed challenges, community events, and location-based missions are on the way."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6" style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'url("#liquid-glass-filter") blur(3px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: [
            '0 0 8px rgba(0,0,0,0.04)',
            '0 4px 16px rgba(0,0,0,0.18)',
            'inset 3px 3px 0.5px -3px rgba(255,255,255,0.18)',
            'inset -3px -3px 0.5px -3px rgba(0,0,0,0.5)',
            'inset 1px 1px 1px -0.5px rgba(255,255,255,0.28)',
            'inset -1px -1px 1px -0.5px rgba(0,0,0,0.35)',
            'inset 0 0 8px 6px rgba(255,255,255,0.03)',
            'inset 0 0 2px 2px rgba(255,255,255,0.025)',
            '0 0 20px rgba(168,85,247,0.06)',
          ].join(', '),
        }}>
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-white/[0.09] p-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
