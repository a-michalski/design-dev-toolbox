# Figma Make to Vercel - Image Decoding Fix

## Problem

When using **Figma Make** to automatically sync Figma designs to your GitHub repository, PNG images are saved as **base64-encoded strings** instead of binary PNG files. This causes several issues when deploying to **Vercel**:

- ❌ Images don't load in the browser (incorrect MIME type)
- ❌ Files are larger than necessary (base64 encoding adds ~33% overhead)
- ❌ Browsers don't recognize them as valid PNG images
- ❌ Vercel deployments may fail or show broken images

## Why This Happens

Figma Make uses the Figma API, which returns images as base64-encoded strings in JSON responses. This is standard behavior for:
- APIs that return binary data through JSON
- JSON-based communication protocols (like MCP)
- Automated Figma → GitHub integrations

**Unfortunately, Figma Make doesn't offer an option to change the image export format** - the API always returns base64, so we need to decode them on the project side.

## Solution Overview

This repository provides **two complementary solutions** to automatically decode base64-encoded PNG images to binary PNG files, making them compatible with Vercel and standard web browsers.

### Why Two Solutions?

We offer two different approaches because they solve the problem at different stages of the deployment pipeline:

1. **Vercel Solution** - Decodes images **during the build process** on Vercel
   - ✅ Most reliable - always works regardless of git state
   - ✅ No extra commits - clean git history
   - ✅ Works on Vercel Free Plan
   - ✅ Best for: Production deployments, when you want simplicity

2. **GitHub Actions Solution** - Decodes images **after Figma Make pushes** and commits them back
   - ✅ Clean git history - images already decoded in repository
   - ✅ Faster builds - no decoding needed during build
   - ✅ Works with any hosting provider
   - ✅ Best for: When you want images already fixed in git, or using other hosting

**You can use one or both** - they complement each other perfectly!

## What the Script Does

The core `decode-base64-images.js` script:
1. ✅ Scans common asset directories (`public/assets/`, `src/assets/`, `build/assets/`)
2. ✅ Detects PNG files saved as base64 strings (starting with `iVBORw0KGgo`)
3. ✅ Decodes them to binary PNG files
4. ✅ Verifies that decoded files are valid PNG images
5. ✅ Preserves original file names and locations

## Solutions

### 🚀 [Vercel Solution](./vercel/) - **Recommended for Most Users**

**What it does:** Uses npm lifecycle hooks (`prebuild`, `postinstall`) to automatically decode images during the Vercel build process.

**Why use it:**
- Most reliable approach - images decoded before build starts
- Works on Vercel Free Plan (Hobby)
- No extra commits to git history
- Zero configuration - just add scripts to `package.json`
- Works everywhere - local dev, CI/CD, Vercel

**When to use:**
- ✅ Primary choice for Vercel deployments
- ✅ When you want automatic decoding without extra commits
- ✅ When you want the most reliable solution
- ✅ For production deployments

👉 **[See Vercel Setup Guide](./vercel/README.md)**

### 🔄 [GitHub Actions Solution](./github-actions/) - **Optional Enhancement**

**What it does:** Automatically decodes images after Figma Make deployments and commits them back to the repository.

**Why use it:**
- Keeps repository clean - images already decoded in git
- Faster builds - no decoding needed during build
- Works with any hosting provider (not just Vercel)
- Can be combined with Vercel solution for maximum reliability

**When to use:**
- ✅ When you want clean git history (images already decoded)
- ✅ When you want faster builds (no decoding during build)
- ✅ When using GitHub Actions anyway
- ✅ When you want to combine with Vercel solution (optional)

**Considerations:**
- ⚠️ Adds extra commits to git history
- ⚠️ Requires GitHub Actions to be enabled
- ⚠️ Needs proper configuration to avoid infinite loops

👉 **[See GitHub Actions Setup Guide](./github-actions/README.md)**

### 📊 [Deployment Strategy Guide](./DEPLOYMENT_STRATEGY.md)

Expert analysis comparing both approaches, best practices, and production recommendations.

## Using AI to Solve This Automatically

If you're using an AI assistant (like Claude, ChatGPT, or GitHub Copilot), you can ask it to implement this solution automatically. Here's a prompt you can use:

---

### AI Prompt Template

```
I'm using Figma Make to automatically sync Figma designs to my GitHub repository. 
The problem is that Figma Make saves PNG images as base64-encoded strings instead of 
binary PNG files, which causes issues when deploying to Vercel (images don't load, 
incorrect MIME type, files are larger than needed).

I need you to:
1. Create a Node.js script that:
   - Scans directories: public/assets/, src/assets/, build/assets/
   - Detects PNG files that are base64-encoded (they start with "iVBORw0KGgo")
   - Decodes them to binary PNG files
   - Validates the decoded files are valid PNG images
   - Preserves original file names and locations

2. Set up automatic decoding using one of these approaches:
   Option A (Recommended): Use npm lifecycle hooks
   - Add "prebuild" script that runs the decoding script before build
   - Add "postinstall" script as a safety net
   - This ensures images are decoded during Vercel builds
   
   Option B (Optional): Set up GitHub Actions workflow
   - Triggers after commits from figma[bot] or with "Update files from Figma Make" message
   - Decodes images and commits them back to repository
   - IMPORTANT: Exclude commits from GitHub Actions to prevent infinite loops
   - Use condition: !contains(github.event.head_commit.message, 'fix: decode base64 images')

3. The script should:
   - Use only Node.js built-in modules (fs, path)
   - Accept optional project root path as argument
   - Provide clear console output showing what was decoded
   - Handle errors gracefully

Please implement this solution and explain how it works.
```

---

**Why this prompt works:**
- Explains the problem clearly
- Specifies exact requirements
- Provides both solution options
- Includes important safeguards (infinite loop prevention)
- Asks for explanation so you understand the solution

## Manual Execution

You can also run the script manually:

```bash
# From the project root directory
node figma-make-to-vercel/decode-base64-images.js

# Or specify a custom project root
node figma-make-to-vercel/decode-base64-images.js /path/to/your/project
```

## Verification

To check if an image is base64-encoded:

```bash
# Check file content
head -c 50 public/assets/your-image.png
# Base64: iVBORw0KGgoAAAANSUhEUgAAB...
# Binary: PNG magic bytes (not visible as text)

# Check file type
file public/assets/your-image.png
# Base64: ASCII text, with very long lines
# Binary: PNG image data, 1024 x 1024, ...
```

## How It Works (Technical Details)

1. **Detection**: Checks if PNG files start with `iVBORw0KGgo` (base64 encoding of PNG magic bytes `89 50 4E 47 0D 0A 1A 0A`)
2. **Decoding**: Converts base64 string to binary buffer using Node.js `Buffer.from()`
3. **Validation**: Verifies the decoded buffer contains valid PNG magic bytes
4. **Replacement**: Writes the binary PNG file back to the same location

## Requirements

- Node.js (no external dependencies - uses only built-in `fs` and `path` modules)
- PNG files must be in one of the scanned directories:
  - `public/assets/`
  - `src/assets/`
  - `build/assets/`

## Standalone Usage

This script can be used as a standalone tool in any project. Simply:
1. Copy the `decode-base64-images.js` file to your project
2. Run it from your project root
3. Optionally customize the `ASSET_DIRS` array in the script to match your project structure

## Project Structure

```
figma-make-to-vercel/
├── decode-base64-images.js      # Core decoding script (used by both solutions)
├── README.md                     # This file - main documentation
├── DEPLOYMENT_STRATEGY.md         # Expert deployment analysis
├── INDEX.md                      # Project structure guide
│
├── vercel/                       # Vercel Solution
│   ├── README.md                 # Complete Vercel setup guide
│   └── package.json.example      # Example package.json configuration
│
└── github-actions/               # GitHub Actions Solution
    ├── README.md                 # Complete GitHub Actions setup guide
    └── workflow.yml              # Complete workflow example
```

## Quick Decision Guide

**Choose Vercel Solution if:**
- ✅ You're deploying to Vercel
- ✅ You want the simplest, most reliable solution
- ✅ You don't mind images being decoded during build
- ✅ You want to avoid extra git commits

**Choose GitHub Actions Solution if:**
- ✅ You want images already decoded in your git repository
- ✅ You want faster builds (no decoding during build)
- ✅ You're using GitHub Actions anyway
- ✅ You're deploying to other platforms (not just Vercel)

**Use Both if:**
- ✅ You want maximum reliability
- ✅ You want clean git history AND build-time safety net
- ✅ You're deploying to production

## License

This script is provided as-is for fixing Figma Make → Vercel deployment issues.
