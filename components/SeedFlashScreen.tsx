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

  const handleReplay = useCallback(() => {
    if (!replayUsed) {
      onReplay();
      setPhase("countdown");
      setCountdown(3);
    }
  }, [replayUsed, onReplay]);

  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 300);
      return () => clearTimeout(timer);
    } else if (phase === "countdown" && countdown === 0) {
      setPhase("flash");
    } else if (phase === "flash") {
      const timer = setTimeout(() => setPhase("void"), 700);
      return () => clearTimeout(timer);
    } else if (phase === "void") {
      const timer = setTimeout(() => setPhase("ready"), 300);
      return () => clearTimeout(timer);
    } else if (phase === "ready") {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, countdown, onComplete]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void">
      <AnimatePresence mode="wait">
        {/* Countdown */}
        {phase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-8xl md:text-9xl font-display text-magenta text-glow-magenta"
          >
            {countdown}
          </motion.div>
        )}

        {/* Flash - meme image */}
        {phase === "flash" && gate.seedImage && (
          <motion.div
            key="flash"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0"
          >
            <img
              src={gate.seedImage}
              alt="Meme flash"
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
            />
            {/* Intense glow effect during flash */}
            <div className="absolute inset-0 bg-magenta/10 mix-blend-overlay" />
          </motion.div>
        )}

        {/* Void - black screen */}
        {phase === "void" && (
          <motion.div
            key="void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void"
          />
        )}

        {/* Ready state - show replay option */}
        {phase === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-2xl md:text-3xl text-lavender font-medium">
              Did you catch that?
            </p>
            
            <motion.button
              onClick={handleReplay}
              disabled={replayUsed}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-bold text-sm uppercase tracking-wider
                transition-all duration-200
                ${replayUsed 
                  ? "bg-ink/30 border-lavender/30 text-lavender/50 cursor-not-allowed" 
                  : "bg-warning/20 border-warning text-warning hover:bg-warning/30 shadow-[0_0_15px_var(--warning)]"
                }
              `}
              whileHover={!replayUsed ? { scale: 1.05 } : {}}
              whileTap={!replayUsed ? { scale: 0.95 } : {}}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              <span>Aura Tax Replay</span>
              {replayUsed && <span className="text-xs">(used)</span>}
            </motion.button>

            {replayUsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-warning font-comic"
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
            className="absolute left-0 right-0 h-1 bg-white/20"
            initial={{ top: "-4px" }}
            animate={{ top: "100%" }}
            transition={{ duration: 0.7, ease: "linear" }}
          />
        </div>
      )}
    </div>
  );
}
