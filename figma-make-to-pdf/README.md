# Figma Make to PDF

A generic, reusable tool for exporting Figma Make presentations (React + Vite) to PDF. Automatically detects slide structure, handles animations, and generates high-quality PDFs with full-page screenshots.

## Use Case

This tool is designed for projects created with **Figma Make** that generate React + Vite presentation applications. It:

- Automatically detects all slides and sub-slides in your presentation
- Handles complex animations and waits for content to load
- Generates high-quality PDFs using full-page screenshots
- Works with any Figma Make project structure
- Provides a simple installation process with automatic configuration

## What You Get

- **Single PDF file** with all slides (including sub-slides)
- **Individual PNG screenshots** for each slide (optional)
- **Automatic detection** of slide structure
- **Animation handling** - waits for all animations to complete
- **Cross-platform** support (Mac, Windows, Linux)

## Technical Requirements

### Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **Chrome/Chromium** browser installed
- **React + Vite** project (created with Figma Make)
- **Development server** must be running during export

### System Requirements

- **macOS**: Chrome installed in `/Applications/Google Chrome.app/`
- **Windows**: Chrome installed in default location
- **Linux**: Chromium or Chrome installed

## Installation

### Step 1: Run the Installer

Navigate to the `Figma-Make-to-pdf` folder and run:

```bash
cd Figma-Make-to-pdf
npm run install
```

**Note:** The installer will automatically install required dependencies (puppeteer, pdf-lib, tsx) in your main project. You don't need to run `npm install` in the Figma-Make-to-pdf folder.

The installer will:
1. Scan your repository to detect slide structure
2. Ask you configuration questions
3. Generate `pdf-export.config.json`
4. Add export script to your project's `package.json`
5. Install required dependencies

### Step 2: Answer Configuration Questions

The installer will ask:

1. **Dev server URL** (default: detected from `vite.config.ts`)
2. **Total number of slides** (auto-detected, you can confirm)
3. **Slides with sub-slides** (auto-detected, you can confirm)
4. **PDF format** (A4 Landscape/Portrait, or custom)
5. **Hide UI elements** (header, navigation, progress bar)

### Step 3: Use the Export Script

After installation, use the export script from your project root:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Export to PDF
npm run export:pdf
```

The PDF will be saved to `exports/presentation.pdf`.

## Configuration

The installer creates `pdf-export.config.json` in your project root:

```json
{
  "devServerUrl": "http://localhost:3000",
  "totalSlides": 22,
  "slidesWithSubSlides": {
    "4": { "type": "subSlide", "max": 8 },
    "5": { "type": "subSlide", "max": 8 },
    "7": { "type": "step", "max": 3 }
  },
  "pdfFormat": "A4",
  "landscape": true,
  "hideUIElements": true,
  "animationWaitTime": 2000,
  "slideTransitionWaitTime": 1000
}
```

You can manually edit this file to adjust settings.

## Troubleshooting

### Problem: "Dev server is not running"

**Solution**: Make sure your dev server is running before exporting:
```bash
npm run dev
```

### Problem: "TimeoutError" or "Chrome not found"

**Solution**: 
- On Mac: Ensure Chrome is installed in `/Applications/Google Chrome.app/`
- On Windows/Linux: Ensure Chrome/Chromium is installed
- Try increasing timeout in `pdf-export.config.json`

### Problem: Empty pages or cut-off content

**Solution**: 
- Increase `animationWaitTime` in config (default: 2000ms)
- Increase `slideTransitionWaitTime` in config (default: 1000ms)
- Check if slides have long-loading animations

### Problem: "Rosetta translating Chrome" warning (Mac)

**Solution**: This is a performance warning but won't break functionality. For better performance, use Node.js built for arm64 (Apple Silicon).

### Problem: Slides not detected correctly

**Solution**: 
- Manually edit `pdf-export.config.json`
- Check your `src/App.tsx` for slide definitions
- Run installer again: `npm run install`

## How It Works

1. **Detection**: Scans your codebase for slide definitions
2. **Navigation**: Uses keyboard navigation (Arrow keys) to move between slides
3. **Animation Handling**: Waits for animations to complete before screenshots
4. **Screenshot**: Takes full-page screenshots of each slide
5. **PDF Generation**: Converts screenshots to PDF pages
6. **Merging**: Combines all pages into a single PDF

## File Structure

```
Figma-Make-to-pdf/
├── README.md              # This file
├── install.ts            # Installation script
├── export-to-pdf.ts      # Main export script (generic)
├── config.example.json   # Example configuration
└── package.json          # Dependencies
```

After installation:
```
your-project/
├── pdf-export.config.json  # Generated configuration
├── export-to-pdf.ts        # Copied export script
└── package.json            # Updated with export script
```

## Advanced Usage

### Custom Slide Detection

If auto-detection doesn't work, manually configure `pdf-export.config.json`:

```json
{
  "totalSlides": 25,
  "slidesWithSubSlides": {
    "0": { "type": "subSlide", "max": 5 },
    "10": { "type": "step", "max": 3 }
  }
}
```

### Custom PDF Format

Edit `pdf-export.config.json`:

```json
{
  "pdfFormat": "A4",
  "landscape": false,
  "customWidth": 1920,
  "customHeight": 1080
}
```

## Known Limitations

- Requires dev server to be running
- Works best with keyboard navigation (Arrow keys)
- Some very long animations may need manual timeout adjustment
- Large presentations (100+ slides) may take several minutes

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review `pdf-export.config.json` settings
3. Check browser console for errors
4. Verify all dependencies are installed

## License

MIT License - feel free to use in your projects.

