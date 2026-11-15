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
    <div className="space-y-6">
      {/* Module Header Section — de-boxed & breathing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-base font-semibold font-sans text-zinc-100 tracking-tight">
            Spacecraft Material Risk Matrix & Suppression Benchmark
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Evaluates material flammability under standardized exploration atmospheres and benchmarks suppression efficacy referencing NASA-STD-6001B.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-sans text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>NASA-STD-6001B methodology</span>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {missionPresets.map(preset => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-[#18181B] border-[#F97316] text-zinc-100 shadow-sm'
                  : 'bg-[#0E0E12] border-zinc-800/70 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans font-medium text-zinc-200">
                  {preset.shortLabel}
                </span>
                <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full border ${
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
                <span className="text-[#F97316] font-semibold">{preset.oxygenPercent}% O₂</span>
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
      <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans font-medium">
            <span className="text-zinc-300">Oxygen concentration</span>
            <span className="text-zinc-100 font-mono font-semibold tabular-nums">{o2Percent.toFixed(1)}% O₂</span>
          </div>
          <input
            type="range"
            min="16"
            max="36"
            step="0.5"
            value={o2Percent}
            onChange={(e) => setO2Percent(Number(e.target.value))}
            className="w-full accent-[#F97316] cursor-pointer bg-zinc-800 h-1.5 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-sans text-zinc-500">
            <span>16% (Extinction limit)</span>
            <span>21% (Nominal)</span>
            <span className="text-[#F97316]">34% (Artemis baseline)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-sans font-medium">
            <span className="text-zinc-300">Cabin total pressure</span>
            <span className="text-zinc-100 font-mono font-semibold tabular-nums">{pressureKpa.toFixed(1)} kPa</span>
          </div>
          <input
            type="range"
            min="50"
            max="102"
            step="0.5"
            value={pressureKpa}
            onChange={(e) => setPressureKpa(Number(e.target.value))}
            className="w-full accent-[#3B82F6] cursor-pointer bg-zinc-800 h-1.5 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-sans text-zinc-500">
            <span className="text-[#3B82F6]">56.5 kPa (Artemis 8.2 psia)</span>
            <span>70.3 kPa (Orion)</span>
            <span>101.3 kPa (1 atm)</span>
          </div>
        </div>
      </div>

      {/* Materials Flammability Table */}
      <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800/70 flex items-center justify-between">
          <span className="text-xs font-sans font-semibold text-zinc-200 uppercase tracking-wider">
            NASA-STD-6001B Material Flammability Assessment
          </span>
          <span className="text-xs font-sans text-zinc-400">
            Current atmosphere: <strong className="text-zinc-200 font-mono tabular-nums">{o2Percent}% O₂ / {pressureKpa} kPa</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#09090B] text-zinc-400 border-b border-zinc-800/70 text-xs">
              <tr>
                <th className="py-3 px-4 font-medium">Material</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Predicted spread</th>
                <th className="py-3 px-4 font-medium">Flammability index</th>
                <th className="py-3 px-4 font-medium">Risk level</th>
                <th className="py-3 px-4 font-medium">STD-6001 status</th>
                <th className="py-3 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
              {evaluatedMaterials.map(mat => {
                const isSelected = mat.id === selectedMaterialId;
                return (
                  <tr
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#18181B] text-zinc-100' : 'hover:bg-[#121216]'
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-zinc-100 flex items-center gap-2">
                      <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F97316]' : 'text-zinc-500'}`} />
                      <span>{mat.name}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-xs">{mat.category}</td>
                    <td className="py-3 px-4 font-mono font-semibold tabular-nums text-zinc-200">
                      {mat.flameSpreadRatePredicted.toFixed(2)} mm/s
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              mat.flammabilityIndex >= 70 ? 'bg-red-500' : mat.flammabilityIndex >= 45 ? 'bg-[#F97316]' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${mat.flammabilityIndex}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{mat.flammabilityIndex}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                        mat.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : mat.riskLevel === 'HIGH'
                          ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {mat.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-sans">
                      <span className={mat.std6001Status.startsWith('Pass') ? 'text-emerald-400' : mat.std6001Status.startsWith('Fail') ? 'text-red-400' : 'text-[#F97316]'}>
                        {mat.std6001Status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className={`px-2.5 py-1 rounded-md text-xs font-sans transition-colors ${
                          isSelected ? 'bg-[#F97316] text-white font-medium' : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Material Dossier */}
        <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl p-5 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
            <span className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">
              Engineering Hazard Dossier: {selectedMaterial.name}
            </span>
            <span className="text-xs font-mono text-zinc-400">MOC: <span className="font-semibold text-zinc-200">{selectedMaterial.baseMoc}% O₂</span></span>
          </div>

          <p className="text-zinc-300 font-sans leading-relaxed text-xs">
            {rawSelectedMaterial.description}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/40 text-xs">
            <div>
              <span className="text-zinc-400 font-medium block mb-1">Toxic offgassing</span>
              <span className="text-red-400 font-medium">{selectedMaterial.toxicByproducts}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-medium block mb-1">Soot propensity</span>
              <span className="text-amber-400 font-medium">{selectedMaterial.sootTendency}</span>
            </div>
          </div>

          <div className="p-3 bg-[#18181B] border border-zinc-800/70 rounded-lg">
            <span className="text-zinc-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Mandated Mitigation Protocol</span>
            <span className="text-zinc-200 text-xs font-sans leading-relaxed">
              {selectedMaterial.mitigationProtocol}
            </span>
          </div>
        </div>

        {/* Right: Fine Water Mist vs CO2 Benchmark */}
        <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl p-5 space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
            <span className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">
              Suppression Benchmark: Water Mist vs. CO₂
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-sans">
              2.26 MJ/kg Latent Heat Quenching
            </span>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="p-3 rounded-lg bg-[#18181B] border border-zinc-800/70">
              <div className="text-emerald-400 font-sans font-semibold mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                NASA SoFIE Fine Water Mist (Recommended)
              </div>
              <ul className="text-zinc-300 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong className="text-zinc-100">Zero Gravity Settling:</strong> Sub-millimeter droplets remain suspended in convective air, achieving 100% phase-change vaporization inside the flame envelope.</li>
                <li><strong className="text-zinc-100">2.26 MJ/kg Heat Extraction:</strong> High latent heat of vaporization rapidly quenches reaction temperatures below the pyrolysis threshold.</li>
                <li><strong className="text-zinc-100">ECLSS Closed-Loop Recovery:</strong> Vaporized mist is reclaimed by condensing heat exchangers, producing potable water rather than depleting cabin oxygen or contaminating filters.</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-zinc-800/70">
              <div className="text-red-400 font-sans font-semibold mb-1.5 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Legacy Carbon Dioxide (CO₂) Flooding Hazards
              </div>
              <ul className="text-zinc-400 space-y-1.5 list-disc list-inside leading-relaxed">
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
