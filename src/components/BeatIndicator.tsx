'use client';

import { useEffect, useRef, memo } from 'react';
import { VisualizerProps } from '@/types/audio';

const BeatIndicator = memo(({ analyzerData, width = 300, height = 300 }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const pulseRef = useRef(0);
  const bpmHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, width, height);

      if (analyzerData?.beatDetected) {
        pulseRef.current = 1;
      }

      if (pulseRef.current > 0) {
        pulseRef.current -= 0.05;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.2;
      const radius = baseRadius + (pulseRef.current * baseRadius * 0.5);

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `rgba(255, 0, 100, ${pulseRef.current})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 200, ${pulseRef.current * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 0, 100, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + pulseRef.current * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyzerData, width, height]);

  const getBPM = (): number => {
    if (!analyzerData) return 0;
    
    if (analyzerData.beatDetected) {
      const now = Date.now();
      const lastBeat = bpmHistoryRef.current[bpmHistoryRef.current.length - 1];
      
      if (lastBeat && now - lastBeat > 200) {
        const timeDiff = now - lastBeat;
        const bpm = Math.round(60000 / timeDiff);
        
        if (bpm > 60 && bpm < 200) {
          bpmHistoryRef.current.push(now);
          if (bpmHistoryRef.current.length > 10) {
            bpmHistoryRef.current.shift();
          }
        }
      } else if (!lastBeat) {
        bpmHistoryRef.current.push(now);
      }
    }

    if (bpmHistoryRef.current.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < bpmHistoryRef.current.length; i++) {
      intervals.push(bpmHistoryRef.current[i] - bpmHistoryRef.current[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.round(60000 / avgInterval);
  };

  const currentBPM = getBPM();
  const beatStrength = analyzerData?.bass || 0;

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold mb-2">Beat Detector</h3>
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full max-w-[300px]"
          />
          <div className="mt-4 text-center">
            <div className="text-white text-4xl font-bold mb-2">
              {currentBPM > 0 ? currentBPM : '--'} BPM
            </div>
            <div className="text-gray-400 text-sm">
              Beat Strength: {(beatStrength * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BeatIndicator.displayName = 'BeatIndicator';

export default BeatIndicator;
