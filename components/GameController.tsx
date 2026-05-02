"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LandingScreen } from "./LandingScreen";
import { SeedFlashScreen } from "./SeedFlashScreen";
import { MazeHubScreen } from "./MazeHubScreen";
import { ForkGateScreen } from "./ForkGateScreen";
import { EraRoomScreen } from "./EraRoomScreen";
import { VibeReportScreen } from "./VibeReportScreen";
import { 
  initialGameState, 
  memeGates, 
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

  const currentGate = memeGates[gameState.currentGateIndex];

  const navigateTo = useCallback((screen: GameScreen) => {
    setGameState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const handleStart = useCallback(() => {
    navigateTo("seed-flash");
  }, [navigateTo]);

  const handleToggleAudio = useCallback(() => {
    setGameState((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  const handleSeedFlashComplete = useCallback(() => {
    navigateTo("fork-gate");
  }, [navigateTo]);

  const handleReplay = useCallback(() => {
    setGameState((prev) => ({ ...prev, replayUsed: true }));
  }, []);

  const handleGateSelect = useCallback((optionId: string, era: Era) => {
    const newAnswer = { 
      gateId: currentGate.id, 
      optionId, 
      era,
    };

    setGameState((prev) => {
      const newSelectedAnswers = [...prev.selectedAnswers, newAnswer];
      const newCompletedGates = [...prev.completedGates, prev.currentGateIndex];
      
      // Check if this was the last gate
      const isLastGate = prev.currentGateIndex >= memeGates.length - 1;
      
      if (isLastGate) {
        // Calculate results
        const calcResults = calculateResults(newSelectedAnswers);
        setResults({ title: calcResults.title, roast: calcResults.roast });
        
        return {
          ...prev,
          selectedAnswers: newSelectedAnswers,
          completedGates: newCompletedGates,
          scores: calcResults.scores,
          finalEra: calcResults.finalEra,
          estimatedAge: calcResults.estimatedAge,
          currentScreen: "era-room" as GameScreen,
        };
      }
      
      return {
        ...prev,
        selectedAnswers: newSelectedAnswers,
        completedGates: newCompletedGates,
        currentScreen: "maze-hub" as GameScreen,
      };
    });
  }, [currentGate]);

  const handleMazeTransitionComplete = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentGateIndex: prev.currentGateIndex + 1,
      currentScreen: "seed-flash",
      replayUsed: false,
    }));
  }, []);

  const handleEraRoomContinue = useCallback(() => {
    navigateTo("vibe-report");
  }, [navigateTo]);

  const handleRestart = useCallback(() => {
    setGameState(initialGameState);
    setResults(null);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {gameState.currentScreen === "landing" && (
        <LandingScreen
          key="landing"
          audioEnabled={gameState.audioEnabled}
          onToggleAudio={handleToggleAudio}
          onStart={handleStart}
        />
      )}

      {gameState.currentScreen === "seed-flash" && currentGate && (
        <SeedFlashScreen
          key={`seed-flash-${gameState.currentGateIndex}`}
          gate={currentGate}
          replayUsed={gameState.replayUsed}
          onComplete={handleSeedFlashComplete}
          onReplay={handleReplay}
        />
      )}

      {gameState.currentScreen === "maze-hub" && (
        <MazeHubScreen
          key="maze-hub"
          totalGates={memeGates.length}
          currentGate={gameState.currentGateIndex + 1}
          completedGates={gameState.completedGates}
          onTransitionComplete={handleMazeTransitionComplete}
        />
      )}

      {gameState.currentScreen === "fork-gate" && currentGate && (
        <ForkGateScreen
          key={`fork-gate-${gameState.currentGateIndex}`}
          gate={currentGate}
          gateIndex={gameState.currentGateIndex}
          totalGates={memeGates.length}
          completedGates={gameState.completedGates}
          onSelect={handleGateSelect}
        />
      )}

      {gameState.currentScreen === "era-room" && gameState.finalEra && results && (
        <EraRoomScreen
          key="era-room"
          era={gameState.finalEra}
          title={results.title}
          estimatedAge={gameState.estimatedAge || 0}
          roast={results.roast}
          onContinue={handleEraRoomContinue}
        />
      )}

      {gameState.currentScreen === "vibe-report" && gameState.finalEra && results && (
        <VibeReportScreen
          key="vibe-report"
          title={results.title}
          era={gameState.finalEra}
          estimatedAge={gameState.estimatedAge || 0}
          scores={gameState.scores}
          roast={results.roast}
          onRestart={handleRestart}
        />
      )}
    </AnimatePresence>
  );
}
