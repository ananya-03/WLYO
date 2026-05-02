"use client";

import { useEffect } from "react";
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
  onTransitionComplete 
}: MazeHubScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onTransitionComplete, 800);
    return () => clearTimeout(timer);
  }, [onTransitionComplete]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-void px-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(var(--electric) 1px, transparent 1px),
            linear-gradient(90deg, var(--electric) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          perspective: "500px",
          transform: "rotateX(60deg)",
        }}
      />

      {/* Portal nodes visualization */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Node graph */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full">
            {[...Array(totalGates)].map((_, i) => {
              const angle = (i / totalGates) * Math.PI * 2 - Math.PI / 2;
              const nextAngle = ((i + 1) / totalGates) * Math.PI * 2 - Math.PI / 2;
              const radius = 120;
              const x1 = 50 + Math.cos(angle) * (radius / 2);
              const y1 = 50 + Math.sin(angle) * (radius / 2);
              const x2 = 50 + Math.cos(nextAngle) * (radius / 2);
              const y2 = 50 + Math.sin(nextAngle) * (radius / 2);

              return (
                <motion.line
                  key={`line-${i}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={completedGates.includes(i) ? "var(--acid)" : "var(--lavender)"}
                  strokeWidth="2"
                  strokeOpacity={completedGates.includes(i) ? 0.8 : 0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              );
            })}
          </svg>

          {/* Portal nodes */}
          {[...Array(totalGates)].map((_, i) => {
            const angle = (i / totalGates) * Math.PI * 2 - Math.PI / 2;
            const radius = 40;
            const x = 50 + Math.cos(angle) * radius;
            const y = 50 + Math.sin(angle) * radius;
            const isCompleted = completedGates.includes(i);
            const isCurrent = i === currentGate;
            const isNext = i === currentGate + 1;

            return (
              <motion.div
                key={`node-${i}`}
                className={`
                  absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isCompleted 
                    ? "bg-acid/30 border-acid shadow-[0_0_20px_var(--acid)]" 
                    : isCurrent 
                      ? "bg-magenta/30 border-magenta shadow-[0_0_25px_var(--magenta)]"
                      : isNext
                        ? "bg-electric/20 border-electric/50"
                        : "bg-ink border-lavender/30"
                  }
                `}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isCurrent ? [1, 1.2, 1] : 1, 
                  opacity: 1,
                }}
                transition={{
                  scale: {
                    duration: 1,
                    repeat: isCurrent ? Infinity : 0,
                    ease: "easeInOut",
                  },
                  opacity: { delay: i * 0.1 },
                }}
              >
                <span className={`
                  text-sm font-bold
                  ${isCompleted ? "text-acid" : isCurrent ? "text-magenta" : "text-lavender/50"}
                `}>
                  {i + 1}
                </span>
              </motion.div>
            );
          })}

          {/* Center portal */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full portal-ring opacity-60" />
          </motion.div>
        </div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProgressPips 
            total={totalGates} 
            current={currentGate} 
            completed={completedGates} 
          />
        </motion.div>

        {/* Gate counter */}
        <motion.p
          className="text-lavender text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Gate {currentGate + 1} of {totalGates}
        </motion.p>

        {/* Warping text */}
        <motion.p
          className="text-electric text-sm uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1] }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Warping to next gate...
        </motion.p>
      </div>
    </div>
  );
}
