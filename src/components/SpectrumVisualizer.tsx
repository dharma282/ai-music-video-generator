'use client';

import { useEffect, useRef, memo } from 'react';
import { VisualizerProps } from '@/types/audio';

const SpectrumVisualizer = memo(({ analyzerData, width = 800, height = 300 }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyzerData) {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const { frequencyData } = analyzerData;
      const barCount = 30;
      const barWidth = (width / barCount) * 0.8;
      const gap = (width / barCount) * 0.2;

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, width, height);

      const step = Math.floor(frequencyData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const barIndex = i * step;
        const barHeight = (frequencyData[barIndex] / 255) * height;
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        const ratio = i / barCount;
        let r, g, b;

        if (ratio < 0.33) {
          r = 255;
          g = Math.floor(ratio * 3 * 255);
          b = 0;
        } else if (ratio < 0.66) {
          r = Math.floor((1 - (ratio - 0.33) * 3) * 255);
          g = 255;
          b = 0;
        } else {
          r = 0;
          g = Math.floor((1 - (ratio - 0.66) * 3) * 255);
          b = 255;
        }

        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.3)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyzerData, width, height]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold mb-2">Spectrum Analyzer</h3>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full"
        />
      </div>
    </div>
  );
});

SpectrumVisualizer.displayName = 'SpectrumVisualizer';

export default SpectrumVisualizer;
