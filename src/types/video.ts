export enum VideoStyle {
  PARTICLE_SYSTEM = 'particle-system',
  GEOMETRIC_PATTERNS = 'geometric-patterns', 
  WAVEFORM_ANIMATION = 'waveform-animation',
  GRADIENT_FLOW = 'gradient-flow',
  SPECTRUM_3D = 'spectrum-3d',
  AUTO_GENERATE = 'auto-generate'
}

export interface VideoGenerationOptions {
  style: VideoStyle;
  resolution: { width: number; height: number };
  frameRate: number;
  bitrate: number;
  audioFile: File;
  duration: number;
  audioUrl: string;
}

export interface GenerationProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  status: 'analyzing' | 'rendering' | 'encoding' | 'complete' | 'error' | 'cancelled';
  message: string;
  estimatedTimeRemaining: number | null;
  currentStyle?: string;
}

export interface VideoMetadata {
  duration: number;
  resolution: string;
  frameRate: number;
  fileSize: number;
  style: VideoStyle | VideoStyle[];
  createdAt: Date;
  audioFileName: string;
}

export interface EncodedVideoData {
  videoBlob: Blob;
  metadata: VideoMetadata;
  downloadUrl: string;
}

export interface FrameRenderConfig {
  width: number;
  height: number;
  frameIndex: number;
  totalFrames: number;
  audioData: {
    frequency: number[];
    timeDomain: number[];
    bass: number;
    mid: number;
    treble: number;
    averageAmplitude: number;
    beatDetected: boolean;
  };
  style: VideoStyle | VideoStyle[];
}