"use client";

import { eraConfig, type Era } from "@/lib/game-store";

interface ShareCardProps {
  title: string;
  era: Era;
  estimatedAge: number;
  scores: {
    rizz: number;
    aura: number;
    sigma: number;
    era: number;
  };
  roast: string;
}

export function ShareCard({ title, era, estimatedAge, scores, roast }: ShareCardProps) {
  const config = eraConfig[era];
  const colors = {
    rizz: "var(--acid)",
    aura: "var(--magenta)",
    sigma: "var(--electric)",
    era: "var(--warning)",
  };

  return (
    <div
      id="share-card"
      className="relative aspect-[1200/630] w-full max-w-[560px] overflow-hidden rounded-xl sm:rounded-2xl"
      style={{
        background: `linear-gradient(135deg, #08070f 0%, #151124 50%, #08070f 100%)`,
      }}
    >
      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-xl sm:rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${config.color}40, transparent, ${config.color}40)`,
          padding: "2px",
        }}
      >
        <div className="w-full h-full bg-void rounded-xl sm:rounded-2xl" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex min-w-0 flex-col p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="mb-2 flex min-w-0 items-start justify-between gap-3 sm:mb-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-2xl md:text-3xl text-offwhite tracking-tight">
              WLYO
            </h1>
            <p className="text-lavender text-[8px] sm:text-xs uppercase tracking-widest">
              Vibe Report
            </p>
          </div>
          <div
            className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[8px] sm:text-xs font-bold uppercase"
            style={{ borderColor: config.color, color: config.color }}
          >
            {config.ageRange}
          </div>
        </div>

        {/* Main content */}
        <div className="flex min-h-0 flex-1 gap-2 sm:gap-4">
          {/* Left - Title and age */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h2
              className="mb-1 overflow-hidden break-words font-display text-lg font-bold leading-none [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:mb-2 sm:text-2xl md:text-4xl lg:text-5xl"
              style={{
                color: config.color,
                textShadow: `0 0 20px ${config.color}`,
              }}
            >
              {title}
            </h2>
            <div className="mb-2 flex min-w-0 items-baseline gap-1 sm:mb-3 sm:gap-2">
              <span className="shrink-0 text-lavender text-[10px] sm:text-sm">Internet Age:</span>
              <span className="font-display text-2xl sm:text-4xl text-offwhite">{estimatedAge}</span>
            </div>
            <p className="overflow-hidden break-words text-[10px] font-comic italic leading-snug text-lavender/80 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-sm">
              {`"${roast}"`}
            </p>
          </div>

          {/* Right - Stats bars */}
          <div className="flex w-20 shrink-0 flex-col justify-center gap-1 sm:w-28 sm:gap-2 md:w-32">
            {Object.entries(scores).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5 sm:gap-1">
                <div className="flex justify-between text-[8px] sm:text-xs">
                  <span className="text-lavender uppercase">{key}</span>
                  <span className="text-offwhite font-bold">{value}</span>
                </div>
                <div className="h-1 sm:h-2 bg-ink rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${value}%`,
                      backgroundColor: colors[key as keyof typeof colors],
                      boxShadow: `0 0 8px ${colors[key as keyof typeof colors]}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 flex min-w-0 items-center justify-between gap-3 border-t border-lavender/20 pt-2 sm:mt-3 sm:pt-3">
          <p className="min-w-0 truncate text-electric text-[10px] font-bold sm:text-sm">
            Who Let You Online?
          </p>
          <p className="shrink-0 text-lavender/60 text-[8px] sm:text-xs">
            wlyo.app
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 opacity-20">
        <div
          className="w-full h-full rounded-full blur-2xl"
          style={{ backgroundColor: config.color }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-24 sm:h-24 opacity-10">
        <div
          className="w-full h-full rounded-full blur-xl"
          style={{ backgroundColor: config.color }}
        />
      </div>
    </div>
  );
}
