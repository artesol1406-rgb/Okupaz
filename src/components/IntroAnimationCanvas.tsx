import React, { useEffect, useRef, useState } from 'react';
import { Activity, Play, SkipForward, Volume2, Sparkles, Heart, Sun, Mountain } from 'lucide-react';
import { speakText } from '../lib/tts';
import { Language } from '../lib/i18n';

interface IntroAnimationCanvasProps {
  onComplete: () => void;
  language?: Language;
  ttsEnabled?: boolean;
}

export const IntroAnimationCanvas: React.FC<IntroAnimationCanvasProps> = ({
  onComplete,
  language = 'es',
  ttsEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stage, setStage] = useState<'mandala' | 'landscape' | 'finished'>('mandala');
  const [progress, setProgress] = useState(0); // 0 to 1

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();
    const mandalaDuration = 3800; // 3.8s for mandala phase
    const morphDuration = 3200;   // 3.2s for landscape phase
    const totalDuration = mandalaDuration + morphDuration;

    // Announce via TTS at start if enabled
    const introSpeech =
      language === 'de'
        ? 'Willkommen bei OcuPaz Senior. Ergotherapie und Wohlbefinden für Ihre Gesundheit.'
        : language === 'en'
        ? 'Welcome to OcuPaz Senior. Occupational therapy and wellness for your health.'
        : 'Te damos la bienvenida a OcuPaz Senior. Terapia ocupacional y bienestar para tu salud.';
    
    const safeLang: 'es' | 'en' | 'de' = language === 'de' ? 'de' : language === 'en' ? 'en' : 'es';
    speakText(introSpeech, ttsEnabled, safeLang);

    // ECG wave calculation helper (P-Q-R-S-T wave pattern)
    const getEcgVal = (t: number) => {
      const cycle = t % 1;
      if (cycle > 0.15 && cycle < 0.25) {
        // P wave
        return Math.sin((cycle - 0.15) * Math.PI * 10) * 0.15;
      }
      if (cycle >= 0.35 && cycle <= 0.38) {
        // Q drop
        return -0.2;
      }
      if (cycle > 0.38 && cycle < 0.44) {
        // R spike
        return Math.sin((cycle - 0.38) * Math.PI * (1 / 0.06)) * 1.0;
      }
      if (cycle >= 0.44 && cycle <= 0.47) {
        // S drop
        return -0.3;
      }
      if (cycle > 0.55 && cycle < 0.7) {
        // T wave
        return Math.sin((cycle - 0.55) * Math.PI * (1 / 0.15)) * 0.25;
      }
      return 0;
    };

    const render = (now: number) => {
      const elapsed = now - startTime;
      const totalNorm = Math.min(1, elapsed / totalDuration);
      setProgress(totalNorm);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Deep dark medical/wellness canvas background
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, '#06201b');
      bgGrad.addColorStop(0.5, '#021310');
      bgGrad.addColorStop(1, '#010a08');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (elapsed < mandalaDuration) {
        // --- STAGE 1: ECG MANDALA ANIMATION ---
        setStage('mandala');
        const mandalaNorm = elapsed / mandalaDuration;

        const numSpokes = 8;
        const maxRadius = Math.max(0, Math.min(width, height) * 0.38 * Math.min(1, mandalaNorm * 1.3));
        const rotationAngle = (elapsed / 1000) * 0.4;

        // Draw ambient expanding pulse rings
        if (maxRadius > 1) {
          for (let rRing = 1; rRing <= 3; rRing++) {
            const rawRingR = (maxRadius * (rRing / 3) + ((elapsed * 0.05) % 40)) % maxRadius;
            const ringR = Math.max(0, Number.isFinite(rawRingR) ? rawRingR : 0);
            if (ringR > 0) {
              ctx.beginPath();
              ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
              const alpha = Math.max(0, Math.min(1, 0.15 * (1 - ringR / maxRadius)));
              ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        }

        // Draw Radial ECG Mandala Spokes
        for (let s = 0; s < numSpokes; s++) {
          const spokeAngle = (s * (Math.PI * 2 / numSpokes)) + rotationAngle;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(spokeAngle);

          ctx.beginPath();
          const steps = 120;
          for (let i = 0; i <= steps; i++) {
            const fraction = i / steps;
            const dist = fraction * maxRadius;
            // ECG pulse modifier along radial line
            const ecgTime = (elapsed * 0.0015) - fraction * 2;
            const ecgOffset = getEcgVal(ecgTime) * 28 * Math.sin(fraction * Math.PI);

            const px = dist;
            const py = ecgOffset;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }

          // Glowing emerald/cyan stroke
          ctx.shadowBlur = 12;
          ctx.shadowColor = s % 2 === 0 ? '#10b981' : '#06b6d4';
          ctx.strokeStyle = s % 2 === 0 ? '#34d399' : '#22d3ee';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Symmetric mirror spoke
          ctx.scale(1, -1);
          ctx.stroke();

          ctx.restore();
        }

        // Central Heartbeat Pulse Circle
        const heartPulse = 1 + Math.sin(elapsed * 0.008) * 0.12;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(heartPulse, heartPulse);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fillStyle = '#059669';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#6ee7b7';
        ctx.stroke();

        // Heart Icon in center
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💚', 0, 2);
        ctx.restore();

      } else {
        // --- STAGE 2: MANDALA MORPHS INTO ECG LANDSCAPE LOGO ---
        setStage('landscape');
        const morphNorm = Math.min(1, (elapsed - mandalaDuration) / morphDuration);

        // Transition factor (0 = radial mandala collapse, 1 = full horizon landscape)
        const transitionEase = Math.sin(morphNorm * (Math.PI / 2));

        // Draw Rising Golden Sun behind Mountains
        const sunY = centerY + 30 - transitionEase * 70;
        const sunRadius = Math.max(1, 45 + transitionEase * 10);
        const sunGlowRadius = Math.max(sunRadius + 1, sunRadius * 2.5);

        // Sun Glow
        const sunGrad = ctx.createRadialGradient(centerX, sunY, 5, centerX, sunY, sunGlowRadius);
        sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
        sunGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(centerX, sunY, sunGlowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sun Disk
        ctx.beginPath();
        ctx.arc(centerX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#fbbf24';
        ctx.fill();

        // Sun Rays
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
        ctx.lineWidth = 2;
        for (let ray = 0; ray < 12; ray++) {
          const rAngle = (ray * Math.PI / 6) + (elapsed * 0.0005);
          ctx.beginPath();
          ctx.moveTo(centerX + Math.cos(rAngle) * (sunRadius + 5), sunY + Math.sin(rAngle) * (sunRadius + 5));
          ctx.lineTo(centerX + Math.cos(rAngle) * (sunRadius + 30 + transitionEase * 20), sunY + Math.sin(rAngle) * (sunRadius + 30 + transitionEase * 20));
          ctx.stroke();
        }

        // Draw Mountain Silhouettes (Back Hills)
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, centerY + 40);
        ctx.quadraticCurveTo(width * 0.25, centerY - 40 * transitionEase, width * 0.45, centerY + 20);
        ctx.quadraticCurveTo(width * 0.7, centerY - 60 * transitionEase, width, centerY + 30);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Draw Foreground Mountain & ECG Horizon Line
        // The ECG pulse line travels across left to right and forms mountain peaks
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#34d399';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();

        const points = 200;
        const horizonY = centerY + 30;

        for (let p = 0; p <= points; p++) {
          const frac = p / points;
          const x = frac * width;

          // ECG wave combined with Mountain Peak profile
          const ecgVal = getEcgVal((elapsed * 0.001) + frac * 2);
          
          // Mountain peak elevation around center (0.35 to 0.65)
          let mountainPeak = 0;
          if (frac > 0.2 && frac < 0.8) {
            mountainPeak = Math.sin((frac - 0.2) / 0.6 * Math.PI) * 75 * transitionEase;
          }

          const y = horizonY - mountainPeak + (ecgVal * 30 * (1 - transitionEase * 0.5));

          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fill below horizon with green valley gradient
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const valleyGrad = ctx.createLinearGradient(0, horizonY, 0, height);
        valleyGrad.addColorStop(0, 'rgba(5, 150, 105, 0.8)');
        valleyGrad.addColorStop(1, 'rgba(2, 44, 34, 0.95)');
        ctx.fillStyle = valleyGrad;
        ctx.fill();

        ctx.restore();

        // Floating sparkles / fireflies
        for (let i = 0; i < 15; i++) {
          const sparkX = (centerX + Math.sin(i * 99 + elapsed * 0.001) * (width * 0.4));
          const sparkY = (centerY + Math.cos(i * 33 + elapsed * 0.0008) * 80) - 20;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#6ee7b7';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fde047';
          ctx.fill();
        }
      }

      if (totalNorm < 1) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        setStage('finished');
        // Auto transition after finishing
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete, language, ttsEnabled]);

  // Adjust canvas pixel density on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateDimensions = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || 450;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] bg-emerald-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-600 flex flex-col items-center justify-center">
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" onClick={onComplete} />

      {/* Floating Logo Overlay Text */}
      <div className="absolute bottom-6 left-0 right-0 px-4 text-center pointer-events-none transition-all duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-400 text-emerald-200 text-sm font-bold backdrop-blur-md mb-2 shadow-lg animate-pulse">
          <Activity size={18} className="text-emerald-400" />
          <span>
            {stage === 'mandala'
              ? language === 'de' ? 'ECG-Mandala der Gesundheit...' : language === 'en' ? 'Health ECG Mandala...' : 'Mandala Terapéutico ECG...'
              : language === 'de' ? 'OcuPaz Landschaft' : language === 'en' ? 'OcuPaz Landscape' : 'Paisaje de Vitalidad OcuPaz'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg flex items-center justify-center gap-3">
          <span className="text-emerald-400">OcuPaz</span>
          <span className="text-amber-300">Senior</span>
        </h1>
        <p className="text-sm sm:text-lg font-medium text-emerald-100 max-w-md mx-auto mt-1 drop-shadow">
          {language === 'de'
            ? 'Ergotherapie & Lebensqualität für Senioren'
            : language === 'en'
            ? 'Occupational Therapy & Senior Wellness'
            : 'Terapia Ocupacional & Bienestar Integral'}
        </p>
      </div>

      {/* Top Right Skip Button */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute top-4 right-4 z-20 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white font-black text-sm border-2 border-emerald-400 backdrop-blur-md flex items-center gap-2 transition active:scale-95 shadow-xl"
      >
        <span>{language === 'de' ? 'Überspringen' : language === 'en' ? 'Skip Intro' : 'Saltar / Continuar'}</span>
        <SkipForward size={18} />
      </button>

      {/* Progress Line Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-emerald-950/80">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
};
