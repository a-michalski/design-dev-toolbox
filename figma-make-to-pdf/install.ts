/**
 * Figma Make to PDF - Installation Script
 * 
 * This script:
 * 1. Scans the repository to detect slide structure
 * 2. Asks user for configuration
 * 3. Generates pdf-export.config.json
 * 4. Copies export script to project
 * 5. Updates package.json with export script
 * 6. Installs dependencies
 * 
 * For AI: This script uses file system operations and regex to detect
 * React slide components. It looks for:
 * - const slides = [...] in App.tsx or main component file
 * - useState with subSlide or step in slide components
 * - vite.config.ts for dev server port
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as readline from 'readline';

// Configuration interface for type safety
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
  specialSlides?: Record<string, any>;
}

// Get project root (parent of Figma-Make-to-pdf folder)
// tsx runs in CommonJS mode by default, so __dirname should work
// If it doesn't, we fall back to process.cwd() detection
let TOOL_DIR: string;
let PROJECT_ROOT: string;

try {
  // Try CommonJS __dirname (works with tsx)
  TOOL_DIR = __dirname;
  PROJECT_ROOT = path.resolve(TOOL_DIR, '..');
} catch (e) {
  // Fallback: detect from current working directory
  const CURRENT_DIR = process.cwd();
  if (path.basename(CURRENT_DIR) === 'Figma-Make-to-pdf') {
    TOOL_DIR = CURRENT_DIR;
    PROJECT_ROOT = path.resolve(CURRENT_DIR, '..');
  } else {
    // Assume we're in project root, look for subfolder
    TOOL_DIR = path.join(CURRENT_DIR, 'Figma-Make-to-pdf');
    PROJECT_ROOT = CURRENT_DIR;
  }
}
const CONFIG_FILE = path.join(PROJECT_ROOT, 'pdf-export.config.json');
const EXPORT_SCRIPT_SOURCE = path.join(TOOL_DIR, 'export-to-pdf.ts');
const EXPORT_SCRIPT_DEST = path.join(PROJECT_ROOT, 'export-to-pdf.ts');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Scan repository for slide structure
function scanRepository(): {
  totalSlides: number;
  slidesWithSubSlides: Record<string, SlideConfig>;
  devServerUrl: string;
} {
  console.log('🔍 Scanning repository...\n');

  // Find App.tsx or main component file
  const appFiles = [
    path.join(PROJECT_ROOT, 'src', 'App.tsx'),
    path.join(PROJECT_ROOT, 'src', 'app.tsx'),
    path.join(PROJECT_ROOT, 'App.tsx'),
  ];

  let appFile: string | null = null;
  for (const file of appFiles) {
    if (fs.existsSync(file)) {
      appFile = file;
      break;
    }
  }

  if (!appFile) {
    console.error('❌ Could not find App.tsx. Please ensure you are in a React project.');
    process.exit(1);
  }

  console.log(`✅ Found main component: ${path.relative(PROJECT_ROOT, appFile)}`);

  // Read App.tsx to find slides array
  const appContent = fs.readFileSync(appFile, 'utf-8');
  
  // Detect total slides - look for "const slides = [" pattern
  const slidesMatch = appContent.match(/const\s+slides\s*=\s*\[([\s\S]*?)\];/);
  let totalSlides = 0;
  
  if (slidesMatch) {
    // Count slide objects in array
    const slidesContent = slidesMatch[1];
    const slideMatches = slidesContent.match(/\{[^}]*id\s*:\s*\d+[^}]*\}/g);
    totalSlides = slideMatches ? slideMatches.length : 0;
    console.log(`✅ Detected ${totalSlides} slides in slides array`);
  } else {
    console.log('⚠️  Could not auto-detect slides. You will need to enter manually.');
  }

  // Detect dev server URL from vite.config.ts
  let devServerUrl = 'http://localhost:3000';
  const viteConfigPath = path.join(PROJECT_ROOT, 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
    const portMatch = viteConfig.match(/port:\s*(\d+)/);
    if (portMatch) {
      devServerUrl = `http://localhost:${portMatch[1]}`;
      console.log(`✅ Detected dev server URL: ${devServerUrl}`);
    }
  }

  // Scan slide components for sub-slides
  const slidesWithSubSlides: Record<string, SlideConfig> = {};
  
  // Try to map component names to slide indices from App.tsx
  // Pattern: component: ComponentName (case-sensitive match)
  const componentToIndex: Record<string, number> = {};
  const componentMatches = appContent.matchAll(/component:\s*(\w+)/g);
  let currentIndex = 0;
  for (const match of componentMatches) {
    const componentName = match[1];
    componentToIndex[componentName] = currentIndex;
    currentIndex++;
  }
  
  // Debug: show mapping if needed
  if (Object.keys(componentToIndex).length === 0) {
    console.warn('⚠️  Warning: Could not map component names to slide indices');
    console.warn('   This might indicate a different slide structure');
  }
  
  // Look for slide component files
  const slidesDir = path.join(PROJECT_ROOT, 'src', 'components', 'slides');
  if (fs.existsSync(slidesDir)) {
    const slideFiles = fs.readdirSync(slidesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    
    console.log(`\n🔍 Scanning ${slideFiles.length} slide components for sub-slides...`);
    
    slideFiles.forEach((file) => {
      const filePath = path.join(slidesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract component name from file (remove .tsx/.ts extension)
      const componentName = file.replace(/\.(tsx|ts)$/, '');
      const slideIndex = componentToIndex[componentName];
      
      if (slideIndex === undefined) {
        return; // Component not found in slides array
      }
      
      // Look for useState with subSlide (pattern: useState(0) and subSlide < 8)
      const subSlidePattern = /const\s+\[subSlide[^\]]*\]\s*=\s*useState\((\d+)\)/;
      const subSlideMatch = content.match(subSlidePattern);
      if (subSlideMatch) {
        // Look for max value (subSlide < 8 or similar)
        const maxPattern = /subSlide\s*[<>=]\s*(\d+)/g;
        let maxValue = 0;
        let match;
        while ((match = maxPattern.exec(content)) !== null) {
          const val = parseInt(match[1]);
          if (val > maxValue) maxValue = val;
        }
        
        if (maxValue > 0) {
          slidesWithSubSlides[slideIndex.toString()] = {
            type: 'subSlide',
            max: maxValue,
            comment: `Auto-detected from ${file}`
          };
          console.log(`   ✓ Slide ${slideIndex} (${componentName}): subSlide 0-${maxValue} (${maxValue + 1} sub-slides)`);
        }
      }
      
      // Look for useState with step (pattern: useState<1 | 2 | 3>(1))
      const stepPattern = /useState<1\s*\|\s*2\s*\|\s*3>\s*\(1\)/;
      if (stepPattern.test(content)) {
        slidesWithSubSlides[slideIndex.toString()] = {
          type: 'step',
          max: 3,
          comment: `Auto-detected from ${file}`
        };
        console.log(`   ✓ Slide ${slideIndex} (${componentName}): step 1-3 (3 steps)`);
      }
      
      // Check if slide uses ContentToDocumentSlide (which has steps)
      // This is a common pattern in Figma Make presentations
      const usesContentToDocument = /ContentToDocumentSlide|from\s+['"].*ContentToDocumentSlide|import.*ContentToDocumentSlide/;
      if (usesContentToDocument.test(content) && !slidesWithSubSlides[slideIndex.toString()]) {
        slidesWithSubSlides[slideIndex.toString()] = {
          type: 'step',
          max: 3,
          comment: `Auto-detected: uses ContentToDocumentSlide (3 steps)`
        };
        console.log(`   ✓ Slide ${slideIndex} (${componentName}): step 1-3 (uses ContentToDocumentSlide)`);
      }
      
      // Check for DesignSystemRulesSlide which has typewriter effect
      if (componentName === 'DesignSystemRulesSlide' && !slidesWithSubSlides[slideIndex.toString()]) {
        // This slide has step AND typewriter effect - step is already detected above
        // We'll add special handling in config generation
      }
    });
  }

  return {
    totalSlides,
    slidesWithSubSlides,
    devServerUrl,
  };
}

// Main installation function
async function install() {
  console.log('🚀 Figma Make to PDF - Installation\n');
  console.log('This will scan your repository and set up PDF export.\n');

  // Scan repository
  const detected = scanRepository();

  // Ask user for configuration
  console.log('\n📝 Configuration Questions:\n');

  // Dev server URL
  const devServerUrl = await question(
    `Dev server URL [${detected.devServerUrl}]: `
  ) || detected.devServerUrl;

  // Total slides
  const totalSlidesInput = await question(
    `Total number of slides [${detected.totalSlides}]: `
  );
  const totalSlides = totalSlidesInput ? parseInt(totalSlidesInput) : detected.totalSlides;

  // Slides with sub-slides
  console.log('\n📊 Detected slides with sub-slides:');
  if (Object.keys(detected.slidesWithSubSlides).length === 0) {
    console.log('   (none detected)');
  } else {
    Object.entries(detected.slidesWithSubSlides).forEach(([index, config]) => {
      console.log(`   Slide ${index}: ${config.type} 0-${config.max}`);
    });
  }

  const confirmSubSlides = await question(
    '\nConfirm detected sub-slides? (y/n) [y]: '
  ) || 'y';

  let slidesWithSubSlides = detected.slidesWithSubSlides;
  if (confirmSubSlides.toLowerCase() !== 'y') {
    console.log('\nYou can manually edit pdf-export.config.json after installation.');
  }

  // PDF format
  const pdfFormat = await question(
    'PDF format (A4/Letter/Custom) [A4]: '
  ) || 'A4';

  const landscapeInput = await question(
    'Landscape orientation? (y/n) [y]: '
  ) || 'y';
  const landscape = landscapeInput.toLowerCase() === 'y';

  // Hide UI elements
  const hideUIInput = await question(
    'Hide UI elements (header, nav, progress bar) in PDF? (y/n) [y]: '
  ) || 'y';
  const hideUIElements = hideUIInput.toLowerCase() === 'y';

  // Build configuration
  const config: ExportConfig = {
    devServerUrl,
    totalSlides,
    slidesWithSubSlides,
    pdfFormat,
    landscape,
    hideUIElements,
    animationWaitTime: 2000,
    slideTransitionWaitTime: 1000,
    subSlideTransitionWaitTime: 2000,
    viewport: {
      width: 1920,
      height: 1080,
    },
    selectors: {
      progressBar: '[role="progressbar"]',
      mainContent: 'main',
      header: 'header',
      navigation: 'nav',
    },
    // Add special slides handling (e.g., typewriter effects)
    specialSlides: {
      // DesignSystemRulesSlide (slide 14) has typewriter effect
      '14': {
        typewriterEffect: true,
        typewriterWaitTime: 3000,
        comment: 'DesignSystemRulesSlide has typewriter effect that needs extra wait time'
      }
    },
  };

  // Save configuration
  console.log('\n💾 Saving configuration...');
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`✅ Configuration saved to: ${path.relative(PROJECT_ROOT, CONFIG_FILE)}`);

  // Copy export script
  console.log('\n📋 Copying export script...');
  if (!fs.existsSync(EXPORT_SCRIPT_SOURCE)) {
    console.error(`❌ Export script not found: ${EXPORT_SCRIPT_SOURCE}`);
    process.exit(1);
  }
  
  // Check if export script already exists
  if (fs.existsSync(EXPORT_SCRIPT_DEST)) {
    const overwrite = await question(
      `⚠️  export-to-pdf.ts already exists. Overwrite? (y/n) [y]: `
    ) || 'y';
    if (overwrite.toLowerCase() !== 'y') {
      console.log('   Skipping export script copy (using existing file)');
    } else {
      fs.copyFileSync(EXPORT_SCRIPT_SOURCE, EXPORT_SCRIPT_DEST);
      console.log(`✅ Export script copied to: ${path.relative(PROJECT_ROOT, EXPORT_SCRIPT_DEST)}`);
    }
  } else {
    fs.copyFileSync(EXPORT_SCRIPT_SOURCE, EXPORT_SCRIPT_DEST);
    console.log(`✅ Export script copied to: ${path.relative(PROJECT_ROOT, EXPORT_SCRIPT_DEST)}`);
  }

  // Update package.json
  console.log('\n📦 Updating package.json...');
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found!');
    process.exit(1);
  }

  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  } catch (error) {
    console.error('❌ Failed to parse package.json:', error);
    process.exit(1);
  }
  
  // Add export script (check if already exists)
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  if (packageJson.scripts['export:pdf']) {
    const overwrite = await question(
      `⚠️  Script 'export:pdf' already exists in package.json. Overwrite? (y/n) [y]: `
    ) || 'y';
    if (overwrite.toLowerCase() !== 'y') {
      console.log('   Keeping existing export:pdf script');
    } else {
      packageJson.scripts['export:pdf'] = 'tsx export-to-pdf.ts';
      console.log('   Updated export:pdf script');
    }
  } else {
    packageJson.scripts['export:pdf'] = 'tsx export-to-pdf.ts';
    console.log('   Added export:pdf script');
  }
  
  // Add devDependencies if not present
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  const requiredDeps = {
    'puppeteer': '^24.30.0',
    'pdf-lib': '^1.17.1',
    'tsx': '^4.20.6',
    '@types/puppeteer': '^5.4.7',
  };

  let depsToInstall: string[] = [];
  Object.entries(requiredDeps).forEach(([dep, version]) => {
    if (!packageJson.devDependencies[dep] && !packageJson.dependencies[dep]) {
      packageJson.devDependencies[dep] = version;
      depsToInstall.push(`${dep}@${version}`);
    }
  });

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated');

  // Install dependencies
  if (depsToInstall.length > 0) {
    console.log('\n📥 Installing dependencies...');
    try {
      execSync(`npm install --save-dev ${depsToInstall.join(' ')}`, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
      });
      console.log('✅ Dependencies installed');
    } catch (error) {
      console.error('❌ Failed to install dependencies. Please run manually:');
      console.error(`   npm install --save-dev ${depsToInstall.join(' ')}`);
    }
  } else {
    console.log('✅ All dependencies already installed');
  }

  // Final instructions
  console.log('\n🎉 Installation complete!\n');
  console.log('Next steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. In another terminal, run: npm run export:pdf');
  console.log('3. PDF will be saved to: exports/presentation.pdf\n');

  rl.close();
}

// Run installation
install().catch((error) => {
  console.error('❌ Installation failed:', error);
  rl.close();
  process.exit(1);
});

