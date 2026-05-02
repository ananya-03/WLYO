"use client";

import { motion } from "framer-motion";

interface RadarChartProps {
  scores: {
    rizz: number;
    aura: number;
    sigma: number;
    era: number;
  };
}

export function RadarChart({ scores }: RadarChartProps) {
  const labels = ["Rizz", "Aura", "Sigma", "Era"];
  const values = [scores.rizz, scores.aura, scores.sigma, scores.era];
  const colors = ["var(--acid)", "var(--magenta)", "var(--electric)", "var(--warning)"];

  // Dominant axis determines polygon accent color
  const dominantIndex = values.indexOf(Math.max(...values));
  const dominantColor = colors[dominantIndex];
  
  const centerX = 120;
  const centerY = 120;
  const maxRadius = 74;
  const labelRadius = 98;
  
  // Calculate points for the radar polygon
  const getPoint = (index: number, value: number) => {
    const angle = (index / 4) * Math.PI * 2 - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  };

  const points = values.map((value, i) => getPoint(i, value));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid circles
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      <svg viewBox="0 0 240 240" className="h-full w-full" role="img" aria-label="Vibe score radar chart">
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={(level / 100) * maxRadius}
            fill="none"
            stroke="var(--lavender)"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {labels.map((_, i) => {
          const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const x = centerX + Math.cos(angle) * maxRadius;
          const y = centerY + Math.sin(angle) * maxRadius;
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="var(--lavender)"
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon — colored by dominant axis */}
        <motion.path
          d={pathD}
          fill={dominantColor}
          fillOpacity={0.15}
          stroke={dominantColor}
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={colors[i]}
            stroke="var(--void)"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            style={{
              filter: `drop-shadow(0 0 6px ${colors[i]})`,
            }}
          />
        ))}

        {/* Labels */}
        {labels.map((label, i) => {
          const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const x = centerX + Math.cos(angle) * labelRadius;
          const y = centerY + Math.sin(angle) * labelRadius;
          return (
            <text
              key={label}
              x={x}
              y={y}
              fill={colors[i]}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              className="uppercase tracking-wider"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
