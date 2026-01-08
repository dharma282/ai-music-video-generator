'use client';

import React, { useState } from 'react';
import { Play, Download, FileVideo, AlertTriangle, CheckCircle } from 'lucide-react';
import { VideoGenerator } from '@/lib/videoGenerator';
import { VideoGenerationOptions, GenerationProgress, EncodedVideoData } from '@/types/video';
import VideoPreview from './VideoPreview';

interface VideoGeneratorProps {
  uploadedFile: File | null;
  audioDuration: number;
  audioUrl: string | null;
  selectedStyle: any;
  autoGenerate: boolean;
  onGenerationComplete?: (videoData: EncodedVideoData) => void;
}

const VideoGeneratorComponent: React.FC<VideoGeneratorProps> = ({
  uploadedFile,
  audioDuration,
  audioUrl,
  selectedStyle,
  autoGenerate,
  onGenerationComplete,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<EncodedVideoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = uploadedFile && audioUrl && (selectedStyle || autoGenerate);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'analyzing':
        return 'bg-blue-600';
      case 'rendering':
        return 'bg-green-600';
      case 'encoding':
        return 'bg-yellow-600';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusMessage = (status: string) => {
    const messages = {
      analyzing: 'Analyzing Audio',
      rendering: 'Rendering Video Frames',
      encoding: 'Encoding to MP4 Format',
      complete: 'Generation Complete',
      error: 'Generation Failed',
    };
    return messages[status as keyof typeof messages] || 'Processing';
  };

  const handleGenerate = async () => {
    if (!uploadedFile || !audioUrl) {
      setError('Please upload an audio file first');
      return;
    }

    if (!selectedStyle && !autoGenerate) {
      setError('Please select a visual style or enable auto-generate mode');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(null);
    setGeneratedVideo(null);

    try {
      const generator = new VideoGenerator();

      const options: VideoGenerationOptions = {
        style: selectedStyle || autoGenerate ? 'auto-generate' : 'particle-system',
        resolution: { width: 1280, height: 720 },
        frameRate: 30,
        bitrate: 2500,
        audioFile: uploadedFile,
        duration: audioDuration,
        audioUrl,
      };

      const videoData = await generator.generateVideo(options, {
        onProgress: (p) => {
          setProgress(p);
          console.log(`Progress: ${p.percentage}% - ${p.message}`);
        },
        onComplete: (result) => {
          setGeneratedVideo(result);
          onGenerationComplete?.(result);
        },
        onError: (err) => {
          setError(err.message);
          setIsGenerating(false);
        },
      });

      setGeneratedVideo(videoData);
      setIsGenerating(false);
    } catch (error) {
      console.error('Video generation failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideo?.downloadUrl) {
      const a = document.createElement('a');
      a.href = generatedVideo.downloadUrl;
      const fileName = uploadedFile?.name.replace(/\.[^/.]+$/, '') || 'video';
      a.download = `${fileName}_generated.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (generatedVideo) {
    return (
      <div className='w-full bg-gray-900 border border-cyan-800 rounded-lg p-6 shadow-lg'>
        <div className='mb-4'>
          <h2 className='text-xl font-bold text-white mb-2 flex items-center gap-2'>
            <CheckCircle className='w-5 h-5 text-green-400' />
            Video Generated Successfully!
          </h2>
          <p className='text-gray-400 text-sm'>Your AI-generated music video is ready</p>
        </div>
        
        <VideoPreview videoData={generatedVideo} />
        
        <div className='mt-4'>
          <button
            onClick={handleDownload}
            className='w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2'
          >
            <Download className='w-5 h-5' />
            Download MP4
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full bg-gray-900 border border-cyan-800 rounded-lg p-6 shadow-lg'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-white mb-2 flex items-center gap-2'>
          <FileVideo className='w-5 h-5 text-pink-400' />
          Generate Video
        </h2>
        <p className='text-gray-400 text-sm'>Transform your music into mesmerizing visuals</p>
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg flex items-start gap-2'>
          <AlertTriangle className='w-4 h-4 text-red-400 mt-0.5' />
          <p className='text-red-200 text-sm'>{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !canGenerate}
        className={[
          'w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200',
          'flex items-center justify-center gap-2',
          isGenerating || !canGenerate
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transform hover:-translate-y-0.5 shadow-lg'
        ].join(' ')}
      >
        {isGenerating ? (
          <>
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Play className='w-5 h-5' />
            <span>Generate Video</span>
          </>
        )}
      </button>

      {progress && (
        <div className='mt-6'>
          <div className='mb-2'>
            <div className='flex justify-between mb-1'>
              <span className='text-sm text-gray-400 font-medium'>
                {getStatusMessage(progress.status)}
              </span>
              <span className='text-sm text-purple-300 font-medium'>
                {Math.round(progress.percentage)}%
              </span>
            </div>
            <div className='w-full bg-gray-700 rounded-full h-2'>
              <div
                className={`${getStatusColor(progress.status)} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-400'>
              {progress.status === 'complete' 
                ? 'Complete' 
                : `${progress.currentFrame} of ${progress.totalFrames} frames`}
            </span>
            <span className='text-xs text-gray-400'>
              {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 
                ? `${Math.max(Math.round(progress.estimatedTimeRemaining / 1000), 1)}s remaining`
                : 'Calculating...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGeneratorComponent;