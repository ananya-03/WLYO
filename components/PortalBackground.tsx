"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

// Generate deterministic particle positions to avoid hydration mismatches
const PARTICLE_POSITIONS = [
  { left: 15, top: 20 }, { left: 82, top: 35 }, { left: 45, top: 78 },
  { left: 23, top: 55 }, { left: 67, top: 12 }, { left: 91, top: 68 },
  { left: 8, top: 42 }, { left: 55, top: 90 }, { left: 38, top: 25 },
  { left: 72, top: 60 }, { left: 28, top: 85 }, { left: 95, top: 18 },
  { left: 12, top: 72 }, { left: 63, top: 45 }, { left: 48, top: 8 },
  { left: 85, top: 52 }, { left: 33, top: 95 }, { left: 58, top: 30 },
  { left: 78, top: 82 }, { left: 5, top: 15 },
];

const PARTICLE_DURATIONS = [4.5, 5.2, 3.8, 6.1, 4.9, 3.5, 5.8, 4.2, 6.5, 3.9, 5.1, 4.7, 6.2, 3.6, 5.5, 4.1, 6.8, 3.4, 5.3, 4.4];
const PARTICLE_DELAYS = [0.5, 1.2, 0.3, 1.8, 0.8, 1.5, 0.2, 1.1, 0.6, 1.9, 0.4, 1.3, 0.7, 1.6, 0.1, 1.4, 0.9, 1.7, 0.35, 1.25];

export function PortalBackground() {
  const particles = useMemo(() => PARTICLE_POSITIONS.map((pos, i) => ({
    ...pos,
    color: ["var(--magenta)", "var(--acid)", "var(--electric)", "var(--warning)"][i % 4],
    duration: PARTICLE_DURATIONS[i],
    delay: PARTICLE_DELAYS[i],
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Void gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ink to-void" />

      {/* Animated portal rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 opacity-30"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
              borderColor: i % 2 === 0 ? "var(--magenta)" : "var(--electric)",
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 3 + i,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </div>

      {/* Floating particles with deterministic positions */}
      {particles.map((particle, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            backgroundColor: particle.color,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, var(--magenta) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(var(--lavender) 1px, transparent 1px),
            linear-gradient(90deg, var(--lavender) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
