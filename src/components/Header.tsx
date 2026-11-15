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

  // Body scroll lock while modal is open
  useEffect(() => {
    if (isAiModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isAiModalOpen]);

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
        label: 'Offline TF-IDF',
        dot: 'bg-zinc-500',
        border: 'border-zinc-800'
      };
    }
    if (aiConfig.provider === 'gemini') {
      return {
        label: 'Gemini 2.0',
        dot: 'bg-emerald-400',
        border: 'border-[#3B82F6]/40 text-[#3B82F6]'
      };
    }
    if (aiConfig.provider === 'openai') {
      return {
        label: 'OpenAI',
        dot: 'bg-emerald-400',
        border: 'border-emerald-500/40 text-emerald-400'
      };
    }
    if (aiConfig.provider === 'anthropic') {
      return {
        label: 'Claude 3.5',
        dot: 'bg-emerald-400',
        border: 'border-amber-500/40 text-amber-400'
      };
    }
    return {
      label: 'Custom AI',
      dot: 'bg-emerald-400',
      border: 'border-[#F97316]/40 text-[#F97316]'
    };
  };

  const pill = getProviderPill();

  return (
    <>
      {/* 48px Header Bar — strict z-30 in hierarchy */}
      <header className="sticky top-0 z-30 h-12 bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800/70 px-4 sm:px-6 flex items-center justify-between select-none">
        {/* Left: Branding & Dataset Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-[#18181B] border border-zinc-800 flex items-center justify-center text-[#F97316]">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="font-sans font-semibold text-sm tracking-tight text-zinc-100">
              IGNIS-0G
            </span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-2 font-sans text-xs text-zinc-400 truncate">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
              <span className="font-mono tabular-nums font-medium text-zinc-200">17</span> NASA PSI records
            </span>
            <span className="text-zinc-600 hidden md:inline">•</span>
            <span className="text-zinc-400 text-xs hidden md:inline">
              NASA-STD-6001B methodology
            </span>
          </div>
        </div>

        {/* Center: Segmented Navigation Tabs */}
        <nav className="flex items-center bg-[#101014] border border-zinc-800/70 rounded-lg p-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-sans font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1C1C21] text-zinc-100 shadow-sm border border-zinc-700/60'
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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-[#101014] text-zinc-300 text-xs font-sans font-medium transition-colors hover:border-zinc-700 ${pill.border}`}
            title="Configure AI Provider (Gemini, OpenAI, Claude, Groq/Ollama, or Offline TF-IDF)"
          >
            <Bot className="w-3.5 h-3.5 text-[#F97316]" />
            <span className="hidden sm:inline">{pill.label}</span>
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
          <div className="w-full max-w-xl bg-[#101014] border border-zinc-800/80 rounded-xl shadow-2xl p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#18181B] text-[#F97316] border border-zinc-800">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 font-sans tracking-tight">
                    AI Flight Synthesizer Configuration
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Select an external AI model or run with the offline deterministic engine.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-[#18181B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Provider Selector Cards (5 Providers) */}
            <div className="space-y-2">
              <label className="block text-xs font-sans font-medium text-zinc-400">
                Select AI Engine Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Offline TF-IDF */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('offline')}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    selectedProvider === 'offline'
                      ? 'bg-[#18181B] border-[#F97316] text-zinc-100'
                      : 'bg-[#0C0C0E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#F97316]" />
                      Offline TF-IDF Analyst
                    </span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Zero Key
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug font-sans">
                    Deterministic local semantic engine over 17 NASA flight records. Always available offline.
                  </p>
                </button>

                {/* 2. Google Gemini */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('gemini')}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    selectedProvider === 'gemini'
                      ? 'bg-[#18181B] border-[#3B82F6] text-zinc-100'
                      : 'bg-[#0C0C0E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                      Google Gemini
                    </span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Fast 2.0
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug font-sans">
                    Fast multimodal reasoning with gemini-2.0-flash or custom model.
                  </p>
                </button>

                {/* 3. OpenAI */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('openai')}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    selectedProvider === 'openai'
                      ? 'bg-[#18181B] border-emerald-500 text-zinc-100'
                      : 'bg-[#0C0C0E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      OpenAI
                    </span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      gpt-4o-mini
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug font-sans">
                    Direct OpenAI API integration (gpt-4o-mini / gpt-4o).
                  </p>
                </button>

                {/* 4. Anthropic Claude */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('anthropic')}
                  className={`p-3 rounded-lg text-left border transition-all ${
                    selectedProvider === 'anthropic'
                      ? 'bg-[#18181B] border-amber-500 text-zinc-100'
                      : 'bg-[#0C0C0E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      Anthropic Claude
                    </span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Claude 3.5
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug font-sans">
                    Direct browser client access to claude-3-5-sonnet-latest.
                  </p>
                </button>

                {/* 5. OpenAI-Compatible Custom Endpoint */}
                <button
                  type="button"
                  onClick={() => handleProviderSelect('custom')}
                  className={`p-3 rounded-lg text-left border transition-all sm:col-span-2 ${
                    selectedProvider === 'custom'
                      ? 'bg-[#18181B] border-[#F97316] text-zinc-100'
                      : 'bg-[#0C0C0E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-[#F97316]" />
                      OpenAI-Compatible Custom Endpoint
                    </span>
                    <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                      Groq / Ollama / DeepSeek
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug font-sans">
                    Connect any OpenAI-compatible server: Groq, OpenRouter, DeepSeek, Mistral, or local Ollama.
                  </p>
                </button>
              </div>
            </div>

            {/* Provider Configuration Fields */}
            {selectedProvider !== 'offline' && (
              <div className="p-4 rounded-lg bg-[#0C0C0E] border border-zinc-800/70 space-y-3 font-sans text-xs">
                {/* Custom Preset Quick-Fill Chips */}
                {selectedProvider === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Quick Presets:</label>
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
                          className="px-2.5 py-1 rounded-md text-xs bg-[#18181B] border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#F97316] transition-colors font-sans"
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
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Base URL (Endpoint):
                    </label>
                    <input
                      type="text"
                      value={tempBaseUrl}
                      onChange={(e) => setTempBaseUrl(e.target.value)}
                      placeholder="https://api.groq.com/openai/v1 or http://localhost:11434/v1"
                      className="w-full bg-[#101014] border border-zinc-800 focus:border-[#F97316] rounded-md px-3 py-1.5 text-xs text-zinc-100 outline-none font-mono"
                    />
                  </div>
                )}

                {/* Model Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Model Name:
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
                    className="w-full bg-[#101014] border border-zinc-800 focus:border-[#F97316] rounded-md px-3 py-1.5 text-xs text-zinc-100 outline-none font-mono"
                  />
                </div>

                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-400">
                      API Key {selectedProvider === 'custom' && '(Optional for local Ollama)'}:
                    </label>
                    {selectedProvider === 'gemini' && (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] hover:underline text-xs flex items-center gap-0.5"
                      >
                        Google AI Studio <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {selectedProvider === 'openai' && (
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline text-xs flex items-center gap-0.5"
                      >
                        OpenAI Platform <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {selectedProvider === 'anthropic' && (
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline text-xs flex items-center gap-0.5"
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
                    className="w-full bg-[#101014] border border-zinc-800 focus:border-[#F97316] rounded-md px-3 py-1.5 text-xs text-zinc-100 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* In-Memory RAM Security Notice */}
            <div className="p-3 bg-[#18181B] border border-zinc-800/70 rounded-lg text-xs text-zinc-300 flex items-start gap-2.5 font-sans">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-100 font-medium">RAM-only guarantee:</strong> Credentials exist solely in memory during your active browser session. Never saved to localStorage, cookies, or remote logs.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/70">
              <div>
                {aiConfig.provider !== 'offline' && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded-md text-xs font-sans font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                  >
                    Reset to Offline
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-sans font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-[#18181B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-3.5 py-1.5 rounded-md text-xs font-sans font-medium text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors"
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
