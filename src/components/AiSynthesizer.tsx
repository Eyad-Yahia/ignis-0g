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
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] border border-zinc-800 text-zinc-300 text-xs font-sans font-medium">
          <Cpu className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Offline TF-IDF (17 records)</span>
        </span>
      );
    }
    if (aiConfig.provider === 'gemini') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141B2D] text-[#3B82F6] border border-[#3B82F6]/30 text-xs font-sans font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini ({aiConfig.model || 'gemini-2.0-flash'})</span>
        </span>
      );
    }
    if (aiConfig.provider === 'openai') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12221A] text-emerald-400 border border-emerald-500/30 text-xs font-sans font-medium">
          <Zap className="w-3.5 h-3.5" />
          <span>OpenAI ({aiConfig.model || 'gpt-4o-mini'})</span>
        </span>
      );
    }
    if (aiConfig.provider === 'anthropic') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#251E14] text-amber-400 border border-amber-500/30 text-xs font-sans font-medium">
          <Bot className="w-3.5 h-3.5" />
          <span>Claude ({aiConfig.model || 'claude-3.5'})</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22160E] text-[#F97316] border border-[#F97316]/30 text-xs font-sans font-medium">
        <Server className="w-3.5 h-3.5" />
        <span>Custom ({aiConfig.model || 'custom'})</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Header — de-boxed & breathing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#18181B] border border-zinc-800 flex items-center justify-center text-[#F97316]">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold font-sans text-zinc-100 tracking-tight">
              AI Flight Safety Analyst
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Universal RAG synthesis engine grounded in 17 verified NASA PSI microgravity flight experiments. Zero hallucination tolerance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E0E12] border border-zinc-800 text-emerald-400 text-xs font-sans font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-hallucination RAG</span>
          </div>

          <button
            onClick={onOpenAiModal}
            className="hover:opacity-85 transition-opacity"
            title="Click to configure AI Provider"
          >
            {getActiveEngineBadge()}
          </button>
        </div>
      </div>

      {/* 4 One-Click Technical Prompt Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="group text-left p-3 rounded-xl bg-[#0E0E12] hover:bg-[#15151B] border border-zinc-800/70 hover:border-zinc-700 text-xs font-sans text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Flame className="w-3.5 h-3.5 text-[#F97316] flex-shrink-0" />
              <span className="truncate font-medium">{chip}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-200 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-zinc-800 flex items-center justify-center text-[#F97316] flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-xl p-5 space-y-3.5 border ${
                  isUser
                    ? 'bg-[#18181B] border-zinc-700/60 text-zinc-100 shadow-sm'
                    : 'bg-[#0E0E12] border-zinc-800/70 text-zinc-200 shadow-sm'
                }`}
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2 text-xs font-sans text-zinc-400">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {isUser ? (
                      <>
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-medium text-zinc-300">Flight Safety Engineer</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-zinc-100 font-semibold">NASA PSI Safety Synthesis</span>
                        {msg.confidenceScore && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-sans font-medium">
                            <span className="font-mono tabular-nums">{msg.confidenceScore}%</span> relevance
                          </span>
                        )}

                        {/* Subtle Fallback Status Badge */}
                        {msg.usedFallback && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] flex items-center gap-1 font-sans font-medium">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Fallback: Offline TF-IDF {msg.fallbackReason && `(${msg.fallbackReason})`}</span>
                          </span>
                        )}

                        {/* Provider Used Badge when not fallback */}
                        {!msg.usedFallback && msg.providerUsed && msg.providerUsed !== 'offline' && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-sans font-medium">
                            {msg.providerUsed}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="font-mono text-zinc-500 text-[11px] tabular-nums">{msg.timestamp}</span>
                </div>

                {/* Content */}
                <div className="text-xs sm:text-sm leading-relaxed font-sans text-zinc-200 space-y-2">
                  <RichText text={msg.content} onCite={exp => handleInspect?.(exp)} />
                </div>

                {/* Clickable PSI Citation Badges */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/70 bg-[#08080A] p-3.5 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-sans text-zinc-400">
                      <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                        <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>Verified flight citations</span>
                      </span>
                      <button
                        onClick={() => copyText(msg.content, msg.id)}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy dossier</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                            className={`p-3 rounded-lg border border-zinc-800 bg-[#101014] text-xs transition-colors ${
                              linkedExp && handleInspect ? 'cursor-pointer hover:border-[#3B82F6]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[#3B82F6] font-mono font-semibold">{cite.psiRecord}</span>
                              <span className="text-zinc-500 font-mono text-[10px]">{cite.id}</span>
                            </div>
                            <div className="text-zinc-200 font-sans font-medium truncate">{cite.material}</div>
                            <div className="text-zinc-400 font-sans text-xs truncate mt-0.5">{cite.takeaway}</div>
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
          <div className="flex gap-3 items-center text-xs font-sans text-zinc-400 bg-[#0E0E12] border border-zinc-800/70 rounded-xl p-4">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-ping" />
            <span>Consulting 17 NASA PSI flight records with {aiConfig.provider || 'offline TF-IDF'} engine...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="sticky bottom-3 z-20 bg-[#0E0E12]/95 backdrop-blur-md border border-zinc-800/80 rounded-xl p-2.5 flex items-center gap-3 shadow-2xl">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask about microgravity combustion, BASS draft paradox, or Artemis atmospheres..."
          className="flex-1 bg-transparent px-3 py-1.5 text-sm font-sans text-zinc-100 placeholder:text-zinc-500 outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 text-white text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
