# AI Music Video Generator

A Next.js 14 application for generating AI-powered music videos with real-time audio visualization.

## MVP Phase 1: Real-time Audio Visualizer

The first phase implements a sophisticated real-time audio visualizer using the Web Audio API.

### Features

- **Audio Upload & Playback**
  - Drag-and-drop or browse to upload audio files
  - Support for MP3, WAV, and OGG formats
  - HTML5 audio player with full controls (play/pause, seek, volume)
  - File information display (name, duration, size)

- **Real-time Visualizations**
  - **Spectrum Analyzer**: 30-bar frequency visualization with color gradient (bass=red, mid=green, treble=blue)
  - **Waveform Display**: Oscilloscope-style time-domain visualization with dynamic coloring
  - **Beat Detector**: Visual pulse indicator with BPM estimation

- **Audio Statistics**
  - Real-time bass, mid, and treble level monitoring
  - Average amplitude tracking
  - BPM (beats per minute) detection
  - Visual frequency band indicators

- **Performance Optimizations**
  - Canvas-based rendering for smooth 60fps animations
  - React.memo for component optimization
  - requestAnimationFrame for efficient updates
  - Lazy audio processing

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio Processing**: Web Audio API

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── AudioPlayer.tsx     # Audio playback controls
│   ├── AudioStats.tsx      # Real-time audio statistics
│   ├── BeatIndicator.tsx   # Beat detection visualizer
│   ├── FileInfo.tsx        # Uploaded file information
│   ├── FileUpload.tsx      # Drag-and-drop file upload
│   ├── SpectrumVisualizer.tsx  # Frequency spectrum display
│   └── WaveformVisualizer.tsx  # Time-domain waveform
├── lib/
│   ├── audioAnalyzer.ts    # AudioAnalyzer class (Web Audio API)
│   ├── audioUtils.ts       # Audio utility functions
│   └── googleDrive.ts      # Google Drive integration (Phase 4)
└── types/
    └── audio.ts            # TypeScript type definitions
```

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Upload an audio file**:
   - Drag and drop an MP3, WAV, or OGG file
   - Or click "Choose File" to browse

5. **Play and visualize**:
   - Click play to start audio playback
   - Watch real-time visualizations update at 60fps
   - Monitor audio statistics and BPM

### Environment Variables

For Phase 4 (Google Drive integration), create a `.env.local` file based on `.env.local.example`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_DRIVE_SCOPE=https://www.googleapis.com/auth/drive.file
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=
```

### Audio Analysis Features

The `AudioAnalyzer` class provides:

- **Frequency Analysis**: FFT-based frequency data extraction
- **Time-Domain Analysis**: Waveform/oscilloscope data
- **Frequency Bands**: Automatic bass, mid, and treble separation
- **Beat Detection**: Threshold-based beat detection with history tracking
- **BPM Estimation**: Real-time tempo calculation

### Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires modern browser with Web Audio API support.

### Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Future Phases

- **Phase 2**: AI video generation from music
- **Phase 3**: Beat-synchronized video effects
- **Phase 4**: Google Drive storage integration
- **Phase 5**: Video preview and export

### Performance Notes

- All visualizations run at 60fps using requestAnimationFrame
- Canvas rendering provides better performance than DOM manipulation
- Components are memoized to prevent unnecessary re-renders
- Audio processing is optimized with proper cleanup on unmount

### Known Limitations

- Audio files are stored in browser memory (no persistence in Phase 1)
- Maximum file size depends on browser memory limits
- Google Drive integration is placeholder-only (Phase 4)

## License

MIT

## Contributing

This is an MVP project. Contributions welcome for future phases!
