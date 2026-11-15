import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { GravityComparator } from './components/GravityComparator';
import { RiskMatrix } from './components/RiskMatrix';
import { AiSynthesizer } from './components/AiSynthesizer';
import { InsightGraph } from './components/InsightGraph';
import { DatasetExplorer } from './components/DatasetExplorer';
import { NASAExperiment, AIProviderConfig } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('gravity');

  // Ephemeral in-memory AI configuration (RAM only) - never stored in localStorage
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>({
    provider: 'offline',
    apiKey: '',
    model: 'gemini-2.0-flash',
    baseUrl: ''
  });

  // Modal and Drawer coordination states ensuring mutual exclusivity
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [inspectingExperiment, setInspectingExperiment] = useState<NASAExperiment | null>(null);

  // Clean up any legacy localStorage entries from prior versions
  useEffect(() => {
    try {
      localStorage.removeItem('IGNIS_GEMINI_API_KEY');
      localStorage.removeItem('IGNIS_AI_CONFIG');
    } catch {
      // ignore
    }
  }, []);

  // Open Universal AI Configuration Modal (automatically closes any open drawer)
  const handleOpenAiModal = () => {
    setInspectingExperiment(null);
    setIsAiModalOpen(true);
  };

  // Open Experiment Dossier Drawer (automatically closes any open modal)
  const handleOpenExperimentDossier = (exp: NASAExperiment) => {
    setIsAiModalOpen(false);
    setInspectingExperiment(exp);
    setActiveTab('dataset');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans selection:bg-[#F97316]/20 selection:text-[#F97316]">
      {/* 48px Header — z-30 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        aiConfig={aiConfig}
        setAiConfig={setAiConfig}
        isAiModalOpen={isAiModalOpen}
        setIsAiModalOpen={setIsAiModalOpen}
        onOpenAiModal={handleOpenAiModal}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-5 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'gravity' && (
            <motion.div
              key="gravity"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <GravityComparator />
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <RiskMatrix />
            </motion.div>
          )}

          {activeTab === 'synthesizer' && (
            <motion.div
              key="synthesizer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <AiSynthesizer
                aiConfig={aiConfig}
                onSelectExperiment={handleOpenExperimentDossier}
                onOpenAiModal={handleOpenAiModal}
              />
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <InsightGraph onSelectExperiment={handleOpenExperimentDossier} />
            </motion.div>
          )}

          {activeTab === 'dataset' && (
            <motion.div
              key="dataset"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <DatasetExplorer
                initialSelectedExperiment={inspectingExperiment}
                selectedExperiment={inspectingExperiment}
                onSelectExperiment={(exp) => {
                  if (exp) setIsAiModalOpen(false);
                  setInspectingExperiment(exp);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal Telemetry Footer */}
      <footer className="border-t border-[#27272A] bg-[#09090B] py-2.5 px-4 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              17 Verified NASA Experiments
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">REFERENCES NASA-STD-6001B METHODOLOGY</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 text-[11px] overflow-x-auto max-w-full">
            <span>Saffire I–VI</span>
            <span>FLEX / FLEX-2 / FLEX-ICE</span>
            <span>BASS / BASS-II</span>
            <span>ACME</span>
            <span>SoFIE</span>
            <span>BRE</span>
            <span>SLICE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
