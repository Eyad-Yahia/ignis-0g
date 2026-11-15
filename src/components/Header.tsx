import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Scale, 
  ShieldAlert, 
  Bot, 
  Network, 
  Database, 
  Key, 
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles,
  Server,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AIProviderConfig, AIProviderId } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aiConfig: AIProviderConfig;
  setAiConfig: (config: AIProviderConfig) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  onOpenAiModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  aiConfig,
  setAiConfig,
  isAiModalOpen,
  setIsAiModalOpen,
  onOpenAiModal
}) => {
  // Local form state within the modal (synced from aiConfig on modal open)
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(aiConfig.provider);
  const [tempApiKey, setTempApiKey] = useState<string>(aiConfig.apiKey);
  const [tempModel, setTempModel] = useState<string>(aiConfig.model);
  const [tempBaseUrl, setTempBaseUrl] = useState<string>(aiConfig.baseUrl);

  // Sync state when modal opens
  useEffect(() => {
    if (isAiModalOpen) {
      setSelectedProvider(aiConfig.provider);
      setTempApiKey(aiConfig.apiKey);
      setTempModel(aiConfig.model);
      setTempBaseUrl(aiConfig.baseUrl);
    }
  }, [isAiModalOpen, aiConfig]);

  // Escape key closing for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiModalOpen) {
        setIsAiModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiModalOpen, setIsAiModalOpen]);

  const navItems = [
    { id: 'gravity', label: 'Simulator', icon: Scale },
    { id: 'risk', label: 'Risk Matrix', icon: ShieldAlert },
    { id: 'synthesizer', label: 'AI Analyst', icon: Bot },
    { id: 'insights', label: 'Telemetry Graph', icon: Network },
    { id: 'dataset', label: 'Dataset', icon: Database }
  ];

  const handleProviderSelect = (p: AIProviderId) => {
    setSelectedProvider(p);
    if (p === 'offline') {
      setTempApiKey('');
      setTempModel('TF-IDF Deterministic Engine');
      setTempBaseUrl('');
    } else if (p === 'gemini') {
      if (!tempModel || tempModel.includes('gpt') || tempModel.includes('claude') || tempModel.includes('llama')) {
        setTempModel('gemini-2.0-flash');
      }
    } else if (p === 'openai') {
      if (!tempModel || tempModel.includes('gemini') || tempModel.includes('claude') || tempModel.includes('llama')) {
        setTempModel('gpt-4o-mini');
      }
    } else if (p === 'anthropic') {
      if (!tempModel || tempModel.includes('gemini') || tempModel.includes('gpt') || tempModel.includes('llama')) {
        setTempModel('claude-3-5-sonnet-latest');
      }
    } else if (p === 'custom') {
      if (!tempBaseUrl) {
        setTempBaseUrl('https://api.groq.com/openai/v1');
      }
      if (!tempModel || tempModel.includes('gemini') || tempModel.includes('gpt') || tempModel.includes('claude')) {
        setTempModel('llama-3.3-70b-versatile');
      }
    }
  };

  const applyCustomPreset = (preset: { name: string; url: string; model: string }) => {
    setTempBaseUrl(preset.url);
    setTempModel(preset.model);
  };

  const handleSaveConfig = () => {
    setAiConfig({
      provider: selectedProvider,
      apiKey: selectedProvider === 'offline' ? '' : tempApiKey.trim(),
      model: tempModel.trim(),
      baseUrl: selectedProvider === 'custom' ? tempBaseUrl.trim() : ''
    });
    setIsAiModalOpen(false);
  };

  const handleDisconnect = () => {
    setAiConfig({
      provider: 'offline',
      apiKey: '',
      model: 'TF-IDF Deterministic Engine',
      baseUrl: ''
    });
    setIsAiModalOpen(false);
  };

  // Badge label and style for top header button
  const getProviderPill = () => {
    if (aiConfig.provider === 'offline' || !aiConfig.provider) {
      return {
        label: 'AI: OFFLINE TF-IDF',
        dot: 'bg-zinc-500',
        border: 'border-[#27272A]'
      };
    }
    if (aiConfig.provider === 'gemini') {
      return {
        label: 'GEMINI: CONNECTED',
        dot: 'bg-emerald-400',
        border: 'border-[#3B82F6]/40 text-[#3B82F6]'
      };
    }
    if (aiConfig.provider === 'openai') {
      return {
        label: 'OPENAI: CONNECTED',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/40 text-emerald-400'
      };
    }
    if (aiConfig.provider === 'anthropic') {
      return {
        label: 'CLAUDE: CONNECTED',
        dot: 'bg-emerald-400',
        border: 'border-amber-500/40 text-amber-400'
      };
    }
    return {
      label: 'CUSTOM AI: CONNECTED',
      dot: 'bg-emerald-400',
      border: 'border-[#F97316]/40 text-[#F97316]'
    };
  };

  const pill = getProviderPill();

  return (
    <>
      {/* 48px Header Bar — strict z-30 in hierarchy */}
      <header className="sticky top-0 z-30 h-12 bg-[#09090B] border-b border-[#27272A] px-3 sm:px-4 flex items-center justify-between select-none">
        {/* Left: Branding & Dataset Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#F97316]">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-zinc-100">
              IGNIS-0G
            </span>
          </div>

          <span className="text-[#27272A] hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-400 truncate">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              17 NASA PSI RECORDS
            </span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="text-zinc-500 text-[10px] hidden md:inline">
              NASA-STD-6001B METHODOLOGY
            </span>
          </div>
        </div>

        {/* Center: Segmented Navigation Tabs */}
        <nav className="flex items-center bg-[#111114] border border-[#27272A] rounded p-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1C1C21] text-zinc-100 shadow-sm border border-[#3F3F46]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]'
                }`}
                title={item.label}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F97316]' : 'text-zinc-500'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Universal AI Provider Selector Trigger */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onOpenAiModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border bg-[#111114] text-zinc-300 text-[11px] font-mono transition-colors hover:border-[#3F3F46] ${pill.border}`}
            title="Configure AI Provider (Gemini, OpenAI, Claude, Groq/Ollama, or Offline TF-IDF)"
          >
            <Bot className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="hidden sm:inline font-medium">{pill.label}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${pill.dot}`} />
          </button>
        </div>
      </header>

      {/* Universal Multi-Provider AI Modal — strict z-50 in hierarchy */}
      {isAiModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAiModalOpen(false);
          }}
        >
          <div className="w-full max-w-xl bg-[#111114] border border-[#27272A] rounded-lg shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#1C1C21] text-[#F97316]">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 font-mono">
                    Universal AI Flight Synthesizer Config
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Select any AI provider or use the offline deterministic engine.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-[#1C1C21]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Provider Selector Cards (5 Providers) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-zinc-400">
                SELECT AI ENGINE PROVIDER:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Offline TF-IDF */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('offline')}
                  className={`p-2.5 rounded text-left border transition-all ${
                    selectedProvider === 'offline'
                      ? 'bg-[#1C1C21] border-[#F97316] text-zinc-100'
                      : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#F97316]" />
                      Offline TF-IDF Analyst
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Zero Key
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                    Deterministic local semantic engine over 17 NASA flight records. Always available offline.
                  </p>
                </button>

                {/* 2. Google Gemini */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('gemini')}
                  className={`p-2.5 rounded text-left border transition-all ${
                    selectedProvider === 'gemini'
                      ? 'bg-[#1C1C21] border-[#3B82F6] text-zinc-100'
                      : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                      Google Gemini
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      Fast 2.0
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                    Fast multimodal reasoning with gemini-2.0-flash or custom model.
                  </p>
                </button>

                {/* 3. OpenAI */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('openai')}
                  className={`p-2.5 rounded text-left border transition-all ${
                    selectedProvider === 'openai'
                      ? 'bg-[#1C1C21] border-emerald-500 text-zinc-100'
                      : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      OpenAI
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      gpt-4o-mini
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                    Direct OpenAI API integration (gpt-4o-mini / gpt-4o).
                  </p>
                </button>

                {/* 4. Anthropic Claude */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('anthropic')}
                  className={`p-2.5 rounded text-left border transition-all ${
                    selectedProvider === 'anthropic'
                      ? 'bg-[#1C1C21] border-amber-500 text-zinc-100'
                      : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      Anthropic Claude
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Claude 3.5
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                    Direct browser client access to claude-3-5-sonnet-latest.
                  </p>
                </button>

                {/* 5. OpenAI-Compatible Custom Endpoint */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('custom')}
                  className={`p-2.5 rounded text-left border transition-all sm:col-span-2 ${
                    selectedProvider === 'custom'
                      ? 'bg-[#1C1C21] border-[#F97316] text-zinc-100'
                      : 'bg-[#09090B] border-[#27272A] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-[#F97316]" />
                      OpenAI-Compatible Custom Endpoint
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
                      Groq / Ollama / DeepSeek
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-snug font-sans">
                    Connect any OpenAI-compatible server: Groq, OpenRouter, DeepSeek, Mistral, or local Ollama.
                  </p>
                </button>
              </div>
            </div>

            {/* Provider Configuration Fields */}
            {selectedProvider !== 'offline' && (
              <div className="p-3.5 rounded bg-[#09090B] border border-[#27272A] space-y-3 font-mono text-xs">
                {/* Custom Preset Quick-Fill Chips */}
                {selectedProvider === 'custom' && (
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">QUICK PRESET CHIPS:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Groq (Llama 3.3)', url: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
                        { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct' },
                        { name: 'DeepSeek', url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
                        { name: 'Local Ollama', url: 'http://localhost:11434/v1', model: 'llama3' },
                        { name: 'Mistral', url: 'https://api.mistral.ai/v1', model: 'mistral-large-latest' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyCustomPreset(preset)}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white hover:border-[#F97316] transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Base URL (for custom) */}
                {selectedProvider === 'custom' && (
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      BASE URL (ENDPOINT):
                    </label>
                    <input
                      type="text"
                      value={tempBaseUrl}
                      onChange={(e) => setTempBaseUrl(e.target.value)}
                      placeholder="https://api.groq.com/openai/v1 or http://localhost:11434/v1"
                      className="w-full bg-[#111114] border border-[#27272A] focus:border-[#F97316] rounded px-3 py-1.5 text-xs text-zinc-100 outline-none"
                    />
                  </div>
                )}

                {/* Model Name */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    MODEL NAME:
                  </label>
                  <input
                    type="text"
                    value={tempModel}
                    onChange={(e) => setTempModel(e.target.value)}
                    placeholder={
                      selectedProvider === 'gemini' ? 'gemini-2.0-flash' :
                      selectedProvider === 'openai' ? 'gpt-4o-mini' :
                      selectedProvider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'model-name'
                    }
                    className="w-full bg-[#111114] border border-[#27272A] focus:border-[#F97316] rounded px-3 py-1.5 text-xs text-zinc-100 outline-none"
                  />
                </div>

                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-zinc-400">
                      API KEY {selectedProvider === 'custom' && '(OPTIONAL FOR LOCAL OLLAMA)'}:
                    </label>
                    {selectedProvider === 'gemini' && (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-0.5"
                      >
                        Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {selectedProvider === 'openai' && (
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline text-[10px] flex items-center gap-0.5"
                      >
                        OpenAI Platform <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {selectedProvider === 'anthropic' && (
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline text-[10px] flex items-center gap-0.5"
                      >
                        Anthropic Console <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={selectedProvider === 'custom' ? 'Optional key or Bearer token' : 'sk-... or AIzaSy...'}
                    className="w-full bg-[#111114] border border-[#27272A] focus:border-[#F97316] rounded px-3 py-1.5 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* In-Memory RAM Security Notice */}
            <div className="p-2.5 bg-[#18181B] border border-[#27272A] rounded text-[11px] text-zinc-300 flex items-start gap-2 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-100">RAM-Only Guarantee:</strong> Configuration and credentials exist solely in memory during your active browser session. Never written to localStorage, cookies, or remote telemetry.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#27272A]">
              <div>
                {aiConfig.provider !== 'offline' && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-2.5 py-1.5 rounded text-xs font-mono text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                  >
                    Reset to Offline
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 border border-[#27272A] hover:bg-[#18181B]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-3 py-1.5 rounded text-xs font-mono font-medium text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors"
                >
                  Save to Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
