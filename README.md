# Design Dev Toolbox

A collection of developer tools for working with projects created using **Figma Make** - the automated Figma to code workflow.

## Overview

This repository contains utilities and scripts to enhance the development workflow when using Figma Make to generate React applications from Figma designs. Each tool solves specific challenges that arise when working with Figma Make projects.

## Tools

### 📄 [Figma Make to PDF](./figma-make-to-pdf/)

Export your Figma Make presentations (React + Vite) to high-quality PDF files. Automatically detects slide structure, handles animations, and generates full-page screenshots.

**Features:**
- Automatic slide detection
- Animation handling
- High-quality PDF generation
- Cross-platform support

[📖 Read more →](./figma-make-to-pdf/README.md)

### 🚀 [Figma Make to Vercel](./figma-make-to-vercel/)

Fix base64-encoded PNG images that Figma Make generates, making them compatible with Vercel deployments and standard web browsers.

**Features:**
- Automatic base64 to PNG conversion
- Vercel build-time integration
- GitHub Actions workflow
- Multiple deployment strategies

[📖 Read more →](./figma-make-to-vercel/README.md)

## Why These Tools?

When using **Figma Make** to automatically sync Figma designs to code, you may encounter:

- **Image encoding issues**: PNG images saved as base64 strings instead of binary files
- **Export limitations**: Need to convert interactive presentations to PDF format
- **Deployment challenges**: Images not loading correctly on Vercel or other platforms

This toolbox provides solutions for these common scenarios.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 Adam Michalski

## Contributing

Contributions are welcome! Each tool is self-contained with its own documentation. Please refer to the individual tool's README for contribution guidelines.

