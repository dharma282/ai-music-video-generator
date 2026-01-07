'use client';

import { Music, Clock, HardDrive } from 'lucide-react';
import { UploadedFile } from '@/types/audio';
import { formatTime, formatFileSize } from '@/lib/audioUtils';

interface FileInfoProps {
  file: UploadedFile;
}

export default function FileInfo({ file }: FileInfoProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="bg-blue-600 p-3 rounded-lg">
          <Music size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold mb-3">{file.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span className="text-sm">Duration: {formatTime(file.duration)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <HardDrive size={16} />
              <span className="text-sm">Size: {formatFileSize(file.size)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
