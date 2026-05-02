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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <PortalBackground />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight glitch text-glow-magenta"
            data-text="BRAINROT"
          >
            <span className="text-offwhite">BRAINROT</span>
          </h1>
          <motion.h2 
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mt-2 chromatic"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-electric">MAZE</span>
          </motion.h2>
        </motion.div>

        {/* Core question */}
        <motion.p
          className="text-xl md:text-2xl lg:text-3xl text-lavender mb-12 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          How brainrotted are you?
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={onStart}
          className="btn-primary text-xl md:text-2xl px-8 py-4 md:px-12 md:py-5 rounded-xl font-display tracking-widest"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 30px var(--magenta), 0 0 60px var(--magenta)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          ENTER MAZE
        </motion.button>

        {/* Audio toggle */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <AudioToggle enabled={audioEnabled} onToggle={onToggleAudio} />
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-4 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          {["$", "!", "?", "$"].map((char, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              style={{ color: ["var(--magenta)", "var(--acid)", "var(--electric)", "var(--warning)"][i] }}
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut" 
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        className="absolute bottom-4 left-0 right-0 text-center text-xs text-lavender/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.4 }}
      >
        Memes and sounds belong to their creators
      </motion.footer>
    </div>
  );
}
