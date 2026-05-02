"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MemeGate } from "@/lib/game-store";

interface SeedFlashScreenProps {
  gate: MemeGate;
  replayUsed: boolean;
  onComplete: () => void;
  onReplay: () => void;
}

export function SeedFlashScreen({ gate, replayUsed, onComplete, onReplay }: SeedFlashScreenProps) {
  const [phase, setPhase] = useState<"countdown" | "flash" | "void" | "ready">("countdown");
  const [countdown, setCountdown] = useState(3);

  // For audio gates, we skip the image flash
  const isAudioGate = gate.type === "audio";

  const handleReplay = useCallback(() => {
    if (!replayUsed) {
      onReplay();
      setPhase("countdown");
      setCountdown(3);
    }
  }, [replayUsed, onReplay]);

  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 250);
      return () => clearTimeout(timer);
    } else if (phase === "countdown" && countdown === 0) {
      // Audio gates skip the flash
      if (isAudioGate) {
        setPhase("ready");
      } else {
        setPhase("flash");
      }
    } else if (phase === "flash") {
      const timer = setTimeout(() => setPhase("void"), 700);
      return () => clearTimeout(timer);
    } else if (phase === "void") {
      const timer = setTimeout(() => setPhase("ready"), 200);
      return () => clearTimeout(timer);
    } else if (phase === "ready") {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
  }, [phase, countdown, onComplete, isAudioGate]);

  return (
    <motion.div
      className="relative min-h-screen min-h-[100dvh] flex items-center justify-center overflow-hidden bg-void"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {/* Countdown */}
        {phase === "countdown" && (
          <motion.div
            key="countdown"
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.span
              className="text-7xl sm:text-8xl md:text-9xl font-display text-magenta text-glow-magenta"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.25 }}
            >
              {countdown}
            </motion.span>
            <p className="text-lavender text-sm sm:text-base uppercase tracking-widest">
              {isAudioGate ? "Audio incoming..." : "Watch closely..."}
            </p>
          </motion.div>
        )}

        {/* Flash - meme image (only for fork gates) */}
        {phase === "flash" && gate.seedImage && (
          <motion.div
            key="flash"
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          >
            <img
              src={gate.seedImage}
              alt="Meme flash"
              className="w-full h-full object-contain p-4"
              crossOrigin="anonymous"
            />
            {/* Intense glow effect during flash */}
            <motion.div
              className="absolute inset-0 bg-magenta/20 mix-blend-overlay"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 0.3, repeat: 2 }}
            />
          </motion.div>
        )}

        {/* Void - black screen */}
        {phase === "void" && (
          <motion.div
            key="void"
            className="absolute inset-0 bg-void flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-magenta"
              animate={{
                scale: [1, 2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        )}

        {/* Ready state - show replay option */}
        {phase === "ready" && (
          <motion.div
            key="ready"
            className="flex flex-col items-center gap-4 sm:gap-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-lavender font-medium text-center">
              {isAudioGate ? "Ready to listen?" : "Did you catch that?"}
            </p>

            {!isAudioGate && (
              <motion.button
                onClick={handleReplay}
                disabled={replayUsed}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 
                  font-bold text-xs sm:text-sm uppercase tracking-wider
                  transition-all duration-200
                  ${replayUsed
                    ? "bg-ink/30 border-lavender/30 text-lavender/50 cursor-not-allowed"
                    : "bg-warning/20 border-warning text-warning hover:bg-warning/30 shadow-[0_0_15px_var(--warning)]"
                  }
                `}
                whileHover={!replayUsed ? { scale: 1.05 } : {}}
                whileTap={!replayUsed ? { scale: 0.95 } : {}}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                <span>Aura Tax Replay</span>
                {replayUsed && <span className="text-xs">(used)</span>}
              </motion.button>
            )}

            {replayUsed && !isAudioGate && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs sm:text-sm text-warning font-comic"
              >
                Aura has been taxed
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanline effect during flash */}
      {phase === "flash" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute left-0 right-0 h-1 sm:h-2 bg-white/30"
            initial={{ top: "-8px" }}
            animate={{ top: "100%" }}
            transition={{ duration: 0.7, ease: "linear" }}
          />
        </div>
      )}

      {/* Corner frame */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-magenta/50" />
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-magenta/50" />
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-electric/50" />
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-electric/50" />
    </motion.div>
  );
}
