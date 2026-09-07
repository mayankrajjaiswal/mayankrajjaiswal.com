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
`<meta http-equiv>` in `Layout.astro`; clickjacking protection is an inline
frame-buster, because `frame-ancestors` and `X-Frame-Options` are both ignored in
`<meta>`. If you edit security policy, edit `Layout.astro` — changing the other two
files has no effect on production. Keep all three consistent anyway, so a host
migration is a one-line change.

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

## Testing gotchas

- **Never `waitUntil: 'networkidle'`.** The service worker holds a connection open,
  so the page never goes idle and the test times out. Use `'commit'` plus an
  explicit `waitForSelector`.
- **Disable CSS transitions before toggling the `dark` class in a test.** Otherwise
  axe samples mid-transition blended colours and reports contrast failures that do
  not exist. Injecting `* { transition: none !important }` is sufficient.
- **WebKit does not keep focus on a mouse-clicked `<button>`.** That is platform
  convention, not a bug — assert focus restoration on the keyboard path (`Enter`,
  `Escape`), not the click path.
- `target-size` is asserted in a separate test with named `.exclude()` selectors for
  inline text links (WCAG 2.5.8 exception), rather than being disabled globally.

## Conventions

- Astro components only; no React/Vue. Interactivity is inline `<script is:inline>`.
- Tailwind utilities in markup; avoid separate CSS files beyond `global.css`.
- Every light-mode text colour needs a `dark:` counterpart.
- Comment the *why*, not the *what* — match the existing density, which is sparse.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`. Note the workflow does
**not** run `npm run test`, so a failing accessibility check will not block a
deploy — run the suite locally before pushing.
