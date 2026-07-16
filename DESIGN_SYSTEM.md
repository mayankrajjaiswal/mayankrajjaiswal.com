# Design System & Information Architecture: MayankRajJaiswal.com

## 1. Information Architecture
The site is a continuous scroll, single-page experience.

1. **Global Navigation (Sticky Header):** Logo (Name), About, Experience, Projects, Research, Contact.
2. **Hero Section:** High-impact introduction, value proposition, quick stats, primary CTA.
3. **About Me:** Professional summary, engineering philosophy, current focus.
4. **Professional Experience:** Interactive, vertical timeline of roles (Thales, Samsung).
5. **Featured Projects:** Grid of detailed case-study cards.
6. **Research & Publications:** Deep expertise areas and highlighted papers/books.
7. **Speaking & Community:** Engagement highlights, mentorship impact.
8. **Certifications & Education:** Credentials establishing formal authority.
9. **Professional Timeline:** High-level career journey visualization.
10. **Contact:** Professional closing and connection links.
11. **Global Footer:** Copyright, social links, quick navigation.

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
- **Primary (Headings & UI):** `Geist` (clean, modern, engineering-focused).
- **Secondary (Body):** `Inter` (highly readable for long-form text).
- **Monospace (Code & Tech tags):** `JetBrains Mono`.
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

---
**Status:** Awaiting Approval to proceed with Implementation: Milestone 1 (Foundation).
