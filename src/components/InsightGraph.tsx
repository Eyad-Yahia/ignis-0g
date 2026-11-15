import React, { useState } from 'react';
import { 
  Network, 
  TrendingUp, 
  Zap, 
  Layers
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  ReferenceArea, 
  Legend 
} from 'recharts';
import { nasaExperiments } from '../data/nasaExperiments';
import { NASAExperiment } from '../types';

interface InsightGraphProps {
  onSelectExperiment?: (exp: NASAExperiment) => void;
  onOpenExperimentModal?: (exp: NASAExperiment) => void;
}

export const InsightGraph: React.FC<InsightGraphProps> = ({ 
  onSelectExperiment,
  onOpenExperimentModal 
}) => {
  const handleInspect = onSelectExperiment || onOpenExperimentModal;
  const [selectedRegimeFilter, setSelectedRegimeFilter] = useState<string>('ALL');

  // Grouped datasets
  const zeroGData = nasaExperiments.filter(e => e.gravityG < 0.05).map(e => ({
    x: e.oxygenPercent,
    y: e.flameSpreadRateMmSec,
    z: e.peakTempK,
    ...e
  }));

  const lunarData = nasaExperiments.filter(e => e.gravityG >= 0.05 && e.gravityG < 0.25).map(e => ({
    x: e.oxygenPercent,
    y: e.flameSpreadRateMmSec,
    z: e.peakTempK,
    ...e
  }));

  const marsData = nasaExperiments.filter(e => e.gravityG >= 0.25 && e.gravityG < 0.7).map(e => ({
    x: e.oxygenPercent,
    y: e.flameSpreadRateMmSec,
    z: e.peakTempK,
    ...e
  }));

  const earthData = nasaExperiments.filter(e => e.gravityG >= 0.7).map(e => ({
    x: e.oxygenPercent,
    y: e.flameSpreadRateMmSec,
    z: e.peakTempK,
    ...e
  }));

  // Chart B: Airflow Velocity vs Combustion Sustainability Profile
  const airflowProfileData = [
    { velocity: 0, zeroG_sustainability: 0, earth_sustainability: 45, label: '0 cm/s (Suffocation in 0g)' },
    { velocity: 2.5, zeroG_sustainability: 75, earth_sustainability: 52, label: '2.5 cm/s (Critical Draft)' },
    { velocity: 5.0, zeroG_sustainability: 95, earth_sustainability: 65, label: '5.0 cm/s (Peak Flame Spread)' },
    { velocity: 10.0, zeroG_sustainability: 98, earth_sustainability: 78, label: '10.0 cm/s (Optimal Saffire Flow)' },
    { velocity: 15.0, zeroG_sustainability: 85, earth_sustainability: 88, label: '15.0 cm/s (Boundary Limit)' },
    { velocity: 20.0, zeroG_sustainability: 50, earth_sustainability: 94, label: '20.0 cm/s (Convective Blowoff)' },
    { velocity: 25.0, zeroG_sustainability: 25, earth_sustainability: 98, label: '25.0 cm/s' },
    { velocity: 30.0, zeroG_sustainability: 10, earth_sustainability: 100, label: '30.0 cm/s (Quenched in 0g)' }
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#111114] border border-[#27272A] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#1C1C21] text-[#F97316]">
              <Network className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold font-mono text-zinc-100 tracking-wide uppercase">
              Cross-Experiment Telemetry Correlation & Anomaly Graph
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Multi-axis correlation across 17 verified NASA PSI flight experiments. Visualizes flame spread kinetics, ventilation thresholds, and non-buoyant combustion limits.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#3B82F6]">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> 0.0g ISS
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> 0.16g Moon
          </span>
          <span className="flex items-center gap-1.5 text-[#F97316]">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" /> 0.38g Mars
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 1.0g Earth
          </span>
        </div>
      </div>

      {/* Grid of Two Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart A: Multi-Axis Scatter Plot */}
        <div className="bg-[#111114] border border-[#27272A] rounded p-4 space-y-3">
          <div className="border-b border-[#27272A] pb-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                Flame Spread Rate vs. Oxygen Concentration
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                X: Oxygen (%) • Y: Spread Rate (mm/s) • Point Size: Peak Temp (K)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Oxygen Concentration"
                  unit="%"
                  domain={[16, 36]}
                  stroke="#52525B"
                  tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Flame Spread Rate"
                  unit=" mm/s"
                  domain={[0, 9]}
                  stroke="#52525B"
                  tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Peak Temp" unit="K" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#52525B' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as NASAExperiment;
                      return (
                        <div className="bg-[#09090B] border border-[#27272A] p-2.5 rounded font-mono text-xs shadow-2xl space-y-1">
                          <div className="text-[#3B82F6] font-bold">{data.id} ({data.psiRecord})</div>
                          <div className="text-zinc-200 font-semibold">{data.material}</div>
                          <div className="text-zinc-400 text-[11px]">
                            Regime: <span className="text-zinc-200">{data.gravity}</span>
                          </div>
                          <div className="text-zinc-400 text-[11px] tabular-nums">
                            Spread: <span className="text-[#F97316] font-bold">{data.flameSpreadRateMmSec} mm/s</span> | Temp: {data.peakTempK}K
                          </div>
                          <div className="text-[10px] text-zinc-500 pt-1 border-t border-[#27272A]">
                            Click point to inspect engineering dossier
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name="0.0g Microgravity"
                  data={zeroGData}
                  fill="#3B82F6"
                  onClick={(data: any) => handleInspect && data?.payload && handleInspect(data.payload as NASAExperiment)}
                  cursor="pointer"
                />
                <Scatter
                  name="0.16g Lunar"
                  data={lunarData}
                  fill="#818CF8"
                  onClick={(data: any) => handleInspect && data?.payload && handleInspect(data.payload as NASAExperiment)}
                  cursor="pointer"
                />
                <Scatter
                  name="0.38g Martian"
                  data={marsData}
                  fill="#F97316"
                  onClick={(data: any) => handleInspect && data?.payload && handleInspect(data.payload as NASAExperiment)}
                  cursor="pointer"
                />
                <Scatter
                  name="1.0g Terrestrial"
                  data={earthData}
                  fill="#FBBF24"
                  onClick={(data: any) => handleInspect && data?.payload && handleInspect(data.payload as NASAExperiment)}
                  cursor="pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1C1C21]">
            <span>Microgravity points form a lower plateau due to pure diffusion limits</span>
            <span className="text-[#F97316] font-bold">Artemis 34% O₂ (BRE-02): {nasaExperiments.find(e => e.id === 'NASA-BRE-02')?.flameSpreadRateMmSec} mm/s</span>
          </div>
        </div>

        {/* Chart B: Airflow Velocity vs Combustion Sustainability Profile */}
        <div className="bg-[#111114] border border-[#27272A] rounded p-4 space-y-3">
          <div className="border-b border-[#27272A] pb-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Airflow Velocity vs. Combustion Sustainability
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Shaded Zone (2.5–15 cm/s): Forced Convection Survival Window in 0g
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={airflowProfileData} margin={{ top: 15, right: 15, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis
                  dataKey="velocity"
                  name="Airflow Velocity"
                  unit=" cm/s"
                  stroke="#52525B"
                  tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis
                  unit="%"
                  stroke="#52525B"
                  tick={{ fill: '#A1A1AA', fontSize: 11, fontFamily: 'monospace' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />

                <ReferenceArea
                  x1={2.5}
                  x2={15.0}
                  fill="#3B82F6"
                  fillOpacity={0.08}
                  stroke="#3B82F6"
                  strokeOpacity={0.3}
                  strokeDasharray="3 3"
                />

                <Area
                  type="monotone"
                  dataKey="zeroG_sustainability"
                  name="0g Flame Sustainability (%)"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="earth_sustainability"
                  name="1g Earth Baseline (%)"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1C1C21]">
            <span className="text-red-400">At 0 cm/s: Flame suffocates (BASS Paradox)</span>
            <span className="text-emerald-400 font-bold">2.5–15 cm/s: Sustainable forced burn</span>
            <span className="text-zinc-500">&gt;20 cm/s: Convective blow-off</span>
          </div>
        </div>
      </div>

      {/* Discovered NASA Flight Anomalies Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded bg-[#111114] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F97316] font-bold">ANOMALY 01</span>
            <span className="px-1.5 py-0.2 rounded bg-[#18181B] text-zinc-400 text-[10px]">NASA SAFFIRE-I</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-100">The Saffire Ventilation Paradox</h4>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            In microgravity, maximum flammability occurs at modest forced airflow (10-15 cm/s), not zero and not maximum flow. Zero flow suffocates the flame in stagnant CO₂, while high flow convectively cools it.
          </p>
        </div>

        <div className="p-3.5 rounded bg-[#111114] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-indigo-400 font-bold">ANOMALY 02</span>
            <span className="px-1.5 py-0.2 rounded bg-[#18181B] text-zinc-400 text-[10px]">NASA FLEX-ICE</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-100">Low-Oxygen Cool Flame Longevity</h4>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Reducing ambient O₂ to 18% extends low-temperature cool flame duration due to reduced radiative and thermal quenching of intermediate peroxy radicals [NASA-FLEX-03].
          </p>
        </div>

        <div className="p-3.5 rounded bg-[#111114] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-bold">ANOMALY 03</span>
            <span className="px-1.5 py-0.2 rounded bg-[#18181B] text-zinc-400 text-[10px]">NASA SLICE / ACME</span>
          </div>
          <h4 className="text-xs font-bold text-zinc-100">Soot Super-Aggregation & High CO</h4>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Absence of buoyant acceleration prolongs soot particle residence times. Soot aggregates into large branched chain structures, impeding oxygen and dramatically elevating carbon monoxide off-gassing.
          </p>
        </div>
      </div>
    </div>
  );
};
