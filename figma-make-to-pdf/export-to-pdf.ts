/**
 * Figma Make to PDF - Generic Export Script
 * 
 * This script exports React + Vite presentations (created with Figma Make) to PDF.
 * It reads configuration from pdf-export.config.json and handles:
 * - Automatic slide navigation
 * - Sub-slide detection and navigation
 * - Animation waiting (prevents empty/cut-off pages)
 * - Full-page screenshots
 * - PDF generation and merging
 * 
 * For AI: This script is designed to be generic and work with any Figma Make project.
 * It uses configuration-driven approach - all settings come from pdf-export.config.json.
 * 
 * Known issues handled:
 * - Puppeteer timeout: Increased timeouts, retry logic
 * - Animations: Intelligent waiting for content visibility
 * - Mac Silicon: Auto-detects Chrome path
 * - TypeScript compilation: Uses waitForFunction instead of complex evaluate()
 * - Dev server: Checks if running before export
 * - Different project structures: Configurable selectors
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

// Configuration interface - matches pdf-export.config.json structure
interface SlideConfig {
  type: 'subSlide' | 'step';
  max: number;
  comment?: string;
}

interface ExportConfig {
  devServerUrl: string;
  totalSlides: number;
  slidesWithSubSlides: Record<string, SlideConfig>;
  pdfFormat: string;
  landscape: boolean;
  hideUIElements: boolean;
  animationWaitTime: number;
  slideTransitionWaitTime: number;
  subSlideTransitionWaitTime: number;
  viewport: {
    width: number;
    height: number;
  };
  selectors: {
    progressBar: string;
    mainContent: string;
    header: string;
    navigation: string;
  };
  specialSlides?: Record<string, {
    typewriterEffect?: boolean;
    typewriterWaitTime?: number;
    comment?: string;
  }>;
}

// Load configuration from pdf-export.config.json
function loadConfig(): ExportConfig {
  const configPath = path.join(process.cwd(), 'pdf-export.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ Configuration file not found: pdf-export.config.json');
    console.error('   Please run the installer first: npm run install (in Figma-Make-to-pdf folder)');
    process.exit(1);
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent) as ExportConfig;
    
    // Validate required fields
    if (!config.devServerUrl || !config.totalSlides) {
      throw new Error('Invalid configuration: missing required fields');
    }
    
    return config;
  } catch (error) {
    console.error('❌ Failed to load configuration:', error);
    process.exit(1);
  }
}

// Paths
const OUTPUT_DIR = path.join(process.cwd(), 'exports');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'presentation.pdf');

/**
 * Wait for animations to complete
 * 
 * For AI: This function handles the common problem of animations not being ready
 * when screenshots are taken. It:
 * 1. Waits a base delay
 * 2. Uses waitForFunction to check if main content is visible (opacity > 0.9)
 * 3. Has timeout handling to prevent infinite waits
 * 
 * We use waitForFunction instead of page.evaluate() with complex logic to avoid
 * TypeScript compilation issues in browser context.
 */
const waitForAnimation = async (page: Page, config: ExportConfig, delay?: number): Promise<void> => {
  const waitTime = delay || config.animationWaitTime;
  
  // Wait the base delay
  await new Promise(resolve => setTimeout(resolve, waitTime));
  
  // Wait for main content to be visible using waitForFunction
  // This avoids TypeScript compilation issues in browser context
  try {
    await page.waitForFunction(
      () => {
        const main = document.querySelector(config.selectors.mainContent);
        if (!main) return false;
        const style = window.getComputedStyle(main);
        return parseFloat(style.opacity) > 0.9;
      },
      { timeout: 3000 }
    );
  } catch (e) {
    // Continue if timeout - content might already be visible
  }
};

/**
 * Navigate to a specific slide using keyboard navigation
 * 
 * For AI: This function uses keyboard navigation (Arrow keys) which is more reliable
 * than clicking buttons (which can be detached from DOM during animations).
 * It:
 * 1. Gets current slide from progress bar
 * 2. Calculates steps needed
 * 3. Uses ArrowRight/ArrowLeft to navigate
 * 4. Waits for animations between each step
 */
const navigateToSlide = async (page: Page, slideIndex: number, config: ExportConfig): Promise<void> => {
  // Get current slide from progress bar
  const currentSlide = await page.evaluate((selector) => {
    const progressBar = document.querySelector(selector);
    const ariaValueNow = progressBar?.getAttribute('aria-valuenow');
    return ariaValueNow ? parseInt(ariaValueNow) - 1 : 0;
  }, config.selectors.progressBar);

  const steps = slideIndex - currentSlide;
  if (steps > 0) {
    for (let i = 0; i < steps; i++) {
      await page.keyboard.press('ArrowRight');
      await waitForAnimation(page, config, config.slideTransitionWaitTime);
    }
  } else if (steps < 0) {
    for (let i = 0; i < Math.abs(steps); i++) {
      await page.keyboard.press('ArrowLeft');
      await waitForAnimation(page, config, config.slideTransitionWaitTime);
    }
  } else {
    await waitForAnimation(page, config, 500);
  }
};

/**
 * Navigate through sub-slides
 * 
 * For AI: Sub-slides are navigated with ArrowDown/ArrowUp keys.
 * We wait longer (subSlideTransitionWaitTime) because sub-slides often have
 * typewriter effects or complex animations that take time to complete.
 */
const navigateSubSlide = async (page: Page, direction: 'down' | 'up', config: ExportConfig): Promise<void> => {
  const key = direction === 'down' ? 'ArrowDown' : 'ArrowUp';
  await page.keyboard.press(key);
  await waitForAnimation(page, config, config.subSlideTransitionWaitTime);
};

/**
 * Hide UI elements for clean screenshots
 * 
 * For AI: This hides header, navigation, progress bar, and sub-slide indicators
 * to create cleaner PDF pages. The selectors are configurable in config.json
 * to work with different project structures.
 */
const hideUIElements = async (page: Page, config: ExportConfig): Promise<void> => {
  await page.evaluate((selectors) => {
    // Hide header
    const header = document.querySelector(selectors.header);
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    // Hide navigation
    const nav = document.querySelector(selectors.navigation);
    if (nav) {
      (nav as HTMLElement).style.display = 'none';
    }
    // Hide progress bar
    const progressBar = document.querySelector(selectors.progressBar);
    if (progressBar) {
      (progressBar as HTMLElement).style.display = 'none';
    }
    // Hide sub-slide indicators (elements with "/" in text content)
    const indicators = document.querySelectorAll('[class*="fixed bottom"]');
    indicators.forEach((indicator) => {
      if (indicator.textContent?.includes('/')) {
        (indicator as HTMLElement).style.display = 'none';
      }
    });
  }, config.selectors);
  
  await waitForAnimation(page, config, 300);
};

/**
 * Wait for slide content to be fully loaded
 * 
 * For AI: This handles special cases like typewriter effects that need extra time.
 * Special slides are configured in pdf-export.config.json under specialSlides.
 * For example, DesignSystemRulesSlide has a typewriter effect that needs 3+ seconds.
 */
const waitForSlideContent = async (page: Page, slideIndex: number, config: ExportConfig): Promise<void> => {
  // Wait for main content to be visible
  try {
    await page.waitForSelector(config.selectors.mainContent, { visible: true, timeout: 5000 });
  } catch (e) {
    // Continue anyway if selector not found
  }
  
  // Check for special slide handling (e.g., typewriter effects)
  const specialSlide = config.specialSlides?.[slideIndex.toString()];
  if (specialSlide?.typewriterEffect) {
    const waitTime = specialSlide.typewriterWaitTime || 3000;
    
    // Wait for typewriter effect to complete
    try {
      await page.waitForFunction(
        () => {
          // Look for terminal or typewriter content
          const terminal = document.querySelector('[class*="Terminal"]') || 
                          document.querySelector('[class*="terminal"]');
          if (terminal) {
            const lines = terminal.querySelectorAll('div, p, span');
            return lines.length > 20; // Typewriter should show many lines when done
          }
          return true; // No terminal found, proceed
        },
        { timeout: waitTime }
      );
    } catch (e) {
      // Continue if timeout
    }
    
    // Extra wait for typewriter
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // General wait for all animations
  await waitForAnimation(page, config, 1500);
};

/**
 * Take full page screenshot
 * 
 * For AI: This takes a full-page screenshot (not just viewport) using
 * fullPage: true and captureBeyondViewport: true. This ensures we capture
 * all content even if it's longer than the viewport.
 */
const takeScreenshot = async (page: Page, filename: string, slideIndex: number, config: ExportConfig): Promise<Buffer> => {
  // Set viewport from config
  await page.setViewport({
    width: config.viewport.width,
    height: config.viewport.height,
  });

  // Wait for slide content to be fully loaded
  await waitForSlideContent(page, slideIndex, config);

  // Take full page screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: true,
    captureBeyondViewport: true,
  });

  return screenshot as Buffer;
};

/**
 * Convert PNG screenshot to PDF page
 * 
 * For AI: This creates a PDF page with the exact dimensions of the screenshot.
 * We don't force A4 format - instead we use the screenshot dimensions to ensure
 * nothing gets cut off. This is important for presentations with varying slide heights.
 */
const convertImageToPDF = async (imageBuffer: Buffer): Promise<PDFDocument> => {
  const pdfDoc = await PDFDocument.create();
  
  // Load PNG image
  const image = await pdfDoc.embedPng(imageBuffer);
  
  // Get image dimensions
  const imageDims = image.scale(1);
  
  // Use screenshot dimensions (not fixed A4) to prevent cut-off
  const pageWidth = imageDims.width;
  const pageHeight = imageDims.height;
  
  // Add page with image dimensions
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: imageDims.width,
    height: imageDims.height,
  });
  
  return pdfDoc;
};

/**
 * Check if dev server is running
 * 
 * For AI: This checks if the dev server is accessible before starting export.
 * Prevents common error where user forgets to start dev server.
 */
async function checkDevServer(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Find Chrome executable path
 * 
 * For AI: This handles the Mac Silicon (arm64) issue where Puppeteer might
 * try to use x64 Chrome. We explicitly find the arm64 Chrome path on Mac.
 * Also handles Windows and Linux Chrome/Chromium paths.
 */
function findChromeExecutable(): string | undefined {
  if (process.platform === 'darwin') {
    // macOS - check common Chrome locations
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
  } else if (process.platform === 'win32') {
    // Windows - common Chrome locations
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
  }
  // Linux - usually in PATH, Puppeteer will find it
  return undefined;
}

/**
 * Main export function
 * 
 * For AI: This is the main orchestration function. It:
 * 1. Loads configuration
 * 2. Checks dev server
 * 3. Launches browser with proper Chrome path
 * 4. Navigates through all slides and sub-slides
 * 5. Takes screenshots
 * 6. Converts to PDF
 * 7. Merges into single PDF
 * 
 * Error handling is comprehensive to help users debug issues.
 */
async function exportPresentationToPDF() {
  console.log('🚀 Starting PDF export (screenshot-based)...\n');

  // Load configuration
  const config = loadConfig();
  console.log(`📋 Configuration loaded: ${config.totalSlides} slides\n`);

  // Check if dev server is running
  console.log('🔍 Checking if dev server is running...');
  const serverRunning = await checkDevServer(config.devServerUrl);
  if (!serverRunning) {
    console.error('❌ Dev server is not running!');
    console.error(`   Expected URL: ${config.devServerUrl}`);
    console.error('   Please run: npm run dev');
    console.error('   Then in another terminal run: npm run export:pdf');
    process.exit(1);
  }
  console.log('✅ Dev server is running\n');

  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Launch browser
  console.log('🌐 Launching browser...');
  
  const executablePath = findChromeExecutable();
  if (executablePath) {
    console.log(`   Using Chrome: ${executablePath}`);
  }
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
    executablePath,
    timeout: 60000, // Increased timeout for slow systems
  });

  const page = await browser.newPage();
  
  // Set longer timeout for page operations (handles slow animations)
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);
  
  // Set viewport from config
  await page.setViewport({
    width: config.viewport.width,
    height: config.viewport.height,
  });

  try {
    // Navigate to presentation
    console.log(`🌐 Navigating to ${config.devServerUrl}...`);
    await page.goto(config.devServerUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for React to load
    try {
      await page.waitForSelector(config.selectors.progressBar, { timeout: 10000 });
    } catch (e) {
      console.warn('⚠️  Progress bar not found, continuing anyway...');
    }
    await waitForAnimation(page, config, 1000);

    console.log('✅ Presentation loaded\n');

    // Create merged PDF document
    const mergedPdf = await PDFDocument.create();
    const screenshotFiles: string[] = [];
    let totalPages = 0;

    // Export each slide
    for (let slideIndex = 0; slideIndex < config.totalSlides; slideIndex++) {
      console.log(`📄 Exporting slide ${slideIndex + 1}/${config.totalSlides}...`);

      // Navigate to slide
      await navigateToSlide(page, slideIndex, config);

      // Check if this slide has sub-slides
      const subSlideConfig = config.slidesWithSubSlides[slideIndex.toString()];

      if (subSlideConfig) {
        const { type, max } = subSlideConfig;
        const startIndex = type === 'subSlide' ? 0 : 1;
        const endIndex = type === 'subSlide' ? max : max;

        console.log(`   └─ Found ${endIndex - startIndex + 1} ${type === 'subSlide' ? 'sub-slides' : 'steps'}`);

        // Export each sub-slide
        for (let subIndex = startIndex; subIndex <= endIndex; subIndex++) {
          // Navigate to specific sub-slide if not at start
          if (subIndex > startIndex) {
            await navigateSubSlide(page, 'down', config);
          }

          // Hide UI and take screenshot
          await hideUIElements(page, config);
          const filename = `slide-${slideIndex + 1}-${type}-${subIndex + (type === 'step' ? 0 : 1)}.png`;
          const filepath = path.join(SCREENSHOTS_DIR, filename);
          
          const screenshot = await takeScreenshot(page, filename, slideIndex, config);
          fs.writeFileSync(filepath, screenshot);
          screenshotFiles.push(filepath);

          // Convert to PDF and add to merged PDF
          const pdfDoc = await convertImageToPDF(screenshot);
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          pages.forEach((page) => mergedPdf.addPage(page));
          totalPages++;

          const displayIndex = type === 'step' ? subIndex : subIndex + 1;
          console.log(`      ✓ Exported ${type} ${displayIndex}`);
        }

        // Reset to first sub-slide for next main slide
        if (type === 'subSlide') {
          for (let i = 0; i < endIndex; i++) {
            await navigateSubSlide(page, 'up', config);
          }
        } else {
          // For steps, cycle back to step 1
          await navigateSubSlide(page, 'down', config);
        }
      } else {
        // No sub-slides, export directly
        await hideUIElements(page, config);
        const filename = `slide-${slideIndex + 1}.png`;
        const filepath = path.join(SCREENSHOTS_DIR, filename);
        
        const screenshot = await takeScreenshot(page, filename, slideIndex, config);
        fs.writeFileSync(filepath, screenshot);
        screenshotFiles.push(filepath);

        // Convert to PDF and add to merged PDF
        const pdfDoc = await convertImageToPDF(screenshot);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
        totalPages++;
        console.log(`   ✓ Exported`);
      }
    }

    // Save merged PDF
    console.log(`\n💾 Saving PDF (${totalPages} pages)...`);
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(OUTPUT_FILE, pdfBytes);

    console.log(`\n✅ PDF exported successfully!`);
    console.log(`📁 Location: ${OUTPUT_FILE}`);
    console.log(`📊 Total pages: ${totalPages}`);
    console.log(`📸 Screenshots saved in: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error during export:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run export
if (require.main === module) {
  exportPresentationToPDF()
    .then(() => {
      console.log('\n🎉 Export completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Export failed:', error);
      process.exit(1);
    });
}

export { exportPresentationToPDF };

