"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressPips } from "./ProgressPips";
import type { MemeGate, Era } from "@/lib/game-store";

interface ForkGateScreenProps {
  gate: MemeGate;
  gateIndex: number;
  totalGates: number;
  completedGates: number[];
  onSelect: (optionId: string, era: Era) => void;
}

export function ForkGateScreen({ 
  gate, 
  gateIndex, 
  totalGates, 
  completedGates,
  onSelect 
}: ForkGateScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSelect = (optionId: string, era: Era) => {
    if (selectedId) return;
    
    setSelectedId(optionId);
    setIsShaking(true);
    
    setTimeout(() => {
      setIsShaking(false);
      onSelect(optionId, era);
    }, 400);
  };

  return (
    <motion.div 
      className={`
        relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-void px-4 py-8
        ${isShaking ? "animate-shake" : ""}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, var(--magenta) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl gap-8">
        {/* Progress */}
        <motion.div
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Portal frame decoration */}
          <div className="absolute -inset-4 rounded-3xl border-2 border-magenta/30 pointer-events-none" />
          <div className="absolute -inset-8 rounded-3xl border border-electric/20 pointer-events-none" />

          {/* Gate content */}
          <div className="relative bg-ink/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-lavender/20">
            {/* Prompt */}
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-display text-center text-offwhite mb-8 text-glow-electric"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {gate.prompt}
            </motion.h2>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {gate.options.map((option, i) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(option.id, option.era)}
                    disabled={selectedId !== null}
                    className={`
                      relative p-6 rounded-xl border-2 text-left transition-all duration-200
                      min-h-[80px] flex items-center justify-center
                      ${selectedId === option.id 
                        ? "bg-acid/20 border-acid shadow-[0_0_30px_var(--acid)]" 
                        : selectedId !== null
                          ? "bg-ink/50 border-lavender/20 opacity-50"
                          : "bg-ink border-lavender/40 hover:border-electric hover:shadow-[0_0_20px_var(--electric)]"
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: selectedId === option.id ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ 
                      delay: 0.4 + i * 0.1,
                      scale: { duration: 0.3 }
                    }}
                    whileHover={selectedId === null ? { 
                      scale: 1.02, 
                      y: -4,
                    } : {}}
                    whileTap={selectedId === null ? { scale: 0.98 } : {}}
                  >
                    {option.imageUrl && (
                      <img 
                        src={option.imageUrl} 
                        alt="" 
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                        crossOrigin="anonymous"
                      />
                    )}
                    <span className={`
                      text-lg md:text-xl font-bold
                      ${selectedId === option.id ? "text-acid" : "text-offwhite"}
                    `}>
                      {option.text}
                    </span>

                    {/* Selection indicator */}
                    {selectedId === option.id && (
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-acid flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <svg className="w-4 h-4 text-void" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Gate number indicator */}
        <motion.p
          className="text-lavender/60 text-sm uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Gate {gateIndex + 1}
        </motion.p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-magenta/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-magenta/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-electric/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-electric/50" />
    </motion.div>
  );
}
