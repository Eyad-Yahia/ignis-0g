import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  Wind, 
  Gauge, 
  Sparkles, 
  Activity, 
  Clock, 
  Zap, 
  FastForward 
} from 'lucide-react';
import { SimulatorGravityKey } from '../types';
import { calculateCombustionPhysics } from '../utils/physics';

export const GravityComparator: React.FC = () => {
  // Interactive control state (updated only on user input)
  const [gravityKey, setGravityKey] = useState<SimulatorGravityKey>('0.0g ISS');
  const [airflowCmSec, setAirflowCmSec] = useState<number>(3.5); // cm/s
  const [oxygenPercent, setOxygenPercent] = useState<number>(21.0); // %
  const [isCoolFlame, setIsCoolFlame] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<1 | 3>(1); // 1x or 3x acceleration

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Direct DOM refs to decouple live 60FPS telemetry from React render cycles
  const flameTempRef = useRef<HTMLSpanElement | null>(null);
  const buoyancyRef = useRef<HTMLSpanElement | null>(null);
  const grashofRef = useRef<HTMLSpanElement | null>(null);
  const froudeRef = useRef<HTMLSpanElement | null>(null);
  const reynoldsRef = useRef<HTMLSpanElement | null>(null);
  const radiantRef = useRef<HTMLSpanElement | null>(null);
  const coRef = useRef<HTMLSpanElement | null>(null);
  const statusBadgeRef = useRef<HTMLDivElement | null>(null);
  const countdownOverlayRef = useRef<HTMLDivElement | null>(null);
  const countdownValRef = useRef<HTMLSpanElement | null>(null);
  const countdownIconRef = useRef<HTMLSpanElement | null>(null);

  // Synchronous ref to hold current simulation parameters for the 60FPS loop
  const paramsRef = useRef({
    gravityKey,
    airflowCmSec,
    oxygenPercent,
    isCoolFlame,
    simSpeed
  });
  paramsRef.current = {
    gravityKey,
    airflowCmSec,
    oxygenPercent,
    isCoolFlame,
    simSpeed
  };

  // Initial calculation for static SSR/first-paint DOM nodes
  const initialPhysics = calculateCombustionPhysics({
    gravityKey,
    airflowCmSec,
    oxygenPercent,
    isCoolFlame,
    timeInZeroFlowSec: 0
  });

  // Decoupled 60FPS Canvas Animation Loop with Direct DOM Telemetry (0 React Re-renders at 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp HiDPI rendering: fixed 760x440 logical space scaled to the device pixel ratio
    const LW = 760, LH = 440;
    let lastObservedWidth = 0;
    const fit = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      if (w === 0 || w === lastObservedWidth) return;
      lastObservedWidth = w;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round((w * LH / LW) * dpr);
      ctx.setTransform(canvas.width / LW, 0, 0, canvas.height / LH, 0, 0);
    };

    fit();
    const ro = new ResizeObserver(() => {
      // Defer through requestAnimationFrame to prevent infinite resize loops
      requestAnimationFrame(fit);
    });
    ro.observe(canvas);

    let animId: number;
    let time = 0;
    let lastTime = performance.now();
    let zeroFlowTimer = 0;
    let lastDomUpdateTime = 0;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
      alpha: number;
      isCOGas?: boolean;
    }

    const particles: Particle[] = [];

    const render = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Extract current live inputs from ref without React state reads
      const {
        gravityKey: curG,
        airflowCmSec: curFlow,
        oxygenPercent: curO2,
        isCoolFlame: curCool,
        simSpeed: curSpeed
      } = paramsRef.current;

      // Update zero-flow suffocation timer smoothly in memory
      if (curG === '0.0g ISS' && curFlow === 0 && !curCool) {
        zeroFlowTimer = Math.min(45.0, zeroFlowTimer + dt * curSpeed);
      } else {
        zeroFlowTimer = 0;
      }

      // Compute live physics
      const physics = calculateCombustionPhysics({
        gravityKey: curG,
        airflowCmSec: curFlow,
        oxygenPercent: curO2,
        isCoolFlame: curCool,
        timeInZeroFlowSec: zeroFlowTimer
      });

      const isExtinguished = physics.flameStatus === 'Extinguished (CO2 Suffocation)';

      // Throttle direct DOM updates to 10 Hz (100ms) to ensure smooth 60fps canvas performance
      if (now - lastDomUpdateTime >= 100) {
        lastDomUpdateTime = now;

        if (flameTempRef.current) flameTempRef.current.textContent = `${physics.flameTempK} K`;
        if (buoyancyRef.current) buoyancyRef.current.textContent = `${physics.buoyancyForceN.toExponential(2)} N`;
        if (grashofRef.current) grashofRef.current.textContent = physics.grashofNumber.toLocaleString();
        if (froudeRef.current) froudeRef.current.textContent = physics.froudeNumber >= 9999 ? '∞ (Forced)' : physics.froudeNumber.toFixed(2);
        if (reynoldsRef.current) reynoldsRef.current.textContent = String(physics.reynoldsNumber);
        if (radiantRef.current) radiantRef.current.textContent = `${physics.radiantLossFraction}%`;
        if (coRef.current) coRef.current.textContent = `${physics.coPpmEmitted} ppm`;

        if (statusBadgeRef.current) {
          statusBadgeRef.current.textContent = physics.flameStatus;
          if (isExtinguished) {
            statusBadgeRef.current.className = 'p-2 rounded border text-xs font-mono font-medium bg-red-950/40 border-red-500/40 text-red-300';
          } else if (curCool) {
            statusBadgeRef.current.className = 'p-2 rounded border text-xs font-mono font-medium bg-indigo-950/40 border-indigo-500/40 text-indigo-300';
          } else {
            statusBadgeRef.current.className = 'p-2 rounded border text-xs font-mono font-medium bg-[#18181B] border-[#27272A] text-zinc-200';
          }
        }

        if (countdownOverlayRef.current) {
          if (physics.extinctionCountdown !== null) {
            countdownOverlayRef.current.style.display = 'flex';
            if (countdownValRef.current) {
              if (physics.extinctionCountdown > 0) {
                countdownValRef.current.textContent = `${physics.extinctionCountdown.toFixed(1)}s TO SUFFOCATION`;
                countdownValRef.current.className = 'text-zinc-100 font-bold tabular-nums';
              } else {
                countdownValRef.current.textContent = 'EXTINGUISHED (0.0s)';
                countdownValRef.current.className = 'text-red-400 font-semibold tabular-nums';
              }
            }
            if (countdownIconRef.current) {
              countdownIconRef.current.className = physics.extinctionCountdown === 0 ? 'text-red-400' : 'text-[#F97316] animate-pulse';
            }
          } else {
            countdownOverlayRef.current.style.display = 'none';
          }
        }
      }

      time += 0.035 * curSpeed;
      const width = LW;
      const height = LH;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.60;

      // Draw Burner Mount
      ctx.save();
      ctx.fillStyle = '#18181B';
      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 14, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 22);
      ctx.lineTo(centerX, height);
      ctx.strokeStyle = '#27272A';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      const is0g = curG === '0.0g ISS';
      const isMoon = curG === '0.16g Moon';
      const isMars = curG === '0.38g Mars';
      const isEarth = curG === '1.0g Earth';

      // Drift from airflow
      const flowDriftX = (curFlow / 20) * 35;

      // Buoyant flicker: 1g has strong 12-14Hz flicker; 0g has 0 flicker
      let flicker = 0;
      if (isEarth) {
        flicker = Math.sin(time * 16) * 0.08 + Math.cos(time * 24) * 0.04;
      } else if (isMars) {
        flicker = Math.sin(time * 10) * 0.04;
      } else if (isMoon) {
        flicker = Math.sin(time * 6) * 0.02;
      }

      // Oxygen scaling factor
      const o2Factor = Math.min(1.4, Math.max(0.7, curO2 / 21));

      // Suffocation fade factor for BASS Draft Paradox (45.0s benchmark)
      let suffocationAlpha = 1.0;
      if (is0g && curFlow === 0 && !curCool) {
        const remaining = Math.max(0, 45.0 - zeroFlowTimer);
        suffocationAlpha = Math.max(0, remaining / 45.0);
      }

      const maxParticles = curCool ? 40 : 65;

      if (suffocationAlpha > 0.01) {
        const flameOriginX = centerX + flowDriftX;
        const flameOriginY = is0g ? centerY : centerY - 10;

        let rX = 35 * o2Factor;
        let rY = 35 * o2Factor;
        let shiftY = 0;

        if (curCool) {
          const pulse = Math.sin(time * 3) * 3;
          rX = 46 + pulse;
          rY = 46 + pulse;
          shiftY = 0;
        } else if (is0g) {
          rX = 42 * o2Factor;
          rY = 42 * o2Factor;
          shiftY = 0;
        } else if (isMoon) {
          rX = 36 * o2Factor;
          rY = 58 * o2Factor * (1 + flicker);
          shiftY = -18 * o2Factor;
        } else if (isMars) {
          rX = 32 * o2Factor;
          rY = 82 * o2Factor * (1 + flicker);
          shiftY = -35 * o2Factor;
        } else {
          rX = 26 * o2Factor;
          rY = 110 * o2Factor * (1 + flicker);
          shiftY = -55 * o2Factor;
        }

        const coreY = flameOriginY + shiftY;

        // 1. Outer Thermal Envelope
        ctx.save();
        ctx.globalAlpha = suffocationAlpha;
        const outerGrad = ctx.createRadialGradient(
          flameOriginX, coreY, 5,
          flameOriginX, coreY, Math.max(rX, rY) * 1.5
        );

        if (curCool) {
          outerGrad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
          outerGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.20)');
          outerGrad.addColorStop(1, 'rgba(79, 70, 229, 0)');
        } else if (is0g) {
          outerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.65)');
          outerGrad.addColorStop(0.6, 'rgba(37, 99, 235, 0.25)');
          outerGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
        } else if (isMoon) {
          outerGrad.addColorStop(0, 'rgba(249, 115, 22, 0.65)');
          outerGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.35)');
          outerGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else if (isMars) {
          outerGrad.addColorStop(0, 'rgba(249, 115, 22, 0.75)');
          outerGrad.addColorStop(0.6, 'rgba(234, 88, 12, 0.3)');
          outerGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else {
          outerGrad.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
          outerGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.4)');
          outerGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        }

        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.ellipse(flameOriginX, coreY, rX * 1.4, rY * 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Middle Reaction Envelope
        ctx.save();
        ctx.globalAlpha = suffocationAlpha;
        const midGrad = ctx.createRadialGradient(
          flameOriginX, coreY, 2,
          flameOriginX, coreY, Math.max(rX, rY)
        );

        if (curCool) {
          midGrad.addColorStop(0, 'rgba(199, 210, 254, 0.7)');
          midGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.35)');
          midGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        } else if (is0g) {
          midGrad.addColorStop(0, 'rgba(147, 197, 253, 0.85)');
          midGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.4)');
          midGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
        } else {
          midGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          midGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.8)');
          midGrad.addColorStop(0.85, 'rgba(59, 130, 246, 0.35)');
          midGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        }

        ctx.fillStyle = midGrad;
        ctx.beginPath();
        ctx.ellipse(flameOriginX, coreY, rX, rY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. High-Temperature Reaction Core
        ctx.save();
        ctx.globalAlpha = suffocationAlpha;
        const coreGrad = ctx.createRadialGradient(
          flameOriginX, is0g ? coreY : coreY + 10, 1,
          flameOriginX, is0g ? coreY : coreY + 10, rX * 0.45
        );

        if (curCool) {
          coreGrad.addColorStop(0, 'rgba(224, 231, 255, 0.6)');
          coreGrad.addColorStop(1, 'rgba(165, 180, 252, 0)');
        } else if (is0g) {
          coreGrad.addColorStop(0, 'rgba(239, 246, 255, 0.9)');
          coreGrad.addColorStop(0.6, 'rgba(147, 197, 253, 0.5)');
          coreGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        } else {
          coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
          coreGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.8)');
          coreGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        }

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.ellipse(flameOriginX, is0g ? coreY : coreY + 10, rX * 0.45, rY * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Particle Emitters
        if (particles.length < maxParticles && Math.random() < 0.65) {
          if (curCool) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 20;
            particles.push({
              x: flameOriginX + Math.cos(angle) * dist,
              y: coreY + Math.sin(angle) * dist,
              vx: Math.cos(angle) * 0.35,
              vy: Math.sin(angle) * 0.35,
              life: 0,
              maxLife: 60,
              size: 2.2,
              color: '#A5B4FC',
              alpha: 0.65,
              isCOGas: true
            });
          } else if (is0g) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.25 + Math.random() * 0.35;
            particles.push({
              x: flameOriginX + (Math.random() - 0.5) * rX * 0.5,
              y: coreY + (Math.random() - 0.5) * rY * 0.5,
              vx: Math.cos(angle) * speed + (curFlow / 20) * 0.5,
              vy: Math.sin(angle) * speed,
              life: 0,
              maxLife: 70,
              size: 2.2,
              color: '#F97316',
              alpha: 0.6
            });
          } else {
            const gSpeed = isEarth ? 2.6 : isMars ? 1.5 : 0.8;
            particles.push({
              x: flameOriginX + (Math.random() - 0.5) * rX * 0.6,
              y: centerY - 15,
              vx: (Math.random() - 0.5) * 0.5 + (curFlow / 20) * 0.3,
              vy: -gSpeed - Math.random() * 1.3,
              life: 0,
              maxLife: 40,
              size: 1.8,
              color: '#FCD34D',
              alpha: 0.8
            });
          }
        }
      }

      // Update Particle System
      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (is0g) {
          p.vx *= 0.985;
          p.vy *= 0.985;
        } else {
          p.vy -= 0.04 * (isEarth ? 1 : isMars ? 0.38 : 0.16);
        }

        const lifeRatio = p.life / p.maxLife;
        const currentAlpha = Math.max(0, p.alpha * (1 - lifeRatio));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.2), 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }
      ctx.restore();

      // HUD Monospace Overlay
      ctx.save();
      ctx.font = '11px "JetBrains Mono", Menlo, monospace';
      ctx.fillStyle = '#71717A';
      ctx.fillText(`GRAVITY: ${curG}`, 16, 24);
      ctx.fillText(`AIRFLOW: ${curFlow.toFixed(1)} cm/s`, 16, 40);
      ctx.fillText(`O2: ${curO2.toFixed(1)}%`, 16, 56);

      if (isExtinguished) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px "JetBrains Mono", Menlo, monospace';
        ctx.fillText('EXTINGUISHED: STAGNANT CO2 SUFFOCATION (BASS)', 16, height - 16);
      } else if (curCool) {
        ctx.fillStyle = '#818CF8';
        ctx.font = 'bold 11px "JetBrains Mono", Menlo, monospace';
        ctx.fillText('FLEX 600K INVISIBLE QUASI-STEADY COOL FLAME', 16, height - 16);
      } else if (is0g) {
        ctx.fillStyle = '#3B82F6';
        ctx.fillText('SPHERICAL DIFFUSION SHELL (Fb ~ 0)', 16, height - 16);
      } else {
        ctx.fillStyle = '#F97316';
        ctx.fillText('BUOYANT CONVECTIVE PLUME (Fb > 0)', 16, height - 16);
      }
      ctx.restore();

      // Telemetry grid, crosshair and convective velocity streamlines (U)
      ctx.save();
      ctx.strokeStyle = 'rgba(56,189,248,0.07)'; ctx.lineWidth = 1;
      for (let gx = 0; gx <= width; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke(); }
      for (let gy = 0; gy <= height; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(56,189,248,0.35)';
      ctx.beginPath(); ctx.moveTo(centerX - 14, centerY); ctx.lineTo(centerX + 14, centerY); ctx.moveTo(centerX, centerY - 14); ctx.lineTo(centerX, centerY + 14); ctx.stroke();
      if (curFlow > 0 && !isExtinguished) {
        ctx.strokeStyle = 'rgba(125,211,252,0.35)'; ctx.fillStyle = 'rgba(125,211,252,0.55)';
        const speedPx = 20 + curFlow * 6;
        for (let r = 0; r < 7; r++) {
          const yy = 70 + r * 50;
          const off = (time * speedPx * 3) % 60;
          for (let k = -1; k < 14; k++) {
            const x0 = k * 60 + off;
            ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + 26, yy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x0 + 26, yy - 3); ctx.lineTo(x0 + 32, yy); ctx.lineTo(x0 + 26, yy + 3); ctx.fill();
          }
        }
        ctx.font = '11px "JetBrains Mono", monospace'; ctx.fillStyle = '#FBBF24';
        ctx.fillText(`U = ${curFlow.toFixed(1)} cm/s →`, 16, 66);
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []); // Mounted once: decoupled from React state renders!

  return (
    <div className="space-y-6">
      {/* Module Header Section — de-boxed & breathing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-base font-semibold font-sans text-zinc-100 tracking-tight">
            Microgravity Combustion & Aerodynamics Simulator
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans leading-relaxed">
            Real-time Navier-Stokes and diffusion kinetics approximation across planetary regimes. Grounded in NASA PSI flight telemetry from Saffire, FLEX, and BASS.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sim Speed Toggle (1x / 3x) */}
          <button
            onClick={() => setSimSpeed(simSpeed === 1 ? 3 : 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium border transition-colors ${
              simSpeed === 3 
                ? 'bg-[#1C1C21] border-[#F97316] text-[#F97316]' 
                : 'bg-[#101014] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title="Accelerate countdown speed for verification"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{simSpeed}× Speed</span>
          </button>

          {/* Cool Flame Toggle Button */}
          <button
            onClick={() => setIsCoolFlame(!isCoolFlame)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all border ${
              isCoolFlame
                ? 'bg-[#312E81] border-[#6366F1] text-indigo-100 shadow-sm'
                : 'bg-[#101014] border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCoolFlame ? 'text-indigo-300' : 'text-zinc-400'}`} />
            <span>{isCoolFlame ? 'Cool Flame Active (600 K)' : 'Enable Cool Flame'}</span>
          </button>
        </div>
      </div>

      {/* Main 70% / 30% Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* 70% Width Main Canvas & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Canvas Container */}
          <div className="relative bg-[#09090B] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={760}
              height={440}
              className="w-full h-auto block aspect-[19/11]"
            />

            {/* Extinction Countdown Overlay (Decoupled DOM ref: 45.0s benchmark) */}
            <div
              ref={countdownOverlayRef}
              style={{ display: initialPhysics.extinctionCountdown !== null ? 'flex' : 'none' }}
              className="absolute top-3 right-3 bg-[#0E0E12]/95 border border-zinc-800/80 rounded-lg px-3 py-2 text-xs shadow-xl items-center gap-2.5 backdrop-blur-sm"
            >
              <span ref={countdownIconRef} className="text-[#F97316] animate-pulse">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <div className="text-[10px] font-sans text-zinc-400">BASS zero-flow benchmark</div>
                <span ref={countdownValRef} className="text-zinc-100 font-medium font-mono tabular-nums">
                  {initialPhysics.extinctionCountdown !== null && initialPhysics.extinctionCountdown > 0
                    ? `${initialPhysics.extinctionCountdown.toFixed(1)}s TO SUFFOCATION`
                    : 'EXTINGUISHED (0.0s)'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Strip Below Canvas */}
          <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Gravity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-sans font-medium text-zinc-300 flex items-center justify-between">
                <span>Gravity regime</span>
                <span className="font-mono text-zinc-100 font-semibold tabular-nums">{gravityKey}</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['1.0g Earth', '0.38g Mars', '0.16g Moon', '0.0g ISS'] as SimulatorGravityKey[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGravityKey(g)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-sans font-medium transition-colors border ${
                      gravityKey === g
                        ? 'bg-[#1C1C21] border-[#F97316] text-[#F97316] shadow-sm'
                        : 'bg-[#09090B] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Airflow Velocity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-medium">
                <span className="text-zinc-300">Forced airflow</span>
                <span className="text-zinc-100 font-mono font-semibold tabular-nums">{airflowCmSec.toFixed(1)} cm/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={airflowCmSec}
                onChange={(e) => setAirflowCmSec(Number(e.target.value))}
                className="w-full accent-[#F97316] cursor-pointer bg-zinc-800 h-1.5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-sans text-zinc-500">
                <span className="text-red-400">0 cm/s (Suffocates)</span>
                <span className="text-emerald-400">2.5–5 (Stable)</span>
                <span>20 cm/s</span>
              </div>
            </div>

            {/* Oxygen Fraction Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-medium">
                <span className="text-zinc-300">Oxygen fraction</span>
                <span className="text-zinc-100 font-mono font-semibold tabular-nums">{oxygenPercent.toFixed(1)}% O₂</span>
              </div>
              <input
                type="range"
                min="18"
                max="35"
                step="0.5"
                value={oxygenPercent}
                onChange={(e) => setOxygenPercent(Number(e.target.value))}
                className="w-full accent-[#F97316] cursor-pointer bg-zinc-800 h-1.5 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-sans text-zinc-500">
                <span>18% (MOC)</span>
                <span className="text-zinc-400">21% (Nominal)</span>
                <span className="text-[#F97316]">34% (Artemis)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 30% Docked Right-Hand Inspector Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-4 min-w-0">
          {/* Live Telemetry Inspector Panel (DOM text updated directly via refs) */}
          <div className="bg-[#0E0E12] border border-zinc-800/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
              <span className="text-xs font-sans font-semibold text-zinc-200 uppercase tracking-wider">
                Telemetry Inspector
              </span>
              <span className="text-[11px] font-sans text-zinc-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                60 FPS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Flame Temperature:</span>
                <span ref={flameTempRef} className="text-zinc-100 font-semibold font-mono tabular-nums">
                  {initialPhysics.flameTempK} K
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Buoyancy Force (Fb):</span>
                <span ref={buoyancyRef} className="text-zinc-100 font-semibold font-mono tabular-nums">
                  {initialPhysics.buoyancyForceN.toExponential(2)} N
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Grashof No. (Gr):</span>
                <span ref={grashofRef} className="text-zinc-100 font-semibold font-mono tabular-nums">
                  {initialPhysics.grashofNumber.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Froude No. (Fr):</span>
                <span ref={froudeRef} className="text-zinc-100 font-semibold font-mono tabular-nums">
                  {initialPhysics.froudeNumber >= 9999 ? '∞ (Forced)' : initialPhysics.froudeNumber.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Reynolds No. (Re):</span>
                <span ref={reynoldsRef} className="text-zinc-100 font-semibold font-mono tabular-nums">
                  {initialPhysics.reynoldsNumber}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Radiant Heat Loss:</span>
                <span ref={radiantRef} className="text-zinc-100 font-semibold font-mono tabular-nums">
                  {initialPhysics.radiantLossFraction}%
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-800/40">
                <span className="text-zinc-400 font-sans">Toxic CO Emission:</span>
                <span ref={coRef} className="text-amber-400 font-semibold font-mono tabular-nums">
                  {initialPhysics.coPpmEmitted} ppm
                </span>
              </div>
            </div>

            {/* Flame Status Pill */}
            <div className="pt-1">
              <div className="text-[10px] font-sans font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Current Reaction Regime</div>
              <div
                ref={statusBadgeRef}
                className="p-2.5 rounded-lg border text-xs font-sans font-medium bg-[#18181B] border-zinc-800 text-zinc-200"
              >
                {initialPhysics.flameStatus}
              </div>
            </div>
          </div>

          {/* NASA Scientific Context Note */}
          <div className="bg-[#0C0C0E] border border-zinc-800/40 rounded-xl p-4 space-y-2">
            <div className="text-xs font-sans font-semibold text-zinc-300">
              Physics Governing Principle
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              {gravityKey === '0.0g ISS' && airflowCmSec === 0 && !isCoolFlame && (
                <>
                  <strong className="text-zinc-200">BASS Draft Paradox:</strong> With zero buoyancy (Gr → 0) and zero airflow, combustion products (CO₂/H₂O) form an envelope suffocating the flame within 45 seconds [NASA-BASS-01].
                </>
              )}
              {gravityKey === '0.0g ISS' && airflowCmSec > 0 && !isCoolFlame && (
                <>
                  <strong className="text-zinc-200">Forced Convection Regime:</strong> Microgravity flames require minimal airflow (2.5–5 cm/s) to sweep combustion products and supply fresh O₂ [NASA-SAFFIRE-I-01].
                </>
              )}
              {isCoolFlame && (
                <>
                  <strong className="text-zinc-200">FLEX Low-Temp Kinetics:</strong> Droplet burning continues at 550–800K supported by peroxy radical chain branching without visible soot [NASA-FLEX-01].
                </>
              )}
              {gravityKey === '1.0g Earth' && (
                <>
                  <strong className="text-zinc-200">Terrestrial Buoyancy:</strong> Rapid upward convective plume (Fb &gt; 0, Gr &gt; 10⁶) stretches flame vertically into an unsteady teardrop [NASA-TERR-1G-01].
                </>
              )}
              {(gravityKey === '0.16g Moon' || gravityKey === '0.38g Mars') && (
                <>
                  <strong className="text-zinc-200">Partial Gravity Hybrid:</strong> Weak buoyancy maintains fresh oxygen entrainment without sufficient convective cooling, creating dangerous intermediate flame spread [NASA-BRE-02].
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
