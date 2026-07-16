# MayankRajJaiswal.com

The personal digital identity of **Mayank Raj Jaiswal**, Enterprise Security Architect.

## Architecture

This project is built as an extremely fast, static single-page application using:
- **Astro** for server-side generation (SSG) with zero-JS output by default.
- **Tailwind CSS** for a strict, maintainable design system.
- **TypeScript** for strict data modeling of experience, projects, and research.
- **Lucide** (SVG) for lightweight iconography.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment (GitHub Pages)

This repository is configured to automatically deploy to GitHub Pages upon pushing to the `main` branch via GitHub Actions.

To enable deployment:
1. Go to repository **Settings** > **Pages**.
2. Set the **Source** to **GitHub Actions**.
3. Push to `main`. The `.github/workflows/deploy.yml` will handle the rest.

## Design Philosophy
The UI relies heavily on typography (`Geist` and `Inter`), ample whitespace, and minimal interactivity to establish absolute trust and authority. Visual effects are strictly limited to necessary micro-interactions (e.g., button hovers, card lifts).
