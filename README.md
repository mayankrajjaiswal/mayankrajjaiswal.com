# MayankRajJaiswal.com — Digital Identity HQ

The official, open-source personal digital identity of **Mayank Raj Jaiswal**, Enterprise Security Architect, AI Researcher, Speaker, and Author. Built to deliver an extremely fast, secure, accessible (WCAG 2.2 AA), and visually premium experience modeled after leading tech platforms like Stripe, Vercel, and Linear.

---

## 🚀 Key Architectural Pillars

- **Zero JavaScript Default (Astro 5):** Leverages server-side static rendering (SSG) for instantaneous first-contentful paint.
- **Sleek Utility Styling (Tailwind CSS):** Implements a bespoke design system with glowing ambient background meshes, interactive card cards, and precise, scannable layouts.
- **Strict Content Schema (TypeScript):** Fully separates copy and layout by managing all experience timelines, technical certifications, speaking records, and projects in typed structure files under `src/data/`.
- **Intelligent Asset Self-Healing:** The home portrait checks for local files (`/images/mayank-portrait.jpg`) and gracefully falls back to an elegant, high-contrast SVG vector avatar if absent, eliminating broken image anchors.
- **Robust Accessibility (WCAG 2.2 AA):** Configured with keyboard navigation, visible focus indicators, screen-reader aria hooks, and automated Axe-core testing.

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

---

## 🧪 Production Auditing & Testing

We have built an end-to-end testing suite using **Playwright** and **Axe-Playwright** to ensure that subsequent updates do not break performance, SEO structure, or accessibility scores.

```bash
# 1. Install dependencies
npm install

# 2. Run the Playwright test pipeline
npm run test
```

The pipeline automatically:
- Builds the production payload and serves it locally.
- Audits meta titles, canonicals, and open-graph properties.
- Validates the structured JSON-LD Schema.
- Runs an automated page-level Axe accessibility audit.

---

## ☁️ GitHub Pages Deployment

The site is configured to compile and deploy automatically on every push to your `main` branch via GitHub Actions (`.github/workflows/deploy.yml`).

To launch:
1. Ensure your DNS `A` records (Wix) point to GitHub's server IPs:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. Add a `CNAME` for `www` pointing to `mayankrajjaiswal.github.io`.
3. In your GitHub repository **Settings** > **Pages**, save your domain as `mayankrajjaiswal.com` and enable **Enforce HTTPS**.
