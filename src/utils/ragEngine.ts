import { nasaExperiments } from '../data/nasaExperiments';
import { NASAExperiment, AIProviderConfig, AIProviderId } from '../types';

export interface GroundedRAGResponse {
  answerText: string;
  citations: Array<{ id: string; psiRecord: string; program: string; material: string; takeaway: string; experiment: NASAExperiment }>;
  confidenceScore: number; // retrieval relevance (0-100), NOT a truth probability
  providerUsed: AIProviderId;
  usedFallback?: boolean;
  fallbackReason?: string;
}

export const NASA_SYSTEM_PROMPT = `You are a spacecraft fire-safety analyst. Answer ONLY from the JSON corpus provided.
Cite every claim with its record ID in square brackets, e.g. [NASA-FLEX-01]. If the corpus does not contain the answer, say so explicitly.
Do not invent numbers. Prefer plain text with short bullet lines.`;

const STOP = new Set('the a an of in on at to is are was be for and or what why how does do did with by from as it its this that than into about can could should would me my tell show explain give please'.split(' '));

/** query token -> extra tokens that appear in the corpus */
const SYN: Record<string, string[]> = {
  moon: ['lunar', '0.16g', 'artemis'], lunar: ['moon', 'artemis'], artemis: ['lunar', 'exploration', 'reduced', 'pressure'],
  mars: ['martian', '0.38g'], earth: ['terrestrial', '1g', 'ground', 'baseline'], ground: ['terrestrial', 'baseline'],
  space: ['microgravity', '0g'], microgravity: ['0g'], iss: ['microgravity', 'cir', 'glovebox'],
  extinguish: ['suppression', 'mist', 'water', 'co2'], suppression: ['mist', 'water', 'extinguish'], mist: ['water', 'suppression', 'sofie'],
  invisible: ['cool', 'uv', 'non-luminous'], cool: ['flex', 'low-temperature', 'peroxy'], detector: ['sensor', 'optical'], sensor: ['detector', 'optical', 'co'],
  wire: ['xlpe', 'cable', 'copper'], cable: ['xlpe', 'wire', 'copper'], wiring: ['xlpe', 'cable', 'copper'], window: ['pmma', 'acrylic'],
  acrylic: ['pmma'], plastic: ['pmma', 'polymer', 'foam'], foam: ['polyurethane', 'smoldering'], smolder: ['smoldering'], smoldering: ['foam'],
  fabric: ['cotton', 'sibal', 'nomex'], cloth: ['fabric', 'cotton', 'nomex'], suit: ['nomex', 'fabric'], candle: ['bass', 'paraffin', 'wax'],
  draft: ['airflow', 'ventilation', 'bass'], ventilation: ['airflow', 'fan'], fan: ['airflow', 'ventilation'], airflow: ['ventilation', 'draft'],
  oxygen: ['o2'], o2: ['oxygen'], soot: ['smoke', 'radiative'], smoke: ['soot'], hydrogen: ['h2'], methane: ['ch4'], toxic: ['co', 'carbon'], poison: ['co', 'carbon'],
  still: ['stagnant', 'draft', 'bass', 'airflow'], stagnant: ['draft', 'bass', 'airflow'], die: ['extinguish', 'extinction'], extinction: ['extinguish', 'draft', 'bass'], fast: ['spread', 'rate'], speed: ['spread', 'rate'], temperature: ['peak', 'k'], hot: ['temperature', 'peak'], droplet: ['liquid', 'drop'], fuel: ['droplet', 'liquid'],
};

const norm = (t: string) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);
const tokenize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9.%\s-]/g, ' ').split(/\s+/).filter(t => t.length > 1 && !STOP.has(t)).map(norm);

interface Doc { exp: NASAExperiment; fields: Array<[Set<string>, number]> }
const toSet = (s: string) => new Set(tokenize(s));
const docs: Doc[] = nasaExperiments.map(exp => ({
  exp,
  fields: [
    [toSet(`${exp.id} ${exp.psiRecord} ${exp.program}`), 4],
    [toSet(exp.material), 3.5],
    [toSet(`${exp.phenomenon} ${exp.materialCategory} ${exp.gravity} ${exp.flameShape}`), 3],
    [toSet(`${exp.finding} ${exp.safetyRecommendation} ${exp.facility}`), 1.2],
    [toSet(exp.hasCoolFlame ? 'cool flame invisible low-temperature' : ''), 3],
  ],
}));
const df = new Map<string, number>();
docs.forEach(d => { const u = new Set<string>(); d.fields.forEach(([s]) => s.forEach(t => u.add(t))); u.forEach(t => df.set(t, (df.get(t) ?? 0) + 1)); });
const idf = (t: string) => Math.log(1 + docs.length / (1 + (df.get(t) ?? 0)));

const GRAV_WORDS: Array<[RegExp, number]> = [[/\b(moon|lunar|0\.16\s*g)\b/, 0.16], [/\b(mars|martian|0\.38\s*g)\b/, 0.38], [/\b(earth|terrestrial|1\s*g|1\.0\s*g|ground)\b/, 1], [/\b(microgravity|0\s*g|iss|space|zero-g)\b/, 0]];

function score(q: string, tokens: string[], d: Doc): number {
  let s = 0;
  const expanded = new Set(tokens);
  tokens.forEach(t => (SYN[t] ?? []).forEach(x => expanded.add(norm(x))));
  expanded.forEach(t => {
    const w = tokens.includes(t) ? 1 : 0.45;
    d.fields.forEach(([set, fw]) => { if (set.has(t)) s += fw * w * idf(t); });
  });
  const o2 = q.match(/(\d+(?:\.\d+)?)\s*%/); if (o2) s += 6 * Math.max(0, 1 - Math.abs(d.exp.oxygenPercent - +o2[1]) / 8);
  const kp = q.match(/(\d+(?:\.\d+)?)\s*kpa/); if (kp) s += 6 * Math.max(0, 1 - Math.abs(d.exp.pressureKpa - +kp[1]) / 40);
  GRAV_WORDS.forEach(([re, g]) => { if (re.test(q)) s += 4 * Math.max(0, 1 - Math.abs(Math.max(d.exp.gravityG, 0) - g) / 0.5); });
  return s;
}

const rank = (q: string) => {
  const tokens = tokenize(q);
  return docs.map(d => ({ exp: d.exp, s: score(q.toLowerCase(), tokens, d) })).sort((a, b) => b.s - a.s);
};

const cite = (e: NASAExperiment) => `[${e.id}] [${e.psiRecord}]`;
const env = (e: NASAExperiment) => `${e.gravity}, ${e.oxygenPercent}% O₂, ${e.pressureKpa} kPa, airflow ${e.airflowCmSec} cm/s`;
const metrics = (e: NASAExperiment) => `spread ${e.flameSpreadRateMmSec} mm/s, peak ${e.peakTempK} K, soot ${e.sootPpm} ppm`;
const ground = nasaExperiments.find(e => e.id === 'NASA-TERR-1G-01');
const ratio = (e: NASAExperiment) => ground && e.flameSpreadRateMmSec > 0 ? `${(e.flameSpreadRateMmSec / ground.flameSpreadRateMmSec).toFixed(2)}× the 1g baseline spread rate` : null;

const SUPERLATIVES: Array<[RegExp, string, (e: NASAExperiment) => number, string, boolean]> = [
  [/\b(fastest|highest spread|quickest|most rapid)\b/, 'Fastest flame spread', e => e.flameSpreadRateMmSec, 'mm/s', true],
  [/\b(hottest|highest temp\w*|peak temp\w*)\b/, 'Highest peak temperature', e => e.peakTempK, 'K', true],
  [/\b(coolest|lowest temp\w*)\b/, 'Lowest peak temperature', e => e.peakTempK, 'K', false],
  [/\b(lowest oxygen|least oxygen|minimum oxygen)\b/, 'Lowest oxygen concentration', e => e.oxygenPercent, '% O₂', false],
  [/\b(highest oxygen|most oxygen|oxygen-rich)\b/, 'Highest oxygen concentration', e => e.oxygenPercent, '% O₂', true],
  [/\b(sootiest|most soot|highest soot)\b/, 'Highest soot volume fraction', e => e.sootPpm, 'ppm', true],
];

export function queryDeterministicNASA(query: string): GroundedRAGResponse {
  const q = query.toLowerCase();
  const ranked = rank(q);
  const top = ranked[0];
  const toCitations = (list: NASAExperiment[]) => list.map(e => ({ id: e.id, psiRecord: e.psiRecord, program: e.program, material: e.material, takeaway: e.safetyRecommendation, experiment: e }));
  const conf = (s: number) => Math.round(Math.min(98, 35 + 63 * (s / (s + 10))) * 10) / 10;
  const note = 'Values are as encoded in the IGNIS-0G dataset; confirm against the cited PSI/NTRS source before engineering use.';

  // 1) Superlatives: computed straight from the dataset
  const sup = SUPERLATIVES.find(([re]) => re.test(q));
  if (sup) {
    const [, title, fn, unit, desc] = sup;
    const list = [...nasaExperiments].sort((a, b) => (desc ? fn(b) - fn(a) : fn(a) - fn(b))).slice(0, 4);
    const text = `### ${title} across ${nasaExperiments.length} records\n${list.map((e, i) => `- ${i + 1}. **${fn(e)} ${unit}** — ${e.material}, ${env(e)} ${cite(e)}`).join('\n')}\n- ${note}`;
    return { answerText: text, citations: toCitations(list.slice(0, 3)), confidenceScore: 92, providerUsed: 'offline', usedFallback: false };
  }

  // 2) Comparison: pick the best record for each side of "A vs B"
  const sides = q.split(/\b(?:vs\.?|versus|compared (?:to|with)|against|compare|and)\b/).map(s => s.trim()).filter(s => tokenize(s).length > 0);
  if (/\b(vs\.?|versus|compare|comparison|difference|differ|between|against)\b/.test(q) && sides.length >= 2) {
    const picks: NASAExperiment[] = [];
    sides.slice(0, 2).forEach(sd => { const r = rank(sd).find(x => !picks.includes(x.exp)); if (r) picks.push(r.exp); });
    if (picks.length === 2) {
      const [a, b] = picks;
      const diff = (k: 'flameSpreadRateMmSec' | 'peakTempK' | 'sootPpm', u: string) => `- **${k === 'flameSpreadRateMmSec' ? 'Spread rate' : k === 'peakTempK' ? 'Peak temperature' : 'Soot'}**: ${a[k]} ${u} vs ${b[k]} ${u}${a[k] && b[k] ? ` (ratio ${(a[k] / b[k]).toFixed(2)})` : ''}`;
      const text = `### Side-by-side: ${a.program} vs ${b.program}\n- **A — ${a.material}**: ${env(a)} ${cite(a)}\n- **B — ${b.material}**: ${env(b)} ${cite(b)}\n${diff('flameSpreadRateMmSec', 'mm/s')}\n${diff('peakTempK', 'K')}\n${diff('sootPpm', 'ppm')}\n### Findings\n- A: ${a.finding}\n- B: ${b.finding}\n- ${note}`;
      return { answerText: text, citations: toCitations(picks), confidenceScore: conf(Math.min(ranked.find(r => r.exp === a)?.s ?? 0, ranked.find(r => r.exp === b)?.s ?? 0) + 8), providerUsed: 'offline', usedFallback: false };
    }
  }

  // 3) Standard retrieval: best record + two related, built only from record fields
  const hits = ranked.filter(r => r.s > 0).slice(0, 3);
  const weak = top.s < 3;
  const primary = (hits[0] ?? top).exp;
  const related = (hits.length > 1 ? hits.slice(1) : ranked.slice(1, 3)).map(h => h.exp);
  const rr = ratio(primary);
  const lines = [
    weak ? `### Closest records for your question\n- No record matches your wording strongly, so these are the nearest by environment and phenomenon.` : `### ${primary.phenomenon}`,
    `- **Source**: ${primary.program} — ${primary.material} ${cite(primary)}`,
    `- **Conditions**: ${env(primary)}`,
    `- **Measured**: ${metrics(primary)}${rr ? ` — ${rr}` : ''}`,
    `- **Finding**: ${primary.finding}`,
    `- **Safety implication**: ${primary.safetyRecommendation}`,
    `### Related records`,
    ...related.map(e => `- ${e.phenomenon} (${env(e)}) ${cite(e)}`),
    `- ${note}`,
  ];
  return { answerText: lines.join('\n'), citations: toCitations([primary, ...related]), confidenceScore: conf(top.s), providerUsed: 'offline', usedFallback: false };
}

/**
 * Fetch wrapper with 15s timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Universal Multi-Provider AI Query Orchestrator
 * Supports:
 * 1. Offline TF-IDF (Zero API Key required)
 * 2. Google Gemini (gemini-2.0-flash or custom model)
 * 3. OpenAI (gpt-4o-mini / gpt-4o)
 * 4. Anthropic Claude (claude-3-5-sonnet-latest)
 * 5. OpenAI-Compatible Custom Endpoint (Groq, OpenRouter, DeepSeek, Mistral, Ollama)
 * Automatic graceful fallback to Offline TF-IDF with status badge.
 */
export async function queryHybridAI(
  query: string,
  configOrKey?: AIProviderConfig | string
): Promise<GroundedRAGResponse> {
  const local = queryDeterministicNASA(query);

  // Normalize configuration input
  let config: AIProviderConfig;
  if (!configOrKey) {
    return { ...local, providerUsed: 'offline', usedFallback: false };
  } else if (typeof configOrKey === 'string') {
    if (!configOrKey.trim()) {
      return { ...local, providerUsed: 'offline', usedFallback: false };
    }
    config = {
      provider: 'gemini',
      apiKey: configOrKey.trim(),
      model: 'gemini-2.0-flash',
      baseUrl: ''
    };
  } else {
    config = configOrKey;
  }

  // 1. Offline TF-IDF Analyst
  if (config.provider === 'offline' || !config.provider) {
    return { ...local, providerUsed: 'offline', usedFallback: false };
  }

  // Corpus for RAG context
  const corpus = nasaExperiments.map(e => ({
    id: e.id,
    psi: e.psiRecord,
    program: e.program,
    material: e.material,
    gravity: e.gravity,
    o2: e.oxygenPercent,
    kPa: e.pressureKpa,
    airflow: e.airflowCmSec,
    spread: e.flameSpreadRateMmSec,
    peakK: e.peakTempK,
    phenomenon: e.phenomenon,
    finding: e.finding
  }));

  try {
    // 2. Google Gemini
    if (config.provider === 'gemini') {
      if (!config.apiKey?.trim()) {
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: 'Gemini API key missing' };
      }
      const model = config.model?.trim() || 'gemini-2.0-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': config.apiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${NASA_SYSTEM_PROMPT}\n\nCORPUS:\n${JSON.stringify(corpus)}\n\nQUESTION: ${query}` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[IGNIS-0G] Gemini API returned ${res.status}:`, errText);
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: `Gemini HTTP ${res.status}` };
      }

      const data = await res.json();
      const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim()) {
        return {
          answerText: text.trim(),
          citations: local.citations,
          confidenceScore: local.confidenceScore,
          providerUsed: 'gemini',
          usedFallback: false
        };
      }
    }

    // 3. OpenAI (gpt-4o-mini / gpt-4o)
    else if (config.provider === 'openai') {
      if (!config.apiKey?.trim()) {
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: 'OpenAI API key missing' };
      }
      const model = config.model?.trim() || 'gpt-4o-mini';
      const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: NASA_SYSTEM_PROMPT },
            { role: 'user', content: `CORPUS:\n${JSON.stringify(corpus)}\n\nQUESTION: ${query}` }
          ],
          temperature: 0.1,
          max_tokens: 1200
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[IGNIS-0G] OpenAI API returned ${res.status}:`, errText);
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: `OpenAI HTTP ${res.status}` };
      }

      const data = await res.json();
      const text: string | undefined = data.choices?.[0]?.message?.content;
      if (text && text.trim()) {
        return {
          answerText: text.trim(),
          citations: local.citations,
          confidenceScore: local.confidenceScore,
          providerUsed: 'openai',
          usedFallback: false
        };
      }
    }

    // 4. Anthropic Claude (claude-3-5-sonnet-latest)
    else if (config.provider === 'anthropic') {
      if (!config.apiKey?.trim()) {
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: 'Anthropic API key missing' };
      }
      const model = config.model?.trim() || 'claude-3-5-sonnet-latest';
      const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          system: NASA_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: `CORPUS:\n${JSON.stringify(corpus)}\n\nQUESTION: ${query}` }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[IGNIS-0G] Anthropic API returned ${res.status}:`, errText);
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: `Anthropic HTTP ${res.status}` };
      }

      const data = await res.json();
      const text: string | undefined = data.content?.[0]?.text;
      if (text && text.trim()) {
        return {
          answerText: text.trim(),
          citations: local.citations,
          confidenceScore: local.confidenceScore,
          providerUsed: 'anthropic',
          usedFallback: false
        };
      }
    }

    // 5. OpenAI-Compatible Custom Endpoint (Groq, OpenRouter, DeepSeek, Mistral, Ollama)
    else if (config.provider === 'custom') {
      let endpoint = (config.baseUrl?.trim() || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint += '/chat/completions';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (config.apiKey?.trim()) {
        headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
      }

      const model = config.model?.trim() || 'llama-3.3-70b-versatile';
      const res = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: NASA_SYSTEM_PROMPT },
            { role: 'user', content: `CORPUS:\n${JSON.stringify(corpus)}\n\nQUESTION: ${query}` }
          ],
          temperature: 0.1,
          max_tokens: 1200
        })
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[IGNIS-0G] Custom Endpoint returned ${res.status}:`, errText);
        return { ...local, providerUsed: 'offline', usedFallback: true, fallbackReason: `Endpoint HTTP ${res.status}` };
      }

      const data = await res.json();
      const text: string | undefined = data.choices?.[0]?.message?.content || data.response || data.output;
      if (text && text.trim()) {
        return {
          answerText: text.trim(),
          citations: local.citations,
          confidenceScore: local.confidenceScore,
          providerUsed: 'custom',
          usedFallback: false
        };
      }
    }
  } catch (err: any) {
    console.warn(`[IGNIS-0G] Provider '${config.provider}' call failed; falling back to Offline TF-IDF Analyst.`, err);
    return {
      ...local,
      providerUsed: 'offline',
      usedFallback: true,
      fallbackReason: err?.name === 'AbortError' ? 'Request timed out (15s limit)' : err?.message || 'Network error'
    };
  }

  // Graceful fallback if no text parsed
  return {
    ...local,
    providerUsed: 'offline',
    usedFallback: true,
    fallbackReason: 'Empty response received from provider'
  };
}
