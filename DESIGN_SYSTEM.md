# Design System & Information Architecture: MayankRajJaiswal.com

> **Status:** This document describes the implemented system. Section 10
> (Contrast Rules) and Section 11 (Interactive Component Requirements) are
> enforced by the Playwright suite — read them before adding UI.

## 1. Information Architecture
The landing page is a continuous scroll experience, with separate routes for the blog.

1. **Global Navigation (Sticky Header):** Logo (Name), About, Experience, Projects, Research, Blog, Contact. Desktop nav plus an `inert`-gated mobile drawer.
2. **Hero Section:** High-impact introduction, value proposition, quick stats, primary CTA.
3. **About Me:** Professional summary, engineering philosophy, current focus.
4. **Professional Experience:** Interactive, vertical timeline of roles (Thales, Samsung).
5. **Featured Projects:** Grid of detailed case-study cards.
6. **Research & Publications:** Deep expertise areas and highlighted papers/books.
7. **Interactive Security Sandbox:** Client-side FIDO2/WebAuthn and OAuth 2.0 walkthroughs with an animated entity diagram and live terminal log.
8. **Speaking & Community:** Engagement highlights, mentorship impact.
9. **Certifications & Education:** Credentials establishing formal authority.
10. **Professional Timeline:** High-level career journey visualization.
11. **Recent Writing:** Latest posts surfaced from the blog content collection.
12. **Recommendations:** Attributed testimonials. Data-driven and *auto-hidden*
    while `src/data/testimonials.ts` is empty, so no placeholder block ever ships.
13. **Contact:** Professional closing and connection links.
14. **Global Footer:** Copyright, social links, quick navigation.

Beyond the single-page scroll there are real routes: `/blog`, `/blog/[slug]`,
`/404`, and `/rss.xml`.

## 2. Wireframe & Layout Hierarchy
- **Container:** Max-width of `7xl` (`1280px`) to maintain readability on ultra-wide screens.
- **Section Padding:** `py-24` on desktop, `py-16` on mobile to create breathing room and elegance.
- **Grid System:** 12-column grid for complex layouts (e.g., About section text vs. image), standard CSS Grid for cards.

## 3. Component Hierarchy
- `Header` (Sticky, frosted glass effect)
  - `NavLinks`
  - `ThemeToggle`
- `SectionWrapper` (Standardized padding, optional background contrast)
  - `SectionHeader` (Title, Subtitle)
  - `ContentBlock`
- `Card` (Base styling for all cards: subtle border, hover lift)
  - `ExperienceCard`
  - `ProjectCard`
  - `PublicationCard`
  - `CertificationCard`
- `Badge` (Small tags for technologies: AWS, Kubernetes, etc.)
- `Button` (Primary: solid, Secondary: outlined/ghost)
- `Footer`

## 4. Typography System
- **Primary (Headings, UI & Body):** `Geist` (clean, modern, engineering-focused).
- **Monospace (Code & Tech tags):** `JetBrains Mono`.

**Self-hosted variable fonts.** `@font-face` declarations live in
`src/styles/global.css`, files in `public/fonts/`. One variable file per family
covers the entire 100-900 weight axis, latin subset, ~69KB for both — so
`font-medium` through `font-extrabold` all resolve from a single request with no
third-party origin and no render-blocking CDN call.

Fallbacks are the system UI stack (`system-ui`, `-apple-system`, `Segoe UI`, …),
not `Inter` — naming a font that may not be installed locally gains nothing.
`font-display: swap` means a slow font never blocks first paint.

To change families, update `@font-face` in `global.css`, `fontFamily` in
`tailwind.config.mjs`, and the preload in `Layout.astro` together.
- **Scale:**
  - H1: `text-5xl md:text-7xl font-bold tracking-tight`
  - H2: `text-3xl md:text-4xl font-semibold`
  - H3: `text-2xl font-medium`
  - Body (Base): `text-base md:text-lg text-slate-600 dark:text-slate-300`
  - Small/Meta: `text-sm text-slate-500`

## 5. Color System (Tailwind)
Designed to feel like Apple/Vercel: high contrast, minimal, calm.

**Dark Mode (Default & Preferred):**
- Background: `bg-slate-950` (Almost black, `#020617`)
- Surface (Cards): `bg-slate-900` (`#0f172a`) with subtle border `border-slate-800`
- Primary Text: `text-slate-50`
- Secondary Text: `text-slate-400`
- Accent: `text-blue-500` / `bg-blue-600` (e.g., primary buttons)

**Light Mode:**
- Background: `bg-slate-50` (`#f8fafc`)
- Surface (Cards): `bg-white` with subtle border `border-slate-200`
- Primary Text: `text-slate-900`
- Secondary Text: `text-slate-600`
- Accent: `text-blue-600` / `bg-blue-600`

## 6. Spacing System
- Relies heavily on Tailwind's default scale.
- Extensive use of whitespace to communicate "premium/enterprise" feel.
- `gap-8` or `gap-12` between grid items.
- `mb-6` between paragraphs in the About section.

## 7. Animation System
- **Philosophy:** Purposeful, not decorative. No particle effects or typing animations.
- **Scroll Reveal:** Sections fade in and slide up slightly (`opacity-0 translate-y-4` to `opacity-100 translate-y-0`) using vanilla JS `IntersectionObserver`.
- **Hover States:** Cards lift slightly (`hover:-translate-y-1`) with a soft shadow increase (`hover:shadow-lg`). Buttons have a quick background transition (`transition-colors duration-200`).
- **Motion One:** Kept on standby, but preference is native CSS transitions for performance.

## 8. Responsive Behavior
- **Mobile First:** Content stacks vertically by default.
- **Tablet (`md`):** Grids transition to 2 columns. Font sizes scale up.
- **Desktop (`lg/xl`):** Complex layouts emerge (e.g., Timeline switches from left-aligned to center-aligned alternating). Max container widths prevent horizontal stretching.

## 9. Accessibility Considerations
- **Color Contrast:** Checked against WCAG 2.2 AA. Dark mode surfaces maintain high contrast with text.
- **Focus Rings:** All interactive elements will have `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`.
- **Reduced Motion:** CSS will include `@media (prefers-reduced-motion) { * { transition: none !important; animation: none !important; } }`.
- **Semantics:** Screen reader friendly text for icon-only buttons (e.g., `<span class="sr-only">Toggle dark mode</span>`).

## 10. Contrast Rules (enforced by tests)

The palette in §5 is safe for body copy, but small bold text is where WCAG 2.2 AA
was actually being failed. Follow these rules; `tests/seo-accessibility.spec.ts`
enforces them on every run.

**Minimum secondary-text pairings**

| Surface | Use | Do NOT use |
| --- | --- | --- |
| Light (`slate-50` / `white`) | `text-slate-600` | `text-slate-400`, `text-slate-500` |
| Dark (`slate-950` / `slate-900`) | `dark:text-slate-400` or lighter | `dark:text-slate-500`, `dark:text-slate-600` |
| Always-dark panels (e.g. the console) | `text-slate-400` | `text-slate-500` |

Rationale, from measured failures: `slate-400` on `slate-50` is **2.45:1**, and
`slate-500` on `white` is **2.56:1** — both far below the 4.5:1 requirement. Small
bold uppercase labels are the most common offender because low weight and small
size make them look subtler than they measure.

**Two rules that are easy to get wrong**

1. **Always pair a light-mode colour with a `dark:` variant.** A bare
   `text-slate-600` is correct in light mode and unreadable in dark. The one
   exception is an element on a surface that is dark in *both* themes.
2. **Toggling colours from JavaScript must toggle both classes.**
   `classList.add('text-slate-600')` alone silently breaks dark mode, because a
   variant like `dark:text-slate-400` cannot be applied by adding a single class.
   Add and remove them together:
   ```js
   el.classList.add('text-slate-600', 'dark:text-slate-400');
   el.classList.remove('text-slate-600', 'dark:text-slate-400');
   ```
   Tailwind only emits a class it has seen in scanned source, so any class added at
   runtime must also appear literally somewhere in the markup.

**Valid shades only.** `tailwind.config.mjs` defines `slate` 50–950. Anything else
(`slate-750`, `blue-350`) compiles to nothing and fails silently — no error, no
style. Two such typos existed in this codebase and were fixed.

**Enforced automatically.** `tests/accessibility.spec.ts` runs axe against every
route in both themes *and* greps the built markup for the banned pairings above,
so a regression fails CI instead of reaching production. The pairing
`text-slate-400 dark:text-slate-500` was live on six elements across the blog
pages and header before this guard existed.

## 11. Interactive Component Requirements

- **Off-screen panels must be `inert` while hidden.** Hiding a panel with
  `translate-x-full` alone leaves its controls in the tab order, so a keyboard user
  tabs into an invisible menu (WCAG 2.4.3 / 2.4.7). The mobile drawer sets `inert`
  and `aria-hidden` when closed and removes both when opened.
- **Return focus on close.** Restore focus to the element that opened the panel,
  and do it *before* setting `inert` — WebKit clears focus the instant `inert`
  lands, discarding any later `.focus()` call.
- **Touch targets:** 24×24px minimum (WCAG 2.5.8). Inline text links in a block of
  text are exempt; standalone buttons and icon controls are not.

---
**Status:** Implemented and in production. Reflects the live site as of the current
commit; see the README's *Known Gaps* section for outstanding items.
