'use client';

import { useState } from 'react';
import { VideoStyle } from '@/types/audio';
import { Play, Box, Waves, Palette, Box3d, Sparkles } from 'lucide-react';

interface StyleOption {
  id: VideoStyle;
  name: string;
  description: string;
  icon: React.ElementType;
  previewGradient: string;
}

const styleOptions: StyleOption[] = [
  {
    id: VideoStyle.PARTICLE_SYSTEM,
    name: 'Particle System',
    description: 'Dynamic particles react to bass and treble frequencies',
    icon: Sparkles,
    previewGradient: 'from-purple-500 to-pink-500'
  },
  {
    id: VideoStyle.GEOMETRIC_PATTERNS,
    name: 'Geometric Patterns',
    description: 'Morphing geometric shapes based on frequency bands',
    icon: Box,
    previewGradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: VideoStyle.WAVEFORM_ANIMATION,
    name: 'Waveform Animation',
    description: 'Classic waveform visualization with animated gradients',
    icon: Waves,
    previewGradient: 'from-green-500 to-teal-500'
  },
  {
    id: VideoStyle.GRADIENT_FLOW,
    name: 'Gradient Flow',
    description: 'Smooth color gradients flowing with beats',
    icon: Palette,
    previewGradient: 'from-orange-500 to-red-500'
  },
  {
    id: VideoStyle.SPECTRUM_3D,
    name: '3D Spectrum',
    description: 'Three-dimensional frequency spectrum visualization',
    icon: Box3d,
    previewGradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: VideoStyle.AUTO_GENERATE,
    name: 'Auto-Generate',
    description: 'AI selects and combines 2-3 styles automatically for optimal results',
    icon: Sparkles,
    previewGradient: 'from-rose-500 to-cyan-400'
  }
];

interface StyleSelectorProps {
  selectedStyle: VideoStyle;
  onStyleChange: (style: VideoStyle) => void;
  disabled?: boolean;
}

export default function StyleSelector({ 
  selectedStyle, 
  onStyleChange, 
  disabled = false 
}: StyleSelectorProps) {
  const [showAutoInfo, setShowAutoInfo] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Visual Style</h2>
        <p className="text-gray-400">
          Select how you want your music to be visualized in the video
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styleOptions.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.id;
          const isAutoGenerate = style.id === VideoStyle.AUTO_GENERATE;

          return (
            <div
              key={style.id}
              onClick={() => !disabled && onStyleChange(style.id)}
              onMouseEnter={() => isAutoGenerate && setShowAutoInfo(true)}
              onMouseLeave={() => isAutoGenerate && setShowAutoInfo(false)}
              className={`
                relative group cursor-pointer rounded-xl p-6 transition-all duration-300
                ${isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 bg-gray-800' 
                  : 'bg-gray-800/50 hover:bg-gray-800'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                  bg-gradient-to-br ${style.previewGradient} bg-opacity-20
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {style.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {style.description}
                  </p>
                  
                  {isSelected && (
                    <div className="mt-3 flex items-center text-blue-400 text-sm font-medium">
                      <Play className="w-4 h-4 mr-1" />
                      Selected
                    </div>
                  )}
                </div>
              </div>

              {isAutoGenerate && showAutoInfo && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-900 rounded-lg z-10 border border-gray-700">
                  <p className="text-sm text-gray-300 mb-2">
                    Auto-Generate will analyze your music and automatically select 
                    the best combination of visual styles.
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• AI-powered style selection</li>
                    <li>• Dynamic style transitions</li>
                    <li>• Optimized for your audio</li>
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Pro Tip</p>
            <p className="text-sm text-blue-200">
              For the best results, try Auto-Generate first. It analyzes your music's 
              characteristics and selects complementary visual styles automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}