import React, { useEffect, useRef, useState } from 'react';
import { Exercise } from '../types';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Square } from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/tts';
import { getTranslation, Language } from '../lib/i18n';

interface Props {
  exercise: Exercise;
  currentStepIndex: number;
  highContrast?: boolean;
  ttsEnabled?: boolean;
  language?: Language;
}

export const ExerciseAnimationCanvas: React.FC<Props> = ({
  exercise,
  currentStepIndex,
  highContrast = false,
  ttsEnabled = true,
  language = 'es',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const safeLang = (language || 'es') as Language;
  const t = getTranslation(safeLang);

  // Read step instruction aloud on step change
  useEffect(() => {
    const currentStep = exercise.steps[currentStepIndex];
    if (currentStep) {
      speakText(`${t.exerciseModal.step} ${currentStep.stepNumber}: ${currentStep.instruction}`, ttsEnabled, safeLang);
    }
  }, [currentStepIndex, exercise, ttsEnabled, safeLang]);

  useEffect(() => {
    let animationFrameId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Background color based on high contrast mode
      ctx.fillStyle = highContrast ? '#000000' : '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid for spatial reference
      ctx.strokeStyle = highContrast ? '#333333' : '#E2E8F0';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Calculate smooth loop phase (0 to 1)
      const elapsed = (time - startTime) / 1000;
      let phase = (elapsed % 3) / 3; // 3 second cycle
      if (!isPlaying) phase = 0.5;
      setProgress(phase);

      const centerX = width / 2;
      const centerY = height / 2;

      // Color Palette for high contrast / senior vision
      const primaryColor = highContrast ? '#FFFF00' : '#2563EB'; // Bright Yellow in contrast mode, Royal Blue in normal
      const accentColor = highContrast ? '#00FF00' : '#16A34A'; // Bright Green
      const jointColor = highContrast ? '#FF0055' : '#DC2626'; // Bright Red/Pink
      const lineThickness = highContrast ? 12 : 8;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // --- ANIMATION TYPE SWITCH ---
      if (exercise.animationType === 'hand_flex') {
        // Open/Close Hand Animation
        const flexFactor = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5; // 0 (closed) to 1 (open)
        
        // Draw Wrist & Palm
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = lineThickness;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 80);
        ctx.lineTo(centerX, centerY + 20);
        ctx.stroke();

        // Palm circle
        ctx.fillStyle = highContrast ? '#1E293B' : '#DBEAFE';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 10, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // 5 Fingers
        const fingerAngles = [-0.6, -0.3, 0, 0.3, 0.6];
        const baseLength = 65;
        const flexedLength = 30 + flexFactor * 40;

        fingerAngles.forEach((angle) => {
          const currentAngle = angle * (0.3 + flexFactor * 0.7) - Math.PI / 2;
          const endX = centerX + Math.cos(currentAngle) * flexedLength;
          const endY = centerY + 10 + Math.sin(currentAngle) * flexedLength;

          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = lineThickness;
          ctx.beginPath();
          ctx.moveTo(centerX + angle * 25, centerY + 10);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Finger Tip Joint Indicator
          ctx.fillStyle = jointColor;
          ctx.beginPath();
          ctx.arc(endX, endY, 10, 0, Math.PI * 2);
          ctx.fill();
        });

        // Direction Arrow
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        const labelText =
          safeLang === 'de'
            ? flexFactor > 0.5 ? '↑ HAND ÖFFNEN ↑' : '↓ FAUST BALLEN ↓'
            : safeLang === 'en'
            ? flexFactor > 0.5 ? '↑ OPEN HAND ↑' : '↓ CLOSE FIST ↓'
            : flexFactor > 0.5 ? '↑ ABRIR MANO ↑' : '↓ CERRAR PUÑO ↓';
        ctx.fillText(labelText, centerX, height - 25);

      } else if (exercise.animationType === 'finger_pinch') {
        // Pinch Finger Animation
        const pinchIndex = Math.floor(phase * 4); // 0: index, 1: middle, 2: ring, 3: pinky
        
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = lineThickness;

        // Base Palm
        ctx.beginPath();
        ctx.arc(centerX, centerY + 30, 40, 0, Math.PI);
        ctx.stroke();

        // Thumb Base
        const thumbX = centerX - 45;
        const thumbY = centerY;

        // Active Target Finger
        const fingerXPositions = [centerX - 20, centerX, centerX + 20, centerX + 40];
        
        fingerXPositions.forEach((fx, idx) => {
          const isActive = idx === pinchIndex;
          ctx.strokeStyle = isActive ? accentColor : primaryColor;
          ctx.lineWidth = isActive ? lineThickness + 4 : lineThickness - 2;

          const topY = isActive ? thumbY : centerY - 50;

          ctx.beginPath();
          ctx.moveTo(fx, centerY + 30);
          ctx.lineTo(isActive ? thumbX + 15 : fx, topY);
          ctx.stroke();

          // Joint Dot
          ctx.fillStyle = isActive ? jointColor : primaryColor;
          ctx.beginPath();
          ctx.arc(isActive ? thumbX + 15 : fx, topY, isActive ? 12 : 8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Thumb
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = lineThickness;
        ctx.beginPath();
        ctx.moveTo(centerX - 35, centerY + 30);
        ctx.lineTo(thumbX + 15, thumbY);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        const labelText =
          safeLang === 'de'
            ? 'PINZETTE: FINGERKUPPEN BERÜHREN'
            : safeLang === 'en'
            ? 'PINCH: TOUCH FINGERTIPS'
            : 'PINZA: TOCA YEMAS DE DEDOS';
        ctx.fillText(labelText, centerX, height - 25);

      } else if (exercise.animationType === 'wrist_rotate') {
        // Wrist Rotate
        const angle = phase * Math.PI * 2;
        
        // Forearm
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = lineThickness;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 90);
        ctx.lineTo(centerX, centerY + 20);
        ctx.stroke();

        // Joint
        ctx.fillStyle = jointColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY + 20, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hand line rotating
        const handX = centerX + Math.cos(angle) * 55;
        const handY = centerY + 20 + Math.sin(angle) * 35;

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = lineThickness + 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 20);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Rotation Guide Circle
        ctx.strokeStyle = highContrast ? '#FFFF0066' : '#2563EB44';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(centerX, centerY + 20, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        const labelText =
          safeLang === 'de'
            ? '↻ HANDGELENK DREHUNG ↺'
            : safeLang === 'en'
            ? '↻ WRIST ROTATION ↺'
            : '↻ ROTACIÓN DE MUÑECA ↺';
        ctx.fillText(labelText, centerX, height - 25);

      } else {
        // General Arm / Movement Motion
        const armAngle = -0.5 + Math.sin(phase * Math.PI * 2) * 0.4;
        
        // Body / Shoulder
        ctx.fillStyle = primaryColor;
        ctx.fillRect(centerX - 40, centerY + 30, 80, 70);

        // Shoulder Joint
        ctx.fillStyle = jointColor;
        ctx.beginPath();
        ctx.arc(centerX - 30, centerY + 30, 15, 0, Math.PI * 2);
        ctx.fill();

        // Arm
        const handX = centerX - 30 + Math.cos(armAngle) * 80;
        const handY = centerY + 30 + Math.sin(armAngle) * 80;

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = lineThickness + 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY + 30);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(handX, handY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        const labelText =
          safeLang === 'de'
            ? 'KONTINUIERLICHE BEWEGUNG'
            : safeLang === 'en'
            ? 'CONTINUOUS GUIDED MOTION'
            : 'MOVIMIENTO GUIADO CONTINUO';
        ctx.fillText(labelText, centerX, height - 25);
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [exercise, isPlaying, highContrast, safeLang]);

  const currentStep = exercise.steps[currentStepIndex] || exercise.steps[0];

  return (
    <div className={`w-full rounded-2xl overflow-hidden border-4 ${highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-blue-200 text-slate-800'} shadow-lg p-4 flex flex-col items-center`}>
      {/* Visual Canvas */}
      <div className="relative w-full max-w-md aspect-4/3 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full object-contain"
        />

        {/* Floating Controls */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-full font-bold text-lg shadow-md flex items-center justify-center transition ${
              highContrast
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={() => speakText(`${t.exerciseModal.step} ${currentStep.stepNumber}: ${currentStep.instruction}`, ttsEnabled, safeLang)}
            className={`p-3 rounded-full font-bold shadow-md flex items-center justify-center transition ${
              highContrast
                ? 'bg-green-400 text-black hover:bg-green-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            title={t.exerciseModal.speakInstruction || 'Escuchar'}
          >
            <Volume2 size={24} />
          </button>
          <button
            onClick={stopSpeaking}
            className="p-3 rounded-full font-bold shadow-md flex items-center justify-center bg-rose-600 text-white hover:bg-rose-700 transition"
            title={t.voiceControl.stop}
          >
            <Square size={24} className="fill-current" />
          </button>
        </div>

        {/* Live Step Overlay Badge */}
        <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-sm font-black uppercase tracking-wider ${
          highContrast ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white'
        }`}>
          {t.exerciseModal.step} {currentStepIndex + 1} {t.exerciseModal.of} {exercise.steps.length}
        </div>
      </div>

      {/* Step Instruction Box in HUGE readable typography */}
      <div className={`w-full mt-4 p-4 rounded-xl border-2 text-center ${
        highContrast ? 'bg-zinc-900 border-yellow-400' : 'bg-blue-50 border-blue-300'
      }`}>
        <p className={`font-black text-xl md:text-2xl mb-1 ${highContrast ? 'text-yellow-300' : 'text-blue-900'}`}>
          {currentStep.instruction}
        </p>
        <p className={`text-base md:text-lg font-medium flex items-center justify-center gap-1.5 ${highContrast ? 'text-zinc-300' : 'text-slate-600'}`}>
          <Sparkles size={18} className="text-amber-500" />
          <span>{language === 'de' ? 'Visuelle Anleitung' : language === 'en' ? 'Visual guide' : 'Guía visual'}:</span> <span className="font-bold underline">{currentStep.visualHint}</span>
        </p>
      </div>
    </div>
  );
};
