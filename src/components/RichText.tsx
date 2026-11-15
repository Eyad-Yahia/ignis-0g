import React from 'react';
import { nasaExperiments } from '../data/nasaExperiments';
import { NASAExperiment } from '../types';

const SUB: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄' };
const clean = (s: string) =>
  s
    .replace(/\$/g, '')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\approx/g, '≈')
    .replace(/\\\\/g, '')
    .replace(/([A-Za-z])_\{?(\d)\}?/g, (_m, a, d) => a + (SUB[d] ?? d));

const CITE = /^(NASA-[A-Za-z0-9-]+|PSI-[A-Z]{2}-\d+)$/;

export const findExperiment = (id: string): NASAExperiment | undefined =>
  nasaExperiments.find(e => e.id === id || e.psiRecord === id);

interface Props {
  text: string;
  onCite?: (exp: NASAExperiment) => void;
}

/** Renders a safe Markdown subset (headings, bullets, **bold**, [ID] citations) as JSX — no raw markup leaks. */
export const RichText: React.FC<Props> = ({ text, onCite }) => {
  const inline = (raw: string, key: string) =>
    clean(raw)
      .split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g)
      .filter(Boolean)
      .map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={`${key}-${i}`} className="text-zinc-50 font-semibold">{part.slice(2, -2)}</strong>;
        const m = part.match(/^\[([^\]]+)\]$/);
        if (m && CITE.test(m[1])) {
          const exp = findExperiment(m[1]);
          return (
            <button
              key={`${key}-${i}`}
              type="button"
              disabled={!exp}
              onClick={() => exp && onCite?.(exp)}
              className="mx-0.5 px-1.5 py-px rounded border border-sky-400/40 bg-sky-400/10 text-sky-300 font-mono text-[11px] hover:bg-sky-400/20 disabled:opacity-50 align-baseline"
            >
              {m[1]}
            </button>
          );
        }
        return <React.Fragment key={`${key}-${i}`}>{part}</React.Fragment>;
      });

  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return null;
        const h = t.match(/^#{1,4}\s+(.*)$/);
        if (h) return <h4 key={i} className="font-display font-semibold text-zinc-50 text-sm pt-1">{inline(h[1], `h${i}`)}</h4>;
        const b = t.match(/^[-*•]\s+(.*)$/) || t.match(/^\d+\.\s+(.*)$/);
        if (b)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-sky-400 select-none">▸</span>
              <span className="tabular-nums">{inline(b[1], `b${i}`)}</span>
            </div>
          );
        return <p key={i}>{inline(t, `p${i}`)}</p>;
      })}
    </div>
  );
};
