"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RadarChart } from "./RadarChart";
import { ShareCard } from "./ShareCard";
import { eraConfig, type Era } from "@/lib/game-store";

interface VibeReportScreenProps {
  title: string;
  era: Era;
  estimatedAge: number;
  scores: {
    rizz: number;
    aura: number;
    sigma: number;
    era: number;
  };
  roast: string;
  onRestart: () => void;
}

export function VibeReportScreen({
  title,
  era,
  estimatedAge,
  scores,
  roast,
  onRestart,
}: VibeReportScreenProps) {
  const config = eraConfig[era];
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "rendering" | "error">("idle");

  const handleDownload = async () => {
    const shareCardElement = document.getElementById("share-card");
    if (!shareCardElement) {
      setDownloadStatus("error");
      return;
    }

    try {
      setDownloadStatus("rendering");
      const html2canvas = (await import("html2canvas")).default;
      const voidColor = getComputedStyle(document.documentElement).getPropertyValue("--void").trim() || "#08070f";
      const canvas = await html2canvas(shareCardElement, {
        backgroundColor: voidColor,
        logging: false,
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = "wlyo-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      setDownloadStatus("idle");
    } catch (error) {
      setDownloadStatus("error");
      console.error("Failed to generate share card:", error);
    }
  };

  return (
    <motion.div
      className="relative min-h-screen min-h-[100dvh] flex flex-col items-center overflow-x-hidden overflow-y-auto bg-void px-3 sm:px-4 py-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: config.color }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-electric mb-1 sm:mb-2">
            VIBE REPORT
          </h1>
          <p className="text-lavender/60 text-xs sm:text-sm uppercase tracking-widest">
            Your internet era diagnosis is complete
          </p>
        </motion.div>

        {/* Mobile-first layout - stack on mobile, grid on larger */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:gap-8">
          {/* Stats column */}
          <motion.div
            className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Title card — primary card, full treatment */}
            <div
              className="rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2"
              style={{ borderColor: `${config.color}60`, background: `linear-gradient(135deg, var(--ink) 0%, ${config.color}10 100%)` }}
            >
              <p className="text-lavender/70 text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">
                Your Verdict
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
                style={{
                  color: config.color,
                  textShadow: `0 0 20px ${config.color}, 0 0 40px ${config.color}40`,
                }}
              >
                {title}
              </h2>
            </div>

            {/* Age + Era - side by side, plain tiles */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-ink rounded-lg sm:rounded-xl p-3 sm:p-4 border border-lavender/15">
                <p className="text-lavender/60 text-[10px] sm:text-xs uppercase tracking-widest mb-0.5 sm:mb-1">
                  Internet Age
                </p>
                <p className="font-display text-3xl sm:text-4xl text-offwhite">
                  {estimatedAge}
                </p>
              </div>
              <div className="bg-ink rounded-lg sm:rounded-xl p-3 sm:p-4 border border-lavender/15">
                <p className="text-lavender/60 text-[10px] sm:text-xs uppercase tracking-widest mb-0.5 sm:mb-1">
                  Era
                </p>
                <p
                  className="font-display text-xl sm:text-2xl"
                  style={{ color: config.color }}
                >
                  {config.ageRange}
                </p>
              </div>
            </div>

            {/* Radar chart — shown on all screen sizes */}
            <div className="overflow-visible rounded-xl border border-lavender/20 bg-ink p-4 sm:rounded-2xl sm:p-6">
              <p className="text-lavender/60 text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4 text-center">
                Vibe Analysis
              </p>
              <RadarChart scores={scores} />
            </div>

            {/* Axis bars — compact strip, no card wrapper */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(scores).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg p-2 sm:p-3 border border-lavender/10 bg-ink/60"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lavender/70 text-[10px] sm:text-xs uppercase tracking-wider">
                      {key}
                    </span>
                    <span className="text-offwhite text-sm sm:text-base font-bold">{value}</span>
                  </div>
                  <div className="h-1 bg-void rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: ({
                          rizz: "var(--acid)",
                          aura: "var(--magenta)",
                          sigma: "var(--electric)",
                          era: "var(--warning)",
                        } as Record<string, string>)[key],
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Share card column */}
          <motion.div
            className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ShareCard
              title={title}
              era={era}
              estimatedAge={estimatedAge}
              scores={scores}
              roast={roast}
            />

            {/* Actions - stack on mobile, row on tablet+ */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <motion.button
                onClick={handleDownload}
                disabled={downloadStatus === "rendering"}
                className="btn-primary flex min-w-0 flex-1 items-center justify-center gap-2 py-3 text-center text-sm disabled:cursor-wait disabled:opacity-70 sm:py-4 sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                {downloadStatus === "rendering" ? "Rendering Card" : "Download Card"}
              </motion.button>

              <motion.button
                onClick={onRestart}
                className="btn-secondary flex min-w-0 flex-1 items-center justify-center gap-2 py-3 text-center text-sm sm:py-4 sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
                Run It Back
              </motion.button>
            </div>
            {downloadStatus === "error" && (
              <p className="text-center text-xs text-warning">
                Could not render the share card. Try again after the card finishes loading.
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        className="mt-8 sm:mt-12 text-center text-[10px] sm:text-xs text-lavender/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        WLYO - Who Let You Online? at wlyo.app
      </motion.footer>
    </motion.div>
  );
}
