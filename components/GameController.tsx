"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LandingScreen } from "./LandingScreen";
import { MazeGame } from "./MazeGame";
import { EraRoomScreen } from "./EraRoomScreen";
import { VibeReportScreen } from "./VibeReportScreen";
import {
  createGameRun,
  initialGameState,
  calculateResults,
  type GeneratedRun,
  type GameState,
  type GameScreen,
} from "@/lib/game-store";

export function GameController() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [activeRun, setActiveRun] = useState<GeneratedRun | null>(null);
  const [results, setResults] = useState<{
    title: string;
    roast: string;
  } | null>(null);

  const navigateTo = useCallback((screen: GameScreen) => {
    setGameState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const handleStart = useCallback(() => {
    setActiveRun(createGameRun());
    setResults(null);
    setGameState((prev) => ({
      ...initialGameState,
      audioEnabled: prev.audioEnabled,
      currentScreen: "maze",
    }));
  }, []);

  const handleToggleAudio = useCallback(() => {
    setGameState((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  const handleMazeComplete = useCallback(
    (answers: GameState["selectedAnswers"]) => {
      const calcResults = calculateResults(answers);
      setResults({ title: calcResults.title, roast: calcResults.roast });
      
      setGameState((prev) => ({
        ...prev,
        selectedAnswers: answers,
        scores: calcResults.scores,
        finalEra: calcResults.finalEra,
        estimatedAge: calcResults.estimatedAge,
        currentScreen: "era-room" as GameScreen,
      }));
    },
    []
  );

  const handleEraRoomContinue = useCallback(() => {
    navigateTo("vibe-report");
  }, [navigateTo]);

  const handleRestart = useCallback(() => {
    setActiveRun(createGameRun());
    setResults(null);
    setGameState((prev) => ({
      ...initialGameState,
      audioEnabled: prev.audioEnabled,
      currentScreen: "maze",
    }));
  }, []);

  const renderScreen = () => {
    switch (gameState.currentScreen) {
      case "landing":
        return (
          <LandingScreen
            key="landing"
            audioEnabled={gameState.audioEnabled}
            onToggleAudio={handleToggleAudio}
            onStart={handleStart}
          />
        );
      case "maze":
        return activeRun ? (
          <MazeGame
            key={`maze-${activeRun.seed}`}
            run={activeRun}
            onComplete={handleMazeComplete}
            onRestart={handleRestart}
            audioEnabled={gameState.audioEnabled}
          />
        ) : null;
      case "era-room":
        return gameState.finalEra && results ? (
          <EraRoomScreen
            key="era-room"
            era={gameState.finalEra}
            title={results.title}
            estimatedAge={gameState.estimatedAge || 0}
            roast={results.roast}
            onContinue={handleEraRoomContinue}
          />
        ) : null;
      case "vibe-report":
        return gameState.finalEra && results ? (
          <VibeReportScreen
            key="vibe-report"
            title={results.title}
            era={gameState.finalEra}
            estimatedAge={gameState.estimatedAge || 0}
            scores={gameState.scores}
            roast={results.roast}
            onRestart={handleRestart}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderScreen()}
    </AnimatePresence>
  );
}
