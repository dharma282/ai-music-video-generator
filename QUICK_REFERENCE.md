# Quick Reference Card

## Project: AI Music Video Generator - MVP Phase 1

### 🚀 Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### 📁 Key Files

#### Main Application
- `src/app/page.tsx` - Main dashboard with state management
- `src/app/layout.tsx` - Root layout and metadata
- `src/app/globals.css` - Global styles + slider CSS

#### Components (src/components/)
- `FileUpload.tsx` - Drag-and-drop audio upload
- `AudioPlayer.tsx` - Playback controls
- `SpectrumVisualizer.tsx` - Frequency bars (30 bars, color gradient)
- `WaveformVisualizer.tsx` - Oscilloscope waveform
- `BeatIndicator.tsx` - Beat pulse + BPM display
- `AudioStats.tsx` - Real-time statistics dashboard
- `FileInfo.tsx` - File metadata display

#### Libraries (src/lib/)
- `audioAnalyzer.ts` - AudioAnalyzer class (Web Audio API)
- `audioUtils.ts` - Helper functions (formatTime, formatFileSize, etc.)
- `googleDrive.ts` - Drive API placeholders (Phase 4)

#### Types (src/types/)
- `audio.ts` - TypeScript interfaces for the entire app

### 🎵 Audio Analysis Parameters

```typescript
FFT_SIZE = 2048              // High-resolution frequency data
SMOOTHING = 0.8              // Smooth visual transitions
UPDATE_RATE = 60fps          // requestAnimationFrame

FREQUENCY_BANDS:
- Bass: 0-10% of range
- Mid: 10-40% of range
- Treble: 40-100% of range

BEAT_DETECTION:
- Threshold: 1.3x average
- Min interval: 200ms
- BPM range: 60-200
- History: 10 beats
```

### 🎨 Visualizer Colors

**Spectrum Analyzer Gradient:**
- Bass (0-33%): Red → Yellow
- Mid (33-66%): Yellow → Green
- Treble (66-100%): Green → Blue

**Waveform:**
- Color intensity = Amplitude
- Low amplitude = Blue (0, 255, 255)
- High amplitude = Red-Purple (255, 0, 255)

**Beat Indicator:**
- Pulse color: Pink (255, 0, 100)
- Base ring: White
- Pulse decay: 0.05 per frame

### 🔧 npm Scripts
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### 📦 Dependencies
```json
{
  "lucide-react": "Icons",
  "next": "14.2.35",
  "react": "^18",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

### 🎯 Supported Audio Formats
- MP3 (audio/mpeg)
- WAV (audio/wav)
- OGG (audio/ogg)

### 🌐 Browser Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Web Audio API support required

### 🔑 Environment Variables (Phase 4)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_API_KEY=
NEXT_PUBLIC_GOOGLE_DRIVE_SCOPE=
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=
```

### 🐛 Common Issues

**Audio not playing?**
- Click play button (user interaction required)
- Check browser audio permissions

**Visualizers not updating?**
- Ensure audio is playing (not paused)
- Check browser console for errors

**Build errors?**
- Run `npm install` to ensure dependencies
- Check TypeScript version

### 📊 Performance Tips
- Canvas renders at 60fps automatically
- Components are memoized
- Audio context cleaned up on unmount
- Object URLs revoked properly

### 🎓 Code Patterns

**Creating a visualizer:**
```typescript
'use client';
import { useEffect, useRef, memo } from 'react';
import { VisualizerProps } from '@/types/audio';

const MyVisualizer = memo(({ analyzerData }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    const draw = () => {
      // Your drawing code here
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyzerData]);

  return <canvas ref={canvasRef} />;
});
```

### 📚 Documentation Files
- `README.md` - Full project documentation
- `GETTING_STARTED.md` - Setup and usage guide
- `PROJECT_SUMMARY.md` - Technical overview
- `DELIVERABLES_CHECKLIST.md` - Completed requirements
- `QUICK_REFERENCE.md` - This file

### 🚦 Next Steps
1. Test audio upload
2. Play audio and verify visualizations
3. Check BPM detection accuracy
4. Test responsive design
5. Review code for Phase 2 planning

### 📞 Support
- Check documentation files
- Review inline code comments
- Build successful: `npm run build`
- Dev server: `npm run dev`

---
**Version**: 0.1.0 (MVP Phase 1)  
**Status**: Complete ✅  
**Lines of Code**: ~1200
