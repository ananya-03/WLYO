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
    rizz: "#39ff14",
    aura: "#ff2bd6",
    sigma: "#00f0ff",
    era: "#ff9f1c",
  };

  return (
    <div
      id="share-card"
      className="relative w-full aspect-[1200/630] rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #08070f 0%, #151124 50%, #08070f 100%)`,
      }}
    >
      {/* Border glow */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${config.color}40, transparent, ${config.color}40)`,
          padding: "2px",
        }}
      >
        <div className="w-full h-full bg-void rounded-2xl" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-offwhite tracking-tight">
              WLYO
            </h1>
            <p className="text-lavender text-xs uppercase tracking-widest">
              Vibe Report
            </p>
          </div>
          <div 
            className="px-3 py-1 rounded-full border text-xs font-bold uppercase"
            style={{ borderColor: config.color, color: config.color }}
          >
            {config.ageRange}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-4">
          {/* Left - Title and age */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-2"
              style={{ 
                color: config.color,
                textShadow: `0 0 20px ${config.color}`,
              }}
            >
              {title}
            </h2>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lavender text-sm">Internet Age:</span>
              <span className="font-display text-4xl text-offwhite">{estimatedAge}</span>
            </div>
            <p className="text-lavender/80 text-sm font-comic italic max-w-xs">
              {`"${roast}"`}
            </p>
          </div>

          {/* Right - Stats bars */}
          <div className="w-32 flex flex-col justify-center gap-2">
            {Object.entries(scores).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-lavender uppercase">{key}</span>
                  <span className="text-offwhite font-bold">{value}</span>
                </div>
                <div className="h-2 bg-ink rounded-full overflow-hidden">
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
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-lavender/20">
          <p className="text-electric text-sm font-bold">
            Who Let You Online?
          </p>
          <p className="text-lavender/60 text-xs">
            wlyo.app
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <div 
          className="w-full h-full rounded-full blur-2xl"
          style={{ backgroundColor: config.color }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
        <div 
          className="w-full h-full rounded-full blur-xl"
          style={{ backgroundColor: config.color }}
        />
      </div>
    </div>
  );
}
