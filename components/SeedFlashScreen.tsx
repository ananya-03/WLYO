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
  const [phase, setPhase] = useState<"ready" | "flash" | "void" | "done">("ready");

  // For audio gates, skip directly to gate
  const isAudioGate = gate.type === "audio";

  const handleFlash = useCallback(() => {
    if (isAudioGate) {
      // Audio gates skip the flash - go directly to gate
      onComplete();
      return;
    }
    setPhase("flash");
  }, [isAudioGate, onComplete]);

  const handleReplay = useCallback(() => {
    if (!replayUsed && !isAudioGate) {
      onReplay();
      setPhase("ready");
    }
  }, [replayUsed, isAudioGate, onReplay]);

  // Auto-start the flash sequence
  useEffect(() => {
    if (phase === "ready") {
      const timer = setTimeout(handleFlash, 800);
      return () => clearTimeout(timer);
    } else if (phase === "flash") {
      const duration = gate.seedDuration || 700;
      const timer = setTimeout(() => setPhase("void"), duration);
      return () => clearTimeout(timer);
    } else if (phase === "void") {
      const timer = setTimeout(() => setPhase("done"), 300);
      return () => clearTimeout(timer);
    } else if (phase === "done") {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, gate.seedDuration, onComplete, handleFlash]);

  return (
    <motion.div
      className="relative min-h-screen min-h-[100dvh] flex items-center justify-center overflow-hidden bg-void"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {/* Ready - building anticipation */}
        {phase === "ready" && (
          <motion.div
            key="ready"
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-magenta flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                borderColor: ["var(--magenta)", "var(--acid)", "var(--magenta)"],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-magenta"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.div>
            <p className="text-lavender text-sm uppercase tracking-widest">
              Watch closely...
            </p>
          </motion.div>
        )}

        {/* Flash - show the meme */}
        {phase === "flash" && gate.seedImage && (
          <motion.div
            key="flash"
            className="absolute inset-0 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            <img
              src={gate.seedImage}
              alt="Remember this!"
              className="max-w-full max-h-full object-contain rounded-lg"
              crossOrigin="anonymous"
            />
            {/* Scanline sweep */}
            <motion.div
              className="absolute left-0 right-0 h-2 bg-white/20"
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              transition={{ duration: gate.seedDuration ? gate.seedDuration / 1000 : 0.7, ease: "linear" }}
            />
            {/* Pulse overlay */}
            <motion.div
              className="absolute inset-0 bg-magenta/10"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.3, repeat: 2 }}
            />
          </motion.div>
        )}

        {/* Void - hard cut to black */}
        {phase === "void" && (
          <motion.div
            key="void"
            className="absolute inset-0 bg-void flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-magenta"
              animate={{
                scale: [1, 3, 0],
                opacity: [1, 0.5, 0],
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}

        {/* Done - show replay option */}
        {phase === "done" && (
          <motion.div
            key="done"
            className="flex flex-col items-center gap-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.p
              className="text-2xl sm:text-3xl text-offwhite font-display"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Did you catch that?
            </motion.p>

            <motion.button
              onClick={handleReplay}
              disabled={replayUsed}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-xl border-2 
                font-bold text-sm uppercase tracking-wider
                transition-all duration-200
                ${replayUsed
                  ? "bg-ink/30 border-lavender/30 text-lavender/50 cursor-not-allowed"
                  : "bg-warning/20 border-warning text-warning hover:bg-warning/30 hover:shadow-[0_0_20px_var(--warning)]"
                }
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={!replayUsed ? { scale: 1.05 } : {}}
              whileTap={!replayUsed ? { scale: 0.95 } : {}}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
              <span>Aura Tax Replay</span>
              {replayUsed && <span className="text-xs opacity-60">(used)</span>}
            </motion.button>

            {replayUsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-warning text-sm font-comic"
              >
                Aura has been taxed
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner frame */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-magenta/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-magenta/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-electric/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-electric/50" />
    </motion.div>
  );
}
