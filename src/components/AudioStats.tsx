'use client';

import { memo } from 'react';
import { AudioAnalyzerData } from '@/types/audio';

interface AudioStatsProps {
  analyzerData: AudioAnalyzerData | null;
  bpm: number;
}

const AudioStats = memo(({ analyzerData, bpm }: AudioStatsProps) => {
  if (!analyzerData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Audio Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Bass" value="--" />
          <StatCard label="Mid" value="--" />
          <StatCard label="Treble" value="--" />
          <StatCard label="BPM" value="--" />
        </div>
      </div>
    );
  }

  const { bass, mid, treble, averageAmplitude } = analyzerData;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Audio Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Bass"
          value={`${(bass * 100).toFixed(0)}%`}
          color="text-red-400"
        />
        <StatCard
          label="Mid"
          value={`${(mid * 100).toFixed(0)}%`}
          color="text-green-400"
        />
        <StatCard
          label="Treble"
          value={`${(treble * 100).toFixed(0)}%`}
          color="text-blue-400"
        />
        <StatCard
          label="BPM"
          value={bpm > 0 ? bpm.toString() : '--'}
          color="text-purple-400"
        />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Average Amplitude</span>
          <span className="text-white font-semibold">
            {(averageAmplitude * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-150"
            style={{ width: `${averageAmplitude * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
});

AudioStats.displayName = 'AudioStats';

interface StatCardProps {
  label: string;
  value: string;
  color?: string;
}

function StatCard({ label, value, color = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center">
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

export default AudioStats;
