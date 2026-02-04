'use client';

import { useState, useRef, useCallback } from 'react';
import { VideoMetadata } from '@/types/audio';
import {
  Film,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Download,
  Clock,
  Monitor,
  Filmstrip,
  Info
} from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'Unknown';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatBitrate(bitrate: number): string {
  if (!bitrate) return 'Unknown';
  return `${bitrate} kbps`;
}

interface VideoPreviewProps {
  videoUrl: string;
  metadata: Partial<VideoMetadata>;
  onDownload: () => void;
  onClose: () => void;
}

export default function VideoPreview({ 
  videoUrl, 
  metadata, 
  onDownload, 
  onClose 
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setIsLoaded(true);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime || 0);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const volume = parseFloat(e.target.value);
      videoRef.current.volume = volume;
      setVolume(volume);
    }
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getStyleName = (style?: string): string => {
    if (!style) return 'Unknown';
    
    const styleMap: Record<string, string> = {
      'particle-system': 'Particle System',
      'geometric-patterns': 'Geometric Patterns',
      'waveform-animation': 'Waveform Animation',
      'gradient-flow': 'Gradient Flow',
      'spectrum-3d': '3D Spectrum',
      'auto-generate': 'Auto-Generate'
    };
    
    return styleMap[style] || style;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-auto max-h-[70vh]"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onClick={handlePlayPause}
            preload="metadata"
          >
            <p className="text-white p-4">Your browser does not support the video tag.</p>
          </video>

          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-gray-300">
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading video...</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPause}
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-white" fill="currentColor" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                  )}
                </button>

                <span className="text-xs text-gray-300 w-20">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>

                <div className="flex items-center space-x-1">
                  <Volume2 className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFullscreenToggle}
                  className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Generated Music Video</h3>
              <p className="text-sm text-gray-400">
                Synchronized to {audioFileName()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Download MP4</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Close preview"
              >
                <Film className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Duration</span>
              </div>
              <p className="text-sm font-medium text-white">
                {formatDuration(duration || metadata.duration || 0)}
              </p>
            </div>

            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Resolution</span>
              </div>
              <p className="text-sm font-medium text-white">
                {metadata.width || 1280} × {metadata.height || 720}
              </p>
            </div>

            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Filmstrip className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Framerate</span>
              </div>
              <p className="text-sm font-medium text-white">
                {metadata.frameRate || 30} fps
              </p>
            </div>

            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-2 mb-1">
                <Info className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Style</span>
              </div>
              <p className="text-sm font-medium text-white">
                {getStyleName(metadata.style)}
              </p>
            </div>
          </div>

          {(metadata.bitrate || metadata.fileSize) && (
            <div className="mt-4 p-3 bg-yellow-900/10 border border-yellow-800/20 rounded-lg">
              <p className="text-xs text-yellow-300">
                {metadata.bitrate && <span>Bitrate: {formatBitrate(metadata.bitrate)} • </span>}
                {metadata.fileSize && <span>Est. file size: {formatFileSize(metadata.fileSize)}</span>}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function audioFileName() {
    if (!videoUrl) return 'Uploaded Audio';
    
    try {
      const url = new URL(videoUrl);
      const pathname = url.pathname;
      return pathname.split('/').pop() || 'Uploaded Audio';
    } catch {
      return 'Uploaded Audio';
    }
  }
}