"use client";

import { motion } from "framer-motion";

interface ProgressPipsProps {
  total: number;
  current: number;
  completed: number[];
}

export function ProgressPips({ total, current, completed }: ProgressPipsProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 justify-center">
      {[...Array(total)].map((_, i) => {
        const isCompleted = completed.includes(i);
        const isCurrent = i === current;

        return (
          <motion.div
            key={i}
            className={`
              w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm border transition-all duration-300
              ${isCompleted
                ? "bg-acid border-acid shadow-[0_0_8px_var(--acid)]"
                : isCurrent
                  ? "bg-magenta border-magenta shadow-[0_0_8px_var(--magenta)]"
                  : "bg-ink border-lavender/50"
              }
            `}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: isCurrent ? [1, 1.15, 1] : 1,
              opacity: 1,
            }}
            transition={{
              scale: {
                duration: 0.8,
                repeat: isCurrent ? Infinity : 0,
                ease: "easeInOut",
              },
              opacity: { delay: i * 0.05 },
            }}
            style={{
              transform: `rotate(${(i % 3 - 1) * 5}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
