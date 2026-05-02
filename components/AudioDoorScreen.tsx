"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressPips } from "./ProgressPips";
import type { MemeGate, Era } from "@/lib/game-store";

interface AudioDoorScreenProps {
  gate: MemeGate;
  gateIndex: number;
  totalGates: number;
  completedGates: number[];
  onSelect: (optionId: string, era: Era, points: number) => void;
}

export function AudioDoorScreen({
  gate,
  gateIndex,
  totalGates,
  completedGates,
  onSelect,
}: AudioDoorScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSlammed, setIsSlammed] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(20).fill(0.2));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Simulate waveform animation
  const animateWaveform = useCallback(() => {
    if (isPlaying) {
      setWaveformBars(prev => 
        prev.map(() => 0.2 + Math.random() * 0.8)
      );
      animationRef.current = requestAnimationFrame(animateWaveform);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animateWaveform);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animateWaveform]);

  const handlePlayAudio = useCallback(() => {
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        setAudioError(true);
      });
      setIsPlaying(true);
      setHasPlayed(true);
    } else {
      // Fallback - just show we tried
      setHasPlayed(true);
      setAudioError(true);
    }
  }, [audioError]);

  const handleAudioEnd = useCallback(() => {
    setIsPlaying(false);
    setWaveformBars(Array(20).fill(0.2));
  }, []);

  const handleSelect = useCallback((optionId: string, era: Era, points: number) => {
    if (selectedId) return;
    
    setSelectedId(optionId);
    setIsSlammed(true);
    
    // Door slam effect then transition
    setTimeout(() => {
      setIsSlammed(false);
      onSelect(optionId, era, points);
    }, 500);
  }, [selectedId, onSelect]);

  // Check if audio is available
  useEffect(() => {
    if (!gate.audioUrl) {
      setAudioError(true);
    }
  }, [gate.audioUrl]);

  return (
    <motion.div
      className={`
        relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-start
        overflow-hidden bg-void px-3 sm:px-4 py-4 sm:py-6
        ${isSlammed ? "animate-slam" : ""}
      `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Hidden audio element */}
      {gate.audioUrl && !audioError && (
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
          className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--electric) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl flex-1 justify-center gap-4 sm:gap-6">
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

        {/* Audio Door Portal */}
        <motion.div
          className="relative w-full max-w-md aspect-square flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-electric/30" />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-electric"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner door/portal */}
          <motion.div
            className={`
              relative w-3/4 h-3/4 rounded-full flex flex-col items-center justify-center
              border-4 transition-colors duration-300
              ${hasPlayed && !isPlaying ? "border-acid bg-acid/10" : "border-electric bg-ink/80"}
            `}
            animate={isPlaying ? {
              boxShadow: [
                "0 0 20px var(--electric)",
                "0 0 60px var(--electric)",
                "0 0 20px var(--electric)",
              ],
            } : {}}
            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
          >
            {/* Waveform visualization */}
            <div className="flex items-end justify-center gap-1 h-16 sm:h-20 mb-4">
              {waveformBars.map((height, i) => (
                <motion.div
                  key={i}
                  className={`w-1.5 sm:w-2 rounded-full ${isPlaying ? "bg-electric" : "bg-lavender/40"}`}
                  animate={{ height: `${height * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>

            {/* Play button */}
            <motion.button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`
                w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                border-2 transition-all duration-200
                ${isPlaying 
                  ? "bg-electric/30 border-electric cursor-not-allowed" 
                  : "bg-ink border-electric hover:bg-electric/20 hover:shadow-[0_0_30px_var(--electric)]"
                }
              `}
              whileHover={!isPlaying ? { scale: 1.1 } : {}}
              whileTap={!isPlaying ? { scale: 0.95 } : {}}
            >
              {isPlaying ? (
                <div className="flex gap-1">
                  <motion.div
                    className="w-1.5 h-8 bg-electric rounded-full"
                    animate={{ scaleY: [1, 0.5, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-1.5 h-8 bg-electric rounded-full"
                    animate={{ scaleY: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                  />
                </div>
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-electric ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </motion.button>

            {/* Status text */}
            <p className="text-sm text-lavender mt-3">
              {isPlaying ? "Playing..." : hasPlayed ? "Tap to replay" : "Tap to play"}
            </p>
          </motion.div>
        </motion.div>

        {/* Prompt */}
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl font-display text-center text-offwhite px-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {audioError ? gate.audioFallbackPrompt || gate.prompt : gate.prompt}
        </motion.h2>

        {/* Signal lost indicator */}
        {audioError && (
          <motion.div
            className="flex items-center gap-2 text-warning text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span className="font-comic">Signal cooked - visual mode</span>
          </motion.div>
        )}

        {/* Options grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-2">
          <AnimatePresence>
            {gate.options.map((option, i) => (
              <motion.button
                key={option.id}
                onClick={() => handleSelect(option.id, option.era, option.points)}
                disabled={selectedId !== null}
                className={`
                  relative p-3 sm:p-4 md:p-5 rounded-xl border-2 text-center
                  transition-all duration-200 min-h-[60px] sm:min-h-[70px]
                  ${selectedId === option.id
                    ? "bg-acid/20 border-acid shadow-[0_0_30px_var(--acid)]"
                    : selectedId !== null
                      ? "bg-ink/50 border-lavender/20 opacity-50"
                      : "bg-ink border-lavender/40 hover:border-electric hover:shadow-[0_0_20px_var(--electric)] active:scale-95"
                  }
                `}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: selectedId === option.id ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  delay: 0.4 + i * 0.1,
                  scale: { duration: 0.3 },
                }}
                whileHover={selectedId === null ? { scale: 1.03, y: -2 } : {}}
                whileTap={selectedId === null ? { scale: 0.97 } : {}}
              >
                <span className={`
                  text-sm sm:text-base md:text-lg font-bold leading-tight
                  ${selectedId === option.id ? "text-acid" : "text-offwhite"}
                `}>
                  {option.text}
                </span>

                {/* Selection glow */}
                {selectedId === option.id && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-acid/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Gate indicator */}
        <motion.p
          className="text-lavender/60 text-xs sm:text-sm uppercase tracking-widest mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Audio Door {gateIndex + 1}
        </motion.p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-electric/50" />
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-electric/50" />
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-magenta/50" />
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-magenta/50" />
    </motion.div>
  );
}
