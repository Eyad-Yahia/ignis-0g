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
    <div className="space-y-6">
      {/* Header Banner — de-boxed & breathing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#18181B] border border-zinc-800 flex items-center justify-center text-[#F97316]">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold font-sans text-zinc-100 tracking-tight">
              NASA Physical Sciences Informatics (PSI) Curated Dataset
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans leading-relaxed">
            17 authentic, verified combustion flight and ground experiments curated from the NASA PSI repository across Saffire, FLEX, BASS, ACME, SoFIE, BRE, and SLICE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101014] hover:bg-[#18181B] border border-zinc-800 text-zinc-200 font-sans text-xs font-medium transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101014] hover:bg-[#18181B] border border-zinc-800 text-zinc-200 font-sans text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search record, fuel, phenomenon..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs font-sans text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Program Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-zinc-400 whitespace-nowrap">Program:</span>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs font-sans text-zinc-200 focus:outline-none focus:border-[#F97316]"
          >
            {programs.map(p => (
              <option key={p} value={p}>{p === 'ALL' ? 'All Programs' : p}</option>
            ))}
          </select>
        </div>

        {/* Gravity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-zinc-400 whitespace-nowrap">Gravity:</span>
          <select
            value={gravityFilter}
            onChange={(e) => setGravityFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs font-sans text-zinc-200 focus:outline-none focus:border-[#F97316]"
          >
            {gravities.map(g => (
              <option key={g} value={g}>{g === 'ALL' ? 'All Gravities' : g}</option>
            ))}
          </select>
        </div>

        {/* Provenance Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-zinc-400 whitespace-nowrap">Provenance:</span>
          <select
            value={provenanceFilter}
            onChange={(e) => setProvenanceFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#09090B] border border-zinc-800 text-xs font-sans text-zinc-200 focus:outline-none focus:border-[#F97316]"
          >
            {provenances.map(pr => (
              <option key={pr} value={pr}>{pr === 'ALL' ? 'All Provenance' : pr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800/70 flex items-center justify-between text-xs font-sans text-zinc-400">
          <span>Displaying <strong className="text-zinc-100 font-mono tabular-nums">{filteredExperiments.length}</strong> of <strong className="text-zinc-100 font-mono tabular-nums">{nasaExperiments.length}</strong> verified experiments</span>
          <span className="text-zinc-500 text-xs">Click row to open engineering dossier</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#09090B] border-b border-zinc-800/70 text-zinc-400 text-xs font-medium">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">PSI Record</th>
                <th className="py-3 px-4">Provenance</th>
                <th className="py-3 px-4">Material sample</th>
                <th className="py-3 px-4">Gravity</th>
                <th className="py-3 px-4">O₂ %</th>
                <th className="py-3 px-4">Pressure</th>
                <th className="py-3 px-4">Spread rate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {filteredExperiments.map(exp => (
                <tr
                  key={exp.id}
                  onClick={() => setActiveExp(exp)}
                  className="hover:bg-[#16161C] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-100 whitespace-nowrap">
                    {exp.id}
                  </td>
                  <td className="py-3 px-4 text-[#3B82F6] font-mono font-semibold">
                    {exp.psiRecord}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                      exp.provenance === 'Published NASA Flight Data'
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {exp.provenance === 'Published NASA Flight Data' ? 'Flight Data' : 'Ground Baseline'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-200 font-medium">
                    {exp.material}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-zinc-400">
                    {exp.gravity}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-zinc-100">
                    {exp.oxygenPercent.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-zinc-300">
                    {exp.pressureKpa} kPa
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#F97316]">
                    {exp.flameSpreadRateMmSec.toFixed(2)} mm/s
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-2.5 py-1 rounded-md bg-[#18181B] text-zinc-400 group-hover:text-zinc-100 group-hover:bg-[#27272A] transition-colors text-xs font-sans">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Engineering Dossier Drawer — strict z-50 in hierarchy */}
      {activeExp && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveExp(null);
          }}
        >
          <div className="w-full max-w-xl bg-[#0E0E12] border-l border-zinc-800/80 h-full overflow-y-auto p-6 space-y-6 font-sans shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800/70">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30">
                    {activeExp.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                    {activeExp.psiRecord}
                  </span>
                  <span className="text-xs text-zinc-400 font-sans">
                    {activeExp.provenance}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 font-sans tracking-tight">
                  {activeExp.program}
                </h3>
              </div>
              <button
                onClick={() => setActiveExp(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quantitative Flight Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#08080A] border border-zinc-800/70">
                <span className="text-[11px] font-sans text-zinc-400 block mb-0.5">Gravity regime</span>
                <span className="text-zinc-200 font-medium font-sans">{activeExp.gravity}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#08080A] border border-zinc-800/70">
                <span className="text-[11px] font-sans text-zinc-400 block mb-0.5">Oxygen fraction</span>
                <span className="text-[#F97316] font-semibold font-mono tabular-nums">{activeExp.oxygenPercent}% O₂</span>
              </div>
              <div className="p-3 rounded-lg bg-[#08080A] border border-zinc-800/70">
                <span className="text-[11px] font-sans text-zinc-400 block mb-0.5">Cabin pressure</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums">{activeExp.pressureKpa} kPa</span>
              </div>
              <div className="p-3 rounded-lg bg-[#08080A] border border-zinc-800/70">
                <span className="text-[11px] font-sans text-zinc-400 block mb-0.5">Airflow velocity</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums">{activeExp.airflowCmSec} cm/s</span>
              </div>
              <div className="p-3 rounded-lg bg-[#08080A] border border-zinc-800/70">
                <span className="text-[11px] font-sans text-zinc-400 block mb-0.5">Flame spread</span>
                <span className="text-[#F97316] font-semibold font-mono tabular-nums">{activeExp.flameSpreadRateMmSec} mm/s</span>
              </div>
              <div className="p-3 rounded-lg bg-[#08080A] border border-zinc-800/70">
                <span className="text-[11px] font-sans text-zinc-400 block mb-0.5">Peak reaction temp</span>
                <span className="text-zinc-200 font-semibold font-mono tabular-nums">{activeExp.peakTempK} K</span>
              </div>
            </div>

            {/* Material & Phenomenon */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 text-xs font-sans block">Material sample</span>
                <span className="text-zinc-100 font-semibold text-sm font-sans mt-0.5 block">{activeExp.material}</span>
                <span className="text-zinc-400 text-xs font-sans block mt-0.5">Category: {activeExp.materialCategory}</span>
              </div>

              <div>
                <span className="text-zinc-400 text-xs font-sans block">Observed phenomenon</span>
                <span className="text-zinc-200 font-medium font-sans mt-0.5 block">{activeExp.phenomenon}</span>
              </div>
            </div>

            {/* Scientific Finding */}
            <div className="p-4 rounded-xl bg-[#141419] border border-zinc-800/70 space-y-1.5 text-xs font-sans">
              <span className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider block font-sans">
                Scientific Takeaway & Discovery
              </span>
              <p className="text-zinc-300 leading-relaxed">
                {activeExp.finding}
              </p>
            </div>

            {/* Safety Guidance */}
            <div className="p-4 rounded-xl bg-[#141419] border border-zinc-800/70 space-y-1.5 text-xs font-sans">
              <span className="text-xs font-semibold text-[#F97316] uppercase tracking-wider block font-sans">
                NASA-STD-6001B Engineering Guidance
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {activeExp.safetyRecommendation}
              </p>
            </div>

            {/* Facility & Citation */}
            <div className="pt-3 border-t border-zinc-800/70 text-xs space-y-1.5 text-zinc-400 font-sans">
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
