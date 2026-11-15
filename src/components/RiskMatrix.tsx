import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Droplets, 
  Flame, 
  Gauge, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Sliders, 
  Check, 
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { MissionPreset, MissionPresetId, MaterialRiskProfile } from '../types';

export const RiskMatrix: React.FC = () => {
  const missionPresets: MissionPreset[] = [
    {
      id: 'iss_nominal',
      name: 'ISS / Gateway Nominal',
      shortLabel: 'ISS / Gateway Nominal',
      oxygenPercent: 21.0,
      pressureKpa: 101.3,
      gravityG: 0.00001,
      gravityLabel: '0.0g Microgravity',
      description: 'Standard sea-level equivalent cabin atmosphere with continuous ECLSS forced circulation.',
      riskFactor: 'Moderate'
    },
    {
      id: 'artemis_exploration',
      name: 'Artemis Exploration Atmosphere (EVA Prep)',
      shortLabel: 'Artemis EVA Atmosphere',
      oxygenPercent: 34.0,
      pressureKpa: 56.5,
      gravityG: 0.16,
      gravityLabel: '0.16g Lunar Surface',
      description: 'NASA exploration baseline (34% O2 at 56.5 kPa / 8.2 psia) designed to eliminate pre-breathe times for surface EVAs.',
      riskFactor: 'Critical'
    },
    {
      id: 'orion_contingency',
      name: 'Orion / Transit Contingency',
      shortLabel: 'Orion / Transit Contingency',
      oxygenPercent: 26.5,
      pressureKpa: 70.3,
      gravityG: 0.00001,
      gravityLabel: '0.0g Microgravity',
      description: 'Intermediate pressure operating regime for lunar transit and atmospheric scrubbing phases.',
      riskFactor: 'High'
    },
    {
      id: 'mars_surface',
      name: 'Mars Surface Habitat (Simulated)',
      shortLabel: 'Mars Surface Habitat',
      oxygenPercent: 26.0,
      pressureKpa: 70.3,
      gravityG: 0.38,
      gravityLabel: '0.38g Martian Gravity',
      description: 'Habitation atmosphere with ISRU recycled diluent and moderate partial pressure compensation.',
      riskFactor: 'High'
    }
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<MissionPresetId>('artemis_exploration');
  const activePreset = missionPresets.find(p => p.id === selectedPresetId)!;

  // Manual sliders initialized from preset
  const [o2Percent, setO2Percent] = useState<number>(activePreset.oxygenPercent);
  const [pressureKpa, setPressureKpa] = useState<number>(activePreset.pressureKpa);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('pmma');

  const handleSelectPreset = (preset: MissionPreset) => {
    setSelectedPresetId(preset.id);
    setO2Percent(preset.oxygenPercent);
    setPressureKpa(preset.pressureKpa);
  };

  const materialsCatalog = [
    {
      id: 'nomex',
      name: 'Nomex Flight Suit Fabric',
      category: 'Aramid Protective Textile',
      baseMoc: 18.5,
      baseFlameSpread: 0.42,
      toxicGas: 'Trace CO, Low Cyanide',
      soot: 'Negligible' as const,
      description: 'High-temperature aromatic polyamide. In microgravity, charring and radiative heat loss promote self-extinction below 18.5% O2 [NASA-SAFFIRE-II-03].'
    },
    {
      id: 'pmma',
      name: 'PMMA Cast Acrylic Window',
      category: 'Structural Viewport Polymer',
      baseMoc: 17.0,
      baseFlameSpread: 2.45,
      toxicGas: 'Methyl Methacrylate, Dense CO',
      soot: 'Severe' as const,
      description: 'Transparent acrylic. At reduced pressure (56.5 kPa) and elevated O2 (34%), undergoes severe surface boiling, emitting floating molten polymer droplets [NASA-SAFFIRE-IV-02].'
    },
    {
      id: 'xlpe',
      name: 'XLPE Copper Wiring Harness',
      category: 'Avionics Wire Insulation',
      baseMoc: 16.5,
      baseFlameSpread: 0.95,
      toxicGas: 'Acidic Vapors, Carbon Black',
      soot: 'High' as const,
      description: 'Cross-linked polyethylene. Copper conductor conducts core heat ahead of the reaction zone, maximizing propagation under ventilation flows [NASA-SoFIE-01].'
    },
    {
      id: 'sibal',
      name: 'SIBAL Cotton-Fiberglass Blend',
      category: 'Standard NASA Fabric Matrix',
      baseMoc: 16.0,
      baseFlameSpread: 1.85,
      toxicGas: 'CO, CO2, Particulates',
      soot: 'Moderate' as const,
      description: 'Standard 75/25 cotton-fiberglass research blend used across Saffire flight missions to characterize non-buoyant flame spread [NASA-SAFFIRE-I-01].'
    },
    {
      id: 'pu_foam',
      name: 'Polyurethane Seat Cushioning Foam',
      category: 'Porous Habitat Acoustic Core',
      baseMoc: 15.0,
      baseFlameSpread: 1.10,
      toxicGas: 'HCN, Isocyanates, High CO',
      soot: 'Severe' as const,
      description: 'Open-cell cushioning foam. Susceptible to invisible internal smoldering for hours before transitioning abruptly to open flaming under cabin air currents [NASA-SAFFIRE-VI-01].'
    }
  ];

  // Dynamic Flammability Calculator
  const evaluatedMaterials: MaterialRiskProfile[] = materialsCatalog.map(mat => {
    // Oxygen factor relative to 21%
    const o2Multiplier = Math.pow(o2Percent / 21.0, 1.35);
    // Pressure factor: reduced pressure slightly decreases spread rate for thin fuels but accelerates thick solid boiling
    const pressureMultiplier = Math.pow(pressureKpa / 101.3, 0.25);
    // Gravity penalty: 0.16g Moon and 0g with ventilation maintain sustained burns
    const gravityFactor = activePreset.gravityG === 0.16 ? 1.25 : 1.0;

    const flameSpreadRatePredicted = Number(
      (mat.baseFlameSpread * o2Multiplier * pressureMultiplier * gravityFactor).toFixed(2)
    );

    // Flammability Index (0 - 100)
    let flammabilityIndex = Math.min(
      100,
      Math.round(((o2Percent - mat.baseMoc) / (35 - mat.baseMoc)) * 75 + (flameSpreadRatePredicted / 4) * 25)
    );
    if (flammabilityIndex < 0) flammabilityIndex = 5;

    let riskLevel: MaterialRiskProfile['riskLevel'] = 'LOW';
    let std6001Status: MaterialRiskProfile['std6001Status'] = 'Pass (Flight Certified)';
    let mitigationProtocol = 'Standard isolation & passive ECLSS monitoring.';

    if (flammabilityIndex >= 70 || (mat.id === 'pmma' && o2Percent >= 28)) {
      riskLevel = 'CRITICAL';
      std6001Status = 'Fail (Prohibited)';
      mitigationProtocol = 'Mandatory intumescent flame-retardant barrier + Fine Water Mist auto-nozzle curtain.';
    } else if (flammabilityIndex >= 45) {
      riskLevel = 'HIGH';
      std6001Status = 'Marginal (Conditional)';
      mitigationProtocol = 'Enclosed avionics bay containment with catalytic CO sniffer.';
    } else if (flammabilityIndex >= 25) {
      riskLevel = 'MODERATE';
      std6001Status = 'Pass (Flight Certified)';
      mitigationProtocol = 'Distance segregation >15 cm from high-power distribution buses.';
    }

    return {
      id: mat.id,
      name: mat.name,
      category: mat.category,
      baseMoc: mat.baseMoc,
      flameSpreadRatePredicted,
      flammabilityIndex,
      riskLevel,
      toxicByproducts: mat.toxicGas,
      sootTendency: mat.soot,
      std6001Status,
      mitigationProtocol
    };
  });

  const selectedMaterial = evaluatedMaterials.find(m => m.id === selectedMaterialId)!;
  const rawSelectedMaterial = materialsCatalog.find(m => m.id === selectedMaterialId)!;

  return (
    <div className="space-y-4">
      {/* Module Title Strip */}
      <div className="bg-[#111114] border border-[#27272A] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#1C1C21] text-[#F97316]">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-semibold font-mono text-zinc-100 tracking-wide uppercase">
              Spacecraft Material Risk Matrix & Suppression Benchmark
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans">
            Evaluates material flammability under standardized NASA exploration atmospheres and benchmarks suppression efficacy referencing NASA-STD-6001B.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>METHODOLOGY: NASA-STD-6001B</span>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {missionPresets.map(preset => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded text-left transition-all border ${
                isSelected
                  ? 'bg-[#18181B] border-[#F97316] text-zinc-100 shadow-sm'
                  : 'bg-[#111114] border-[#27272A] text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-semibold uppercase text-zinc-200">
                  {preset.shortLabel}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  preset.riskFactor === 'Critical'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : preset.riskFactor === 'High'
                    ? 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {preset.riskFactor}
                </span>
              </div>
              <div className="font-mono text-xs text-zinc-300 flex items-center gap-2 tabular-nums">
                <span className="text-[#F97316] font-bold">{preset.oxygenPercent}% O₂</span>
                <span>•</span>
                <span>{preset.pressureKpa} kPa</span>
                <span>•</span>
                <span className="text-[#3B82F6]">{preset.gravityLabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Atmospheric Tuning Sliders */}
      <div className="bg-[#111114] border border-[#27272A] rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#F97316]" />
              <span>OXYGEN CONCENTRATION:</span>
            </span>
            <span className="text-zinc-100 font-bold tabular-nums">{o2Percent.toFixed(1)}% O₂</span>
          </div>
          <input
            type="range"
            min="16"
            max="36"
            step="0.5"
            value={o2Percent}
            onChange={(e) => setO2Percent(Number(e.target.value))}
            className="w-full accent-[#F97316] cursor-pointer bg-[#27272A] h-1.5 rounded"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>16% (Extinction Limit)</span>
            <span>21% (Nominal)</span>
            <span className="text-[#F97316]">34% (Artemis Baseline)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>CABIN TOTAL PRESSURE:</span>
            </span>
            <span className="text-zinc-100 font-bold tabular-nums">{pressureKpa.toFixed(1)} kPa</span>
          </div>
          <input
            type="range"
            min="50"
            max="102"
            step="0.5"
            value={pressureKpa}
            onChange={(e) => setPressureKpa(Number(e.target.value))}
            className="w-full accent-[#3B82F6] cursor-pointer bg-[#27272A] h-1.5 rounded"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span className="text-[#3B82F6]">56.5 kPa (Artemis 8.2 psia)</span>
            <span>70.3 kPa (Orion)</span>
            <span>101.3 kPa (1 atm)</span>
          </div>
        </div>
      </div>

      {/* Materials Flammability Table */}
      <div className="bg-[#111114] border border-[#27272A] rounded overflow-hidden">
        <div className="p-3 border-b border-[#27272A] flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">
            NASA-STD-6001B Material Flammability Assessment
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Current Atmosphere: <strong className="text-zinc-200">{o2Percent}% O₂ / {pressureKpa} kPa</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#09090B] text-zinc-400 border-b border-[#27272A] text-[11px]">
              <tr>
                <th className="py-2.5 px-3">MATERIAL NAME</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">PREDICTED SPREAD</th>
                <th className="py-2.5 px-3">FLAMMABILITY INDEX</th>
                <th className="py-2.5 px-3">RISK LEVEL</th>
                <th className="py-2.5 px-3">STD-6001 STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C21] text-zinc-300">
              {evaluatedMaterials.map(mat => {
                const isSelected = mat.id === selectedMaterialId;
                return (
                  <tr
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#18181B] text-zinc-100' : 'hover:bg-[#141418]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-zinc-100 flex items-center gap-2">
                      <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F97316]' : 'text-zinc-500'}`} />
                      <span>{mat.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 text-[11px]">{mat.category}</td>
                    <td className="py-2.5 px-3 font-bold tabular-nums">
                      {mat.flameSpreadRatePredicted.toFixed(2)} mm/s
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#27272A] rounded overflow-hidden">
                          <div
                            className={`h-full ${
                              mat.flammabilityIndex >= 70 ? 'bg-red-500' : mat.flammabilityIndex >= 45 ? 'bg-[#F97316]' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${mat.flammabilityIndex}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-zinc-400">{mat.flammabilityIndex}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mat.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : mat.riskLevel === 'HIGH'
                          ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {mat.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <span className={mat.std6001Status.startsWith('Pass') ? 'text-emerald-400' : mat.std6001Status.startsWith('Fail') ? 'text-red-400' : 'text-[#F97316]'}>
                        {mat.std6001Status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        className={`px-2 py-1 rounded text-[11px] transition-colors ${
                          isSelected ? 'bg-[#F97316] text-white font-semibold' : 'bg-[#1C1C21] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Material Deep-Dive & Suppression Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Material Dossier */}
        <div className="bg-[#111114] border border-[#27272A] rounded p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
            <span className="font-semibold text-zinc-200 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F97316]" />
              Engineering Hazard Dossier: {selectedMaterial.name}
            </span>
            <span className="text-[10px] text-zinc-500">MOC: {selectedMaterial.baseMoc}% O₂</span>
          </div>

          <p className="text-zinc-300 font-sans leading-relaxed text-xs">
            {rawSelectedMaterial.description}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1C1C21] text-[11px]">
            <div>
              <span className="text-zinc-500 block">TOXIC OFFGASSING:</span>
              <span className="text-red-400 font-semibold">{selectedMaterial.toxicByproducts}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">SOOT PROPENSITY:</span>
              <span className="text-amber-400 font-semibold">{selectedMaterial.sootTendency}</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#18181B] border border-[#27272A] rounded">
            <span className="text-zinc-400 text-[10px] block mb-1">MANDATED MITIGATION PROTOCOL:</span>
            <span className="text-zinc-200 text-xs font-sans leading-snug">
              {selectedMaterial.mitigationProtocol}
            </span>
          </div>
        </div>

        {/* Right: Fine Water Mist vs CO2 Benchmark */}
        <div className="bg-[#111114] border border-[#27272A] rounded p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
            <span className="font-semibold text-zinc-200 uppercase flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />
              Suppression Benchmark: Water Mist vs. CO₂
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              2.26 MJ/kg LATENT HEAT QUENCHING
            </span>
          </div>

          <div className="space-y-2 text-[11px] font-sans">
            <div className="p-2.5 rounded bg-[#18181B] border border-[#27272A]">
              <div className="text-emerald-400 font-mono font-semibold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                NASA SoFIE Fine Water Mist (Recommended)
              </div>
              <ul className="text-zinc-300 space-y-1 list-disc list-inside">
                <li><strong className="text-zinc-100">Zero Gravity Settling:</strong> Sub-millimeter droplets remain suspended in convective air, achieving 100% phase-change vaporization inside the flame envelope.</li>
                <li><strong className="text-zinc-100">2.26 MJ/kg Heat Extraction:</strong> High latent heat of vaporization rapidly quenches reaction temperatures below the pyrolysis threshold.</li>
                <li><strong className="text-zinc-100">ECLSS Closed-Loop Recovery:</strong> Vaporized mist is reclaimed by condensing heat exchangers, producing potable water rather than depleting cabin oxygen or contaminating filters.</li>
              </ul>
            </div>

            <div className="p-2.5 rounded bg-[#18181B] border border-[#27272A]">
              <div className="text-red-400 font-mono font-semibold mb-1 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Legacy Carbon Dioxide (CO₂) Flooding Hazards
              </div>
              <ul className="text-zinc-400 space-y-1 list-disc list-inside">
                <li>Induces rapid cabin hypercapnia (&gt;4% CO₂), requiring crew to immediately don emergency breathing masks.</li>
                <li>Exhausts consumable LiOH / CDRA scrubbing canisters, compromising ECLSS duration.</li>
                <li>High-velocity discharge jet risks dispersing molten droplets across microgravity bays.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
