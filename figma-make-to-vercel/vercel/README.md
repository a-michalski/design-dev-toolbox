# Vercel Solution - Build-Time Image Decoding

## Overview

This solution uses **npm lifecycle hooks** to automatically decode base64 images during the Vercel build process. It's the **recommended approach** for Vercel deployments.

## ✅ Advantages

- ✅ **Works on Vercel Free Plan (Hobby)** - no limitations
- ✅ **Most reliable** - images decoded before build starts
- ✅ **No extra commits** - clean git history
- ✅ **Zero configuration** - just add scripts to `package.json`
- ✅ **Works everywhere** - local dev, CI/CD, Vercel

## 🚀 Quick Setup

### Step 1: Add scripts to `package.json`

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run decode-images",
    "build": "vite build",
    "decode-images": "node figma-make-to-vercel/decode-base64-images.js",
    "postinstall": "npm run decode-images"
  }
}
```

**What each script does:**
- `prebuild` - Automatically runs before `npm run build` (Vercel uses this)
- `decode-images` - Runs the decoding script
- `postinstall` - Safety net that runs after `npm install`

### Step 2: Deploy to Vercel

That's it! Vercel will automatically:
1. Run `npm install` → triggers `postinstall` → decodes images
2. Run `npm run build` → triggers `prebuild` → decodes images again (safety)
3. Build your app with decoded images ✅

## 📋 How It Works

```
Vercel Build Process:
├── npm install
│   └── postinstall hook → decode-images ✅
├── npm run build
│   ├── prebuild hook → decode-images ✅
│   └── vite build (uses decoded images)
└── Deploy ✅
```

## 🔍 Verification

After deployment, check Vercel build logs. You should see:

```
> prebuild
> npm run decode-images
🔍 Scanning for base64-encoded PNG images...
✅ Decoded: image1.png (45.2 KB)
```

## 📝 Example `package.json`

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "prebuild": "npm run decode-images",
    "build": "vite build",
    "decode-images": "node figma-make-to-vercel/decode-base64-images.js",
    "postinstall": "npm run decode-images"
  },
  "dependencies": {
    "vite": "^6.3.5"
  }
}
```

## 🎯 When to Use This

- ✅ **Primary choice** for Vercel deployments
- ✅ When you want automatic decoding without extra commits
- ✅ When you want the most reliable solution
- ✅ For production deployments

## ⚙️ Customization

### Change Asset Directories

Edit `decode-base64-images.js` and modify the `ASSET_DIRS` array:

```javascript
const ASSET_DIRS = [
  'public/assets',
  'src/assets',
  'build/assets',
  'your/custom/path'  // Add your custom path
];
```

### Skip `postinstall` (Optional)

If you only want decoding during build (not after install), remove `postinstall`:

```json
{
  "scripts": {
    "prebuild": "npm run decode-images",
    "build": "vite build",
    "decode-images": "node figma-make-to-vercel/decode-base64-images.js"
  }
}
```

## 🐛 Troubleshooting

### Images still not loading?

1. Check Vercel build logs for decoding output
2. Verify `prebuild` script is in `package.json`
3. Check that script path is correct: `figma-make-to-vercel/decode-base64-images.js`

### Build fails?

1. Make sure Node.js is available (Vercel provides it automatically)
2. Check that `decode-base64-images.js` exists in the correct path
3. Verify file permissions (should be executable)

## 📚 Related Files

- `../decode-base64-images.js` - The decoding script
- `../README.md` - Main documentation
- `../DEPLOYMENT_STRATEGY.md` - Expert deployment strategy guide

