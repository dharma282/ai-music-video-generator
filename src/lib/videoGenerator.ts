import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { VideoGenerationOptions, GenerationProgress, EncodedVideoData, FrameRenderConfig } from '@/types/video';
import { AudioAnalyzer } from './audioAnalyzer';
import { FrameRenderer } from './frameRenderer';

interface VideoGenerationCallbacks {
  onProgress?: (progress: GenerationProgress) => void;
  onComplete?: (result: EncodedVideoData) => void;
  onError?: (error: Error) => void;
}

export class VideoGenerator {
  private ffmpeg: FFmpeg | null = null;
  private frameRenderer: FrameRenderer;
  private audioAnalyzer: AudioAnalyzer;
  private isGenerating = false;
  private currentOptions: VideoGenerationOptions | null = null;
  private callbacks: VideoGenerationCallbacks = {};
  private audioElement: HTMLAudioElement | null = null;
  private audioBuffer: Float32Array | null = null;
  private sampleRate = 44100;
  private frameData: Array<{
    frequency: number[];
    timeDomain: number[];
    bass: number;
    mid: number;
    treble: number;
    averageAmplitude: number;
    beatDetected: boolean;
  }> = [];

  constructor(width = 1280, height = 720) {
    this.frameRenderer = new FrameRenderer(width, height);
    this.audioAnalyzer = new AudioAnalyzer();
  }

  async initializeFFmpeg(): Promise<void> {
    if (this.ffmpeg) return;

    this.ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    try {
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      throw new Error('Failed to initialize video encoding library. Please try again.');
    }
  }

  async generateVideo(
    options: VideoGenerationOptions,
    callbacks?: VideoGenerationCallbacks
  ): Promise<EncodedVideoData> {
    if (this.isGenerating) {
      throw new Error('Video generation already in progress');
    }

    this.isGenerating = true;
    this.currentOptions = options;
    this.callbacks = callbacks || {};

    try {
      await this.initializeFFmpeg();
      await this.processAudio(options);
      await this.renderFrames(options);
      return await this.encodeVideo(options);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      this.callbacks.onError?.(err);
      throw err;
    } finally {
      this.isGenerating = false;
      this.cleanup();
    }
  }

  private async processAudio(options: VideoGenerationOptions): Promise<void> {
    this.updateProgress({
      status: 'analyzing',
      message: 'Analyzing audio...',
      currentFrame: 0,
      totalFrames: Math.floor(options.duration * options.frameRate),
      percentage: 0,
      estimatedTimeRemaining: null
    });

    // Create audio element and analyzer
    this.audioElement = new Audio();
    this.audioElement.src = options.audioUrl;
    
    // Load audio file and extract audio data
    const audioBuffer = await this.loadAudioFile(options.audioFile);
    this.sampleRate = audioBuffer.sampleRate;
    
    // Simulate real-time audio analysis by processing chunks
    const frameCount = Math.floor(options.duration * options.frameRate);
    const samplesPerFrame = Math.floor(audioBuffer.length / frameCount);

    for (let i = 0; i < frameCount; i++) {
      const frameData = await this.analyzeFrame(
        audioBuffer,
        i * samplesPerFrame,
        samplesPerFrame
      );
      this.frameData.push(frameData);

      if (i % 30 === 0) {
        this.updateProgress({
          currentFrame: i,
          totalFrames: frameCount,
          percentage: (i / frameCount) * 15 + 5, // Allocate 5-20% for analysis
          status: 'analyzing',
          message: `Analyzing audio: ${Math.round((i / frameCount) * 100)}%`,
          estimatedTimeRemaining: this.estimateTimeRemaining(i, frameCount, 0.15)
        });
      }
    }
  }

  private async loadAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  private async analyzeFrame(
    audioBuffer: AudioBuffer,
    startIndex: number,
    sampleCount: number
  ): Promise<{
    frequency: number[];
    timeDomain: number[];
    bass: number;
    mid: number;
    treble: number;
    averageAmplitude: number;
    beatDetected: boolean;
  }> {
    // Extract audio data for this frame
    const channelData = audioBuffer.getChannelData(0);
    const frameData = channelData.slice(startIndex, startIndex + sampleCount);
    
    // Compute FFT-like frequency analysis (simplified)
    const frequency = this.computeFrequencyData(frameData, 128);
    const timeDomain = Array.from(frameData).map(v => (v + 1) * 128);
    
    // Calculate frequency bands
    const bass = frequency.slice(0, Math.floor(frequency.length * 0.1)).reduce((a, b) => a + b, 0) / frequency.length;
    const mid = frequency.slice(Math.floor(frequency.length * 0.1), Math.floor(frequency.length * 0.4)).reduce((a, b) => a + b, 0) / frequency.length;
    const treble = frequency.slice(Math.floor(frequency.length * 0.4)).reduce((a, b) => a + b, 0) / frequency.length;
    
    // Calculate average amplitude
    const averageAmplitude = frameData.reduce((a, b) => Math.abs(a) + Math.abs(b), 0) / frameData.length;
    
    // Simple beat detection based on bass
    const beatDetected = bass > 0.6;
    
    return {
      frequency: Array.from(frequency),
      timeDomain,
      bass: bass / 255,
      mid: mid / 255,
      treble: treble / 255,
      averageAmplitude,
      beatDetected
    };
  }

  private computeFrequencyData(timeDomainData: Float32Array, fftSize: number): Float32Array {
    // Simplified FFT computation for demonstration
    // In production, you'd use a proper FFT library
    const result = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
      const index = Math.floor((i / fftSize) * timeDomainData.length);
      result[i] = Math.abs(timeDomainData[index]) * 255;
    }
    return result;
  }

  private async renderFrames(options: VideoGenerationOptions): Promise<void> {
    this.updateProgress({
      status: 'rendering',
      message: 'Rendering video frames...',
      currentFrame: 0,
      totalFrames: this.frameData.length,
      percentage: 20,
      estimatedTimeRemaining: null
    });

    const frameCount = this.frameData.length;
    const frameDelay = 1000 / options.frameRate; // milliseconds per frame

    for (let i = 0; i < frameCount; i++) {
      const frameConfig: FrameRenderConfig = {
        width: options.resolution.width,
        height: options.resolution.height,
        frameIndex: i,
        totalFrames: frameCount,
        audioData: this.frameData[i],
        style: options.style
      };

      const imageData = this.frameRenderer.renderFrame(frameConfig);
      
      // Save frame as PNG (will be used by FFmpeg)
      if (this.ffmpeg) {
        const canvas = this.frameRenderer.getCanvas();
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(resolve as BlobCallback, 'image/png');
        });
        
        if (blob) {
          const buffer = await blob.arrayBuffer();
          this.ffmpeg.writeFile(`frame${i.toString().padStart(6, '0')}.png`, new Uint8Array(buffer));
        }
      }

      // Update progress every 30 frames
      if (i % 30 === 0) {
        const progress = 20 + (i / frameCount) * 50; // Allocate 20-70% for rendering
        this.updateProgress({
          currentFrame: i,
          totalFrames: frameCount,
          percentage: progress,
          status: 'rendering',
          message: `Rendering frames: ${Math.round((i / frameCount) * 100)}%`,
          estimatedTimeRemaining: this.estimateTimeRemaining(i, frameCount, 0.5)
        });
      }
    }
  }

  private async encodeVideo(options: VideoGenerationOptions): Promise<EncodedVideoData> {
    this.updateProgress({
      status: 'encoding',
      message: 'Encoding video to MP4...',
      currentFrame: options.frameRate * options.duration,
      totalFrames: options.frameRate * options.duration,
      percentage: 70,
      estimatedTimeRemaining: null
    });

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    // Create video from frames using FFmpeg
    const inputPattern = 'frame%06d.png';
    const outputFile = 'output.mp4';
    
    // FFmpeg command for MP4 encoding
    const ffmpegArgs = [
      '-framerate', options.frameRate.toString(),
      '-i', inputPattern,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'medium',
      '-b:v', `${options.bitrate}k`,
      '-movflags', '+faststart',
      '-y', // Overwrite output file
      outputFile
    ];

    await this.ffmpeg.exec(ffmpegArgs);

    // Read the output file
    const data = await this.ffmpeg.readFile(outputFile);
    const videoBlob = new Blob([data], { type: 'video/mp4' });
    
    // Clean up frame files
    for (let i = 0; i < this.frameData.length; i++) {
      try {
        await this.ffmpeg.deleteFile(`frame${i.toString().padStart(6, '0')}.png`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    const metadata: any = {
      duration: options.duration,
      resolution: `${options.resolution.width}x${options.resolution.height}`,
      frameRate: options.frameRate,
      fileSize: videoBlob.size,
      style: options.style,
      createdAt: new Date(),
      audioFileName: options.audioFile.name
    };

    // Create download URL
    const downloadUrl = URL.createObjectURL(videoBlob);

    this.updateProgress({
      status: 'complete',
      message: 'Video generation complete!',
      currentFrame: options.frameRate * options.duration,
      totalFrames: options.frameRate * options.duration,
      percentage: 100,
      estimatedTimeRemaining: 0
    });

    this.callbacks.onComplete?.({
      videoBlob,
      metadata,
      downloadUrl
    });

    return {
      videoBlob,
      metadata,
      downloadUrl
    };
  }

  private updateProgress(progress: GenerationProgress): void {
    if (this.callbacks.onProgress) {
      this.callbacks.onProgress(progress);
    }
  }

  private estimateTimeRemaining(
    currentFrame: number,
    totalFrames: number,
    progressSection: number
  ): number {
    const timePerFrame = 1000 / (this.currentOptions?.frameRate || 30);
    const remainingFrames = totalFrames - currentFrame;
    return remainingFrames * timePerFrame;
  }

  cancelGeneration(): void {
    if (this.ffmpeg) {
      this.isGenerating = false;
    }
  }

  private cleanup(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    
    this.frameData = [];
    this.currentOptions = null;
  }

  destroy(): void {
    this.cancelGeneration();
    this.cleanup();
    this.frameRenderer.destroy();
  }
}