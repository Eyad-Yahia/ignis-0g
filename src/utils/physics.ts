import { PhysicsReadout, SimulatorGravityKey } from '../types';

export interface SimulatorPhysicsParams {
  gravityKey: SimulatorGravityKey;
  airflowCmSec: number;
  oxygenPercent: number;
  isCoolFlame: boolean;
  timeInZeroFlowSec?: number; // elapsed time when airflow is 0 in 0g
}

/**
 * Calculates live aerodynamic and thermodynamic dimensionless numbers
 * grounded in NASA PSI microgravity combustion physics.
 */
export function calculateCombustionPhysics({
  gravityKey,
  airflowCmSec,
  oxygenPercent,
  isCoolFlame,
  timeInZeroFlowSec = 0
}: SimulatorPhysicsParams): PhysicsReadout {
  // Gravitational acceleration (m/s^2)
  let g = 9.81;
  let gFraction = 1.0;

  if (gravityKey === '0.0g ISS') {
    g = 0.0001; // near zero
    gFraction = 0.00001;
  } else if (gravityKey === '0.16g Moon') {
    g = 1.62;
    gFraction = 0.16;
  } else if (gravityKey === '0.38g Mars') {
    g = 3.72;
    gFraction = 0.38;
  } else {
    g = 9.81;
    gFraction = 1.0;
  }

  // Characteristic flame dimension L (meters)
  const L = 0.025; // 25 mm burner / flame scale
  const flameVolumeM3 = (4 / 3) * Math.PI * Math.pow(L / 2, 3); // ~8.2e-6 m^3

  // Ambient thermodynamic state
  const P = 101325; // Pa
  const R = 287.05; // J/(kg*K)
  const T_inf = 295.15; // K (ambient cabin temperature, 22 deg C)
  const rho_inf = P / (R * T_inf); // ~1.196 kg/m^3
  const nu = 1.55e-5; // kinematic viscosity (m^2/s)
  const beta = 1 / T_inf; // thermal expansion coefficient (1/K)

  // Flame temperature calculation
  let baseFlameTempK = 1750;
  if (isCoolFlame) {
    baseFlameTempK = 600; // FLEX cool flame benchmark
  } else {
    // Scales with oxygen fraction (O2 / 21%)^0.4
    const o2Factor = Math.pow(oxygenPercent / 21, 0.4);
    baseFlameTempK = Math.round(1750 * o2Factor);
  }

  const T_f = baseFlameTempK;
  const rho_f = P / (R * T_f); // flame zone gas density

  // 1. Buoyancy Force (F_b) = (rho_inf - rho_f) * g * V (Newtons)
  const buoyancyForceN = Math.max(0, (rho_inf - rho_f) * g * flameVolumeM3);

  // 2. Grashof Number (Gr) = (g * beta * (T_f - T_inf) * L^3) / nu^2
  const deltaT = Math.max(1, T_f - T_inf);
  const grashofNumber = (g * beta * deltaT * Math.pow(L, 3)) / Math.pow(nu, 2);

  // 3. Airflow velocity U (m/s)
  const U = airflowCmSec / 100; // convert cm/s to m/s

  // 4. Froude Number (Fr) = U^2 / (g * L)
  // In microgravity (g ~ 0), Fr -> infinity (forced flow completely dominates buoyancy)
  const froudeNumber = gFraction < 0.01 ? (U > 0 ? 9999.0 : 0.0) : Math.pow(U, 2) / (g * L);

  // 5. Reynolds Number (Re) = U * L / nu
  const reynoldsNumber = (U * L) / nu;

  // 6. Radiant loss fraction (% of total heat)
  // In 0g, soot residence time is prolonged so radiative loss is high (40-65%)
  let radiantLossFraction = gFraction < 0.01 ? 0.45 : 0.18 + (1 - gFraction) * 0.15;
  if (isCoolFlame) radiantLossFraction = 0.65;

  // 7. BASS Draft Paradox & Flame Status Determination
  let flameStatus: PhysicsReadout['flameStatus'] = 'Stable Spherical Diffusion Flame';
  let extinctionCountdown: number | null = null;
  let coPpmEmitted = 15;

  if (isCoolFlame) {
    flameStatus = 'Quasi-Steady Cool Flame (600K)';
    coPpmEmitted = 85; // High toxic CO byproduct from incomplete peroxy kinetics
  } else if (gFraction < 0.01) {
    // Microgravity BASS behavior
    if (airflowCmSec === 0) {
      // BASS Draft Paradox: Stagnant 0g suffocates in 45.0 seconds
      const maxExtinctionTime = 45.0; // 45s NASA BASS benchmark
      const remaining = Math.max(0, Number((maxExtinctionTime - timeInZeroFlowSec).toFixed(1)));
      extinctionCountdown = remaining;

      if (remaining <= 0) {
        flameStatus = 'Extinguished (CO2 Suffocation)';
        coPpmEmitted = 120;
      } else {
        flameStatus = 'Stable Spherical Diffusion Flame';
        coPpmEmitted = Math.round(25 + (45 - remaining) * 2);
      }
    } else if (airflowCmSec >= 2.5 && airflowCmSec <= 15) {
      flameStatus = 'Stable Spherical Diffusion Flame';
      coPpmEmitted = 25;
    } else {
      flameStatus = 'Stable Spherical Diffusion Flame';
      coPpmEmitted = 20;
    }
  } else if (gFraction === 0.16) {
    flameStatus = 'Stable Dome Flame';
    coPpmEmitted = 30;
  } else if (gFraction >= 0.7) {
    flameStatus = 'Buoyant Convective Plume';
    coPpmEmitted = 10;
  } else {
    flameStatus = 'Stable Dome Flame';
    coPpmEmitted = 20;
  }

  // Guard against NaN / Infinity for all computed dimensionless numbers
  const safeNum = (v: number, fallback: number = 0): number =>
    Number.isFinite(v) ? v : fallback;

  return {
    buoyancyForceN: Number(safeNum(buoyancyForceN).toExponential(3)),
    grashofNumber: Math.round(safeNum(grashofNumber)),
    froudeNumber: Number(safeNum(froudeNumber).toFixed(2)),
    reynoldsNumber: Math.round(safeNum(reynoldsNumber)),
    flameTempK: safeNum(T_f, 600),
    radiantLossFraction: Number(safeNum(radiantLossFraction * 100).toFixed(1)),
    flameStatus,
    extinctionCountdown,
    coPpmEmitted: safeNum(coPpmEmitted, 0)
  };
}
