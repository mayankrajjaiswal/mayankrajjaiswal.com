import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * Static-source regressions found during the 2026-09 audit. These guard
 * against the exact defect recurring, not just "the page loads" -- several of
 * these bugs (assignment-in-condition, an invalid SVG element) produced no
 * visible symptom and would not have been caught by any runtime test.
 */
test.describe('Static source checks', () => {
  test('no assignment-in-condition in inline scripts', () => {
    // `if (x = y)` inside an is:inline <script> creates an implicit global and
    // is always truthy when y is a DOM node -- SecuritySimulator.astro had four
    // of these (fReg, fAuth, oCode, oTok). Matches a bare identifier assigned
    // inside an `if (...)` head; real comparisons (`===`, `==`, `<=`, etc.)
    // don't match this pattern.
    const files = [
      'src/components/sections/SecuritySimulator.astro',
      'src/components/layout/Header.astro',
      'src/components/sections/Experience.astro',
      'src/components/sections/Certifications.astro',
      'src/layouts/Layout.astro',
      'src/layouts/BlogPostLayout.astro',
      'src/pages/blog/index.astro',
    ];
    const assignmentInCondition = /if\s*\(\s*[A-Za-z_$][\w$]*\s*=\s*[A-Za-z_$][\w$.]*\s*\)/;

    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      const match = src.match(assignmentInCondition);
      expect(match, `${file} contains an assignment-in-condition: ${match?.[0]}`).toBeNull();
    }
  });

  test('no non-standard SVG elements ship in markup', () => {
    // <key> is not a valid SVG element (a copy/paste of <circle> went wrong in
    // SecuritySimulator.astro) -- it silently renders nothing, with no console
    // error, so this can only be caught by scanning source/output for the tag.
    const files = [
      'src/components/sections/SecuritySimulator.astro',
      'src/components/sections/Hero.astro',
      'src/components/sections/About.astro',
      'src/components/sections/Experience.astro',
      'src/components/sections/Projects.astro',
      'src/components/sections/Research.astro',
      'src/components/sections/Media.astro',
      'src/components/sections/Recognition.astro',
      'src/components/sections/Speaking.astro',
      'src/components/sections/Certifications.astro',
      'src/components/sections/Timeline.astro',
      'src/components/sections/Contact.astro',
      'src/components/layout/Header.astro',
      'src/components/layout/Footer.astro',
    ];
    // Valid SVG element names that could plausibly appear; anything else
    // opening inside an <svg>...</svg> block is suspect. Cheaper and more
    // robust than parsing: just deny-list the specific known-bad tag plus any
    // other clearly non-SVG element name pattern seen in this codebase.
    const invalidSvgChildTags = ['key', 'div', 'span', 'button'];

    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      for (const svgBlock of src.matchAll(/<svg[^>]*>([\s\S]*?)<\/svg>/g)) {
        for (const tag of invalidSvgChildTags) {
          const re = new RegExp(`<${tag}[\\s>]`);
          expect(
            re.test(svgBlock[1]),
            `${file} has an invalid <${tag}> element inside an <svg>`
          ).toBe(false);
        }
      }
    }
  });

  test('dead astro:after-swap listeners are not reintroduced', () => {
    // ViewTransitions is not used anywhere in this project, so
    // 'astro:after-swap' never fires -- any listener for it is dead code that
    // implies a feature (SPA navigation) the site does not have.
    const files = [
      'src/components/layout/Header.astro',
      'src/components/sections/Certifications.astro',
      'src/components/sections/Experience.astro',
      'src/components/sections/SecuritySimulator.astro',
      'src/layouts/BlogPostLayout.astro',
      'src/layouts/Layout.astro',
      'src/pages/blog/index.astro',
    ];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src, `${file} still listens for astro:after-swap`).not.toContain('astro:after-swap');
    }

    // If this ever fails because ViewTransitions was intentionally adopted,
    // that's a real signal to bring the listeners back -- not a false positive.
    for (const file of ['src/layouts/Layout.astro', 'src/pages/index.astro']) {
      const src = readFileSync(file, 'utf8');
      expect(src, `${file} should not reference ViewTransitions without updating this test`).not.toMatch(
        /ViewTransitions|astro:transitions/
      );
    }
  });

  test('print stylesheet does not name a removed font', () => {
    // Inter was removed when fonts became self-hosted (Geist only); the print
    // block in global.css kept naming it, so print output silently fell back
    // to a generic sans-serif with no visible error.
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css, 'global.css print styles should not reference the removed Inter font').not.toMatch(
      /font-family:\s*'Inter'/
    );
  });

  test('CSP directive set is identical across Layout.astro, _headers, and vercel.json', () => {
    // Layout.astro's <meta> CSP is the only one actually enforced on GitHub
    // Pages; _headers and vercel.json are inert but exist so a host migration
    // is a one-line change. That's only true if the three stay in sync -- they
    // had silently drifted (frame-src, worker-src, manifest-src were missing
    // from the two inert files).
    //
    // `frame-ancestors` is a deliberate, permanent exception: <meta> cannot
    // deliver it (browsers ignore frame-ancestors set via <meta
    // http-equiv>), which is exactly why Layout.astro ships the inline
    // frame-buster script instead. _headers/vercel.json correctly include it
    // for a future header-capable host; Layout.astro correctly does not.
    const EXPECTED_ONLY_IN_HEADER_FILES = ['frame-ancestors'];

    const layoutSrc = readFileSync('src/layouts/Layout.astro', 'utf8');
    const directiveArrayMatch = layoutSrc.match(/const cspDirectives = \[([\s\S]*?)\];/);
    expect(directiveArrayMatch, 'Layout.astro must declare a cspDirectives array').toBeTruthy();

    const layoutDirectives = [...directiveArrayMatch![1].matchAll(/"([^"]+)"/g)]
      .map((m) => m[1])
      .filter((d) => d !== 'upgrade-insecure-requests') // production-only, appended conditionally
      .map((d) => d.split(' ')[0])
      .sort();

    const expectedHeaderFileDirectives = [...layoutDirectives, ...EXPECTED_ONLY_IN_HEADER_FILES].sort();

    const headersSrc = readFileSync('public/_headers', 'utf8');
    const headersCsp = headersSrc.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? '';
    const headersDirectives = headersCsp
      .split(';')
      .map((d) => d.trim().split(' ')[0])
      .filter((d) => d && d !== 'upgrade-insecure-requests')
      .sort();

    const vercelSrc = readFileSync('vercel.json', 'utf8');
    const vercelJson = JSON.parse(vercelSrc);
    const vercelCsp: string = vercelJson.headers[0].headers.find(
      (h: { key: string }) => h.key === 'Content-Security-Policy'
    ).value;
    const vercelDirectives = vercelCsp
      .split(';')
      .map((d: string) => d.trim().split(' ')[0])
      .filter((d: string) => d && d !== 'upgrade-insecure-requests')
      .sort();

    expect(headersDirectives, '_headers CSP directives must match Layout.astro (+ frame-ancestors)').toEqual(
      expectedHeaderFileDirectives
    );
    expect(vercelDirectives, 'vercel.json CSP directives must match Layout.astro (+ frame-ancestors)').toEqual(
      expectedHeaderFileDirectives
    );
  });

  test('service worker precache list has no un-trailing-slashed routes or unused assets', () => {
    // '/blog' (no slash) 301-redirects under trailingSlash: 'always', so the
    // service worker was precaching a redirect instead of the page. The
    // portrait path pointed at the unused 1000x667 original instead of the
    // 448/896 derivatives the page actually requests.
    const sw = readFileSync('public/sw.js', 'utf8');
    const assetsMatch = sw.match(/ASSETS_TO_CACHE\s*=\s*\[([\s\S]*?)\]/);
    expect(assetsMatch, 'sw.js must declare ASSETS_TO_CACHE').toBeTruthy();
    const assets = [...assetsMatch![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

    for (const asset of assets) {
      if (asset === '/' || asset.includes('.')) continue; // root and file assets are exempt
      expect(asset.endsWith('/'), `${asset} in sw.js must be trailing-slashed`).toBe(true);
    }
    expect(assets, 'sw.js should not precache the unused full-size portrait').not.toContain(
      '/images/mayank-portrait.jpg'
    );
  });
});
