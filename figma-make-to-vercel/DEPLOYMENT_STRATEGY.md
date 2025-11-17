# Deployment Strategy: Figma Make → Vercel

## Expert Analysis: Best Practices for Production Deployment

As a deployment expert, here's the recommended **multi-layered approach** to ensure images are always decoded correctly, regardless of where the build happens.

## 🎯 Recommended Strategy: Defense in Depth

### Layer 1: Vercel Build Command (Primary - Most Important)
**Why:** Vercel runs `npm run build`, which automatically triggers `prebuild` hook that decodes images **before** the build starts.

**How it works:**
- `package.json` has `"prebuild": "npm run decode-images"`
- Vercel runs: `npm install` → `npm run build` → `prebuild` runs → images decoded → build starts
- ✅ **Always works** - no dependency on GitHub Actions
- ✅ **Happens at build time** - images are ready before Vite processes them
- ✅ **No extra commits** - clean git history

**Configuration:**
```json
{
  "scripts": {
    "prebuild": "npm run decode-images",
    "build": "vite build",
    "decode-images": "node figma-make-to-vercel/decode-base64-images.js"
  }
}
```

### Layer 2: Postinstall Hook (Secondary Safety Net)
**Why:** Ensures images are decoded even during local development and CI/CD pipelines.

**How it works:**
- Runs automatically after `npm install`
- ✅ Works in all environments (local, CI, Vercel)
- ✅ No manual intervention needed

**Configuration:**
```json
{
  "scripts": {
    "postinstall": "npm run decode-images"
  }
}
```

### Layer 3: GitHub Action (Optional - For Clean Git History)
**Why:** Commits decoded images back to repo, so they're already correct for future builds.

**Why it's optional:**
- ⚠️ Can cause infinite loops if not configured correctly
- ⚠️ Adds extra commits to git history
- ✅ Keeps repo clean (images always binary in git)
- ✅ Faster builds (no decoding needed if already done)

**Safeguards:**
- Excludes commits from GitHub Actions to prevent loops
- Only runs on Figma Make commits
- Uses proper git config to avoid triggering Figma Make

## 🔄 Build Flow Comparison

### Current Approach (GitHub Action Only)
```
Figma Make → Push to GitHub → GitHub Action → Decode → Commit → Vercel Build
```
**Problems:**
- ❌ If GitHub Action fails, Vercel build fails
- ❌ Extra commits in git history
- ❌ Risk of infinite loops

### Recommended Approach (Multi-Layer)
```
Figma Make → Push to GitHub → Vercel Build → prebuild hook → Decode → Build
                                                                    ↓
                                            (Optional) GitHub Action → Commit decoded images
```
**Benefits:**
- ✅ Vercel build always works (decodes during build)
- ✅ GitHub Action is optional (just for clean git history)
- ✅ No risk of build failures
- ✅ Works even if GitHub Action is disabled

## 📊 Decision Matrix

| Approach | Reliability | Git Clean | Build Speed | Complexity |
|----------|------------|-----------|-------------|------------|
| **Vercel Build Command** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| GitHub Action Only | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Multi-Layer (Recommended)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🚀 Production Recommendations

### For Production (Recommended)
1. ✅ **Use `prebuild` hook** - ensures images are decoded before every build
2. ✅ **Keep `postinstall` hook** - safety net for all environments
3. ✅ **GitHub Action optional** - only if you want clean git history

### For Development
- All hooks work automatically
- No manual steps needed
- Images decoded on `npm install` and `npm run build`

### For CI/CD
- Works in any CI environment (GitHub Actions, GitLab CI, Jenkins, etc.)
- No special configuration needed
- Just run `npm install` and `npm run build`

## ⚠️ Common Pitfalls to Avoid

1. **Infinite Loops**
   - ❌ Don't commit from GitHub Action without excluding your own commits
   - ✅ Use message filters: `!contains(github.event.head_commit.message, 'fix: decode base64 images')`

2. **Timing Issues**
   - ❌ Don't decode after build (images already processed)
   - ✅ Decode before build using `prebuild` hook

3. **Single Point of Failure**
   - ❌ Don't rely only on GitHub Actions
   - ✅ Use build-time hooks as primary solution

4. **Missing Images**
   - ❌ Don't forget to scan all asset directories
   - ✅ Include: `public/assets/`, `src/assets/`, `build/assets/`

## 🎓 Best Practices Summary

1. **Primary Solution:** Use `prebuild` hook - it's the most reliable
2. **Safety Net:** Keep `postinstall` hook for all environments
3. **Optional Enhancement:** GitHub Action for clean git history (with safeguards)
4. **Test Locally:** Always test with `npm run build` before deploying
5. **Monitor:** Check Vercel build logs to ensure decoding happens

## 📝 Implementation Checklist

- [x] Add `prebuild` script to `package.json`
- [x] Keep `postinstall` hook
- [x] Update `decode-images` to use new path
- [x] Configure GitHub Action with loop prevention
- [x] Test locally: `npm install` → `npm run build`
- [x] Verify Vercel build logs show decoding step
- [x] Document strategy for team

## 🔗 Related Files

- `package.json` - Scripts configuration
- `vercel.json` - Vercel build settings
- `.github/workflows/figma-deployment-fix.yml` - GitHub Action (optional)
- `figma-make-to-vercel/decode-base64-images.js` - Decoding script


