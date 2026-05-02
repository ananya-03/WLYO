"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { memeGates, type MemeGate, type Era } from "@/lib/game-store";

// Maze tile types
type TileType = "floor" | "wall" | "gate" | "start" | "exit" | "path";

interface Position {
  x: number;
  y: number;
}

interface Gate {
  position: Position;
  gateData: MemeGate;
  isOpen: boolean;
}

// Define a maze layout - 15x11 grid
// W = wall, F = floor, G = gate, S = start, E = exit, P = main path
const MAZE_LAYOUT: string[] = [
  "WWWWWWWWWWWWWWW",
  "WSPPPPGPPPPPPWW",
  "WWWWWWPWWWWWPWW",
  "WWWFPPPPPPWWPWW",
  "WWWPWWWWGWWWPWW",
  "WGPPPPPPPPPPPPW",
  "WWWPWWWWWWWWWPW",
  "WWWPPPGPPPPPPPW",
  "WWWWWWPWWWWWWGW",
  "WPPPPPPPPPPPPEW",
  "WWWWWWWWWWWWWWW",
];

const TILE_SIZE = 40;
const PLAYER_SIZE = 28;

// Gate positions (manually placed at G locations)
const GATE_POSITIONS: Position[] = [
  { x: 6, y: 1 },   // Gate 1
  { x: 8, y: 4 },   // Gate 2
  { x: 1, y: 5 },   // Gate 3
  { x: 6, y: 7 },   // Gate 4
  { x: 13, y: 8 },  // Gate 5
];

interface MazeGameProps {
  onComplete: (answers: { gateId: number; optionId: string; era: Era; isCorrect: boolean }[]) => void;
  audioEnabled: boolean;
}

export function MazeGame({ onComplete, audioEnabled }: MazeGameProps) {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [direction, setDirection] = useState<"down" | "up" | "left" | "right">("down");
  const [isMoving, setIsMoving] = useState(false);
  const [gates, setGates] = useState<Gate[]>(() => 
    GATE_POSITIONS.slice(0, Math.min(5, memeGates.length)).map((pos, i) => ({
      position: pos,
      gateData: memeGates[i],
      isOpen: false,
    }))
  );
  const [activeGate, setActiveGate] = useState<Gate | null>(null);
  const [showMemeFlash, setShowMemeFlash] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answers, setAnswers] = useState<{ gateId: number; optionId: string; era: Era; isCorrect: boolean }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Touch controls state
  const touchStartRef = useRef<Position | null>(null);

  // Parse maze layout into grid
  const maze: TileType[][] = MAZE_LAYOUT.map(row => 
    row.split("").map(char => {
      switch (char) {
        case "W": return "wall";
        case "F": return "floor";
        case "G": return "gate";
        case "S": return "start";
        case "E": return "exit";
        case "P": return "path";
        default: return "floor";
      }
    })
  );

  // Check if position is walkable
  const canMoveTo = useCallback((x: number, y: number): boolean => {
    if (x < 0 || y < 0 || y >= maze.length || x >= maze[0].length) return false;
    const tile = maze[y][x];
    if (tile === "wall") return false;
    
    // Check if there's a closed gate
    const gateAtPos = gates.find(g => g.position.x === x && g.position.y === y);
    if (gateAtPos && !gateAtPos.isOpen) return false;
    
    return true;
  }, [maze, gates]);

  // Move player
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (activeGate || gameCompleted) return;
    
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    // Set direction
    if (dx > 0) setDirection("right");
    else if (dx < 0) setDirection("left");
    else if (dy > 0) setDirection("down");
    else if (dy < 0) setDirection("up");
    
    // Check for gate interaction
    const gateAtNewPos = gates.find(g => g.position.x === newX && g.position.y === newY && !g.isOpen);
    if (gateAtNewPos) {
      setActiveGate(gateAtNewPos);
      if (gateAtNewPos.gateData.type === "image") {
        setShowMemeFlash(true);
        setTimeout(() => {
          setShowMemeFlash(false);
          setShowQuestion(true);
        }, 700);
      } else {
        setShowQuestion(true);
      }
      return;
    }
    
    // Check for exit
    if (maze[newY]?.[newX] === "exit") {
      const allGatesOpen = gates.every(g => g.isOpen);
      if (allGatesOpen) {
        setGameCompleted(true);
        setTimeout(() => onComplete(answers), 500);
        return;
      }
    }
    
    if (canMoveTo(newX, newY)) {
      setIsMoving(true);
      setPlayerPos({ x: newX, y: newY });
      setTimeout(() => setIsMoving(false), 150);
    }
  }, [playerPos, activeGate, gates, maze, canMoveTo, gameCompleted, answers, onComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    
    const minSwipe = 30;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) {
        movePlayer(dx > 0 ? 1 : -1, 0);
      }
    } else {
      if (Math.abs(dy) > minSwipe) {
        movePlayer(0, dy > 0 ? 1 : -1);
      }
    }
    
    touchStartRef.current = null;
  };

  // Handle answer selection
  const handleAnswer = (optionId: string, era: Era, isCorrect: boolean) => {
    if (!activeGate || selectedOption) return;
    
    setSelectedOption(optionId);
    
    const newAnswer = {
      gateId: activeGate.gateData.id,
      optionId,
      era,
      isCorrect,
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Open gate after delay
    setTimeout(() => {
      setGates(prev => prev.map(g => 
        g.gateData.id === activeGate.gateData.id ? { ...g, isOpen: true } : g
      ));
      setActiveGate(null);
      setShowQuestion(false);
      setSelectedOption(null);
      
      // Move player to gate position
      setPlayerPos(activeGate.position);
    }, 800);
  };

  // Calculate camera offset to center on player
  const mazeWidth = maze[0].length * TILE_SIZE;
  const mazeHeight = maze.length * TILE_SIZE;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-void overflow-hidden touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <div className="flex gap-2">
          {gates.map((gate, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-sm border-2 transition-all ${
                gate.isOpen
                  ? "bg-acid border-acid glow-acid"
                  : "bg-ink border-lavender/50"
              }`}
            />
          ))}
        </div>
        <div className="text-lavender text-sm font-mono">
          GATES: {gates.filter(g => g.isOpen).length}/{gates.length}
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 z-20 text-lavender/50 text-xs font-mono hidden md:block">
        WASD / Arrow Keys to move
      </div>
      <div className="absolute bottom-4 left-4 z-20 text-lavender/50 text-xs font-mono md:hidden">
        Swipe to move
      </div>

      {/* Maze container with camera */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          className="relative"
          style={{
            width: mazeWidth,
            height: mazeHeight,
            transformStyle: "preserve-3d",
          }}
          animate={{
            x: -(playerPos.x * TILE_SIZE - window.innerWidth / 2 + TILE_SIZE / 2),
            y: -(playerPos.y * TILE_SIZE - window.innerHeight / 2 + TILE_SIZE / 2),
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {/* Render maze tiles */}
          {maze.map((row, y) =>
            row.map((tile, x) => {
              const isGate = gates.find(g => g.position.x === x && g.position.y === y);
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`absolute transition-colors ${
                    tile === "wall"
                      ? "bg-ink border border-lavender/20"
                      : tile === "exit"
                      ? "bg-gradient-to-br from-acid/30 to-electric/30 border-2 border-acid"
                      : "bg-void/50 border border-ink"
                  }`}
                  style={{
                    left: x * TILE_SIZE,
                    top: y * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                  }}
                >
                  {/* Gate indicator */}
                  {isGate && !isGate.isOpen && (
                    <div className="absolute inset-1 flex items-center justify-center">
                      <div className={`w-6 h-6 rounded-sm ${
                        isGate.gateData.type === "audio" 
                          ? "bg-electric/80 animate-pulse" 
                          : "bg-magenta/80 animate-pulse"
                      }`}>
                        {isGate.gateData.type === "audio" ? (
                          <svg className="w-full h-full p-1 text-void" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                          </svg>
                        ) : (
                          <svg className="w-full h-full p-1 text-void" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Exit marker */}
                  {tile === "exit" && (
                    <div className="absolute inset-0 flex items-center justify-center text-acid font-display text-xs">
                      EXIT
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Player character */}
          <motion.div
            className="absolute z-10"
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              left: playerPos.x * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
              top: playerPos.y * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
            }}
            animate={{
              scale: isMoving ? 0.9 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            {/* Pixel character */}
            <div className="relative w-full h-full">
              {/* Body */}
              <div 
                className="absolute inset-0 rounded-md bg-magenta"
                style={{
                  boxShadow: "0 0 10px var(--magenta), 0 0 20px var(--magenta)",
                }}
              />
              {/* Eyes */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-void rounded-full" />
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-void rounded-full" />
              {/* Direction indicator */}
              <div 
                className={`absolute w-2 h-2 bg-offwhite rounded-full transition-all ${
                  direction === "up" ? "top-0 left-1/2 -translate-x-1/2" :
                  direction === "down" ? "bottom-0 left-1/2 -translate-x-1/2" :
                  direction === "left" ? "left-0 top-1/2 -translate-y-1/2" :
                  "right-0 top-1/2 -translate-y-1/2"
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Gate interaction overlay */}
      <AnimatePresence>
        {activeGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-void/90 backdrop-blur-sm"
          >
            {/* Meme flash for image gates */}
            {showMemeFlash && activeGate.gateData.seedImage && (
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <img
                  src={activeGate.gateData.seedImage}
                  alt="Meme"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  crossOrigin="anonymous"
                />
              </motion.div>
            )}

            {/* Question UI */}
            {showQuestion && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-lg mx-4 p-6 bg-ink rounded-xl border-2 border-lavender/30"
              >
                {/* Audio player for audio gates */}
                {activeGate.gateData.type === "audio" && (
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        // Play audio (would need actual audio file)
                        const utterance = new SpeechSynthesisUtterance(
                          activeGate.gateData.audioFallbackText || "Audio clip"
                        );
                        speechSynthesis.speak(utterance);
                      }}
                      className="w-full py-4 bg-electric/20 border-2 border-electric rounded-lg text-electric font-bold hover:bg-electric/30 transition-colors flex items-center justify-center gap-3"
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      TAP TO PLAY AUDIO
                    </button>
                    <p className="text-center text-lavender/60 text-sm mt-2">
                      {activeGate.gateData.audioFallbackText}
                    </p>
                  </div>
                )}

                <h3 className="text-xl md:text-2xl font-display text-offwhite mb-6 text-center">
                  {activeGate.gateData.prompt}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {activeGate.gateData.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id, option.era, option.isCorrect || false)}
                      disabled={!!selectedOption}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedOption === option.id
                          ? option.isCorrect
                            ? "bg-acid/30 border-acid text-acid"
                            : "bg-warning/30 border-warning text-warning"
                          : selectedOption
                          ? "bg-ink/50 border-lavender/20 text-lavender/50"
                          : "bg-ink border-lavender/40 text-offwhite hover:border-magenta hover:bg-magenta/10"
                      }`}
                    >
                      <span className="font-bold text-sm md:text-base">{option.text}</span>
                    </button>
                  ))}
                </div>

                {selectedOption && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-4 text-lavender"
                  >
                    {activeGate.gateData.options.find(o => o.id === selectedOption)?.isCorrect
                      ? "Gate opening..."
                      : "Wrong path, but you continue..."}
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game completed overlay */}
      <AnimatePresence>
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-void"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h2 className="font-display text-4xl md:text-6xl text-acid text-glow-acid mb-4">
                MAZE COMPLETE
              </h2>
              <p className="text-lavender text-xl">Analyzing your timeline...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* D-pad for mobile */}
      <div className="absolute bottom-20 right-4 z-20 md:hidden">
        <div className="grid grid-cols-3 gap-1 w-32 h-32">
          <div />
          <button
            onTouchStart={() => movePlayer(0, -1)}
            className="bg-ink/80 border border-lavender/30 rounded-lg active:bg-magenta/50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div />
          <button
            onTouchStart={() => movePlayer(-1, 0)}
            className="bg-ink/80 border border-lavender/30 rounded-lg active:bg-magenta/50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="bg-ink/40 border border-lavender/20 rounded-lg" />
          <button
            onTouchStart={() => movePlayer(1, 0)}
            className="bg-ink/80 border border-lavender/30 rounded-lg active:bg-magenta/50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div />
          <button
            onTouchStart={() => movePlayer(0, 1)}
            className="bg-ink/80 border border-lavender/30 rounded-lg active:bg-magenta/50 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div />
        </div>
      </div>
    </div>
  );
}
