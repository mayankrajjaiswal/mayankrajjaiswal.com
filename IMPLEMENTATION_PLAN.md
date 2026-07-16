# Implementation Plan: MayankRajJaiswal.com

## 1. Architecture
The website will be built as a highly optimized static single-page application (SPA architecture but fully server-rendered as static HTML). 
- **Framework:** Astro (SSG mode) to achieve zero JavaScript by default (Component Islands used only when interactivity is strictly required).
- **Styling:** Tailwind CSS for a utility-first, maintainable design system.
- **Content:** Data models driven by TypeScript, keeping content cleanly separated from UI components.
- **Interactivity:** Minimal vanilla JavaScript or lightweight Motion One for elegant scroll animations, ensuring the primary experience remains fast and functional even without JS.

## 2. Folder Structure
```text
/
├── .github/
│   └── workflows/         # Deployment pipelines (GitHub Pages)
├── public/                # Static assets (images, icons, resume, robots.txt)
│   ├── images/            # Professional portraits, project screenshots, logos
│   ├── resume/            # Downloadable resume PDF
│   └── fonts/             # Local font files (Geist, Inter, JetBrains Mono)
├── src/
│   ├── components/        # Reusable Astro and UI components
│   │   ├── core/          # Buttons, Typography, Containers, Badges
│   │   ├── layout/        # Header, Footer, Section wrappers
│   │   └── sections/      # Hero, About, Experience, Projects, Contact, etc.
│   ├── data/              # TypeScript data files for content (separation of concerns)
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   ├── research.ts
│   │   ├── speaking.ts
│   │   └── timeline.ts
│   ├── layouts/           # Page layouts (Base layout with Meta tags)
│   ├── pages/             # Route definitions (index.astro, 404.astro)
│   ├── styles/            # Global Tailwind CSS and custom utilities
│   ├── types/             # TypeScript interfaces for data models
│   └── utils/             # Helper functions (date formatting, class merging)
├── package.json
├── tsconfig.json
├── tailwind.config.cjs
└── astro.config.mjs
```

## 3. Technology Decisions
- **Astro:** Best-in-class for static content sites. Eliminates unnecessary client-side React/Vue overhead.
- **TypeScript:** Enforces strict typing for data models (Experience, Projects), preventing runtime errors.
- **Tailwind CSS:** Enables rapid, consistent styling without managing separate CSS files.
- **Lucide Icons:** Clean, consistent, and lightweight SVG icons.
- **Motion One / CSS Animations:** We will challenge the need for heavy JS animation libraries. CSS transitions and `IntersectionObserver` with vanilla JS are often sufficient for "elegant" reveal animations. We will only load Motion One if complex sequenced animations are truly needed.

## 4. Component Hierarchy
- `Layout (Base)`
  - `Header (Navigation)`
  - `Main`
    - `HeroSection`
    - `AboutSection`
    - `ExperienceSection`
      - `ExperienceCard`
    - `ProjectsSection`
      - `ProjectCard`
    - `ResearchSection`
    - `SpeakingSection`
    - `CertificationsSection`
    - `TimelineSection`
    - `ContactSection`
  - `Footer`

## 5. Data Model
Content will be structured in strongly typed data files (e.g., `src/data/experience.ts`).
```typescript
interface Experience {
  company: string;
  role: string;
  duration: string;
  overview: string;
  contributions: string[];
  impact: string[];
  products: string[];
}
```
This ensures content can be updated independently of UI components.

## 6. Responsive Strategy
- **Mobile-First:** Base classes target mobile devices.
- **Breakpoints:** `sm`, `md`, `lg`, `xl` will be utilized to adapt grids (e.g., stacking cards on mobile, side-by-side on desktop).
- **Typography:** Fluid typography using clamped values or responsive classes to ensure readability across all devices.

## 7. Accessibility Strategy
- **Semantic HTML:** Strict adherence to `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`.
- **Keyboard Navigation:** Ensured visible focus states (`focus-visible:ring`) for all interactive elements.
- **Aria Labels:** Used where visual context is insufficient (e.g., icon-only buttons).
- **Reduced Motion:** `prefers-reduced-motion` media queries will disable animations for sensitive users.
- **Contrast:** Strict WCAG 2.2 AA compliance for text over backgrounds.

## 8. Performance Strategy
- **Zero-JS Default:** Astro will output pure HTML/CSS.
- **Image Optimization:** Astro's built-in `<Image />` component for automatic WebP conversion and responsive sizing.
- **Font Optimization:** Self-host fonts (Geist, Inter) and preload critical formats.
- **Lazy Loading:** `loading="lazy"` for images below the fold.

## 9. SEO Strategy
- **Meta Tags:** Comprehensive OpenGraph and Twitter cards in the base layout.
- **JSON-LD Schema:** Structured data representing a "Person" to establish authority.
- **Sitemap & Robots.txt:** Auto-generated via Astro integrations.
- **Semantic Structure:** One H1, proper H2/H3 nesting for content hierarchy.

## 10. Deployment Strategy
- **Platform:** GitHub Pages via GitHub Actions.
- **Workflow:** Action triggers on push to `main`, runs `astro build`, and deploys the `dist` folder.
- **Custom Domain:** `CNAME` file generation included in the build pipeline.

## 11. Milestones
1. **Foundation:** Project setup, configuration, layout shell, global styles, typography, and data models.
2. **Hero:** High-impact initial view with typography and portrait.
3. **About:** Content-focused section communicating philosophy.
4. **Experience:** Interactive timeline and elegant cards for Thales and Samsung.
5. **Projects:** Case study cards emphasizing architecture and impact.
6. **Research & Speaking:** Authority-building content sections.
7. **Education & Certifications:** Trust-building credential sections.
8. **Timeline & Contact:** Journey overview and conversion (CTA) area.
9. **SEO & Polish:** JSON-LD, Meta tags, accessibility audit, performance tuning.
10. **Deployment:** GitHub Actions workflow and final launch.

## 12. Risk Analysis
- **Content Overload:** The volume of achievements might clutter the UI. *Mitigation: Use expandable cards, progressive disclosure, and extensive whitespace.*
- **Performance Drag:** Too many high-res images or heavy fonts. *Mitigation: Strict image optimization and subsetting fonts.*
- **Over-Animation:** Risk of feeling like a "template". *Mitigation: Strictly limit animations to subtle opacity/transform reveals on scroll.*

## 13. Potential Improvements & Challenges to Original Specs
- **Animation Library:** While Motion One is suggested, native CSS `@keyframes` combined with vanilla JS `IntersectionObserver` is significantly lighter and often feels more native. I propose relying on CSS/Vanilla JS first, adding Motion One only if we encounter complex orchestration needs.
- **Single Page vs. Multi Page:** A heavy single page can impact load times if not careful. By statically rendering and lazy-loading images, we mitigate this, but we should ensure section IDs are clean for anchor routing (e.g., `/#experience`).

---
**Status:** Awaiting Approval to proceed with Milestone 1 (Foundation).
