"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProgressPips } from "./ProgressPips";

interface MazeHubScreenProps {
  totalGates: number;
  currentGate: number;
  completedGates: number[];
  onTransitionComplete: () => void;
}

export function MazeHubScreen({
  totalGates,
  currentGate,
  completedGates,
  onTransitionComplete,
}: MazeHubScreenProps) {
  const [phase, setPhase] = useState<"entering" | "warping" | "exiting">("entering");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("warping"), 200),
      setTimeout(() => setPhase("exiting"), 600),
      setTimeout(onTransitionComplete, 850),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onTransitionComplete]);

  return (
    <motion.div
      className="relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-void px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Perspective grid floor */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[60vh] opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(var(--electric) 1px, transparent 1px),
              linear-gradient(90deg, var(--electric) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transform: "perspective(500px) rotateX(60deg)",
            transformOrigin: "center bottom",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "0px 60px"],
          }}
          transition={{ duration: 0.8, ease: "linear" }}
        />
      </div>

      {/* Stars/particles rushing past */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-offwhite"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 500],
              opacity: [0, 1, 0],
              scale: [0.5, 2, 0.5],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.02,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      {/* Central warp tunnel */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={{
          scale: phase === "warping" ? [1, 1.5, 3] : phase === "exiting" ? [3, 10] : 1,
          opacity: phase === "exiting" ? 0 : 1,
        }}
        transition={{ duration: phase === "warping" ? 0.4 : 0.25 }}
      >
        {/* Tunnel rings */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: `${100 + i * 60}px`,
              height: `${100 + i * 60}px`,
              borderColor: i % 2 === 0 ? "var(--magenta)" : "var(--electric)",
              opacity: 0.5 - i * 0.08,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: i % 2 === 0 ? [0, 180] : [180, 0],
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Center portal */}
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full portal-ring"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 1, ease: "linear" },
            scale: { duration: 0.4, repeat: 2 },
          }}
        />
      </motion.div>

      {/* Gate counter */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: phase === "entering" ? 1 : 0, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-4xl sm:text-5xl md:text-6xl font-display text-magenta text-glow-magenta">
          {currentGate + 1}
        </p>
        <p className="text-lavender text-sm sm:text-base mt-2">of {totalGates}</p>
      </motion.div>

      {/* Progress pips */}
      <motion.div
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ProgressPips
          total={totalGates}
          current={currentGate}
          completed={completedGates}
        />
      </motion.div>

      {/* Warp text */}
      <motion.p
        className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 text-electric text-xs sm:text-sm uppercase tracking-widest font-bold z-20"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
        }}
        transition={{ duration: 0.8, times: [0, 0.2, 0.7, 1] }}
      >
        {phase === "entering" ? "Entering gate..." : "WARPING..."}
      </motion.p>

      {/* Speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-electric to-transparent"
            style={{
              left: 0,
              right: 0,
              top: `${5 + (i / 20) * 90}%`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 1],
              opacity: [0, 0.6, 0],
              x: ["-100%", "0%", "100%"],
            }}
            transition={{
              duration: 0.6,
              delay: i * 0.02,
              ease: "easeIn",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
