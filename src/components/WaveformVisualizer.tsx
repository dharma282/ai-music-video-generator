'use client';

import { useEffect, useRef, memo } from 'react';
import { VisualizerProps } from '@/types/audio';

const WaveformVisualizer = memo(({ analyzerData, width = 800, height = 300 }: VisualizerProps) => {
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

      const { timeDomainData } = analyzerData;
      
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 255, 255)';
      ctx.beginPath();

      const sliceWidth = width / timeDomainData.length;
      let x = 0;

      let sum = 0;
      for (let i = 0; i < timeDomainData.length; i++) {
        sum += Math.abs(timeDomainData[i] - 128);
      }
      const avgAmplitude = sum / timeDomainData.length;

      const intensity = Math.min(avgAmplitude / 64, 1);
      const r = Math.floor(intensity * 255);
      const g = Math.floor((1 - intensity) * 255);
      const b = 255;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;

      for (let i = 0; i < timeDomainData.length; i++) {
        const v = timeDomainData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
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

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <div className="p-4">
        <h3 className="text-white text-lg font-semibold mb-2">Waveform</h3>
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

WaveformVisualizer.displayName = 'WaveformVisualizer';

export default WaveformVisualizer;
