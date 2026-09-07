# Project Handover & Maintenance Guide: MayankRajJaiswal.com

Welcome to the definitive digital headquarters of **Mayank Raj Jaiswal**, Enterprise Security Architect. This document serves as a high-signal handover guide for local maintenance, future content updates, and deployment checks.

## 1. Project Directory Map

```text
/
├── .github/workflows/   # Automated deployment to GitHub Pages (GitHub Actions)
├── public/              # Static assets, copied verbatim into dist/
│   ├── .well-known/
│   │   └── security.txt # RFC 9116 vulnerability disclosure policy
│   ├── fonts/           # Self-hosted variable fonts (Geist, JetBrains Mono)
│   ├── images/          # Portrait + generated AVIF/WebP/JPEG at 1x and 2x
│   ├── resume/          # resume.pdf goes here; only the .sig is present today
│   ├── CNAME            # Custom domain for GitHub Pages (mayankrajjaiswal.com)
│   ├── _headers         # Netlify/Cloudflare header config — INERT on GitHub Pages
│   ├── llms.txt         # Guidance for LLM crawlers
│   ├── icon-192.png     # PWA icons (raster; Android needs these, not SVG)
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   ├── apple-touch-icon.png
│   ├── manifest.json    # PWA manifest
│   ├── mayank_pgp.asc   # PGP public key for encrypted disclosure
│   ├── robots.txt       # Crawler policies (incl. AI/GEO bot allowances)
│   └── sw.js            # Service worker — network-first, see README
├── src/
│   ├── content/         # Blogging Hub database
│   │   ├── blog/        # Drop `.mdx` or `.md` posts here to publish instantly
│   │   └── config.ts    # Schema definition for post validation
│   ├── data/            # Strongly-typed site data (separates UI from content)
│   │   ├── certifications.ts
│   │   ├── testimonials.ts  # Seeded EMPTY; section auto-hides until filled
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   ├── research.ts
│   │   ├── speaking.ts
│   │   └── timeline.ts
│   ├── components/
│   │   ├── layout/      # Header (nav, theme toggle, mobile drawer), Footer
│   │   └── sections/    # Hero, About, Experience, Projects, Research, Speaking,
│   │                    # Certifications, Timeline, SecuritySimulator,
│   │                    # RecentWriting, Testimonials, Contact
│   ├── layouts/         # Layout.astro (head, CSP meta, theme script, JSON-LD)
│   │                    # BlogPostLayout.astro (article shell + breadcrumbs)
│   ├── pages/           # index, 404, blog/index, blog/[slug], rss.xml.ts
│   └── styles/          # global.css
├── tests/               # 60 specs / 234 assertions, 3 browser engines
│   ├── helpers.ts                  # goto(), applyTheme(), ALL_PAGES, THEMES
│   ├── accessibility.spec.ts       # WCAG 2.2 AA, every route x both themes
│   ├── seo-schema.spec.ts          # Meta, JSON-LD, ORCID checksum, RSS, links
│   ├── security.spec.ts            # CSP, security.txt, form hardening
│   ├── performance-assets.spec.ts  # Fonts, images, CLS/FCP, no 3rd parties
│   ├── pwa-touch-targets.spec.ts   # Manifest, icons, 24px targets, overflow
│   ├── content.spec.ts             # Placeholders, post depth, testimonials
│   └── mobile-drawer-a11y.spec.ts  # Drawer inert state + keyboard focus return
├── astro.config.mjs     # Site URL, sitemap (404 excluded), MDX, Tailwind
├── playwright.config.ts # 3 browser projects; builds + previews before testing
├── vercel.json          # Vercel header config — INERT on GitHub Pages
└── tailwind.config.mjs  # Theme system (manual 'class' dark mode, slate 50–950)
```

> **Note on `_headers` and `vercel.json`:** both are retained for a possible host
> migration but have **no effect** on GitHub Pages, which cannot send custom
> response headers. The live policy is the `<meta http-equiv>` CSP in
> `Layout.astro`. See the README's deployment section for the full matrix.

---

## 2. Core Operational Instructions

### **How to Add a Blog Post**
Astro’s Content Collections will automatically validate your posts against a strict TypeScript schema. To publish an article:
1. Create a new file in `src/content/blog/` (e.g., `securing-jwt-signatures.mdx`).
2. Include the metadata block at the very top:
   ```markdown
   ---
   title: "Your Article Title"
   description: "A short, engaging description for SEO card summaries."
   pubDate: "YYYY-MM-DD"
   updatedDate: "YYYY-MM-DD"   # optional; omit unless revising a published post
   tags: ["Security", "Architecture"]
   ---
   ```
   `title`, `description`, and `pubDate` are required; `updatedDate` is optional and
   `tags` defaults to `[]`. The schema lives in `src/content/config.ts` — a build
   fails loudly on a malformed block rather than publishing a broken page.
3. Write your content in standard Markdown below the metadata. 
4. Commit and push. Your article is compiled, mapped to the `/blog/` list, generated inside `rss.xml`, and registered in `sitemap.xml` automatically!

### **How to Update Your Experience or Projects**
All main landing page content is separated into `src/data/` for easier modification:
- Update **Companies, Roles, and Achievements** in `src/data/experience.ts`.
- Update **Featured Projects and Startups** in `src/data/projects.ts`.
- Update **Certifications and Academic Milestones** in `src/data/certifications.ts`.
- Update **Speaking Engagements and Seminars** in `src/data/speaking.ts`.
- Update **Research areas and publications** in `src/data/research.ts`.
- Update **Career journey milestones** in `src/data/timeline.ts`.

Editing these files is the intended way to change site copy — the section
components read from them, so no component markup needs touching.

### **How to add a testimonial**
1. Open `src/data/testimonials.ts`.
2. Append an entry with the quote **verbatim** — do not paraphrase:
   ```ts
   {
     id: 'jane-doe',
     quote: 'Exactly what they wrote, unedited.',
     author: 'Jane Doe',
     role: 'Engineering Manager',
     company: 'Thales Group',
     sourceUrl: 'https://linkedin.com/in/...',   // optional but recommended
   }
   ```
3. The Recommendations section appears automatically once the array is non-empty
   (it stays hidden while empty, so a half-built section never ships).

`sourceUrl` renders a "Verify on LinkedIn" link. On a site about trust, a
verifiable recommendation is worth considerably more than an anonymous one.

### **Adding or replacing the portrait**
The hero image is served as pre-cropped AVIF/WebP/JPEG at 1x and 2x, not used
raw. After replacing `public/images/mayank-portrait.jpg`, regenerate everything:

```bash
node scripts/generate-images.mjs
```

That rebuilds the six portrait derivatives and the four PWA icons. The crop uses
`position: 'north'` so the head stays in frame when a landscape source is cut to
the 4:5 display box — **look at the output before committing.** If you change the
rendered size, update the `width`/`height` attributes in `Hero.astro` and the
`imagesrcset` preloads in `Layout.astro` to match.

### **Editing colours safely**
`tailwind.config.mjs` pins the `slate` palette to shades 50–950. A class naming a
shade outside that set (`slate-750`, `blue-350`) compiles to **nothing** and fails
silently — no build error, just a style that never applies. Two such typos were
found and fixed; if a colour appears not to take effect, check the shade exists.

---

## 3. Deployment & Live URL Checks

The site is served by **GitHub Pages**, with DNS managed at **GoDaddy**.

1. **Domain Setup:** Point the domain's A records at GitHub Pages:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. **Subdomain Setup:** Configure a CNAME for `www` pointing to `mayankrajjaiswal.github.io`.
3. **Verify Security (HTTPS):** In GitHub Repository Settings > **Pages**, confirm the custom domain is `mayankrajjaiswal.com` and **Enforce HTTPS** is checked. This is the only available substitute for an HSTS header on this host.

To confirm what the live site actually sends:
```bash
curl -sSI https://mayankrajjaiswal.com/ | grep -i -E 'server|content-security|strict-transport'
```
Expect `Server: GitHub.com` and **no** `Strict-Transport-Security` header — the CSP
is delivered in the document via `<meta http-equiv>`, not as a response header.

---

## 4. Run Automated Local Audits

To audit your website's markup, routing, SEO, and accessibility standards prior to launching:
```bash
# Install testing dependencies
npx playwright install

# Run the test pipeline
npm run test
```
The suite builds the site, serves it locally, and runs **60 specs / 234
assertions** across Chromium, Firefox, and WebKit — accessibility on every route
in both themes, SEO and structured data, CSP, fonts and images, PWA, touch
targets, responsive overflow, and content integrity. See the README for the
per-file breakdown.

**CI runs this as a gate.** A failing check blocks the deploy.

Useful variants:
```bash
npm run test -- --project=chromium        # single engine, much faster
npm run test -- --reporter=list           # readable per-test output
npx playwright show-report                # open the HTML report after a run
```

**Two gotchas worth knowing before you write new tests:**
- Never wait on `networkidle`. The service worker keeps a connection open, so the
  page never reaches an idle state and the test times out. Use
  `{ waitUntil: 'commit' }` plus an explicit `waitForSelector`.
- When toggling the `dark` class mid-test, disable CSS transitions first, or axe
  samples half-blended colours and reports contrast failures that do not exist.
