import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { VideoGenerationOptions, EncodedVideoData } from '@/types/video';

interface ExportProgress {
  progress: number;
  status: string;
}

export class VideoExporter {
  private ffmpeg: FFmpeg|null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      throw new Error('Failed to initialize video export library. This might be due to browser restrictions or network issues.');
    }
  }

  async exportVideo(
    options: Partial<VideoGenerationOptions>,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<EncodedVideoData> {
    await this.initialize();

    if (!this.ffmpeg) {
      throw new Error('Video exporter not initialized');
    }

    const {
      resolution = { width: 1280, height: 720 },
      frameRate = 30,
      bitrate = 2500,
      audioFile,
      duration = 180,
      audioUrl
    } = options;

    try {
      // Note: Actual video generation is handled by VideoGenerator class
      // This class can be used for additional export options or transformations
      
      // For now, return a placeholder since generation is done in VideoGenerator
      return {
        videoBlob: new Blob([], { type: 'video/mp4' }),
        metadata: {
          duration,
          resolution: `${resolution.width}x${resolution.height}`,
          frameRate,
          fileSize: 0,
          style: 'particle-system',
          createdAt: new Date(),
          audioFileName: 'placeholder'
        },
        downloadUrl: ''
      };

    } catch (error) {
      console.error('Video export failed:', error);
      throw error;
    }
  }

  async convertFormat(
    videoBlob: Blob,
    targetFormat: 'mp4' | 'webm' = 'mp4',
    onProgress?: (progress: ExportProgress) => void
  ): Promise<Blob> {
    await this.initialize();

    if (!this.ffmpeg) {
      throw new Error('Video exporter not initialized');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const inputFileName = 'input.mp4';
        const outputFileName = `output.${targetFormat}`;

        // Write input file
        const buffer = await videoBlob.arrayBuffer();
        await this.ffmpeg.writeFile(inputFileName, new Uint8Array(buffer));

        await this.ffmpeg.exec([
          '-i', inputFileName,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-movflags', '+faststart',
          '-y',
          outputFileName
        ]);

        const data = await this.ffmpeg.readFile(outputFileName);
        const outputBlob = new Blob([data], { type: `video/${targetFormat}` });

        // Cleanup
        await this.ffmpeg.deleteFile(inputFileName);
        await this.ffmpeg.deleteFile(outputFileName);

        resolve(outputBlob);
      } catch (error) {
        reject(error);
      }
    });
  }

  async optimizeForWeb(videoBlob: Blob): Promise<Blob> {
    const progressCallbacks: ((p: ExportProgress) => void)[] = [];
    
    const onProgress = (callback: (p: ExportProgress) => void) => {
      progressCallbacks.push(callback);
    };

    // Optimize for web streaming
    const optimizedBlob = await this.convertFormat(videoBlob, 'mp4', (progress) => {
      progressCallbacks.forEach(cb => cb(progress));
    });

    return optimizedBlob;
  }

  createDownloadUrl(videoBlob: Blob, fileName: string): string {
    const url = URL.createObjectURL(videoBlob);
    return url;
  }

  cleanupUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  destroy(): void {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.ffmpeg = null;
      this.isInitialized = false;
    }
  }
}