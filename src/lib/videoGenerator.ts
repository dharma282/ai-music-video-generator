import { AudioAnalyzer } from './audioAnalyzer';
import { FrameRenderer } from './frameRenderer';
import { 
  VideoGenerationOptions, 
  VideoMetadata, 
  GenerationProgress,
  VideoStyle,
  AudioAnalyzerData
} from '@/types/audio';

export class VideoGenerator {
  private analyzer: AudioAnalyzer;
  private frameRenderer: FrameRenderer;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private isCancelled = false;

  constructor() {
    this.analyzer = new AudioAnalyzer();
    this.frameRenderer = new FrameRenderer(1280, 720);
  }

  async generateVideo(
    options: VideoGenerationOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<{ videoUrl: string; metadata: VideoMetadata }> {
    this.isCancelled = false;
    
    try {
      onProgress?.({
        currentFrame: 0,
        totalFrames: 0,
        percentage: 0,
        currentStage: 'analyzing',
        estimatedTimeRemaining: 0,
        startTime: Date.now()
      });

      await this.setupAudioContext();
      
      const audioArrayBuffer = await options.audioFile.arrayBuffer();
      this.audioBuffer = await this.decodeAudioData(audioArrayBuffer);
      
      const duration = this.audioBuffer.duration;
      const totalFrames = Math.ceil(duration * options.frameRate);
      
      onProgress?.({
        currentFrame: 0,
        totalFrames,
        percentage: 5,
        currentStage: 'rendering',
        estimatedTimeRemaining: 0,
        startTime: Date.now()
      });

      const frames: ImageData[] = [];
      const sampleRate = this.audioBuffer.sampleRate;
      
      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        if (this.isCancelled) {
          throw new Error('Video generation cancelled');
        }

        const progress = {
          currentFrame: frameIndex,
          totalFrames,
          percentage: 5 + (frameIndex / totalFrames) * 85,
          currentStage: 'rendering' as const,
          estimatedTimeRemaining: this.calculateEstimatedTimeRemaining(frameIndex, totalFrames, Date.now()),
          startTime: Date.now() - (frameIndex / options.frameRate) * 1000
        };
        
        onProgress?.(progress);

        const currentTime = frameIndex / options.frameRate;
        const audioData = this.extractAudioAnalysisAtTime(currentTime, sampleRate);
        
        const frame = this.frameRenderer.renderFrame(frameIndex, audioData, options.style);
        frames.push(frame);

        if (frameIndex % 30 === 0) {
          await this.yieldToMainThread();
        }
      }

      onProgress?.({
        currentFrame: totalFrames,
        totalFrames,
        percentage: 90,
        currentStage: 'encoding',
        estimatedTimeRemaining: 0,
        startTime: Date.now()
      });

      const videoUrl = await this.encodeVideo(frames, options);
      
      const metadata: VideoMetadata = {
        duration,
        width: options.resolution.width,
        height: options.resolution.height,
        frameRate: options.frameRate,
        bitrate: options.bitrate,
        fileSize: 0,
        codec: 'H.264',
        style: options.style,
        generatedAt: new Date()
      };

      onProgress?.({
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        currentStage: 'encoding',
        estimatedTimeRemaining: 0,
        startTime: Date.now()
      });

      return { videoUrl, metadata };
    } catch (error) {
      console.error('Video generation failed:', error);
      throw error;
    } finally {
      this.cleanup();
    }
  }

  cancel(): void {
    this.isCancelled = true;
  }

  private async setupAudioContext(): Promise<void> {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new AudioContextClass();
  }

  private async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    
    return new Promise((resolve, reject) => {
      this.audioContext!.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }

  private extractAudioAnalysisAtTime(time: number, sampleRate: number): AudioAnalyzerData {
    if (!this.audioBuffer) {
      throw new Error('AudioBuffer not loaded');
    }

    const samplesPerFrame = Math.floor(sampleRate / 30); // Analyze at 30fps
    const startSample = Math.floor(time * sampleRate);
    const endSample = Math.min(startSample + samplesPerFrame, this.audioBuffer.length);
    
    const channelData = this.audioBuffer.getChannelData(0);
    const samples = channelData.slice(startSample, endSample);
    
    const analyzerData: AudioAnalyzerData = {
      frequencyData: this.generateFrequencyData(samples),
      timeDomainData: this.generateTimeDomainData(samples),
      bass: this.calculateBandEnergy(samples, 0, 200, sampleRate),
      mid: this.calculateBandEnergy(samples, 200, 2000, sampleRate),
      treble: this.calculateBandEnergy(samples, 2000, 8000, sampleRate),
      averageAmplitude: this.calculateAverageAmplitude(samples),
      beatDetected: this.detectBeat(samples)
    };

    return analyzerData;
  }

  private generateFrequencyData(samples: Float32Array): Uint8Array {
    const fftSize = 2048;
    const buffer = new ArrayBuffer(fftSize);
    const data = new Uint8Array(buffer);
    
    for (let i = 0; i < Math.min(samples.length, fftSize); i++) {
      data[i] = Math.abs(samples[i]) * 255;
    }
    
    return data;
  }

  private generateTimeDomainData(samples: Float32Array): Uint8Array {
    const data = new Uint8Array(2048);
    
    for (let i = 0; i < Math.min(samples.length, 2048); i++) {
      data[i] = (samples[i] + 1) * 127.5;
    }
    
    return data;
  }

  private calculateBandEnergy(samples: Float32Array, lowFreq: number, highFreq: number, sampleRate: number): number {
    const lowIndex = Math.floor(lowFreq * samples.length / sampleRate);
    const highIndex = Math.min(
      Math.floor(highFreq * samples.length / sampleRate),
      samples.length
    );
    
    if (highIndex <= lowIndex) return 0;
    
    let energy = 0;
    for (let i = lowIndex; i < highIndex; i++) {
      energy += Math.abs(samples[i]);
    }
    
    return energy / (highIndex - lowIndex);
  }

  private calculateAverageAmplitude(samples: Float32Array): number {
    if (samples.length === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += Math.abs(samples[i]);
    }
    
    return sum / samples.length;
  }

  private beatHistory: number[] = [];
  private lastBeatSample = 0;
  
  private detectBeat(samples: Float32Array): boolean {
    const bassEnergy = this.calculateBandEnergy(samples, 0, 200, 44100);
    
    this.beatHistory.push(bassEnergy);
    if (this.beatHistory.length > 10) {
      this.beatHistory.shift();
    }
    
    if (this.beatHistory.length < 5) return false;
    
    const avgEnergy = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
    const threshold = avgEnergy * 1.5;
    
    if (bassEnergy > threshold) {
      this.lastBeatSample = samples.length;
      return true;
    }
    
    return false;
  }

  private async encodeVideo(
    frames: ImageData[], 
    options: VideoGenerationOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = options.resolution.width;
      canvas.height = options.resolution.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      const stream = canvas.captureStream(options.frameRate);
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      
      if (this.audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(destination);
        source.connect(audioContext.destination);
        
        const audioTrack = destination.stream.getAudioTracks()[0];
        stream.addTrack(audioTrack);
        
        setTimeout(() => source.start(0), 100);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=h264',
        videoBitsPerSecond: options.bitrate * 1000
      });

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      mediaRecorder.onerror = (error) => {
        reject(error);
      };

      mediaRecorder.start();

      let frameIndex = 0;
      const renderFrame = () => {
        if (frameIndex >= frames.length) {
          mediaRecorder.stop();
          return;
        }

        if (this.isCancelled) {
          mediaRecorder.stop();
          reject(new Error('Video generation cancelled'));
          return;
        }

        ctx.putImageData(frames[frameIndex], 0, 0);
        frameIndex++;
        
        setTimeout(renderFrame, 1000 / options.frameRate);
      };

      setTimeout(renderFrame, 100);
    });
  }

  private calculateEstimatedTimeRemaining(
    currentFrame: number,
    totalFrames: number,
    currentTime: number
  ): number {
    if (currentFrame === 0) return 0;
    
    const elapsed = currentTime;
    const framesPerMs = currentFrame / elapsed;
    const remainingFrames = totalFrames - currentFrame;
    const remainingTime = remainingFrames / framesPerMs;
    
    return Math.max(0, Math.round(remainingTime));
  }

  private yieldToMainThread(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  private cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }
    this.audioBuffer = null;
  }
}