"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Static particle positions - no randomness
const PARTICLES = [
  { left: 15, top: 20, color: "var(--magenta)", duration: 4.5, delay: 0.5 },
  { left: 82, top: 35, color: "var(--acid)", duration: 5.2, delay: 1.2 },
  { left: 45, top: 78, color: "var(--electric)", duration: 3.8, delay: 0.3 },
  { left: 23, top: 55, color: "var(--warning)", duration: 6.1, delay: 1.8 },
  { left: 67, top: 12, color: "var(--magenta)", duration: 4.9, delay: 0.8 },
  { left: 91, top: 68, color: "var(--acid)", duration: 3.5, delay: 1.5 },
  { left: 8, top: 42, color: "var(--electric)", duration: 5.8, delay: 0.2 },
  { left: 55, top: 90, color: "var(--warning)", duration: 4.2, delay: 1.1 },
  { left: 38, top: 25, color: "var(--magenta)", duration: 6.5, delay: 0.6 },
  { left: 72, top: 60, color: "var(--acid)", duration: 3.9, delay: 1.9 },
  { left: 28, top: 85, color: "var(--electric)", duration: 5.1, delay: 0.4 },
  { left: 95, top: 18, color: "var(--warning)", duration: 4.7, delay: 1.3 },
];

export function PortalBackground() {
  const [showParticles, setShowParticles] = useState(false);
  
  useEffect(() => {
    // Delay particle rendering to ensure client-only
    const timer = setTimeout(() => setShowParticles(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Void gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-ink to-void" />

      {/* Animated portal rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3, 4].map((i) => (
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

      {/* Floating particles - client-only to avoid hydration */}
      {showParticles && PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
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
