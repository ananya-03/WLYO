"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LandingScreen } from "./LandingScreen";
import { SeedFlashScreen } from "./SeedFlashScreen";
import { MazeHubScreen } from "./MazeHubScreen";
import { ForkGateScreen } from "./ForkGateScreen";
import { AudioDoorScreen } from "./AudioDoorScreen";
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
    // Navigate to the appropriate gate type
    const gate = memeGates[gameState.currentGateIndex];
    if (gate.type === "audio") {
      navigateTo("audio-door");
    } else {
      navigateTo("fork-gate");
    }
  }, [gameState.currentGateIndex, navigateTo]);

  const handleReplay = useCallback(() => {
    setGameState((prev) => ({ ...prev, replayUsed: true }));
  }, []);

  const handleGateSelect = useCallback(
    (optionId: string, era: Era, points: number) => {
      const newAnswer = {
        gateId: currentGate.id,
        optionId,
        era,
        points,
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
    },
    [currentGate]
  );

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
      case "seed-flash":
        return currentGate ? (
          <SeedFlashScreen
            key={`seed-flash-${gameState.currentGateIndex}`}
            gate={currentGate}
            replayUsed={gameState.replayUsed}
            onComplete={handleSeedFlashComplete}
            onReplay={handleReplay}
          />
        ) : null;
      case "maze-hub":
        return (
          <MazeHubScreen
            key="maze-hub"
            totalGates={memeGates.length}
            currentGate={gameState.currentGateIndex + 1}
            completedGates={gameState.completedGates}
            onTransitionComplete={handleMazeTransitionComplete}
          />
        );
      case "fork-gate":
        return currentGate ? (
          <ForkGateScreen
            key={`fork-gate-${gameState.currentGateIndex}`}
            gate={currentGate}
            gateIndex={gameState.currentGateIndex}
            totalGates={memeGates.length}
            completedGates={gameState.completedGates}
            onSelect={handleGateSelect}
          />
        ) : null;
      case "audio-door":
        return currentGate ? (
          <AudioDoorScreen
            key={`audio-door-${gameState.currentGateIndex}`}
            gate={currentGate}
            gateIndex={gameState.currentGateIndex}
            totalGates={memeGates.length}
            completedGates={gameState.completedGates}
            onSelect={handleGateSelect}
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
