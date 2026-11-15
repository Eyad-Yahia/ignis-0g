export type GravityRegimeLabel = '0g (Microgravity)' | '0.16g (Lunar)' | '0.38g (Mars)' | '1.0g (Earth)';

export interface NASAExperiment {
  id: string; // e.g. NASA-SAFFIRE-I-01
  psiRecord: string; // e.g. PSI-CB-0041
  program: string; // e.g. Saffire (Cygnus)
  material: string; // e.g. SIBAL Cotton-Fiberglass
  materialCategory: 'Solid Fabric' | 'Solid Polymer' | 'Liquid Droplet' | 'Gas Jet' | 'Wire Harness';
  gravity: GravityRegimeLabel;
  gravityG: number; // 0.00001, 0.16, 0.38, 1.0
  oxygenPercent: number; // e.g. 18.0 to 34.0
  pressureKpa: number; // e.g. 56.5 to 101.3
  airflowCmSec: number; // e.g. 0 to 25
  flameSpreadRateMmSec: number;
  peakTempK: number;
  sootPpm: number;
  phenomenon: string; // e.g. Quasi-Steady Cool Flame, Draft Paradox, etc.
  finding: string; // detailed scientific takeaway
  safetyRecommendation: string; // actionable NASA-STD-6001B engineering guidance
  facility: string;
  citation: string;
  hasCoolFlame: boolean;
  flameShape: 'Spherical' | 'Teardrop' | 'Hemispherical' | 'Ellipsoidal';
  provenance: 'Published NASA Flight Data' | 'NASA Ground/Drop-Tower Baseline';
}

export type SimulatorGravityKey = '1.0g Earth' | '0.38g Mars' | '0.16g Moon' | '0.0g ISS';

export interface PhysicsReadout {
  buoyancyForceN: number;
  grashofNumber: number;
  froudeNumber: number;
  reynoldsNumber: number;
  flameTempK: number;
  radiantLossFraction: number;
  flameStatus: 'Extinguished (CO2 Suffocation)' | 'Quasi-Steady Cool Flame (600K)' | 'Stable Spherical Diffusion Flame' | 'Buoyant Convective Plume' | 'Stable Dome Flame';
  extinctionCountdown: number | null; // seconds left if suffocating
  coPpmEmitted: number;
}

export type MissionPresetId = 'iss_nominal' | 'artemis_exploration' | 'orion_contingency' | 'mars_surface';

export interface MissionPreset {
  id: MissionPresetId;
  name: string;
  shortLabel: string;
  oxygenPercent: number;
  pressureKpa: number;
  gravityG: number;
  gravityLabel: string;
  description: string;
  riskFactor: 'Moderate' | 'High' | 'Critical';
}

export interface MaterialRiskProfile {
  id: string;
  name: string;
  category: string;
  baseMoc: number; // Maximum Oxygen Concentration in 1g (%)
  flameSpreadRatePredicted: number; // mm/s under current conditions
  flammabilityIndex: number; // 0 - 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  toxicByproducts: string;
  sootTendency: 'Negligible' | 'Moderate' | 'High' | 'Severe';
  std6001Status: 'Pass (Flight Certified)' | 'Marginal (Conditional)' | 'Fail (Prohibited)';
  mitigationProtocol: string;
}

export type AIProviderId = 'offline' | 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface AIProviderConfig {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Array<{
    id: string;
    psiRecord: string;
    program: string;
    material: string;
    takeaway: string;
  }>;
  confidenceScore?: number;
  providerUsed?: AIProviderId;
  usedFallback?: boolean;
  fallbackReason?: string;
}
