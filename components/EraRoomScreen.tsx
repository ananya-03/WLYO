"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { eraConfig, type Era } from "@/lib/game-store";

interface EraRoomScreenProps {
  era: Era;
  title: string;
  estimatedAge: number;
  roast: string;
  onContinue: () => void;
}

// Stable random positions — computed once at module load, never on render
const OLDER_GENZ_PARTICLES = Array.from({ length: 12 }, () => ({
  left: 10 + Math.random() * 80,
  top: 10 + Math.random() * 80,
  dur: 2 + Math.random() * 2,
}));

const GENZ_CORE_FLOATERS = Array.from({ length: 15 }, (_, i) => ({
  left: Math.random() * 90,
  top: Math.random() * 90,
  dur: 2 + Math.random(),
  label: (["?", "!", "SUS", "W", "L", "$"] as const)[i % 6],
  color: (["var(--magenta)", "var(--acid)", "var(--electric)"] as const)[i % 3],
}));

const GEN_ALPHA_STICKERS = Array.from({ length: 20 }, (_, i) => ({
  left: Math.random() * 90,
  top: Math.random() * 90,
  dur: 1 + Math.random(),
  rotateTarget: Math.random() * 360,
  dx: Math.random() * 20 - 10,
  color: (["var(--magenta)", "var(--acid)", "var(--electric)", "var(--warning)", "var(--lavender)"] as const)[i % 5],
  label: (["RIZZ", "GYATT", "OHIO", "SIGMA", "W", "SKIBIDI", "MEWING", "FR FR"] as const)[i % 8],
}));

export function EraRoomScreen({ era, title, estimatedAge, roast, onContinue }: EraRoomScreenProps) {
  const [phase, setPhase] = useState<"blackout" | "title" | "age" | "roast" | "ready">("blackout");
  const config = eraConfig[era];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("title"), 300),
      setTimeout(() => setPhase("age"), 1000),
      setTimeout(() => setPhase("roast"), 1600),
      setTimeout(() => setPhase("ready"), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Era-specific background chaos — uses module-level stable constants to avoid rerenders
  const getEraBackground = () => {
    const baseElements = (
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${config.color}20 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      />
    );

    switch (era) {
      case "boomer":
        return (
          <>
            {baseElements}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,159,28,0.03)_3px,rgba(255,159,28,0.03)_6px)]" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-warning/10 to-transparent"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        );
      case "millennial":
        return (
          <>
            {baseElements}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 sm:h-3 w-full opacity-40"
                style={{
                  top: `${15 + i * 12}%`,
                  background: `linear-gradient(90deg, transparent, ${
                    ["#ff0000", "#ff9f1c", "#39ff14", "#00f0ff", "#ff2bd6", "#b9aee8"][i]
                  }, transparent)`,
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
              />
            ))}
          </>
        );
      case "older-gen-z":
        return (
          <>
            {baseElements}
            {OLDER_GENZ_PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  backgroundColor: "var(--acid)",
                  opacity: 0.3,
                }}
                animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </>
        );
      case "gen-z-core":
        return (
          <>
            {baseElements}
            {GENZ_CORE_FLOATERS.map((p, i) => (
              <motion.div
                key={i}
                className="absolute text-lg sm:text-xl font-bold opacity-30"
                style={{ left: `${p.left}%`, top: `${p.top}%`, color: p.color }}
                animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {p.label}
              </motion.div>
            ))}
          </>
        );
      case "gen-alpha":
        return (
          <>
            {baseElements}
            {GEN_ALPHA_STICKERS.map((p, i) => (
              <motion.div
                key={i}
                className="absolute text-xs sm:text-sm font-comic font-bold opacity-40"
                style={{ left: `${p.left}%`, top: `${p.top}%`, color: p.color }}
                animate={{ y: [0, -40, 0], x: [0, p.dx, 0], rotate: [0, p.rotateTarget], scale: [1, 1.5, 1] }}
                transition={{ duration: p.dur, repeat: Infinity, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {p.label}
              </motion.div>
            ))}
          </>
        );
      default:
        return baseElements;
    }
  };

  return (
    <motion.div
      className="relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-void px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Era-specific background */}
      <div className="absolute inset-0 overflow-hidden">
        {getEraBackground()}
      </div>

      {/* Central glow matching era color */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-3xl"
        style={{ backgroundColor: config.color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full px-4">
        <AnimatePresence mode="wait">
          {/* Blackout */}
          {phase === "blackout" && (
            <motion.div
              key="blackout"
              className="absolute inset-0 bg-void"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}

          {/* Title SLAM */}
          {(phase === "title" || phase === "age" || phase === "roast" || phase === "ready") && (
            <motion.div
              key="title"
              className="mb-4 sm:mb-6"
              initial={{ scale: 3, opacity: 0, y: -100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                damping: 8,
                stiffness: 100,
                mass: 0.8,
              }}
            >
              <h1
                className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
                style={{
                  color: config.color,
                  textShadow: `0 0 20px ${config.color}, 0 0 40px ${config.color}, 0 0 60px ${config.color}`,
                }}
              >
                {title}
              </h1>
            </motion.div>
          )}

          {/* Age reveal - SLAM in */}
          {(phase === "age" || phase === "roast" || phase === "ready") && (
            <motion.div
              key="age"
              className="mb-4 sm:mb-6"
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                damping: 10,
                stiffness: 150,
              }}
            >
              <p className="text-lavender text-sm sm:text-base mb-1 sm:mb-2 uppercase tracking-widest">
                Internet Age
              </p>
              <motion.p
                className="font-display text-5xl sm:text-7xl md:text-8xl text-offwhite"
                animate={{
                  textShadow: [
                    "0 0 10px var(--offwhite)",
                    "0 0 30px var(--offwhite)",
                    "0 0 10px var(--offwhite)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {estimatedAge}
              </motion.p>
            </motion.div>
          )}

          {/* Roast line - slide in */}
          {(phase === "roast" || phase === "ready") && (
            <motion.p
              key="roast"
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-lavender font-medium mb-6 sm:mb-8 font-comic max-w-md"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {`"${roast}"`}
            </motion.p>
          )}

          {/* Continue button */}
          {phase === "ready" && (
            <motion.button
              key="button"
              onClick={onContinue}
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 mt-2 sm:mt-4"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                damping: 15,
                delay: 0.1,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              VIEW VIBE REPORT
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Era badge at bottom */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border-2"
        style={{ borderColor: config.color, color: config.color }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">
          {config.ageRange} Era
        </span>
      </motion.div>

      {/* Screen shake on title slam */}
      {phase === "title" && (
        <motion.div
          className="fixed inset-0 pointer-events-none"
          aria-hidden="true"
          animate={{
            x: [0, -5, 5, -3, 3, 0],
            y: [0, 3, -3, 2, -2, 0],
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}
