"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressPips } from "./ProgressPips";
import type { MemeGate, Era } from "@/lib/game-store";

interface ForkGateScreenProps {
  gate: MemeGate;
  gateIndex: number;
  totalGates: number;
  completedGates: number[];
  onSelect: (optionId: string, era: Era, points: number) => void;
}

export function ForkGateScreen({
  gate,
  gateIndex,
  totalGates,
  completedGates,
  onSelect,
}: ForkGateScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSlammed, setIsSlammed] = useState(false);
  const [impactPosition, setImpactPosition] = useState({ x: 0, y: 0 });

  const handleSelect = useCallback((optionId: string, era: Era, points: number, event: React.MouseEvent) => {
    if (selectedId) return;

    // Get click position for impact effect
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setImpactPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    setSelectedId(optionId);
    setIsSlammed(true);

    // Screen shake and gate slam effect
    setTimeout(() => {
      setIsSlammed(false);
      onSelect(optionId, era, points);
    }, 450);
  }, [selectedId, onSelect]);

  return (
    <motion.div
      className={`
        relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-start
        overflow-hidden bg-void px-3 sm:px-4 py-4 sm:py-6
        ${isSlammed ? "animate-slam" : ""}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--magenta) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Impact flash effect */}
      <AnimatePresence>
        {isSlammed && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Radial impact */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-acid/40 blur-xl"
              style={{
                left: impactPosition.x - 64,
                top: impactPosition.y - 64,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
            {/* Screen flash */}
            <motion.div
              className="absolute inset-0 bg-acid/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl flex-1 justify-center gap-4 sm:gap-6">
        {/* Progress pips - sticky on mobile */}
        <motion.div
          className="sticky top-2 z-20 bg-void/80 backdrop-blur-sm px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressPips
            total={totalGates}
            current={gateIndex}
            completed={completedGates}
          />
        </motion.div>

        {/* Gate frame */}
        <motion.div
          className="relative w-full"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", damping: 20 }}
        >
          {/* Animated portal frame */}
          <motion.div
            className="absolute -inset-3 sm:-inset-4 rounded-2xl sm:rounded-3xl border-2 border-magenta/30 pointer-events-none"
            animate={{
              borderColor: ["rgba(255, 43, 214, 0.3)", "rgba(255, 43, 214, 0.6)", "rgba(255, 43, 214, 0.3)"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -inset-6 sm:-inset-8 rounded-2xl sm:rounded-3xl border border-electric/20 pointer-events-none"
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Gate content */}
          <div className="relative bg-ink/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-lavender/20">
            {/* Prompt */}
            <motion.h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display text-center text-offwhite mb-4 sm:mb-6 md:mb-8 leading-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {gate.prompt}
            </motion.h2>

            {/* Options grid - 2x2 on all screens */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <AnimatePresence>
                {gate.options.map((option, i) => (
                  <motion.button
                    key={option.id}
                    onClick={(e) => handleSelect(option.id, option.era, option.points, e)}
                    disabled={selectedId !== null}
                    className={`
                      relative p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border-2 text-center
                      transition-all duration-150 min-h-[70px] sm:min-h-[80px] md:min-h-[100px]
                      flex items-center justify-center
                      ${selectedId === option.id
                        ? "bg-acid/20 border-acid shadow-[0_0_30px_var(--acid)] z-10"
                        : selectedId !== null
                          ? "bg-ink/50 border-lavender/20 opacity-40 scale-95"
                          : "bg-ink border-lavender/40 hover:border-electric hover:shadow-[0_0_20px_var(--electric)] active:scale-95"
                      }
                    `}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: selectedId === option.id ? 1.02 : selectedId !== null ? 0.95 : 1,
                    }}
                    transition={{
                      delay: 0.3 + i * 0.08,
                      scale: { duration: 0.2 },
                    }}
                    whileHover={selectedId === null ? {
                      scale: 1.03,
                      y: -3,
                      transition: { duration: 0.15 },
                    } : {}}
                    whileTap={selectedId === null ? {
                      scale: 0.97,
                      transition: { duration: 0.1 },
                    } : {}}
                  >
                    {/* Option content */}
                    {option.imageUrl && (
                      <img
                        src={option.imageUrl}
                        alt=""
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-cover rounded-lg mr-2 sm:mr-3"
                        crossOrigin="anonymous"
                      />
                    )}
                    <span className={`
                      text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight
                      ${selectedId === option.id ? "text-acid" : "text-offwhite"}
                    `}>
                      {option.text}
                    </span>

                    {/* Selection burst effect */}
                    {selectedId === option.id && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-acid"
                          initial={{ opacity: 1 }}
                          animate={{
                            opacity: [1, 0],
                            scale: [1, 1.2],
                          }}
                          transition={{ duration: 0.4 }}
                        />
                        <motion.div
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-acid flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", damping: 10 }}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-void" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Gate number indicator */}
        <motion.p
          className="text-lavender/60 text-xs sm:text-sm uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Fork Gate {gateIndex + 1}
        </motion.p>
      </div>

      {/* Corner decorations - smaller on mobile */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-magenta/50" />
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-magenta/50" />
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-electric/50" />
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-electric/50" />
    </motion.div>
  );
}
