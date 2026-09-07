# MayankRajJaiswal.com — Digital Identity HQ

The official, open-source personal digital identity of **Mayank Raj Jaiswal**, Enterprise Security Architect, AI Researcher, Speaker, and Author. Built to deliver an extremely fast, secure, accessible (WCAG 2.2 AA), and visually premium experience modeled after leading tech platforms like Stripe, Vercel, and Linear.

---

## 🚀 Key Architectural Pillars

- **Zero JavaScript Default (Astro 5):** Leverages server-side static rendering (SSG) for instantaneous first-contentful paint.
- **Sleek Utility Styling (Tailwind CSS):** Implements a bespoke design system with glowing ambient background meshes, interactive cards, and precise, scannable layouts.
- **Strict Content Schema (TypeScript):** Fully separates copy and layout by managing all experience timelines, technical certifications, speaking records, and projects in typed structure files under `src/data/`.
- **Resilient Portrait Rendering:** An SVG vector avatar sits behind the portrait as a permanently-rendered layer. `/images/mayank-portrait.jpg` is painted on top and, on load failure, an `onerror` handler fades it out to reveal the fallback — so a missing or broken image never leaves a broken-image anchor.
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
  PDF is added, the signature has nothing to verify. Deferred by choice.
- **`/resume/mayank_press_kit.zip` returns 404.** Linked from `Speaking.astro`.
- **Fonts are CDN-hosted, not self-hosted.** `Layout.astro` loads Geist, Inter, and
  JetBrains Mono from Google Fonts. Self-hosting would remove a third-party
  request from the critical path, drop `fonts.googleapis.com` / `fonts.gstatic.com`
  from the CSP, and improve privacy. `public/fonts/` does not exist yet.
- **No CI test gate.** `.github/workflows/deploy.yml` runs `npm audit` and builds,
  but never runs `npm run test`, so a failing accessibility check cannot block a
  deploy.

---

## 🧪 Production Auditing & Testing

An end-to-end suite built on **Playwright** and **@axe-core/playwright** guards SEO
structure and accessibility against regressions. It runs on Chromium, Firefox, and
WebKit — 24 checks total.

```bash
# 1. Install dependencies
npm install
npx playwright install   # first run only: fetch browser binaries

# 2. Run the Playwright test pipeline
npm run test
```

The pipeline automatically:
- Builds the production payload and serves it locally.
- Audits meta titles, canonicals, and open-graph properties.
- Validates the `ProfilePage` → `mainEntity: Person` JSON-LD graph.
- Runs a page-level Axe audit against `wcag2a`, `wcag2aa`, and `wcag22aa`.
- Asserts the 24px minimum touch-target rule, with the WCAG 2.5.8 inline-text-link
  exception applied to named selectors rather than disabled wholesale.
- Verifies the mobile drawer is `inert` while closed and returns keyboard focus to
  its toggle on both `Escape` and `Enter` (see `tests/mobile-drawer-a11y.spec.ts`).

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
| `Strict-Transport-Security` | — | ❌ Not possible; use **Enforce HTTPS** |
| `X-Content-Type-Options` | — | ❌ No `<meta>` equivalent exists |
| `X-Frame-Options` / `frame-ancestors` | — | ❌ Ignored in `<meta>`; hence the frame-buster |

Moving to Cloudflare Pages, Netlify, or Vercel would restore the complete header
set from the configs already committed here, and would let the frame-buster be
removed in favour of `frame-ancestors 'none'`.
