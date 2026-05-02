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

export function EraRoomScreen({ era, title, estimatedAge, roast, onContinue }: EraRoomScreenProps) {
  const [phase, setPhase] = useState<"title" | "age" | "roast" | "ready">("title");
  const config = eraConfig[era];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("age"), 800),
      setTimeout(() => setPhase("roast"), 1400),
      setTimeout(() => setPhase("ready"), 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Era-specific background elements
  const getEraBackground = () => {
    switch (era) {
      case "boomer":
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-warning/30 to-transparent" />
            {/* CRT effect */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,159,28,0.1)_2px,rgba(255,159,28,0.1)_4px)]" />
          </div>
        );
      case "millennial":
        return (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-electric/20 via-transparent to-magenta/20" />
            {/* Rainbow streaks */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-full"
                style={{
                  top: `${20 + i * 15}%`,
                  background: `linear-gradient(90deg, 
                    transparent, 
                    ${["#ff0000", "#ff9f1c", "#39ff14", "#00f0ff", "#ff2bd6"][i]}, 
                    transparent
                  )`,
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        );
      case "older-gen-z":
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-acid/20 to-transparent" />
            {/* Floating pepes/doges represented as shapes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full bg-acid/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        );
      case "gen-z-core":
        return (
          <div className="absolute inset-0 opacity-25">
            <div className="absolute inset-0 bg-gradient-to-br from-magenta/30 via-transparent to-electric/30" />
            {/* Sus indicators */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
              >
                {["?", "!", "$", "%"][i % 4]}
              </motion.div>
            ))}
          </div>
        );
      case "gen-alpha":
        return (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-lavender/30 via-magenta/20 to-electric/30" />
            {/* Chaotic floating elements */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm font-comic"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  color: ["var(--magenta)", "var(--acid)", "var(--electric)", "var(--warning)"][i % 4],
                }}
                animate={{ 
                  y: [0, -30, 0],
                  rotate: [0, Math.random() * 360],
                  scale: [1, 1.5, 1],
                }}
                transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.1 }}
              >
                {["RIZZ", "GYATT", "OHIO", "SIGMA", "W", "L"][i % 6]}
              </motion.div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-void px-4">
      {/* Era-specific background */}
      {getEraBackground()}

      {/* Central glow matching era color */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: config.color }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Title slam */}
          <motion.div
            key="title"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="mb-6"
          >
            <h1 
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
              style={{ 
                color: config.color,
                textShadow: `0 0 20px ${config.color}, 0 0 40px ${config.color}`,
              }}
            >
              {title}
            </h1>
          </motion.div>

          {/* Age reveal */}
          {(phase === "age" || phase === "roast" || phase === "ready") && (
            <motion.div
              key="age"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="mb-4"
            >
              <p className="text-lavender text-lg mb-2">Estimated Internet Age</p>
              <p className="font-display text-6xl md:text-8xl text-offwhite">
                {estimatedAge}
              </p>
            </motion.div>
          )}

          {/* Roast */}
          {(phase === "roast" || phase === "ready") && (
            <motion.p
              key="roast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl text-lavender font-medium mt-6 mb-8 font-comic"
            >
              {`"${roast}"`}
            </motion.p>
          )}

          {/* Continue button */}
          {phase === "ready" && (
            <motion.button
              key="button"
              onClick={onContinue}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="btn-primary text-lg px-8 py-4 mt-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              VIEW VIBE REPORT
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Era badge */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border-2"
        style={{ borderColor: config.color, color: config.color }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-sm uppercase tracking-widest font-bold">
          {config.ageRange} Era
        </span>
      </motion.div>
    </div>
  );
}
