import React, { useEffect, useRef } from 'react';

interface FlameCanvasProps {
  gravity: number; // 0 to 1
  oxygen: number;  // 15 to 40
  velocity: number; // 0 to 30 cm/s
  isCoolFlame: boolean;
  fuelType?: string;
  width?: number;
  height?: number;
}

export const FlameCanvas: React.FC<FlameCanvasProps> = ({
  gravity,
  oxygen,
  velocity,
  isCoolFlame,
  fuelType = 'PMMA',
  width = 380,
  height = 340
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Particle system for soot and diffusion radicals
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
    }

    const particles: Particle[] = [];
    const maxParticles = 60;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.65;

      // Fuel source burner / droplet
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Burner mount or droplet needle
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 8);
      ctx.lineTo(centerX, height);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Atmospheric convection & buoyancy calculations
      const gFactor = Math.max(0.0001, gravity);
      const isMicrogravity = gravity < 0.05;
      const isLunar = gravity >= 0.05 && gravity < 0.25;
      const isMartian = gravity >= 0.25 && gravity < 0.7;
      const isEarth = gravity >= 0.7;

      // Flame flicker frequency: 1g has buoyant flicker (~12 Hz), 0g has 0 flicker
      const flickerAmplitude = isMicrogravity ? 0 : Math.sin(time * 14) * (0.05 * gFactor) + Math.cos(time * 22) * (0.03 * gFactor);
      const flowDriftX = (velocity / 30) * 25; // lateral displacement from ventilation

      // Scale factors
      const o2Intensity = Math.min(1.5, Math.max(0.7, oxygen / 21));
      
      // Radius & height
      let flameRadiusX = 35 * o2Intensity;
      let flameRadiusY = 35 * o2Intensity;
      let flameShiftY = 0;

      if (isCoolFlame) {
        // Cool flame is larger, quasi-spherical, dim
        flameRadiusX = 48;
        flameRadiusY = 48;
        flameShiftY = 0;
      } else if (isMicrogravity) {
        // True spherical flame front in zero-g
        flameRadiusX = 40 * o2Intensity;
        flameRadiusY = 40 * o2Intensity;
        flameShiftY = 0;
      } else if (isLunar) {
        // Hemispherical dome
        flameRadiusX = 36 * o2Intensity;
        flameRadiusY = 55 * o2Intensity * (1 + flickerAmplitude);
        flameShiftY = -18 * o2Intensity;
      } else if (isMartian) {
        // Moderately elongated teardrop
        flameRadiusX = 32 * o2Intensity;
        flameRadiusY = 75 * o2Intensity * (1 + flickerAmplitude);
        flameShiftY = -35 * o2Intensity;
      } else {
        // Terrestrial 1g sharp buoyant teardrop
        flameRadiusX = 26 * o2Intensity;
        flameRadiusY = 100 * o2Intensity * (1 + flickerAmplitude);
        flameShiftY = -55 * o2Intensity;
      }

      const flameCenterX = centerX + flowDriftX;
      const flameCenterY = centerY + flameShiftY;

      // Draw Outer Glow / Thermal Diffusion Layer
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        flameCenterX,
        flameCenterY,
        flameRadiusX * 0.2,
        flameCenterX,
        flameCenterY,
        flameRadiusX * 2.2
      );

      if (isCoolFlame) {
        glowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (isMicrogravity) {
        glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        glowGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)');
        glowGrad.addColorStop(0.85, 'rgba(234, 88, 12, 0.15)'); // outer soot shell
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
        glowGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
        glowGrad.addColorStop(0.8, 'rgba(239, 68, 68, 0.15)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(flameCenterX, flameCenterY, flameRadiusX * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Core Flame Front
      ctx.save();
      ctx.beginPath();

      if (isMicrogravity || isCoolFlame) {
        // True sphere
        ctx.arc(flameCenterX, flameCenterY, flameRadiusX, 0, Math.PI * 2);
      } else {
        // Teardrop path with bezier curves
        ctx.moveTo(flameCenterX - flameRadiusX, centerY);
        ctx.bezierCurveTo(
          flameCenterX - flameRadiusX * 1.1,
          centerY - flameRadiusY * 0.5,
          flameCenterX - flameRadiusX * 0.3,
          flameCenterY - flameRadiusY * 0.6,
          flameCenterX,
          flameCenterY - flameRadiusY * 0.65
        );
        ctx.bezierCurveTo(
          flameCenterX + flameRadiusX * 0.3,
          flameCenterY - flameRadiusY * 0.65,
          flameCenterX + flameRadiusX * 1.1,
          centerY - flameRadiusY * 0.5,
          flameCenterX + flameRadiusX,
          centerY
        );
        ctx.bezierCurveTo(
          flameCenterX + flameRadiusX * 0.7,
          centerY + flameRadiusX * 0.4,
          flameCenterX - flameRadiusX * 0.7,
          centerY + flameRadiusX * 0.4,
          flameCenterX - flameRadiusX,
          centerY
        );
      }

      const flameGrad = ctx.createRadialGradient(
        flameCenterX,
        isMicrogravity ? flameCenterY : flameCenterY + flameRadiusY * 0.2,
        5,
        flameCenterX,
        flameCenterY,
        flameRadiusY
      );

      if (isCoolFlame) {
        flameGrad.addColorStop(0, 'rgba(216, 180, 254, 0.9)'); // Faint lilac
        flameGrad.addColorStop(0.6, 'rgba(147, 51, 234, 0.6)');
        flameGrad.addColorStop(1, 'rgba(79, 70, 229, 0.1)');
      } else if (isMicrogravity) {
        // Pale blue / UV chemiluminescence (CH*, C2* radicals)
        flameGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        flameGrad.addColorStop(0.3, 'rgba(125, 211, 252, 0.85)');
        flameGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.6)');
        flameGrad.addColorStop(0.9, 'rgba(30, 58, 138, 0.4)');
        flameGrad.addColorStop(1, 'rgba(249, 115, 22, 0.25)'); // Soot ring
      } else {
        // 1g or partial g: Bright yellow buoyant tip + blue base
        flameGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        flameGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)');
        flameGrad.addColorStop(0.65, 'rgba(249, 115, 22, 0.85)');
        flameGrad.addColorStop(0.88, 'rgba(220, 38, 38, 0.5)');
        flameGrad.addColorStop(1, 'rgba(37, 99, 235, 0.2)');
      }

      ctx.fillStyle = flameGrad;
      ctx.fill();
      ctx.restore();

      // Emit soot/combustion particles
      if (particles.length < maxParticles && Math.random() > 0.4) {
        const pAngle = isMicrogravity ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        const pSpeed = isMicrogravity ? 0.3 + Math.random() * 0.4 : 1.2 + gFactor * 2.5;

        particles.push({
          x: flameCenterX + (Math.random() - 0.5) * flameRadiusX * 0.6,
          y: isMicrogravity ? flameCenterY + (Math.random() - 0.5) * flameRadiusY * 0.6 : centerY - 15,
          vx: Math.cos(pAngle) * pSpeed + (velocity / 30) * 0.8,
          vy: Math.sin(pAngle) * pSpeed,
          life: 0,
          maxLife: isMicrogravity ? 70 : 40,
          size: isMicrogravity ? 2.5 : 1.8,
          color: isCoolFlame ? '#C084FC' : isMicrogravity ? '#F97316' : '#FCD34D',
          alpha: 0.8
        });
      }

      // Update and draw particles
      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (isMicrogravity) {
          // Thermophoretic repulsion creates a stationary soot shell
          p.vx *= 0.98;
          p.vy *= 0.98;
        } else {
          // Buoyancy accelerates particles upward
          p.vy -= 0.08 * gFactor;
        }

        const lifeRatio = p.life / p.maxLife;
        const currentAlpha = Math.max(0, p.alpha * (1 - lifeRatio));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.3), 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }
      ctx.restore();

      // Overlay Physics HUD labels
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#67E8F9';
      ctx.fillText(`g-Level: ${gravity.toFixed(3)}g`, 12, 20);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`Flow: ${velocity.toFixed(1)} cm/s`, 12, 34);
      ctx.fillText(`O2: ${oxygen.toFixed(1)}%`, 12, 48);

      if (isCoolFlame) {
        ctx.fillStyle = '#C084FC';
        ctx.fillText('MODE: QUASI-STEADY COOL FLAME (600 K)', 12, height - 14);
      } else if (isMicrogravity) {
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('SYMMETRY: DIFFUSION-DOMINATED SPHERICAL', 12, height - 14);
      } else {
        ctx.fillStyle = '#F59E0B';
        ctx.fillText('REGIME: BUOYANCY-CONVECTIVE TEARDROP', 12, height - 14);
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gravity, oxygen, velocity, isCoolFlame, fuelType, width, height]);

  return (
    <div className="relative rounded-xl border border-cyan-500/30 bg-black/70 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto cursor-crosshair"
      />
      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>LIVE 60FPS CFD RENDER</span>
      </div>
    </div>
  );
};
