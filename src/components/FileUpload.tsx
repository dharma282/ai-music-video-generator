'use client';

import { useCallback, useState } from 'react';
import { Upload, Music } from 'lucide-react';
import { isValidAudioFile, getAudioDuration } from '@/lib/audioUtils';
import { UploadedFile } from '@/types/audio';

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!isValidAudioFile(file)) {
      alert('Please upload a valid audio file (MP3, WAV, or OGG)');
      return;
    }

    setIsProcessing(true);

    try {
      const duration = await getAudioDuration(file);
      const url = URL.createObjectURL(file);

      const uploadedFile: UploadedFile = {
        file,
        name: file.name,
        size: file.size,
        duration,
        url,
      };

      onFileUpload(uploadedFile);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing audio file. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 transition-all ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Processing audio file...</p>
          </>
        ) : (
          <>
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <Upload size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Upload Audio File
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your audio file here, or click to browse
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2">
              <Music size={20} />
              Choose File
              <input
                type="file"
                accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Supported formats: MP3, WAV, OGG
            </p>
          </>
        )}
      </div>
    </div>
  );
}
