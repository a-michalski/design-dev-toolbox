# Figma Make to Vercel - Project Structure

## 📁 Folder Structure

```
figma-make-to-vercel/
├── decode-base64-images.js    # Core decoding script (used by both solutions)
├── README.md                   # Main documentation
├── DEPLOYMENT_STRATEGY.md      # Expert deployment analysis
├── INDEX.md                    # This file
│
├── vercel/                     # Vercel Solution
│   ├── README.md               # Vercel setup guide
│   └── package.json.example    # Example package.json configuration
│
└── github-actions/             # GitHub Actions Solution
    ├── README.md               # GitHub Actions setup guide
    └── workflow.yml            # Complete workflow example
```

## 🎯 Quick Start

1. **Read the main [README.md](./README.md)** to understand the problem
2. **Choose your solution:**
   - For Vercel → See [`vercel/README.md`](./vercel/README.md)
   - For GitHub Actions → See [`github-actions/README.md`](./github-actions/README.md)
3. **Follow the setup guide** in your chosen solution folder

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation - problem, solution overview, links to specific solutions |
| `DEPLOYMENT_STRATEGY.md` | Expert analysis comparing approaches, best practices, production recommendations |
| `vercel/README.md` | Complete guide for Vercel solution setup |
| `github-actions/README.md` | Complete guide for GitHub Actions solution setup |
| `decode-base64-images.js` | The core script that decodes base64 images (used by both solutions) |

## 🔧 Core Script

The `decode-base64-images.js` script is shared by both solutions. It:
- Scans asset directories for base64-encoded PNG files
- Decodes them to binary PNG format
- Validates the decoded images
- Works standalone or as part of build processes

## 🚀 Solutions Comparison

| Feature | Vercel Solution | GitHub Actions Solution |
|---------|----------------|------------------------|
| **Setup Complexity** | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐ Moderate |
| **Reliability** | ⭐⭐⭐⭐⭐ Highest | ⭐⭐⭐⭐ High |
| **Git History** | ⭐⭐⭐⭐ Clean (no extra commits) | ⭐⭐⭐⭐⭐ Cleanest (images already decoded) |
| **Build Speed** | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐⭐ Fastest (no decoding during build) |
| **Works on Free Plan** | ✅ Yes | ✅ Yes |
| **Requires GitHub Actions** | ❌ No | ✅ Yes |

## 💡 Recommendation

- **For most users:** Use the **Vercel Solution** - it's simpler and more reliable
- **For advanced users:** Combine both solutions for maximum reliability
- **For clean git history:** Use GitHub Actions Solution

See [`DEPLOYMENT_STRATEGY.md`](./DEPLOYMENT_STRATEGY.md) for detailed expert recommendations.

