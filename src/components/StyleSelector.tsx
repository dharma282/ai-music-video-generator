'use client';

import React from 'react';
import { VideoStyle } from '@/types/video';
import { Palette, Grid, AudioWaveform, Gradient, Box, Sparkles } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: VideoStyle | null;
  onStyleChange: (style: VideoStyle) => void;
  autoGenerate: boolean;
  onAutoGenerateChange: (auto: boolean) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
  autoGenerate,
  onAutoGenerateChange,
}) => {
  const styles = [
    {
      id: VideoStyle.PARTICLE_SYSTEM,
      name: 'Particle System',
      description: 'Dynamic particles that react to bass and treble frequencies',
      icon: Palette,
      color: 'from-blue-500 to-purple-600',
    },
    {
      id: VideoStyle.GEOMETRIC_PATTERNS,
      name: 'Geometric Patterns',
      description: 'Abstract shapes that morph and rotate based on frequency bands',
      icon: Grid,
      color: 'from-green-500 to-teal-600',
    },
    {
      id: VideoStyle.WAVEFORM_ANIMATION,
      name: 'Waveform Animation',
      description: 'Animated waveform visualization synchronized with beats',
      icon: AudioWaveform,
      color: 'from-orange-500 to-red-600',
    },
    {
      id: VideoStyle.GRADIENT_FLOW,
      name: 'Gradient Flow',
      description: 'Fluid gradients and flowing shapes synced with music',
      icon: Gradient,
      color: 'from-pink-500 to-purple-600',
    },
    {
      id: VideoStyle.SPECTRUM_3D,
      name: '3D Spectrum',
      description: 'Immersive 3D frequency spectrum visualization',
      icon: Box,
      color: 'from-indigo-500 to-blue-600',
    },
  ];

  const handleStyleClick = (style: VideoStyle) => {
    if (!autoGenerate) {
      onStyleChange(style);
    }
  };

  const handleAutoGenerateChange = (value: boolean) => {
    onAutoGenerateChange(value);
    if (!value && !selectedStyle) {
      // If disabling auto-generate and no style selected, select first style
      onStyleChange(VideoStyle.PARTICLE_SYSTEM);
    }
  };

  return (
    <div className='w-full bg-gray-900 border border-cyan-800 rounded-lg p-6 shadow-lg'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-white mb-2 flex items-center gap-2'>
          <Sparkles className='w-5 h-5 text-purple-400' />
          Visual Style
        </h2>
        <p className='text-gray-400 text-sm'>Choose how your music video will look</p>
      </div>

      <div className='mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <label className='flex items-center gap-2 cursor-pointer'>
            <input
              type='checkbox'
              checked={autoGenerate}
              onChange={(e) => handleAutoGenerateChange(e.target.checked)}
              className='w-4 h-4 accent-purple-600'
            />
            <span className='text-white font-medium'>Auto-Generate Mode</span>
          </label>
          <span className='text-xs text-green-400 bg-green-900 bg-opacity-50 px-2 py-1 rounded-full'>
            AI POWERED
          </span>
        </div>
        <p className='text-gray-400 text-sm'>
          Automatically blends multiple styles based on audio analysis
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${autoGenerate ? 'opacity-50' : ''}`}>
        {styles.map((style) => {
          const IconComponent = style.icon;
          const isSelected = selectedStyle === style.id;
          
          return (
            <div
              key={style.id}
              onClick={() => handleStyleClick(style.id)}
              className={[
                'bg-gray-800 hover:bg-gray-700 transition-all duration-200 rounded-lg p-4 cursor-pointer',
                'border-2 hover:border-purple-400',
                isSelected ? 'border-purple-500 bg-purple-900 bg-opacity-20' : 'border-gray-600',
                autoGenerate ? 'cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              <div className='flex items-start gap-3 mb-3'>
                <div className={`bg-gradient-to-br ${style.color} rounded-lg p-2 shadow-lg`}>
                  <IconComponent className='w-5 h-5 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-white font-semibold text-sm'>{style.name}</h3>
                  {isSelected && (
                    <span className='text-xs text-green-400 bg-green-900 bg-opacity-50 px-2 py-1 rounded-full ml-2'>
                      SELECTED
                    </span>
                  )}
                </div>
              </div>
              <p className='text-gray-400 text-xs'>
                {style.description}
              </p>
            </div>
          );
        })}
      </div>

      {autoGenerate && (
        <div className='mt-4 p-4 bg-purple-900 bg-opacity-20 border border-purple-500 rounded-lg'>
          <div className='flex items-center gap-2'>
            <Sparkles className='w-4 h-4 text-purple-400' />
            <p className='text-purple-300 text-sm'>
              AI will automatically select and blend styles based on your music's characteristics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleSelector;