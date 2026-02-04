import { AudioAnalyzerData, VideoStyle } from '@/types/audio';

export class FrameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; size: number }>;
  private lastBeatTime: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
    this.particles = [];
  }

  renderFrame(frameIndex: number, audioData: AudioAnalyzerData, style: VideoStyle): ImageData {
    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (style) {
      case VideoStyle.PARTICLE_SYSTEM:
        this.renderParticleSystem(audioData);
        break;
      case VideoStyle.GEOMETRIC_PATTERNS:
        this.renderGeometricPatterns(audioData);
        break;
      case VideoStyle.WAVEFORM_ANIMATION:
        this.renderWaveformAnimation(audioData);
        break;
      case VideoStyle.GRADIENT_FLOW:
        this.renderGradientFlow(audioData);
        break;
      case VideoStyle.SPECTRUM_3D:
        this.render3DSpectrum(audioData);
        break;
      case VideoStyle.AUTO_GENERATE:
        this.renderAutoGenerate(frameIndex, audioData);
        break;
      default:
        this.renderWaveformAnimation(audioData);
    }

    return this.ctx.getImageData(0, 0, this.width, this.height);
  }

  private renderParticleSystem(audioData: AudioAnalyzerData): void {
    const { bass, treble, beatDetected } = audioData;
    
    if (beatDetected) {
      this.lastBeatTime = Date.now();
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.width / 2,
          y: this.height / 2,
          vx: (Math.random() - 0.5) * bass * 20,
          vy: (Math.random() - 0.5) * bass * 20,
          life: 1.0,
          size: Math.random() * 3 + 1
        });
      }
    }

    this.particles = this.particles.filter(p => p.life > 0);

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.01;
      p.vx *= 0.99;
      p.vy *= 0.99;

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = `hsl(${(p.life * 360) % 360}, 70%, 50%)`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * treble * 10, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    if (this.particles.length > 0) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  private renderGeometricPatterns(audioData: AudioData): void {
    const { bass, mid, treble, averageAmplitude } = audioData;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    const time = Date.now() / 1000;
    const shapes = Math.floor(bass * 8) + 3;
    
    for (let i = 0; i < shapes; i++) {
      const angle = (i / shapes) * Math.PI * 2;
      const radius = (150 + mid * 100) * (1 + Math.sin(time + i) * 0.3);
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      const size = (treble * 30 + 10) * averageAmplitude;
      
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle + time * bass);
      
      const hue = (i * 360 / shapes + time * 50) % 360;
      this.ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${0.6 + treble * 0.4})`;
      this.ctx.strokeStyle = `hsl(${hue + 30}, 80%, 60%)`;
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.rect(-size / 2, -size / 2, size, size);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private renderWaveformAnimation(audioData: AudioAnalyzerData): void {
    const { timeDomainData, frequencyData, averageAmplitude } = audioData;
    
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(0.5, '#0099ff');
    gradient.addColorStop(1, '#ff00ff');
    
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    
    for (let i = 0; i < timeDomainData.length; i += 4) {
      const x = (i / timeDomainData.length) * this.width;
      const y = this.height / 2 + (timeDomainData[i] - 128) * averageAmplitude * 2;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.stroke();
    
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${averageAmplitude * 0.8})`;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    
    for (let i = 0; i < frequencyData.length; i += 4) {
      const x = (i / frequencyData.length) * this.width;
      const height = (frequencyData[i] / 255) * this.height * 0.3;
      const y = this.height - height;
      
      this.ctx.lineTo(x, y);
    }
    
    this.ctx.stroke();
  }

  private renderGradientFlow(audioData: AudioAnalyzerData): void {
    const { bass, mid, treble, beatDetected } = audioData;
    const time = Date.now() / 1000;
    
    const gradient = this.ctx.createLinearGradient(
      this.width * 0.5 + Math.sin(time) * this.width * 0.3,
      this.height * 0.5 + Math.cos(time) * this.height * 0.3,
      this.width * 0.5 - Math.sin(time) * this.width * 0.3,
      this.height * 0.5 - Math.cos(time) * this.height * 0.3
    );
    
    const phase = (time * 20) % 360;
    gradient.addColorStop(0, `hsl(${(phase + bass * 60) % 360}, 80%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${(phase + 180 + mid * 60) % 360}, 80%, 50%)`);
    gradient.addColorStop(1, `hsl(${(phase + 360 + treble * 60) % 360}, 80%, 50%)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    if (beatDetected) {
      this.ctx.save();
      this.ctx.globalAlpha = bass * 0.5;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }
  }

  private render3DSpectrum(audioData: AudioAnalyzerData): void {
    const { frequencyData, bass, mid, treble } = audioData;
    const barWidth = this.width / frequencyData.length * 2;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(bass * Math.PI * 0.5);
    
    for (let i = 0; i < frequencyData.length / 2; i++) {
      const value = frequencyData[i];
      const height = (value / 255) * this.height * 0.4;
      
      const x = (i - frequencyData.length / 4) * barWidth;
      const depth = mid * 100;
      
      const hue = (i / frequencyData.length * 360 + Date.now() / 50) % 360;
      this.ctx.fillStyle = `hsl(${hue}, 70%, ${50 + treble * 30}%)`;
      
      this.ctx.save();
      this.ctx.translate(x, 0);
      this.ctx.scale(1 + mid * 0.5, 1);
      this.ctx.rotate(mid * Math.PI * 0.1);
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, -height / 2);
      this.ctx.lineTo(-depth, height / 2);
      this.ctx.lineTo(depth, height / 2);
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  private renderAutoGenerate(frameIndex: number, audioData: AudioAnalyzerData): void {
    const styles = [
      this.renderParticleSystem.bind(this),
      this.renderGeometricPatterns.bind(this),
      this.renderGradientFlow.bind(this),
      this.render3DSpectrum.bind(this)
    ];
    
    const styleIndex = Math.floor(frameIndex / 180) % styles.length;
    styles[styleIndex](audioData);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}