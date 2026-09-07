# CLAUDE.md

Working notes for `mayankrajjaiswal.com` — an Astro 5 + Tailwind static site,
deployed to GitHub Pages. Read `DESIGN_SYSTEM.md` §10–11 before touching UI.

## Commands

```bash
npm run dev                          # dev server on :4321
npm run build                        # static build to dist/
npm run test                         # full suite, 3 engines (~30s)
npm run test -- --project=chromium   # single engine while iterating
npx playwright show-report           # open HTML report after a run
```

`npm run test` builds and previews automatically — no need to start a server first.

## Architecture

- **Content lives in `src/data/*.ts`**, not in components. To change site copy, edit
  `experience.ts`, `projects.ts`, `certifications.ts`, `research.ts`, `speaking.ts`,
  or `timeline.ts`. Section components read from these.
- **Blog posts** are MDX in `src/content/blog/`, validated by the Zod schema in
  `src/content/config.ts`. A malformed frontmatter block fails the build.
- **`src/layouts/Layout.astro`** owns `<head>`: meta tags, the CSP, the blocking
  theme script, and JSON-LD. The homepage emits `ProfilePage` with the `Person` as
  `mainEntity` — not a bare `Person`.

## Non-obvious constraints

**GitHub Pages cannot send custom response headers.** `vercel.json` and
`public/_headers` are committed but **inert**. The live CSP is the
`<meta http-equiv>` in `Layout.astro` (built from the `cspDirectives` array);
clickjacking protection is an inline frame-buster, because `frame-ancestors` and
`X-Frame-Options` are both ignored in `<meta>`. If you edit security policy, edit
`Layout.astro` — changing the other two files has no effect on production. Keep
all three consistent anyway, so a host migration is a one-line change.

**`upgrade-insecure-requests` must stay production-only.** It rewrites `http://`
to `https://`, which breaks `astro dev` and `astro preview` (plain HTTP on
localhost): WebKit honours the upgrade, cannot reach `https://localhost:4321`,
and the page renders with no CSS, no fonts, and no service worker. Chromium and
Firefox exempt localhost so the breakage is **invisible** there. The directive is
gated on `import.meta.env.PUBLIC_PLAYWRIGHT`, which `playwright.config.ts` sets
via its `webServer.env`. Note `astro preview` builds in PROD mode, so
`import.meta.env.PROD` cannot distinguish it from a real deploy.

**Trailing slashes are mandatory.** `trailingSlash: 'always'` is set because
GitHub Pages 301-redirects `/blog/foo` → `/blog/foo/`. Every internal link needs
the slash — including markdown links inside `.mdx` posts, which are easy to miss.
`/404` without a slash is a genuine 404; the route is `/404/`.

**Only `PUBLIC_`-prefixed env vars reach `import.meta.env`** in Astro.

**Windows shells reject `VAR=value cmd`.** Use Playwright's `webServer.env`, or
`cross-env`, rather than inline assignment.

**Tailwind shades are enumerated 50–950 in `tailwind.config.mjs`.** A class naming a
shade outside that set (`slate-750`, `blue-350`) compiles to nothing and fails
*silently* — no build error, no applied style. Two such typos have already been
fixed here. If a colour seems not to apply, verify the shade exists.

**Runtime class toggling must include the `dark:` variant.** Adding
`text-slate-600` from JavaScript without `dark:text-slate-400` breaks dark mode,
and Tailwind only emits classes it finds in scanned source — so a class added at
runtime must also appear literally in markup somewhere.

**Order matters when hiding a panel:** restore focus *before* setting `inert`.
WebKit clears focus the moment `inert` lands and discards a later `.focus()` call.

## Testing

60 specs / 234 assertions across 3 engines. Shared utilities live in
`tests/helpers.ts` — use `goto()`, `applyTheme()`, `ALL_PAGES`, and `THEMES`
rather than re-rolling navigation or theme switching.

Gotchas, all of which have bitten this project:

- **Never `waitUntil: 'networkidle'` or `'load'` for navigation.** The service
  worker holds a connection open, so the page never goes idle and the test times
  out. `goto()` uses `'commit'` plus an explicit wait.
- **Disable CSS transitions before asserting colour.** Otherwise axe samples
  mid-transition blended values and reports contrast failures that exist in
  neither theme. `applyTheme()` handles it.
- **WebKit does not keep focus on a mouse-clicked `<button>`,** and does not put
  links in sequential tab order by default. Assert keyboard behaviour via
  `.focus()` / `Enter` / `Escape`, not by pressing Tab and expecting a link.
- **Playwright contexts do not persist service-worker registrations.**
  `getRegistrations()` returns `[]` and `serviceWorker.ready` never settles even
  when registration succeeded — assert on the `register()` promise instead.
- **A swallowed `.catch(() => {})` on a click can wedge the page handle.** It
  produced a hang that looked like a CSP failure but was purely test-side.
- **Don't leave a preview server running from a plain `npm run build`.**
  Playwright reuses it, and that `dist/` still has `upgrade-insecure-requests`,
  so every WebKit test fails with a "no CSS" symptom that mimics a real bug.
  `npm test` alone always builds correctly.
- `target-size` is asserted separately from the main axe sweep, applying the WCAG
  2.5.8 inline-text-link exception to specific selectors rather than disabling the
  rule wholesale.

## Conventions

- Astro components only; no React/Vue. Interactivity is inline `<script is:inline>`.
- Tailwind utilities in markup; avoid separate CSS files beyond `global.css`.
- Every light-mode text colour needs a `dark:` counterpart.
- Comment the *why*, not the *what* — match the existing density, which is sparse.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`, which runs
`test` → `build` → `deploy`. **The test job is a gate**: a failing accessibility,
SEO, or CSP check blocks the deploy. Pull requests run test + build but never
deploy. CI installs Chromium only, for speed — run all three engines locally
before pushing, since WebKit has repeatedly caught issues the others miss.

## Design & content constraints

- **Contrast:** see `DESIGN_SYSTEM.md` §10. `text-slate-400 dark:text-slate-500`
  fails in *both* themes (2.56:1 / 4.23:1) and is banned by a test. Use
  `text-slate-600 dark:text-slate-400` for secondary text.
- **Blog posts must not restate their title as a `# ` heading** — the layout
  already renders it as the `<h1>`, so doing so creates a duplicate H1.
- **The hero `<h1>` is the visible headline**, with an `sr-only` span carrying the
  entity name. Don't revert it to a hidden `<h1>` plus a styled `<p>`.
- **Testimonials are real or absent.** `src/data/testimonials.ts` is seeded empty
  and the section auto-hides. Never invent quotes or attributions.
- **`sameAs` targets must be verifiable.** An ORCID failing its ISO 7064 MOD 11-2
  checksum was live here; `orcid.org` returns HTTP 200 even for non-existent iDs,
  so a link check will not catch it. `seo-schema.spec.ts` validates the checksum.
