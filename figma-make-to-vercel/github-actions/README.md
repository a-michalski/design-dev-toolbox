# GitHub Actions Solution - Automatic Image Fixing

## Overview

This solution uses **GitHub Actions** to automatically decode base64 images after Figma Make deployments and commit them back to the repository. This keeps your git history clean with binary images.

## ✅ Advantages

- ✅ **Clean git history** - images are already decoded in the repo
- ✅ **Faster builds** - no decoding needed during build
- ✅ **Automatic** - runs after every Figma Make deployment
- ✅ **Works with any hosting** - not just Vercel

## ⚠️ Considerations

- ⚠️ Adds extra commits to git history
- ⚠️ Requires GitHub Actions to be enabled
- ⚠️ Needs proper configuration to avoid infinite loops

## 🚀 Quick Setup

### Step 1: Create GitHub Workflow

Create `.github/workflows/figma-deployment-fix.yml`:

```yaml
name: Fix Figma Make Images for Vercel

on:
  push:
    branches:
      - main
      - 'feature/**'
    paths:
      - 'public/assets/**/*.png'
      - 'src/assets/**/*.png'
      - 'build/assets/**/*.png'

jobs:
  decode-images:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    # Only run if commit is from Figma Make
    # IMPORTANT: Exclude commits from GitHub Actions to prevent infinite loops
    if: |
      (github.actor == 'figma[bot]' || 
       contains(github.event.head_commit.message, 'Update files from Figma Make') ||
       contains(github.event.head_commit.message, 'Figma Make')) &&
      !contains(github.event.head_commit.message, 'fix: decode base64 images')

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Decode base64 images
        run: |
          node figma-make-to-vercel/decode-base64-images.js
        continue-on-error: true

      - name: Check for changes
        id: check-changes
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            echo "has_changes=true" >> $GITHUB_OUTPUT
          else
            echo "has_changes=false" >> $GITHUB_OUTPUT
          fi

      - name: Commit decoded images
        if: steps.check-changes.outputs.has_changes == 'true'
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add public/assets/ src/assets/ build/assets/
          git commit -m "fix: decode base64 images from Figma Make for Vercel compatibility

          - Automatically decoded base64-encoded PNG files to binary format
          - Images are now compatible with Vercel deployments
          - Triggered by: ${{ github.event.head_commit.message }}" || exit 0
          git push

      - name: Summary - Changes detected
        if: steps.check-changes.outputs.has_changes == 'true'
        run: |
          echo "✅ Successfully decoded base64 images and committed changes"

      - name: Summary - No changes
        if: steps.check-changes.outputs.has_changes == 'false'
        run: |
          echo "ℹ️  No base64-encoded images found. All images are already binary."
```

### Step 2: Ensure Permissions

Make sure your repository allows GitHub Actions to write:
- Go to Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"
- Save changes

## 📋 How It Works

```
Figma Make → Push to GitHub → GitHub Action Triggered
                                    ↓
                          Decode base64 images
                                    ↓
                          Commit decoded images
                                    ↓
                          Push back to repository
                                    ↓
                          Next build uses decoded images ✅
```

## 🔍 Verification

After Figma Make deployment:

1. Go to **Actions** tab in GitHub
2. Find the workflow run "Fix Figma Make Images for Vercel"
3. Check the logs - you should see:
   ```
   ✅ Decoded: image1.png (45.2 KB)
   ✅ Successfully decoded base64 images and committed changes
   ```
4. Check the latest commit - should see a commit from `github-actions[bot]`

## 🎯 When to Use This

- ✅ When you want clean git history (images already decoded)
- ✅ When you want faster builds (no decoding during build)
- ✅ When using GitHub Actions anyway
- ✅ When you want to combine with Vercel solution (optional)

## ⚙️ Customization

### Change Trigger Conditions

Modify the `if` condition to match your needs:

```yaml
if: |
  github.actor == 'figma[bot]' ||
  contains(github.event.head_commit.message, 'Your Custom Message')
```

### Change Commit Message

Modify the commit message in the workflow:

```yaml
git commit -m "Your custom commit message" || exit 0
```

### Add More Asset Directories

If you have custom asset directories, add them to the workflow:

```yaml
git add public/assets/ src/assets/ build/assets/ custom/assets/
```

## 🐛 Troubleshooting

### Infinite Loop (Action triggers itself)

**Solution:** Make sure the `if` condition excludes your commit messages:

```yaml
!contains(github.event.head_commit.message, 'fix: decode base64 images')
```

### Permission Denied

**Solution:** 
1. Go to Settings → Actions → General
2. Enable "Read and write permissions"
3. Re-run the workflow

### Action Not Triggering

**Check:**
1. Is the workflow file in `.github/workflows/`?
2. Does the commit match the `if` condition?
3. Are PNG files in the specified paths?

## 🔄 Combining with Vercel Solution

You can use both solutions together:
- **GitHub Action** - keeps repo clean
- **Vercel prebuild hook** - safety net if GitHub Action fails

This provides maximum reliability (see `../DEPLOYMENT_STRATEGY.md`).

## 📚 Related Files

- `../decode-base64-images.js` - The decoding script
- `../README.md` - Main documentation
- `../DEPLOYMENT_STRATEGY.md` - Expert deployment strategy guide
- `workflow.yml` - Complete workflow example

