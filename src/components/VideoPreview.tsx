'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Expand, Volume2, Clock, Film, Download, Info } from 'lucide-react';
import { EncodedVideoData } from '@/types/video';

interface VideoPreviewProps {
  videoData: EncodedVideoData;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      // Ensure video is properly loaded
      video.load();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoData.downloadUrl;
    link.download = videoData.metadata.audioFileName.replace(/\.[^/.]+$/, '') + '_generated.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metadata = videoData.metadata;

  return (
    <div className='w-full bg-gray-900 border border-cyan-800 rounded-lg p-6 shadow-lg'>
      <div className='mb-4'>
        <h2 className='text-xl font-bold text-white mb-2 flex items-center gap-2'>
          <Film className='w-5 h-5 text-green-400' />
          Video Preview
          <button
            onClick={() => setShowInfo(!showInfo)}
            className='ml-auto text-gray-400 hover:text-gray-300'
          >
            <Info className='w-4 h-4' />
          </button>
        </h2>
      </div>

      {/* Video Player */}
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-lg overflow-hidden shadow-2xl ${isFullscreen ? 'h-full' : ''}`}
        style={{ aspectRatio: '16/9' }}
      >
        <video
          ref={videoRef}
          src={videoData.downloadUrl}
          className='w-full h-full'
          preload='metadata'
        >
          Your browser does not support the video tag.
        </video>

        {/* Controls */}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-4'>
          {/* Progress Bar */}
          <div className='mb-3'>
            <input
              type='range'
              min='0'
              max={videoRef.current?.duration || 0}
              step='0.1'
              value={currentTime}
              onChange={handleSeek}
              className='w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer'
              style={{
                background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${(currentTime / (videoRef.current?.duration || 1)) * 100}%, #4B5563 ${(currentTime / (videoRef.current?.duration || 1)) * 100}%, #4B5563 100%)`
              }}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={handlePlayPause}
                className='bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all duration-200'
              >
                {isPlaying ? (
                  <div className='w-4 h-4 border-l-4 border-r-4 border-white' style={{ height: '16px' }} />
                ) : (
                  <div className='w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1' />
                )}
              </button>

              <span className='text-white text-sm'>
                {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 0)}
              </span>

              <button className='text-gray-400 hover:text-white'>
                <Volume2 className='w-5 h-5' />
              </button>
            </div>

            <button
              onClick={handleFullscreen}
              className='text-gray-400 hover:text-white'
            >
              <Expand className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* Video Info */}
      {showInfo && (
        <div className='mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700'>
          <h4 className='text-white font-semibold mb-3 flex items-center gap-2'>
            <Info className='w-4 h-4' />
            Video Details
          </h4>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm'>
            <div>
              <p className='text-gray-400'>Resolution</p>
              <p className='text-white font-medium'>{metadata.resolution}</p>
            </div>
            <div>
              <p className='text-gray-400'>Duration</p>
              <p className='text-white font-medium'>{metadata.duration} seconds</p>
            </div>
            <div>
              <p className='text-gray-400'>Frame Rate</p>
              <p className='text-white font-medium'>{metadata.frameRate} fps</p>
            </div>
            <div>
              <p className='text-gray-400'>File Size</p>
              <p className='text-white font-medium'>{formatFileSize(metadata.fileSize)}</p>
            </div>
            <div>
              <p className='text-gray-400'>Created</p>
              <p className='text-white font-medium'>
                {metadata.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className='text-gray-400'>Style</p>
              <p className='text-white font-medium'>
                {Array.isArray(metadata.style) ? 'Auto-Generate' : metadata.style}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className='mt-3 text-sm text-gray-400 hover:text-gray-300'
          >
            Hide Details
          </button>
        </div>
      )}

      {/* Metadata (always visible) */}
      <div className='mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700'>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs'>
          <div className='flex items-center gap-2'>
            <Clock className='w-3 h-3 text-gray-400' />
            <div>
              <p className='text-gray-400'>Duration</p>
              <p className='text-white'>{metadata.duration}s</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Film className='w-3 h-3 text-gray-400' />
            <div>
              <p className='text-gray-400'>Quality</p>
              <p className='text-white'>{metadata.resolution}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Download className='w-3 h-3 text-gray-400' />
            <div>
              <p className='text-gray-400'>Size</p>
              <p className='text-white'>{formatFileSize(metadata.fileSize)}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-3 h-3 bg-green-500 rounded-full' />
            <div>
              <p className='text-gray-400'>Status</p>
              <p className='text-white'>Ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;