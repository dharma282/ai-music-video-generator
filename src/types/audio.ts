export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  duration: number;
  url: string;
}

export interface AudioAnalyzerData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
  averageAmplitude: number;
  beatDetected: boolean;
}

export interface AudioStats {
  currentFrequency: number;
  averageAmplitude: number;
  bpm: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
}

export interface VisualizerProps {
  analyzerData: AudioAnalyzerData | null;
  width?: number;
  height?: number;
}

export interface BeatDetection {
  isBeat: boolean;
  strength: number;
  bpm: number;
}
