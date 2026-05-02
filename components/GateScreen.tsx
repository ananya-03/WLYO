"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressPips } from "./ProgressPips";
import type { MemeGate, Era } from "@/lib/game-store";

interface GateScreenProps {
  gate: MemeGate;
  gateIndex: number;
  totalGates: number;
  completedGates: number[];
  onSelect: (optionId: string, era: Era, isCorrect: boolean) => void;
}

export function GateScreen({
  gate,
  gateIndex,
  totalGates,
  completedGates,
  onSelect,
}: GateScreenProps) {
  const [phase, setPhase] = useState<"locked" | "unlocked" | "answered">("locked");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(16).fill(0.2));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const isAudioGate = gate.type === "audio";

  // Animate waveform when playing
  const animateWaveform = useCallback(() => {
    setWaveformBars(Array(16).fill(0).map(() => 0.15 + Math.random() * 0.85));
    animationRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateWaveform);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setWaveformBars(Array(16).fill(0.2));
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animateWaveform]);

  // Handle door unlock (tap the door to open it)
  const handleUnlockDoor = useCallback(() => {
    if (phase !== "locked") return;
    
    setDoorOpen(true);
    
    if (isAudioGate && audioRef.current && !audioError) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setAudioError(true));
      setIsPlaying(true);
    }

    // Door slams open with delay before showing options
    setTimeout(() => {
      setPhase("unlocked");
    }, 600);
  }, [phase, isAudioGate, audioError]);

  const handleAudioEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReplay = useCallback(() => {
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioError]);

  // Handle answer selection
  const handleSelect = useCallback((optionId: string, era: Era, isCorrect: boolean) => {
    if (selectedId || phase !== "unlocked") return;

    setSelectedId(optionId);
    setPhase("answered");

    // Slam effect then transition
    setTimeout(() => {
      onSelect(optionId, era, isCorrect);
    }, 600);
  }, [selectedId, phase, onSelect]);

  // Check for audio error
  useEffect(() => {
    if (isAudioGate && !gate.audioUrl) {
      setAudioError(true);
    }
  }, [isAudioGate, gate.audioUrl]);

  return (
    <motion.div
      className={`
        relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center
        overflow-hidden bg-void px-4 py-6
        ${phase === "answered" ? "animate-slam" : ""}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Hidden audio element */}
      {isAudioGate && gate.audioUrl && (
        <audio
          ref={audioRef}
          src={gate.audioUrl}
          onEnded={handleAudioEnd}
          onError={() => setAudioError(true)}
          preload="auto"
        />
      )}

      {/* Background portal glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full blur-3xl"
          style={{
            background: isAudioGate 
              ? "radial-gradient(circle, var(--electric) 0%, transparent 70%)"
              : "radial-gradient(circle, var(--magenta) 0%, transparent 70%)",
          }}
          animate={{
            opacity: doorOpen ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
            scale: doorOpen ? [1, 1.1, 1] : [1, 1.02, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Progress pips */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-void/80 backdrop-blur-sm px-4 py-2 rounded-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ProgressPips
          total={totalGates}
          current={gateIndex}
          completed={completedGates}
        />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl">
        {/* THE DOOR */}
        <AnimatePresence mode="wait">
          {phase === "locked" && (
            <motion.div
              key="door"
              className="relative w-full max-w-sm aspect-[3/4] cursor-pointer"
              onClick={handleUnlockDoor}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0, rotateY: -90 }}
              transition={{ type: "spring", damping: 20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Door frame */}
              <div className="absolute inset-0 rounded-2xl border-4 border-lavender/30 bg-ink/80 backdrop-blur overflow-hidden">
                {/* Door panels */}
                <div className="absolute inset-4 border-2 border-lavender/20 rounded-lg" />
                <div className="absolute inset-8 border border-lavender/10 rounded-md" />
                
                {/* Door handle */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <motion.div
                    className={`w-4 h-12 rounded-full ${isAudioGate ? "bg-electric" : "bg-magenta"}`}
                    animate={{
                      boxShadow: isAudioGate 
                        ? ["0 0 10px var(--electric)", "0 0 30px var(--electric)", "0 0 10px var(--electric)"]
                        : ["0 0 10px var(--magenta)", "0 0 30px var(--magenta)", "0 0 10px var(--magenta)"],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* Lock icon or play icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isAudioGate ? (
                    <>
                      {/* Speaker icon */}
                      <motion.div
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-electric flex items-center justify-center"
                        animate={{
                          borderColor: ["var(--electric)", "var(--acid)", "var(--electric)"],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-electric" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      </motion.div>
                      <p className="text-electric text-sm mt-4 font-bold uppercase tracking-widest">
                        Tap to Play
                      </p>
                    </>
                  ) : (
                    <>
                      {/* Lock icon */}
                      <motion.div
                        className="w-16 h-16 sm:w-20 sm:h-20"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <svg className="w-full h-full text-magenta" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                      </motion.div>
                      <p className="text-magenta text-sm mt-4 font-bold uppercase tracking-widest">
                        Tap to Unlock
                      </p>
                    </>
                  )}
                </div>

                {/* Pulsing border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 pointer-events-none"
                  style={{ borderColor: isAudioGate ? "var(--electric)" : "var(--magenta)" }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {/* Gate number label */}
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-void border border-lavender/30 rounded-full"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs text-lavender uppercase tracking-widest">
                  Gate {gateIndex + 1}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UNLOCKED STATE - Show prompt and options */}
        <AnimatePresence>
          {(phase === "unlocked" || phase === "answered") && (
            <motion.div
              key="content"
              className="w-full flex flex-col items-center gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Audio waveform for audio gates */}
              {isAudioGate && (
                <motion.div
                  className="flex items-center gap-4 mb-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-end justify-center gap-1 h-12">
                    {waveformBars.map((height, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 rounded-full ${isPlaying ? "bg-electric" : "bg-lavender/40"}`}
                        animate={{ height: `${height * 100}%` }}
                        transition={{ duration: 0.08 }}
                      />
                    ))}
                  </div>
                  <motion.button
                    onClick={handleReplay}
                    disabled={isPlaying}
                    className="w-12 h-12 rounded-full border-2 border-electric flex items-center justify-center hover:bg-electric/20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg className="w-5 h-5 text-electric" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                    </svg>
                  </motion.button>
                </motion.div>
              )}

              {/* Fallback indicator */}
              {isAudioGate && audioError && (
                <motion.p
                  className="text-warning text-sm font-comic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Signal cooked - visual mode
                </motion.p>
              )}

              {/* Prompt */}
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl font-display text-center text-offwhite leading-tight px-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {isAudioGate && audioError ? gate.audioFallbackText : gate.prompt}
              </motion.h2>

              {/* Options - 2x2 grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-2">
                {gate.options.map((option, i) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelect(option.id, option.era, option.isCorrect || false)}
                    disabled={selectedId !== null}
                    className={`
                      relative p-4 sm:p-5 md:p-6 rounded-xl border-2 text-center
                      transition-all duration-150 min-h-[80px] sm:min-h-[90px]
                      flex items-center justify-center
                      ${selectedId === option.id
                        ? "bg-acid/20 border-acid shadow-[0_0_40px_var(--acid)] scale-105 z-10"
                        : selectedId !== null
                          ? "bg-ink/30 border-lavender/10 opacity-30 scale-90"
                          : "bg-ink border-lavender/40 hover:border-magenta hover:shadow-[0_0_25px_var(--magenta)]"
                      }
                    `}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: selectedId === option.id ? 1.05 : selectedId !== null ? 0.9 : 1,
                    }}
                    transition={{
                      delay: 0.2 + i * 0.08,
                      scale: { duration: 0.25 },
                    }}
                    whileHover={selectedId === null ? {
                      scale: 1.03,
                      y: -3,
                    } : {}}
                    whileTap={selectedId === null ? {
                      scale: 0.95,
                    } : {}}
                  >
                    <span className={`
                      text-base sm:text-lg md:text-xl font-bold leading-tight
                      ${selectedId === option.id ? "text-acid" : "text-offwhite"}
                    `}>
                      {option.text}
                    </span>

                    {/* Selection burst */}
                    {selectedId === option.id && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-acid/20 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0] }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Gate type indicator */}
              <motion.p
                className="text-lavender/50 text-xs uppercase tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {isAudioGate ? "Audio Door" : "Fork Gate"} {gateIndex + 1}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Impact flash on selection */}
      <AnimatePresence>
        {phase === "answered" && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-acid/15"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-magenta/50" />
      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-magenta/50" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-electric/50" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-electric/50" />
    </motion.div>
  );
}
