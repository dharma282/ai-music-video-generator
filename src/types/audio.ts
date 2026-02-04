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

export enum VideoStyle {
  PARTICLE_SYSTEM = 'particle-system',
  GEOMETRIC_PATTERNS = 'geometric-patterns',
  WAVEFORM_ANIMATION = 'waveform-animation',
  GRADIENT_FLOW = 'gradient-flow',
  SPECTRUM_3D = 'spectrum-3d',
  AUTO_GENERATE = 'auto-generate'
}

export interface VideoGenerationOptions {
  audioFile: File;
  audioDuration: number;
  style: VideoStyle;
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  bitrate: number;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  fileSize: number;
  codec: string;
  style: VideoStyle;
  generatedAt: Date;
}

export interface FrameRenderConfig {
  width: number;
  height: number;
  frameIndex: number;
  totalFrames: number;
  audioData: AudioAnalyzerData;
  style: VideoStyle;
}

export interface GenerationProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  currentStage: 'analyzing' | 'rendering' | 'encoding';
  estimatedTimeRemaining: number;
  startTime: number;
}
