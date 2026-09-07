import { test, expect } from '@playwright/test';
import { ALL_PAGES, goto } from './helpers';

test.describe('PWA installability', () => {
  test('manifest is valid and declares raster icons', async ({ request }) => {
    const res = await request.get('/manifest.json');
    expect(res.status()).toBe(200);

    const m = await res.json();
    expect(m.name).toBeTruthy();
    expect(m.short_name).toBeTruthy();
    expect(m.short_name.length, 'short_name should stay under ~12 chars').toBeLessThanOrEqual(14);
    expect(m.start_url).toBeTruthy();
    expect(m.display).toBe('standalone');
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(m.background_color).toMatch(/^#[0-9a-f]{6}$/i);

    // Android's install prompt requires PNG icons at 192 and 512; an SVG-only
    // manifest silently blocks installability.
    const pngs = (m.icons ?? []).filter((i: any) => i.type === 'image/png');
    const sizes = pngs.map((i: any) => i.sizes);
    expect(sizes, 'manifest needs a 192x192 PNG').toContain('192x192');
    expect(sizes, 'manifest needs a 512x512 PNG').toContain('512x512');

    // A maskable icon prevents Android from letterboxing the icon.
    const maskable = (m.icons ?? []).filter((i: any) =>
      (i.purpose ?? '').includes('maskable')
    );
    expect(maskable.length, 'manifest should declare a maskable icon').toBeGreaterThan(0);
  });

  test('every manifest icon actually resolves', async ({ request }) => {
    const m = await (await request.get('/manifest.json')).json();
    for (const icon of m.icons ?? []) {
      const res = await request.get(icon.src);
      expect(res.status(), `${icon.src} must exist`).toBe(200);
      expect(res.headers()['content-type'], `${icon.src} content-type`).toMatch(
        /image\/(png|svg\+xml)/
      );
      const body = await res.body();
      expect(body.length, `${icon.src} must not be empty`).toBeGreaterThan(200);
    }
  });

  test('apple-touch-icon is linked and reachable', async ({ page, request }) => {
    await goto(page, '/');
    const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect(href, 'iOS home-screen bookmarks need a PNG apple-touch-icon').toBeTruthy();

    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });

  test('theme-color and manifest link are present on all pages', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      await expect(page.locator('link[rel="manifest"]'), `${path} manifest link`).toHaveCount(1);
      const theme = await page.locator('meta[name="theme-color"]').getAttribute('content');
      expect(theme, `${path} theme-color`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  /**
   * Asserts registration SUCCEEDS rather than inspecting getRegistrations().
   *
   * Playwright gives each test a fresh browser context, where service-worker
   * registrations are not persisted — getRegistrations() returns [] and
   * serviceWorker.ready never settles, even though registration itself worked.
   * Watching the registration promise resolve is therefore the reliable signal,
   * and it still catches the real failure modes: a 404 on /sw.js, a syntax
   * error inside it, or a CSP worker-src block.
   */
  test('service worker registers successfully', async ({ page, request }) => {
    // The script must exist and be served as JavaScript.
    const sw = await request.get('/sw.js');
    expect(sw.status(), '/sw.js must be served').toBe(200);
    expect(sw.headers()['content-type']).toMatch(/javascript/);

    await goto(page, '/');
    const outcome = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return 'unsupported';
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        return reg.scope.endsWith('/') ? 'registered' : `odd-scope:${reg.scope}`;
      } catch (e) {
        return `failed:${(e as Error).message}`;
      }
    });

    expect(
      outcome,
      'sw.js failed to register — check for a CSP worker-src block or a syntax error'
    ).toBe('registered');
  });
});

test.describe('Touch target sizing (WCAG 2.5.8)', () => {
  const VIEWPORTS = [
    { name: 'mobile-sm', width: 320, height: 568 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const vp of VIEWPORTS) {
    test(`standalone controls are >=24px at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const path of ALL_PAGES) {
        await goto(page, path);
        await page.waitForTimeout(250);

        const small = await page.evaluate(() => {
          const out: string[] = [];
          for (const el of document.querySelectorAll(
            'a,button,input,select,textarea,[role="button"]'
          )) {
            const box = el.getBoundingClientRect();
            if (box.width === 0 || box.height === 0) continue;      // hidden
            if (el.closest('#mobile-drawer')) continue;             // inert when closed
            if (el.classList.contains('sr-only')) continue;         // skip link
            const type = el.getAttribute('type');
            if (type === 'hidden') continue;

            // WCAG 2.5.8 exempts links rendered inline within a block of text.
            const style = getComputedStyle(el);
            const isInlineTextLink =
              el.tagName === 'A' &&
              style.display === 'inline' &&
              ['P', 'LI', 'SPAN', 'BLOCKQUOTE'].includes(el.parentElement?.tagName ?? '');
            if (isInlineTextLink) continue;

            if (box.width < 24 || box.height < 24) {
              out.push(
                `${el.tagName}"${(el.textContent || '').trim().slice(0, 22)}" ` +
                  `${Math.round(box.width)}x${Math.round(box.height)}`
              );
            }
          }
          return out;
        });

        expect(small, `${path} @ ${vp.name}: ${small.join(' | ')}`).toEqual([]);
      }
    });
  }
});

test.describe('Responsive integrity', () => {
  const WIDTHS = [320, 375, 390, 768, 1024, 1280, 1920, 2560];

  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of ALL_PAGES) {
        await goto(page, path);
        await page.waitForTimeout(250);

        const result = await page.evaluate(() => {
          const de = document.documentElement;
          const overflow = de.scrollWidth > de.clientWidth + 1;
          const culprits: string[] = [];
          if (overflow) {
            for (const el of [...document.querySelectorAll('*')].slice(0, 3000)) {
              const b = el.getBoundingClientRect();
              if (b.width > de.clientWidth + 2 && b.height > 0) {
                culprits.push(`${el.tagName}.${String(el.className).slice(0, 40)}`);
                if (culprits.length >= 3) break;
              }
            }
          }
          return { overflow, scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, culprits };
        });

        expect(
          result.overflow,
          `${path} @ ${width}px overflows ` +
            `(${result.scrollWidth} > ${result.clientWidth}): ${result.culprits.join(', ')}`
        ).toBe(false);
      }
    });
  }
});
