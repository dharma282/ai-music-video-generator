# Getting Started with AI Music Video Generator

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Using the Application

### Step 1: Upload Audio
- Drag and drop an audio file (MP3, WAV, or OGG) onto the upload area
- Or click "Choose File" to browse your files
- Supported formats: MP3, WAV, OGG

### Step 2: Play and Visualize
- Click the play button to start audio playback
- Use the progress slider to seek through the track
- Adjust volume with the volume slider

### Step 3: Watch Real-time Visualizations

**Spectrum Analyzer**
- Shows frequency distribution across 30 bars
- Color coded: Red (bass) → Green (mid) → Blue (treble)
- Updates in real-time as music plays

**Waveform Visualizer**
- Displays time-domain oscilloscope view
- Color intensity reflects amplitude
- Shows the actual sound wave shape

**Beat Detector**
- Circular indicator that pulses on detected beats
- Displays estimated BPM (Beats Per Minute)
- Shows beat strength percentage

**Audio Statistics**
- Real-time bass, mid, and treble levels
- Average amplitude indicator
- All values update at 60fps

## Features

### Audio Upload & Playback
- ✅ Drag-and-drop file upload
- ✅ File validation (MP3, WAV, OGG)
- ✅ File info display (name, duration, size)
- ✅ Full audio player controls
- ✅ Progress seeking
- ✅ Volume control

### Visualizations
- ✅ Real-time spectrum analyzer (60fps)
- ✅ Real-time waveform display (60fps)
- ✅ Beat detection with BPM estimation
- ✅ Audio statistics dashboard

### Performance
- ✅ Canvas-based rendering for smooth animations
- ✅ Optimized component re-renders
- ✅ Efficient memory management
- ✅ Proper cleanup on file change

## Project Structure

```
ai-music-video-generator/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── AudioPlayer.tsx     # Audio playback controls
│   │   ├── AudioStats.tsx      # Statistics display
│   │   ├── BeatIndicator.tsx   # Beat detection viz
│   │   ├── FileInfo.tsx        # File information
│   │   ├── FileUpload.tsx      # File upload UI
│   │   ├── SpectrumVisualizer.tsx  # Frequency bars
│   │   └── WaveformVisualizer.tsx  # Waveform display
│   ├── lib/
│   │   ├── audioAnalyzer.ts    # Audio processing
│   │   ├── audioUtils.ts       # Helper functions
│   │   └── googleDrive.ts      # Drive API (Phase 4)
│   └── types/
│       └── audio.ts            # TypeScript types
├── public/                     # Static assets
├── .env.local.example         # Environment template
└── README.md                  # Project documentation
```

## Technical Details

### Audio Analysis
The application uses the Web Audio API for real-time audio analysis:
- **FFT Size**: 2048 (high frequency resolution)
- **Smoothing**: 0.8 (smooth transitions)
- **Update Rate**: 60fps (requestAnimationFrame)

### Frequency Bands
- **Bass**: 0-10% of frequency range
- **Mid**: 10-40% of frequency range
- **Treble**: 40-100% of frequency range

### Beat Detection
- Uses bass frequency threshold algorithm
- Tracks beat history for BPM calculation
- Filters BPM between 60-200 for accuracy
- Average of last 10 beats for stability

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires Web Audio API support.

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

### Building for Production

```bash
npm run build
npm start
```

The production build is optimized for performance with:
- Minified JavaScript and CSS
- Optimized images
- Code splitting
- Tree shaking

## Troubleshooting

### Audio not playing
- Check browser permissions for audio
- Try clicking play again (browsers require user interaction)
- Ensure file format is supported (MP3, WAV, OGG)

### Visualizations not updating
- Make sure audio is playing (not paused)
- Check browser console for errors
- Try refreshing the page

### File upload fails
- Verify file is a valid audio format
- Check file isn't corrupted
- Try a different audio file

### Performance issues
- Close other browser tabs
- Reduce browser zoom level
- Try a shorter audio file
- Check browser is up to date

## Future Development

### Phase 2: AI Video Generation
- Generate video frames from audio analysis
- AI-powered visual effects
- Multiple video styles

### Phase 3: Beat-Synchronized Effects
- Effects triggered by beat detection
- Tempo-matched animations
- Dynamic visual transitions

### Phase 4: Google Drive Integration
- Save generated videos to Google Drive
- Load audio from Google Drive
- Share videos directly

### Phase 5: Video Export
- Export videos in multiple formats
- Preview before export
- Download or share options

## Contributing

This is an MVP project. Contributions and suggestions are welcome!

## Support

For issues or questions, please refer to the main README.md or create an issue in the repository.
