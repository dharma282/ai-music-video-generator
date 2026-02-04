'use client';

import { useState, useCallback, useRef } from 'react';
import { VideoGenerator } from '@/lib/videoGenerator';
import { VideoStyle, VideoGenerationOptions, GenerationProgress, UploadedFile } from '@/types/audio';
import { 
  Film, 
  Play, 
  Pause, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

interface VideoGeneratorProps {
  audioFile?: UploadedFile;
  selectedStyle: VideoStyle;
  onGenerationComplete: (videoUrl: string, metadata: any) => void;
  disabled?: boolean;
}

export default function VideoGenerator({ 
  audioFile, 
  selectedStyle, 
  onGenerationComplete, 
  disabled = false 
}: VideoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const videoGeneratorRef = useRef<VideoGenerator | null>(null);

  const getStageLabel = (stage: GenerationProgress['currentStage']) => {
    switch (stage) {
      case 'analyzing':
        return 'Analyzing audio file...';
      case 'rendering':
        return 'Rendering video frames...';
      case 'encoding':
        return 'Encoding final video...';
      default:
        return 'Processing...';
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    if (milliseconds <= 0) return 'Calculating...';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s remaining`;
    }
    return `${seconds}s remaining`;
  };

  const handleGenerate = useCallback(async () => {
    if (!audioFile?.file || !selectedStyle) {
      setError('Please upload an audio file and select a visual style');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const videoGenerator = new VideoGenerator();
      videoGeneratorRef.current = videoGenerator;

      const options: VideoGenerationOptions = {
        audioFile: audioFile.file,
        audioDuration: audioFile.duration,
        style: selectedStyle,
        resolution: {
          width: 1280,
          height: 720
        },
        frameRate: 30,
        bitrate: 2500
      };

      const result = await videoGenerator.generateVideo(
        options,
        (progress: GenerationProgress) => {
          setProgress(progress);
        }
      );

      setSuccessMessage('Video generated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      onGenerationComplete(result.videoUrl, result.metadata);
      
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unknown error occurred during video generation';
      
      if (errorMessage.includes('cancelled')) {
        setSuccessMessage('Video generation cancelled');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      }
    } finally {
      setIsGenerating(false);
      setProgress(null);
      videoGeneratorRef.current = null;
    }
  }, [audioFile, selectedStyle, onGenerationComplete]);

  const handleCancel = useCallback(() => {
    if (videoGeneratorRef.current && isGenerating) {
      videoGeneratorRef.current.cancel();
    }
  }, [isGenerating]);

  const getProgressColor = (): string => {
    if (!progress) return '';
    
    if (progress.percentage < 33) {
      return 'from-blue-500 to-blue-600';
    } else if (progress.percentage < 66) {
      return 'from-purple-500 to-purple-600';
    }
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Generate Music Video
              </h3>
              <p className="text-sm text-gray-400">
                Create a 720p video synchronized to your audio
              </p>
            </div>
          </div>
          
          {!isGenerating && (
            <button
              onClick={handleGenerate}
              disabled={disabled || !audioFile || isGenerating}
              className={`
                relative inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-white
                transition-all duration-300 transform hover:scale-105
                ${disabled || !audioFile 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }
              `}
            >
              <Zap className="w-5 h-5" />
              <span>Generate Video</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-sm text-green-200">{successMessage}</p>
          </div>
        )}

        {isGenerating && progress && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-white">
                  {getStageLabel(progress.currentStage)}
                </span>
              </div>
              <span className="text-sm text-gray-400">
                {Math.round(progress.percentage)}%
              </span>
            </div>

            <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-300`}
                style={{ width: `${progress.percentage}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Frames: {progress.currentFrame}/{progress.totalFrames}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{formatTimeRemaining(progress.estimatedTimeRemaining)}</span>
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-400">
                This may take several minutes depending on your audio length. 
                The generated video will be 720p at 30fps with H.264 encoding.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}