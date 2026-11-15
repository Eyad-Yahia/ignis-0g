import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Check, 
  Copy, 
  Flame, 
  ArrowRight,
  User,
  AlertTriangle,
  Cpu,
  Zap,
  Server
} from 'lucide-react';
import { ChatMessage, NASAExperiment, AIProviderConfig } from '../types';
import { RichText } from './RichText';
import { queryHybridAI, GroundedRAGResponse } from '../utils/ragEngine';

interface AiSynthesizerProps {
  aiConfig: AIProviderConfig;
  onSelectExperiment?: (exp: NASAExperiment) => void;
  onOpenExperimentModal?: (exp: NASAExperiment) => void;
  onOpenAiModal?: () => void;
}

export const AiSynthesizer: React.FC<AiSynthesizerProps> = ({
  aiConfig,
  onSelectExperiment,
  onOpenExperimentModal,
  onOpenAiModal
}) => {
  const handleInspect = onSelectExperiment || onOpenExperimentModal;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      role: 'assistant',
      content: `### IGNIS-0G Flight Safety Synthesizer Online
I am grounded directly in NASA's **Physical Sciences Informatics (PSI)** microgravity flight experiments (Saffire I–VI, FLEX, BASS, ACME, SoFIE, BRE). 

Every statement is cross-referenced with flight record IDs to eliminate hallucinations. You can query me on microgravity combustion physics, flame spread kinetics, cool flames, or material flammability under exploration atmospheres.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceScore: 100,
      providerUsed: 'offline',
      usedFallback: false,
      citations: [
        {
          id: 'NASA-SAFFIRE-I-01',
          psiRecord: 'PSI-CB-0041',
          program: 'Saffire (Cygnus)',
          material: 'SIBAL Cotton-Fiberglass',
          takeaway: '1g upward flammability tests underestimate microgravity burn duration under low forced draft.'
        },
        {
          id: 'NASA-FLEX-01',
          psiRecord: 'PSI-CB-0012',
          program: 'FLEX (ISS CIR)',
          material: 'n-Heptane Droplet',
          takeaway: 'Standard optical sensors report false "fire out" while invisible 600K cool flames persist.'
        }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitationsMap, setActiveCitationsMap] = useState<Record<string, NASAExperiment>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 4 One-Click Technical Prompt Chips
  const promptChips = [
    "Compare Methane vs. Hydrogen fire hazards in 0g",
    "Explain the Draft Paradox in BASS experiments",
    "Why is Artemis 34% O2 dangerous at low pressure?",
    "Water Mist vs CO2 in microgravity"
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response: GroundedRAGResponse = await queryHybridAI(q, aiConfig);

      // Save citations map
      const newMap: Record<string, NASAExperiment> = { ...activeCitationsMap };
      response.citations.forEach(c => {
        newMap[c.psiRecord] = c.experiment;
        newMap[c.id] = c.experiment;
      });
      setActiveCitationsMap(newMap);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.answerText,
        citations: response.citations.map(c => ({
          id: c.id,
          psiRecord: c.psiRecord,
          program: c.program,
          material: c.material,
          takeaway: c.takeaway
        })),
        confidenceScore: response.confidenceScore,
        providerUsed: response.providerUsed,
        usedFallback: response.usedFallback,
        fallbackReason: response.fallbackReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActiveEngineBadge = () => {
    if (aiConfig.provider === 'offline' || !aiConfig.provider) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-zinc-300 text-[11px] font-mono">
          <Cpu className="w-3.5 h-3.5 text-[#F97316]" />
          <span>OFFLINE TF-IDF (17 RECORDS)</span>
        </span>
      );
    }
    if (aiConfig.provider === 'gemini') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C21] text-[#3B82F6] border border-[#3B82F6]/30 text-[11px] font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GEMINI ({aiConfig.model || 'gemini-2.0-flash'})</span>
        </span>
      );
    }
    if (aiConfig.provider === 'openai') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C21] text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
          <Zap className="w-3.5 h-3.5" />
          <span>OPENAI ({aiConfig.model || 'gpt-4o-mini'})</span>
        </span>
      );
    }
    if (aiConfig.provider === 'anthropic') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C21] text-amber-400 border border-amber-500/30 text-[11px] font-mono">
          <Bot className="w-3.5 h-3.5" />
          <span>CLAUDE ({aiConfig.model || 'claude-3.5'})</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1C21] text-[#F97316] border border-[#F97316]/30 text-[11px] font-mono">
        <Server className="w-3.5 h-3.5" />
        <span>CUSTOM ENDPOINT ({aiConfig.model || 'custom'})</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Module Overview Header */}
      <div className="bg-[#111114] border border-[#27272A] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#1C1C21] text-[#F97316]">
              <Bot className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold font-mono text-zinc-100 tracking-wide uppercase">
              AI Flight Safety Analyst (17 NASA PSI Flight Records)
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Universal AI synthesis engine with support for Offline TF-IDF, Google Gemini, OpenAI, Anthropic Claude, and OpenAI-Compatible Custom Endpoints. Grounded in verified NASA PSI flight data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-emerald-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ZERO-HALLUCINATION RAG</span>
          </div>

          <button
            onClick={onOpenAiModal}
            className="hover:opacity-80 transition-opacity"
            title="Click to configure AI Provider"
          >
            {getActiveEngineBadge()}
          </button>
        </div>
      </div>

      {/* 4 One-Click Technical Prompt Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="group text-left p-2.5 rounded bg-[#111114] hover:bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 line-clamp-1">
              <Flame className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
              <span>{chip}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-200 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="space-y-3">
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#F97316] flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded p-4 space-y-3 border ${
                  isUser
                    ? 'bg-[#18181B] border-[#3F3F46] text-zinc-100'
                    : 'bg-[#111114] border-[#27272A] text-zinc-200'
                }`}
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-[#27272A] pb-1.5 text-[11px] font-mono text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2">
                    {isUser ? (
                      <>
                        <User className="w-3 h-3 text-zinc-400" />
                        <span>FLIGHT SAFETY ENGINEER</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-zinc-100 font-bold">NASA PSI SAFETY SYNTHESIS</span>
                        {msg.confidenceScore && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            {msg.confidenceScore}% RELEVANCE
                          </span>
                        )}

                        {/* Subtle Fallback Status Badge */}
                        {msg.usedFallback && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>FALLBACK: OFFLINE TF-IDF {msg.fallbackReason && `(${msg.fallbackReason})`}</span>
                          </span>
                        )}

                        {/* Provider Used Badge when not fallback */}
                        {!msg.usedFallback && msg.providerUsed && msg.providerUsed !== 'offline' && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono uppercase">
                            {msg.providerUsed}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Content */}
                <div className="text-xs sm:text-sm leading-relaxed font-sans text-zinc-200 space-y-2">
                  <RichText text={msg.content} onCite={exp => handleInspect?.(exp)} />
                </div>

                {/* Clickable PSI Citation Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#27272A] bg-[#09090B] p-2.5 rounded space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                        <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>VERIFIED FLIGHT CITATIONS:</span>
                      </span>
                      <button
                        onClick={() => copyText(msg.content, msg.id)}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Dossier</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((cite, cIdx) => {
                        const linkedExp = activeCitationsMap[cite.psiRecord] || activeCitationsMap[cite.id];

                        return (
                          <div
                            key={cIdx}
                            onClick={() => {
                              if (linkedExp && handleInspect) {
                                handleInspect(linkedExp);
                              }
                            }}
                            className={`p-2 rounded border border-[#27272A] bg-[#111114] text-[11px] font-mono transition-colors ${
                              linkedExp && handleInspect ? 'cursor-pointer hover:border-[#3B82F6]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[#3B82F6] font-bold">{cite.psiRecord}</span>
                              <span className="text-zinc-500 text-[10px]">{cite.id}</span>
                            </div>
                            <div className="text-zinc-300 font-semibold truncate">{cite.material}</div>
                            <div className="text-zinc-400 text-[10px] truncate">{cite.takeaway}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs font-mono text-zinc-400 bg-[#111114] border border-[#27272A] rounded p-3">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-ping" />
            <span>Consulting 17 NASA PSI flight records with {aiConfig.provider || 'offline TF-IDF'} engine...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="sticky bottom-2 z-20 bg-[#111114] border border-[#27272A] rounded p-2 flex items-center gap-2 shadow-lg">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask about microgravity combustion, BASS draft paradox, or Artemis atmospheres..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-3 py-1.5 rounded bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
