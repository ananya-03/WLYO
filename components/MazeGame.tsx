"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Era, GeneratedGate, GeneratedRun, Position, SelectedAnswer, TextAnswerOption } from "@/lib/game-store";

type TileType = "floor" | "wall" | "gate" | "start" | "exit" | "path";

interface Gate {
  position: Position;
  gateData: GeneratedGate;
  isOpen: boolean;
}

interface MazeGameProps {
  run: GeneratedRun;
  onComplete: (answers: SelectedAnswer[]) => void;
  onRestart: () => void;
  audioEnabled: boolean;
}

const TILE_SIZE = 40;
const PLAYER_SIZE = 28;
const JUDGMENT_SOUND = "/audio/windows_xp_error.mp3";
const JUDGMENT_MEME = "/memes/trollface.webp";

function buildGateInstances(run: GeneratedRun): Gate[] {
  return run.maze.gatePositions.map((pos, index) => ({
    position: pos,
    gateData: run.gates[index],
    isOpen: false,
  }));
}

function parseMaze(layout: string[]): TileType[][] {
  return layout.map((row) =>
    row.split("").map((char) => {
      switch (char) {
        case "W": return "wall";
        case "G": return "gate";
        case "S": return "start";
        case "E": return "exit";
        case "P": return "path";
        default: return "floor";
      }
    })
  );
}

function answerPayload(gate: GeneratedGate, option: TextAnswerOption): SelectedAnswer {
  return {
    gateId: gate.id,
    optionId: option.id,
    era: option.era as Era,
    isCorrect: Boolean(option.isCorrect),
    eraPull: option.eraPull,
    axisDeltas: option.axisDeltas,
  };
}

export function MazeGame({ run, onComplete, onRestart, audioEnabled }: MazeGameProps) {
  const maze = useMemo(() => parseMaze(run.maze.layout), [run.maze.layout]);
  const [playerPos, setPlayerPos] = useState<Position>(run.maze.start);
  const [direction, setDirection] = useState<"down" | "up" | "left" | "right">("down");
  const [isMoving, setIsMoving] = useState(false);
  const [gates, setGates] = useState<Gate[]>(() => buildGateInstances(run));
  const [activeGate, setActiveGate] = useState<Gate | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answers, setAnswers] = useState<SelectedAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [judgment, setJudgment] = useState<string | null>(null);
  const [restartRequired, setRestartRequired] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartRef = useRef<Position | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayerPos(run.maze.start);
    setDirection("down");
    setIsMoving(false);
    setGates(buildGateInstances(run));
    setActiveGate(null);
    setShowStimulus(false);
    setShowQuestion(false);
    setAnswers([]);
    setSelectedOption(null);
    setGameCompleted(false);
    setAudioUnavailable(false);
    setStrikes(0);
    setJudgment(null);
    setRestartRequired(false);
  }, [run]);

  const playClip = useCallback(async (clipUrl?: string, options: { affectsGateAudio?: boolean } = {}): Promise<boolean> => {
    const affectsGateAudio = options.affectsGateAudio ?? true;

    if (!clipUrl) {
      if (affectsGateAudio) setAudioUnavailable(true);
      return false;
    }

    try {
      audioRef.current?.pause();
      const clip = new Audio(clipUrl);
      audioRef.current = clip;
      clip.volume = audioEnabled ? 0.9 : 0;
      await clip.play();
      if (affectsGateAudio) setAudioUnavailable(false);
      return true;
    } catch {
      if (affectsGateAudio) setAudioUnavailable(true);
      return false;
    }
  }, [audioEnabled]);

  const canMoveTo = useCallback((x: number, y: number): boolean => {
    if (x < 0 || y < 0 || y >= maze.length || x >= maze[0].length) return false;
    const tile = maze[y][x];
    if (tile === "wall") return false;

    const gateAtPos = gates.find((gate) => gate.position.x === x && gate.position.y === y);
    if (gateAtPos && !gateAtPos.isOpen) return false;

    return true;
  }, [maze, gates]);

  const openGate = useCallback((gate: Gate) => {
    setGates((prev) => prev.map((item) =>
      item.gateData.id === gate.gateData.id ? { ...item, isOpen: true } : item
    ));
    setActiveGate(null);
    setShowQuestion(false);
    setShowStimulus(false);
    setSelectedOption(null);
    setJudgment(null);
    setAudioUnavailable(false);
    setPlayerPos(gate.position);
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (activeGate || gameCompleted || restartRequired) return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (dx > 0) setDirection("right");
    else if (dx < 0) setDirection("left");
    else if (dy > 0) setDirection("down");
    else if (dy < 0) setDirection("up");

    const gateAtNewPos = gates.find((gate) => gate.position.x === newX && gate.position.y === newY && !gate.isOpen);
    if (gateAtNewPos) {
      setActiveGate(gateAtNewPos);
      setAudioUnavailable(false);
      setJudgment(null);
      if (gateAtNewPos.gateData.type === "image") {
        setShowStimulus(true);
        setTimeout(() => {
          setShowStimulus(false);
          setShowQuestion(true);
        }, 700);
      } else {
        setShowQuestion(true);
      }
      return;
    }

    if (maze[newY]?.[newX] === "exit") {
      if (gates.every((gate) => gate.isOpen)) {
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
  }, [activeGate, answers, canMoveTo, gameCompleted, gates, maze, onComplete, playerPos, restartRequired]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault();
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) movePlayer(dx > 0 ? 1 : -1, 0);
    } else if (Math.abs(dy) > minSwipe) {
      movePlayer(0, dy > 0 ? 1 : -1);
    }

    touchStartRef.current = null;
  };

  const handleAnswer = (option: TextAnswerOption) => {
    if (!activeGate || selectedOption) return;

    setSelectedOption(option.id);
    setAnswers((prev) => [...prev, answerPayload(activeGate.gateData, option)]);

    if (option.isCorrect) {
      setJudgment("memory accepted");
      setTimeout(() => openGate(activeGate), 650);
      return;
    }

    const nextStrikes = strikes + 1;
    setStrikes(nextStrikes);
    setJudgment(nextStrikes >= 3 ? "three strikes. the maze has judged you" : "wrong timeline. judgment issued");
    void playClip(JUDGMENT_SOUND, { affectsGateAudio: false });

    if (nextStrikes >= 3) {
      setTimeout(() => setRestartRequired(true), 900);
    } else {
      setTimeout(() => openGate(activeGate), 900);
    }
  };

  const mazeWidth = maze[0].length * TILE_SIZE;
  const mazeHeight = maze.length * TILE_SIZE;
  const playerCenterX = playerPos.x * TILE_SIZE + TILE_SIZE / 2;
  const playerCenterY = playerPos.y * TILE_SIZE + TILE_SIZE / 2;
  const cameraX = mazeWidth / 2 - playerCenterX;
  const cameraY = mazeHeight / 2 - playerCenterY;

  const activeStimulus = activeGate?.gateData.stimulus;
  const fallbackStimulus = activeGate?.gateData.fallbackStimulus;
  const flashImage = activeStimulus?.kind === "image" ? activeStimulus.imageUrl : null;
  const fallbackImage = audioUnavailable && fallbackStimulus?.kind === "image" ? fallbackStimulus.imageUrl : null;

  return (
    <div
      className="fixed inset-0 touch-none select-none overflow-hidden bg-void"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex gap-2">
            {gates.map((gate) => (
              <div
                key={gate.gateData.id}
                className={`h-4 w-4 rounded-sm border-2 transition-all ${
                  gate.isOpen ? "bg-acid border-acid glow-acid" : "bg-ink border-lavender/50"
                }`}
              />
            ))}
          </div>
          <div className="font-mono text-xs text-warning">STRIKES {strikes}/3</div>
        </div>
        <div className="text-right font-mono text-sm text-lavender">
          GATES {gates.filter((gate) => gate.isOpen).length}/{gates.length}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20 hidden font-mono text-xs text-lavender/50 md:block">
        WASD / Arrow Keys to move
      </div>
      <div className="absolute bottom-4 left-4 z-20 font-mono text-xs text-lavender/50 md:hidden">
        Swipe to move
      </div>

      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1000px" }}>
        <motion.div
          className="relative"
          style={{ width: mazeWidth, height: mazeHeight, transformStyle: "preserve-3d" }}
          animate={{ x: cameraX, y: cameraY }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {maze.map((row, y) =>
            row.map((tile, x) => {
              const isGate = gates.find((gate) => gate.position.x === x && gate.position.y === y);
              return (
                <div
                  key={`${x}-${y}`}
                  className={`absolute transition-colors ${
                    tile === "wall"
                      ? "border border-lavender/20 bg-ink"
                      : tile === "exit"
                        ? "border-2 border-acid bg-gradient-to-br from-acid/30 to-electric/30"
                        : "border border-ink bg-void/50"
                  }`}
                  style={{ left: x * TILE_SIZE, top: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }}
                >
                  {isGate && !isGate.isOpen && (
                    <div className="absolute inset-1 flex items-center justify-center">
                      <div className={`h-6 w-6 animate-pulse rounded-sm ${isGate.gateData.type === "audio" ? "bg-electric/80" : "bg-magenta/80"}`}>
                        {isGate.gateData.type === "audio" ? (
                          <svg className="h-full w-full p-1 text-void" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                          </svg>
                        ) : (
                          <svg className="h-full w-full p-1 text-void" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  {tile === "exit" && (
                    <div className="absolute inset-0 flex items-center justify-center font-display text-xs text-acid">
                      EXIT
                    </div>
                  )}
                </div>
              );
            })
          )}

          <motion.div
            className="absolute z-10"
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              left: playerPos.x * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
              top: playerPos.y * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2,
            }}
            animate={{ scale: isMoving ? 0.9 : 1 }}
            transition={{ duration: 0.1 }}
          >
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-md bg-magenta" style={{ boxShadow: "0 0 10px var(--magenta), 0 0 20px var(--magenta)" }} />
              <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-void" />
              <div className="absolute right-1/4 top-1/4 h-2 w-2 rounded-full bg-void" />
              <div
                className={`absolute h-2 w-2 rounded-full bg-offwhite transition-all ${
                  direction === "up" ? "left-1/2 top-0 -translate-x-1/2" :
                  direction === "down" ? "bottom-0 left-1/2 -translate-x-1/2" :
                  direction === "left" ? "left-0 top-1/2 -translate-y-1/2" :
                  "right-0 top-1/2 -translate-y-1/2"
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {activeGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-void/90 p-4 backdrop-blur-sm md:p-6"
          >
            {showStimulus && flashImage && (
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <img src={flashImage} alt="Meme" className="max-h-full max-w-full rounded-lg object-contain" />
              </motion.div>
            )}

            {showQuestion && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-h-[calc(100dvh-2rem)] overflow-y-auto w-full max-w-2xl rounded-lg border-2 border-lavender/30 bg-ink p-4 md:max-h-[calc(100dvh-3rem)] md:p-5"
              >
                {activeGate.gateData.type === "audio" && activeStimulus?.kind === "audio" && (
                  <div className="mb-4 sm:mb-6">
                    <button
                      type="button"
                      onClick={() => void playClip(activeStimulus.audioUrl)}
                      className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-electric bg-electric/20 py-3 font-bold text-electric transition-colors hover:bg-electric/30 sm:py-4"
                    >
                      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      TAP TO PLAY AUDIO
                    </button>
                    <p className="mt-2 text-center text-sm text-lavender/60">
                      {audioUnavailable ? activeGate.gateData.fallbackPrompt : "listen once. choose the text that matches"}
                    </p>
                  </div>
                )}

                {fallbackImage && (
                  <div className="mb-4 flex justify-center">
                    <img src={fallbackImage} alt="" className="h-28 w-28 rounded-lg border border-electric/50 object-cover md:h-32 md:w-32" />
                  </div>
                )}

                <h3 className="mb-4 text-center font-display text-lg leading-tight text-offwhite md:text-2xl">
                  {audioUnavailable ? activeGate.gateData.fallbackPrompt ?? activeGate.gateData.prompt : activeGate.gateData.prompt}
                </h3>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  {activeGate.gateData.options.map((option) => {
                    const optionStateClass = selectedOption === option.id
                      ? option.isCorrect
                        ? "border-acid bg-acid/30 text-acid"
                        : "border-warning bg-warning/30 text-warning"
                      : selectedOption
                        ? "border-lavender/20 bg-ink/50 text-lavender/50"
                        : "border-lavender/40 bg-ink text-offwhite hover:border-magenta hover:bg-magenta/10";

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedOption}
                        className={`block min-h-24 w-full rounded-lg border-2 p-4 text-left text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-void disabled:cursor-default md:min-h-28 md:text-base ${optionStateClass}`}
                      >
                        {option.text}
                      </button>
                    );
                  })}
                </div>

                {judgment && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center justify-center gap-3 text-center text-lavender">
                    {!activeGate.gateData.options.find((option) => option.id === selectedOption)?.isCorrect && (
                      <img src={JUDGMENT_MEME} alt="" className="h-12 w-12 rounded border border-warning/40 object-cover" />
                    )}
                    <span>{judgment}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {restartRequired && strikes >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-void p-6">
            <div className="max-w-md text-center">
              <img src={JUDGMENT_MEME} alt="" className="mx-auto mb-5 h-32 w-32 rounded-lg border-2 border-warning object-cover" />
              <h2 className="mb-3 font-display text-4xl text-warning">JUDGED</h2>
              <p className="mb-6 text-lavender">three wrong answers. the maze demands a fresh timeline</p>
              <button
                type="button"
                onClick={onRestart}
                className="rounded-lg border-2 border-electric bg-electric/20 px-6 py-3 font-bold text-electric hover:bg-electric/30"
              >
                RUN IT BACK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-void">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center">
              <h2 className="mb-4 font-display text-4xl text-acid text-glow-acid md:text-6xl">MAZE COMPLETE</h2>
              <p className="text-xl text-lavender">Analyzing your timeline...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-20 right-4 z-20 md:hidden">
        <div className="grid h-32 w-32 grid-cols-3 gap-1">
          <div />
          <button type="button" onTouchStart={() => movePlayer(0, -1)} className="flex items-center justify-center rounded-lg border border-lavender/30 bg-ink/80 active:bg-magenta/50">
            <svg className="h-6 w-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div />
          <button type="button" onTouchStart={() => movePlayer(-1, 0)} className="flex items-center justify-center rounded-lg border border-lavender/30 bg-ink/80 active:bg-magenta/50">
            <svg className="h-6 w-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="rounded-lg border border-lavender/20 bg-ink/40" />
          <button type="button" onTouchStart={() => movePlayer(1, 0)} className="flex items-center justify-center rounded-lg border border-lavender/30 bg-ink/80 active:bg-magenta/50">
            <svg className="h-6 w-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div />
          <button type="button" onTouchStart={() => movePlayer(0, 1)} className="flex items-center justify-center rounded-lg border border-lavender/30 bg-ink/80 active:bg-magenta/50">
            <svg className="h-6 w-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div />
        </div>
      </div>
    </div>
  );
}
