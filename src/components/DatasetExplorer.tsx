import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  FileJson, 
  Flame, 
  X,
  Layers,
  BookOpen,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { nasaExperiments } from '../data/nasaExperiments';
import { NASAExperiment } from '../types';

interface DatasetExplorerProps {
  initialSelectedExperiment?: NASAExperiment | null;
  selectedExperiment?: NASAExperiment | null;
  onSelectExperiment?: (exp: NASAExperiment | null) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  initialSelectedExperiment,
  selectedExperiment: externalSelectedExp,
  onSelectExperiment
}) => {
  const [internalSelectedExp, setInternalSelectedExp] = useState<NASAExperiment | null>(
    initialSelectedExperiment || null
  );

  useEffect(() => {
    if (initialSelectedExperiment) {
      setInternalSelectedExp(initialSelectedExperiment);
    }
  }, [initialSelectedExperiment]);

  const activeExp = externalSelectedExp !== undefined ? externalSelectedExp : internalSelectedExp;

  const setActiveExp = (exp: NASAExperiment | null) => {
    if (onSelectExperiment) onSelectExperiment(exp);
    setInternalSelectedExp(exp);
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeExp) {
        setActiveExp(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeExp]);

  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [gravityFilter, setGravityFilter] = useState('ALL');
  const [provenanceFilter, setProvenanceFilter] = useState('ALL');

  // Filter options
  const programs = ['ALL', ...Array.from(new Set(nasaExperiments.map(e => e.program.split(' ')[0])))];
  const gravities = ['ALL', '0g', '0.16g', '0.38g', '1.0g'];
  const provenances = ['ALL', 'Published NASA Flight Data', 'NASA Ground/Drop-Tower Baseline'];

  const filteredExperiments = nasaExperiments.filter(e => {
    const matchesSearch = 
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.psiRecord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phenomenon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.finding.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProgram = programFilter === 'ALL' || e.program.includes(programFilter);
    const matchesGravity = gravityFilter === 'ALL' || e.gravity.includes(gravityFilter);
    const matchesProvenance = provenanceFilter === 'ALL' || e.provenance === provenanceFilter;

    return matchesSearch && matchesProgram && matchesGravity && matchesProvenance;
  });

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(nasaExperiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "nasa_psi_combustion_dataset.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "PSI_Record",
      "Program",
      "Provenance",
      "Material",
      "Gravity",
      "Oxygen_Percent",
      "Pressure_kPa",
      "Airflow_cm_s",
      "Spread_Rate_mm_s",
      "Peak_Temp_K",
      "Phenomenon",
      "Finding",
      "Safety_Guidance"
    ];
    const rows = nasaExperiments.map(e => [
      `"${e.id}"`,
      `"${e.psiRecord}"`,
      `"${e.program}"`,
      `"${e.provenance}"`,
      `"${e.material}"`,
      `"${e.gravity}"`,
      e.oxygenPercent,
      e.pressureKpa,
      e.airflowCmSec,
      e.flameSpreadRateMmSec,
      e.peakTempK,
      `"${e.phenomenon.replace(/"/g, '""')}"`,
      `"${e.finding.replace(/"/g, '""')}"`,
      `"${e.safetyRecommendation.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'nasa_psi_combustion_dataset.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-[#111114] border border-[#27272A] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#1C1C21] text-[#F97316]">
              <Database className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold font-mono text-zinc-100 tracking-wide uppercase">
              NASA Physical Sciences Informatics (PSI) Curated Dataset
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            17 authentic, verified combustion flight and ground experiments curated from the NASA PSI repository across Saffire, FLEX, BASS, ACME, SoFIE, BRE, and SLICE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 font-mono text-xs transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 font-mono text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111114] border border-[#27272A] rounded p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search record, fuel, phenomenon..."
            className="w-full pl-8 pr-3 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Program Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">Program:</span>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#F97316]"
          >
            {programs.map(p => (
              <option key={p} value={p}>{p === 'ALL' ? 'All Programs' : p}</option>
            ))}
          </select>
        </div>

        {/* Gravity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">Gravity:</span>
          <select
            value={gravityFilter}
            onChange={(e) => setGravityFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#F97316]"
          >
            {gravities.map(g => (
              <option key={g} value={g}>{g === 'ALL' ? 'All Gravities' : g}</option>
            ))}
          </select>
        </div>

        {/* Provenance Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">Provenance:</span>
          <select
            value={provenanceFilter}
            onChange={(e) => setProvenanceFilter(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-[#09090B] border border-[#27272A] text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#F97316]"
          >
            {provenances.map(pr => (
              <option key={pr} value={pr}>{pr === 'ALL' ? 'All Provenance' : pr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="bg-[#111114] border border-[#27272A] rounded overflow-hidden">
        <div className="p-3 border-b border-[#27272A] flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>Displaying <strong className="text-zinc-100">{filteredExperiments.length}</strong> of <strong className="text-zinc-100">{nasaExperiments.length}</strong> Verified Experiments</span>
          <span className="text-zinc-500 text-[11px]">Click row to open engineering dossier</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#09090B] border-b border-[#27272A] text-zinc-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">RECORD ID</th>
                <th className="py-2.5 px-3">PSI RECORD</th>
                <th className="py-2.5 px-3">PROVENANCE</th>
                <th className="py-2.5 px-3">MATERIAL SAMPLE</th>
                <th className="py-2.5 px-3">GRAVITY</th>
                <th className="py-2.5 px-3">O₂ %</th>
                <th className="py-2.5 px-3">PRESSURE</th>
                <th className="py-2.5 px-3">SPREAD RATE</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C21] text-zinc-300">
              {filteredExperiments.map(exp => (
                <tr
                  key={exp.id}
                  onClick={() => setActiveExp(exp)}
                  className="hover:bg-[#18181B] transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3 font-bold text-zinc-100 whitespace-nowrap">
                    {exp.id}
                  </td>
                  <td className="py-2.5 px-3 text-[#3B82F6] font-bold">
                    {exp.psiRecord}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      exp.provenance === 'Published NASA Flight Data'
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {exp.provenance === 'Published NASA Flight Data' ? 'Flight Data' : 'Ground Baseline'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-200">
                    {exp.material}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {exp.gravity}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums font-semibold text-zinc-100">
                    {exp.oxygenPercent.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    {exp.pressureKpa} kPa
                  </td>
                  <td className="py-2.5 px-3 tabular-nums font-bold text-[#F97316]">
                    {exp.flameSpreadRateMmSec.toFixed(2)} mm/s
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="px-2 py-1 rounded bg-[#18181B] text-zinc-400 group-hover:text-zinc-100 group-hover:bg-[#27272A] transition-colors text-[11px]">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Engineering Dossier Drawer — strict z-40 in hierarchy */}
      {activeExp && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveExp(null);
          }}
        >
          <div className="w-full max-w-xl bg-[#111114] border-l border-[#27272A] h-full overflow-y-auto p-6 space-y-5 font-mono shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#27272A]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
                    {activeExp.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                    {activeExp.psiRecord}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {activeExp.provenance}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-100 font-sans">
                  {activeExp.program}
                </h3>
              </div>
              <button
                onClick={() => setActiveExp(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quantitative Flight Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A]">
                <span className="text-[10px] text-zinc-500 block">GRAVITY REGIME:</span>
                <span className="text-zinc-200 font-bold">{activeExp.gravity}</span>
              </div>
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A]">
                <span className="text-[10px] text-zinc-500 block">OXYGEN FRACTION:</span>
                <span className="text-[#F97316] font-bold tabular-nums">{activeExp.oxygenPercent}% O₂</span>
              </div>
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A]">
                <span className="text-[10px] text-zinc-500 block">CABIN PRESSURE:</span>
                <span className="text-zinc-200 font-bold tabular-nums">{activeExp.pressureKpa} kPa</span>
              </div>
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A]">
                <span className="text-[10px] text-zinc-500 block">AIRFLOW VELOCITY:</span>
                <span className="text-zinc-200 font-bold tabular-nums">{activeExp.airflowCmSec} cm/s</span>
              </div>
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A]">
                <span className="text-[10px] text-zinc-500 block">FLAME SPREAD:</span>
                <span className="text-[#F97316] font-bold tabular-nums">{activeExp.flameSpreadRateMmSec} mm/s</span>
              </div>
              <div className="p-2.5 rounded bg-[#09090B] border border-[#27272A]">
                <span className="text-[10px] text-zinc-500 block">PEAK REACTION TEMP:</span>
                <span className="text-zinc-200 font-bold tabular-nums">{activeExp.peakTempK} K</span>
              </div>
            </div>

            {/* Material & Phenomenon */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 text-[10px] block">MATERIAL / FUEL SAMPLE:</span>
                <span className="text-zinc-200 font-semibold text-sm">{activeExp.material}</span>
                <span className="text-zinc-400 text-[11px] block mt-0.5">Category: {activeExp.materialCategory}</span>
              </div>

              <div>
                <span className="text-zinc-500 text-[10px] block">OBSERVED PHENOMENON:</span>
                <span className="text-zinc-200 font-semibold">{activeExp.phenomenon}</span>
              </div>
            </div>

            {/* Scientific Finding */}
            <div className="p-3.5 rounded bg-[#18181B] border border-[#27272A] space-y-1.5 text-xs font-sans">
              <span className="text-[10px] font-mono font-bold text-[#3B82F6] uppercase block">
                SCIENTIFIC TAKEAWAY & FLIGHT DISCOVERY:
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {activeExp.finding}
              </p>
            </div>

            {/* Safety Guidance */}
            <div className="p-3.5 rounded bg-[#18181B] border border-[#27272A] space-y-1.5 text-xs font-sans">
              <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block">
                NASA-STD-6001B ENGINEERING GUIDANCE:
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {activeExp.safetyRecommendation}
              </p>
            </div>

            {/* Facility & Citation */}
            <div className="pt-3 border-t border-[#27272A] text-[11px] space-y-1 text-zinc-400">
              <div>
                <span className="text-zinc-500">Facility: </span>
                <span className="text-zinc-300">{activeExp.facility}</span>
              </div>
              <div>
                <span className="text-zinc-500">Citation: </span>
                <span className="text-zinc-300">{activeExp.citation}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
