"use client";

import { motion } from "framer-motion";
import { PortalBackground } from "./PortalBackground";
import { AudioToggle } from "./AudioToggle";

interface LandingScreenProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onStart: () => void;
}

export function LandingScreen({ audioEnabled, onToggleAudio, onStart }: LandingScreenProps) {
  return (
    <motion.div
      className="relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-between px-4 py-8 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
    >
      <PortalBackground />

      {/* Top spacer to keep content vertically centered with justify-between */}
      <div aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 sm:mb-8"
        >
          <h1
            className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight glitch text-glow-magenta"
            data-text="WLYO"
          >
            <span className="text-offwhite">WLYO</span>
          </h1>
          <motion.h2
            className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mt-2 chromatic"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-electric">Who Let You Online?</span>
          </motion.h2>
        </motion.div>

        {/* Core question */}
        <motion.p
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-lavender mb-8 sm:mb-12 font-medium max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Navigate the maze. Open the gates. Discover your era.
        </motion.p>

        {/* Instructions */}
        <motion.div
          className="text-sm text-lavender/60 mb-6 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <span className="hidden md:block">Use WASD or Arrow Keys to move</span>
          <span className="md:hidden">Use the D-Pad or swipe to move</span>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={onStart}
          className="btn-primary text-lg sm:text-xl md:text-2xl px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-xl font-display tracking-widest"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px var(--magenta), 0 0 60px var(--magenta)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          ENTER THE MAZE
        </motion.button>

        {/* Audio toggle */}
        <motion.div
          className="mt-6 sm:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <AudioToggle enabled={audioEnabled} onToggle={onToggleAudio} />
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-16 sm:-bottom-20 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          {["$", "!", "?", "$"].map((char, i) => (
            <motion.span
              key={i}
              className="text-xl sm:text-2xl"
              style={{ color: ["var(--magenta)", "var(--acid)", "var(--electric)", "var(--warning)"][i] }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-8 sm:mt-10 text-center text-[10px] sm:text-xs text-lavender/50 px-4 pb-3 sm:pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.4 }}
      >
        Memes and sounds belong to their creators
      </motion.footer>
    </motion.div>
  );
}
