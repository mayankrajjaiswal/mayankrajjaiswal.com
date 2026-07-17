# Project Handover & Maintenance Guide: MayankRajJaiswal.com

Welcome to the definitive digital headquarters of **Mayank Raj Jaiswal**, Enterprise Security Architect. This document serves as a high-signal handover guide for local maintenance, future content updates, and deployment checks.

## 1. Project Directory Map

```text
/
├── .github/workflows/   # Automated deployment to GitHub Pages (GitHub Actions)
├── public/              # Static assets directory
│   ├── images/          # Drop your real pictures here (portrait, og-image)
│   ├── resume/          # Drop your downloadable resume.pdf here
│   ├── CNAME            # Domain routing rules (mayankrajjaiswal.com)
│   └── robots.txt       # Crawler policies
├── src/
│   ├── content/         # Blogging Hub database
│   │   ├── blog/        # Drop `.mdx` or `.md` posts here to publish instantly
│   │   └── config.ts    # Schema definition for post validation
│   ├── data/            # Strongly-typed site data (separates UI from content)
│   │   ├── experience.ts
│   │   ├── projects.ts
│   │   ├── speaking.ts
│   │   └── timeline.ts
│   ├── components/      # Modular UI layout and sections
│   ├── layouts/         # HTML Head, fonts, and blocking zero-flicker theme script
│   └── pages/           # Dynamic sitemaps, 404, RSS feeds, and blogging index
├── tests/               # End-to-End automated testing suite (Playwright + Axe-core)
├── playwright.config.ts # Testing options
└── tailwind.config.mjs  # Theme system (with manual 'class' dark mode enabled)
```

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
   tags: ["Security", "Architecture"]
   ---
   ```
3. Write your content in standard Markdown below the metadata. 
4. Commit and push. Your article is compiled, mapped to the `/blog/` list, generated inside `rss.xml`, and registered in `sitemap.xml` automatically!

### **How to Update Your Experience or Projects**
All main landing page content is separated into `src/data/` for easier modification:
- Update **Companies, Roles, and Achievements** in `src/data/experience.ts`.
- Update **Featured Projects and Startups** in `src/data/projects.ts`.
- Update **Certifications and Academic Milestones** in `src/data/certifications.ts`.
- Update **Speaking Engagements and Seminars** in `src/data/speaking.ts`.

---

## 3. Deployment & Live URL Checks

1. **Domain Setup:** Point your domain host (Wix) to the following A records:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. **Subdomain Setup:** Configure a CNAME for `www` pointing to `mayankrajjaiswal.github.io`.
3. **Verify Security (HTTPS):** In your GitHub Repository Settings > **Pages**, make sure the custom domain is saved as `mayankrajjaiswal.com` and **Enforce HTTPS** is checked.

---

## 4. Run Automated Local Audits

To audit your website's markup, routing, SEO, and accessibility standards prior to launching:
```bash
# Install testing dependencies
npx playwright install

# Run the test pipeline
npm run test
```
The Playwright test suite will spin up a local preview, execute multi-browser testing, verify OpenGraph and JSON-LD schema objects, and run an automated `axe-core` accessibility scan on your code.
