"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LandingScreen } from "./LandingScreen";
import { MazeGame } from "./MazeGame";
import { EraRoomScreen } from "./EraRoomScreen";
import { VibeReportScreen } from "./VibeReportScreen";
import {
  initialGameState,
  calculateResults,
  type GameState,
  type GameScreen,
  type Era,
} from "@/lib/game-store";

export function GameController() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [results, setResults] = useState<{
    title: string;
    roast: string;
  } | null>(null);

  const navigateTo = useCallback((screen: GameScreen) => {
    setGameState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const handleStart = useCallback(() => {
    navigateTo("maze");
  }, [navigateTo]);

  const handleToggleAudio = useCallback(() => {
    setGameState((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  const handleMazeComplete = useCallback(
    (answers: { gateId: number; optionId: string; era: Era; isCorrect: boolean }[]) => {
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
    setGameState(initialGameState);
    setResults(null);
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
        return (
          <MazeGame
            key="maze"
            onComplete={handleMazeComplete}
            audioEnabled={gameState.audioEnabled}
          />
        );
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
