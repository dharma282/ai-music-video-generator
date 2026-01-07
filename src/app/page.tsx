'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FileUpload from '@/components/FileUpload';
import FileInfo from '@/components/FileInfo';
import AudioPlayer from '@/components/AudioPlayer';
import SpectrumVisualizer from '@/components/SpectrumVisualizer';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import BeatIndicator from '@/components/BeatIndicator';
import AudioStats from '@/components/AudioStats';
import { AudioAnalyzer } from '@/lib/audioAnalyzer';
import { UploadedFile, AudioAnalyzerData } from '@/types/audio';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [analyzerData, setAnalyzerData] = useState<AudioAnalyzerData | null>(null);
  const [bpm, setBpm] = useState(0);
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const animationFrameRef = useRef<number>();

  const handleFileUpload = useCallback((file: UploadedFile) => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    setUploadedFile(file);
  }, [uploadedFile]);

  const handleAudioElementReady = useCallback(async (element: HTMLAudioElement) => {
    setAudioElement(element);

    if (!analyzerRef.current) {
      analyzerRef.current = new AudioAnalyzer();
    }

    try {
      await analyzerRef.current.initialize(element);
      console.log('Audio analyzer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio analyzer:', error);
    }
  }, []);

  useEffect(() => {
    const updateAnalyzerData = () => {
      if (analyzerRef.current && audioElement && !audioElement.paused) {
        const data = analyzerRef.current.getAnalyzerData();
        setAnalyzerData(data);
        setBpm(analyzerRef.current.getEstimatedBPM());
      }
      animationFrameRef.current = requestAnimationFrame(updateAnalyzerData);
    };

    if (audioElement) {
      updateAnalyzerData();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioElement]);

  useEffect(() => {
    return () => {
      if (analyzerRef.current) {
        analyzerRef.current.disconnect();
      }
      if (uploadedFile?.url) {
        URL.revokeObjectURL(uploadedFile.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            AI Music Video Generator
          </h1>
          <p className="text-gray-400 text-lg">
            MVP Phase 1: Real-time Audio Visualizer
          </p>
        </header>

        <div className="space-y-6">
          {!uploadedFile ? (
            <FileUpload onFileUpload={handleFileUpload} />
          ) : (
            <>
              <FileInfo file={uploadedFile} />
              
              <AudioPlayer
                audioUrl={uploadedFile.url}
                audioElement={audioElement}
                onAudioElementReady={handleAudioElementReady}
              />

              <AudioStats analyzerData={analyzerData} bpm={bpm} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpectrumVisualizer
                  analyzerData={analyzerData}
                  width={800}
                  height={300}
                />
                <WaveformVisualizer
                  analyzerData={analyzerData}
                  width={800}
                  height={300}
                />
              </div>

              <div className="flex justify-center">
                <div className="w-full lg:w-1/2">
                  <BeatIndicator
                    analyzerData={analyzerData}
                    width={400}
                    height={400}
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (uploadedFile.url) {
                      URL.revokeObjectURL(uploadedFile.url);
                    }
                    setUploadedFile(null);
                    setAnalyzerData(null);
                    setBpm(0);
                    if (analyzerRef.current) {
                      analyzerRef.current.disconnect();
                      analyzerRef.current = null;
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Upload New File
                </button>
              </div>
            </>
          )}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
          <p>Built with Next.js 14, React 18, TypeScript & Tailwind CSS</p>
          <p className="mt-2 text-sm">Using Web Audio API for real-time audio analysis</p>
        </footer>
      </div>
    </main>
  );
}
