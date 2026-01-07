import { AudioAnalyzerData, BeatDetection } from '@/types/audio';

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private timeDomainArray: Uint8Array | null = null;
  private beatThreshold = 1.3;
  private beatHistory: number[] = [];
  private lastBeatTime = 0;
  private bpmHistory: number[] = [];

  async initialize(audioElement: HTMLAudioElement): Promise<void> {
    try {
      if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.sourceNode) {
        this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      }

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      const bufferLength = this.analyserNode.frequencyBinCount;
      const buffer = new ArrayBuffer(bufferLength);
      const timeDomainBuffer = new ArrayBuffer(bufferLength);
      this.dataArray = new Uint8Array(buffer);
      this.timeDomainArray = new Uint8Array(timeDomainBuffer);
    } catch (error) {
      console.error('Error initializing audio analyzer:', error);
      throw error;
    }
  }

  getAnalyzerData(): AudioAnalyzerData | null {
    if (!this.analyserNode || !this.dataArray || !this.timeDomainArray) {
      return null;
    }

    // @ts-expect-error - TypeScript strict typing issue with ArrayBuffer vs ArrayBufferLike
    this.analyserNode.getByteFrequencyData(this.dataArray);
    // @ts-expect-error - TypeScript strict typing issue with ArrayBuffer vs ArrayBufferLike
    this.analyserNode.getByteTimeDomainData(this.timeDomainArray);

    const { bass, mid, treble } = this.getFrequencyBands();
    const beatDetected = this.detectBeat(bass);
    const averageAmplitude = this.calculateAverageAmplitude();

    return {
      frequencyData: this.dataArray,
      timeDomainData: this.timeDomainArray,
      bass,
      mid,
      treble,
      averageAmplitude,
      beatDetected,
    };
  }

  private getFrequencyBands(): { bass: number; mid: number; treble: number } {
    if (!this.dataArray) {
      return { bass: 0, mid: 0, treble: 0 };
    }

    const length = this.dataArray.length;
    const bassEnd = Math.floor(length * 0.1);
    const midEnd = Math.floor(length * 0.4);

    let bass = 0;
    let mid = 0;
    let treble = 0;

    for (let i = 0; i < bassEnd; i++) {
      bass += this.dataArray[i];
    }
    bass /= bassEnd;

    for (let i = bassEnd; i < midEnd; i++) {
      mid += this.dataArray[i];
    }
    mid /= (midEnd - bassEnd);

    for (let i = midEnd; i < length; i++) {
      treble += this.dataArray[i];
    }
    treble /= (length - midEnd);

    return {
      bass: bass / 255,
      mid: mid / 255,
      treble: treble / 255,
    };
  }

  private detectBeat(bassLevel: number): boolean {
    const now = Date.now();
    this.beatHistory.push(bassLevel);

    if (this.beatHistory.length > 10) {
      this.beatHistory.shift();
    }

    const average = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
    const isBeat = bassLevel > average * this.beatThreshold;

    if (isBeat && now - this.lastBeatTime > 200) {
      const timeDiff = now - this.lastBeatTime;
      const bpm = Math.round(60000 / timeDiff);

      if (bpm > 60 && bpm < 200) {
        this.bpmHistory.push(bpm);
        if (this.bpmHistory.length > 10) {
          this.bpmHistory.shift();
        }
      }

      this.lastBeatTime = now;
      return true;
    }

    return false;
  }

  private calculateAverageAmplitude(): number {
    if (!this.dataArray) {
      return 0;
    }

    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    return sum / this.dataArray.length / 255;
  }

  getEstimatedBPM(): number {
    if (this.bpmHistory.length === 0) {
      return 0;
    }

    const sum = this.bpmHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.bpmHistory.length);
  }

  getBeatDetection(): BeatDetection {
    const data = this.getAnalyzerData();
    return {
      isBeat: data?.beatDetected || false,
      strength: data?.bass || 0,
      bpm: this.getEstimatedBPM(),
    };
  }

  disconnect(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyserNode = null;
    this.sourceNode = null;
  }
}
