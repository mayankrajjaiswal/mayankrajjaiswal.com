# MayankRajJaiswal.com — Digital Identity HQ

The official personal digital identity of **Mayank Raj Jaiswal**, Enterprise Security Architect, AI Researcher, Speaker, and Author. Built to deliver an extremely fast, secure, accessible (WCAG 2.2 AA), and visually premium experience modeled after leading tech platforms like Stripe, Vercel, and Linear.

> **© Mayank Raj Jaiswal. All rights reserved.** This repository is public for
> transparency and review, but it is not open-source: no license is granted to
> reuse the code, written content, portrait, or branding. The source was
> previously described as "open-source" without a LICENSE file, which was
> inaccurate — absent an explicit license, default copyright applies.

---

## 🚀 Key Architectural Pillars

- **Zero JavaScript Default (Astro 5):** Leverages server-side static rendering (SSG) for instantaneous first-contentful paint.
- **Sleek Utility Styling (Tailwind CSS):** Implements a bespoke design system with glowing ambient background meshes, interactive cards, and precise, scannable layouts.
- **Strict Content Schema (TypeScript):** Fully separates copy and layout by managing all experience timelines, technical certifications, speaking records, and projects in typed structure files under `src/data/`.
- **Fully Self-Hosted, Zero Third-Party Requests:** Geist and JetBrains Mono are self-hosted variable fonts (one file per family covers the whole weight axis, latin subset, ~69KB total). Nothing is fetched from a CDN at runtime, which removes a render-blocking third-party request, eliminates a privacy leak, and lets the CSP drop every external origin.
- **Resilient, Modern Portrait Delivery:** Served via `<picture>` as AVIF → WebP → JPEG at 1x/2x, pre-cropped to the rendered 4:5 box (the 3:2 source was downloading pixels the browser then cropped away). **10.4KB AVIF vs 38.9KB originally — a 73% reduction.** Explicit `width`/`height` reserve layout space, and an SVG avatar layer behind the image is revealed by an `onerror` handler so a broken image never leaves an empty anchor.
- **Robust Accessibility (WCAG 2.2 AA):** Keyboard navigation, visible focus indicators, screen-reader aria hooks, an `inert`-gated mobile drawer with focus return, and automated Axe-core testing across three browser engines.

---

## 🛠️ Advanced Polish Features

### **1. Dynamic Blogging Hub (MDX)**
We have incorporated a modular writing interface under `src/content/blog/` backed by Astro Content Collections. It compiles `.mdx` files into rich individual pages complete with:
- Canonical SEO links and JSON-LD schema integration.
- Custom tag highlights and responsive reading view layouts.
- Dynamic subscription feeds generated at `/rss.xml` using `@astrojs/rss`.

### **2. Anti-Flicker Manual Theme Engine**
Equipped with an advanced manual dark/light toggle in the header. To prevent Flash of Unstyled Content (FOUC), a blocking script is injected directly into `<head>` to synchronize preferred states from `localStorage` or OS level preferences before the DOM is painted.

### **3. Intersection Scroll Highlighting**
The sticky header features a smart `IntersectionObserver` scroll listener. As you scroll down the page, the corresponding desktop menu item is dynamically highlighted in real-time, mapping active coordinates precisely.

### **4. Interactive Security Sandbox**
`src/components/sections/SecuritySimulator.astro` renders two client-side
walkthroughs — a WebAuthn/FIDO2 passkey registration-and-assertion flow and an
OAuth 2.0 authorization-code grant — with an animated entity diagram and a live
terminal log. Entirely simulated; no network calls and no real key material.

### **5. Progressive Web App & Offline Shell**
`public/manifest.json` plus a network-first service worker (`public/sw.js`)
provide installability and resilience on flaky connections. Network-first was a
deliberate choice over cache-first: cache-first was serving unstyled layouts on
refresh after a deploy (commit `9a07a68`).

### **6. Security & Machine-Readable Disclosure**
- `public/.well-known/security.txt` — RFC 9116 vulnerability-disclosure policy.
- `public/mayank_pgp.asc` — public key for encrypted reports.
- `public/llms.txt` — guidance for LLM crawlers, alongside explicit
  `ChatGPT-User` / `ClaudeBot` / `PerplexityBot` allowances in `robots.txt`.

---

## 📌 Known Gaps

Tracked deliberately so they are not mistaken for finished work:

- **`/resume/resume.pdf` returns 404.** `Certifications.astro` links both the PDF
  and its detached GPG signature (`resume.pdf.sig`, which *is* present). Until the
  PDF is added, the signature has nothing to verify. Deferred by choice; asserted
  in `tests/content.spec.ts` so it cannot be forgotten, and allow-listed in the
  broken-link test.
- **`/resume/mayank_press_kit.zip` returns 404.** Linked from `Speaking.astro`.
- **No analytics provider is enabled.** There is no traffic, referrer, or
  article-performance visibility. `Layout.astro` carries a commented, ready-to-use
  block for Cloudflare Web Analytics, Plausible, and GoatCounter — each with the
  exact CSP directive it needs. Uncomment one and paste a token.
- **No search-console verification.** The placeholder `google-site-verification`
  and `msvalidate.01` tags were removed (they shipped live as literal
  `YOUR_..._KEY_HERE` strings and verified nothing). Add a real tag, or use DNS
  TXT verification.
- **Testimonials section is empty.** `src/data/testimonials.ts` is intentionally
  seeded empty and the section auto-hides, so nothing half-finished ships. Add
  real, attributable quotes (ideally with a LinkedIn permalink) to enable it.

---

## 🧪 Production Auditing & Testing

An end-to-end suite built on **Playwright** and **@axe-core/playwright** guards
accessibility, SEO, security, performance, and content integrity against
regressions. **60 specs → 234 assertions**, run on Chromium, Firefox, and WebKit.

| Spec | Covers |
| --- | --- |
| `accessibility.spec.ts` | WCAG 2.2 AA on every route × both themes, banned colour pairings, heading hierarchy, accessible names, skip link |
| `seo-schema.spec.ts` | Meta uniqueness, canonicals, JSON-LD graphs, **ORCID checksum**, sitemap, RSS ordering, redirect-free internal links |
| `security.spec.ts` | CSP directives + zero violations, production-only `upgrade-insecure-requests`, frame-buster, RFC 9116 `Expires`, form hardening |
| `performance-assets.spec.ts` | No third-party requests, self-hosted font weights, AVIF/WebP negotiation, image dimensions, CLS/FCP budgets |
| `pwa-touch-targets.spec.ts` | Manifest + raster icons, service worker, 24px targets across 4 viewports, overflow at 8 widths (320→2560px) |
| `content.spec.ts` | No placeholder text, post depth, frontmatter validity, duplicate-H1 guard, testimonials, licence claims |
| `mobile-drawer-a11y.spec.ts` | Drawer `inert` when closed, keyboard focus return on Enter/Escape |

```bash
# 1. Install dependencies
npm install
npx playwright install   # first run only: fetch browser binaries

# 2. Run the Playwright test pipeline
npm run test
```

The suite builds the production payload, serves it locally, and runs the matrix
above. **CI runs it as a gate** (`.github/workflows/deploy.yml`): the `test` job
must pass before `build`, and `deploy` only runs on pushes to `main`, so a
failing accessibility or SEO check now blocks the deploy rather than shipping.

Two things to know before writing new tests:

- **Never wait on `networkidle` or `load` for navigation.** The service worker
  holds a connection open, so the page never reaches network idle. Use the
  `goto()` helper in `tests/helpers.ts` (`waitUntil: 'commit'` + an explicit
  wait).
- **Disable CSS transitions before asserting colour.** Toggling the `dark` class
  mid-test makes axe sample half-blended values and report contrast failures that
  exist in neither theme. `applyTheme()` handles this.

---

## ☁️ Deployment

**Live host: GitHub Pages.** The site compiles and deploys automatically on every
push to `main` via GitHub Actions (`.github/workflows/deploy.yml`). DNS is managed
at GoDaddy.

To launch:
1. Ensure your DNS `A` records point to GitHub's server IPs:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. Add a `CNAME` for `www` pointing to `mayankrajjaiswal.github.io`.
3. In your GitHub repository **Settings** > **Pages**, save your domain as `mayankrajjaiswal.com` and enable **Enforce HTTPS**.

### ⚠️ Security headers and the GitHub Pages constraint

GitHub Pages **cannot serve custom HTTP response headers.** This has a direct
consequence worth stating plainly: the policies in `vercel.json` and
`public/_headers` are **inert on the live site.** Both files are retained only as
ready-to-use configuration should the site move to a host that supports headers.

What is actually enforced today, from `src/layouts/Layout.astro`:

| Policy | Mechanism | Status on GitHub Pages |
| --- | --- | --- |
| `Content-Security-Policy` | `<meta http-equiv>` | ✅ Enforced |
| `Referrer-Policy` | `<meta name="referrer">` | ✅ Enforced |
| Clickjacking defence | inline frame-buster script | ✅ Enforced (JS-dependent) |
| `upgrade-insecure-requests` | CSP directive | ✅ Enforced in production only |
| `Strict-Transport-Security` | — | ❌ Not possible; use **Enforce HTTPS** |
| `X-Content-Type-Options` | — | ❌ No `<meta>` equivalent exists |
| `X-Frame-Options` / `frame-ancestors` | — | ❌ Ignored in `<meta>`; hence the frame-buster |

Moving to Cloudflare Pages, Netlify, or Vercel would restore the complete header
set from the configs already committed here, and would let the frame-buster be
removed in favour of `frame-ancestors 'none'`.

The CSP is built in `src/layouts/Layout.astro` as a directive array, and mirrored
in `vercel.json` and `public/_headers`. **Keep all three in sync** — only the
`<meta>` one is live today, but a host migration should be a one-line change.

> **`upgrade-insecure-requests` is production-only, and that is deliberate.** It
> rewrites every `http://` subresource URL to `https://`. Because `astro dev` and
> `astro preview` serve plain HTTP on localhost, WebKit honours the upgrade,
> fails to reach `https://localhost:4321`, and renders the page with **no CSS, no
> fonts, and no service worker**. Chromium and Firefox exempt localhost, so this
> is invisible in those engines — it only surfaced in WebKit. The Playwright
> `webServer` therefore sets `PUBLIC_PLAYWRIGHT=1` to omit the directive, and
> `security.spec.ts` builds without that flag to prove production still gets it.
