import { test, expect } from '@playwright/test';
import { ALL_PAGES, goto } from './helpers';

test.describe('Fonts', () => {
  /**
   * Fonts were previously loaded from the Google Fonts CDN: a render-blocking
   * third-party request that also forced two extra origins into the CSP. They
   * are now self-hosted variable fonts.
   */
  test('no third-party font requests; self-hosted fonts load', async ({ page }) => {
    const thirdParty: string[] = [];
    const fontRequests: string[] = [];

    page.on('request', (r) => {
      const url = r.url();
      if (/fonts\.(googleapis|gstatic)\.com|use\.typekit|fonts\.bunny/.test(url)) {
        thirdParty.push(url);
      }
      if (r.resourceType() === 'font') fontRequests.push(new URL(url).pathname);
    });

    await goto(page, '/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);

    expect(thirdParty, `third-party font requests: ${thirdParty.join(', ')}`).toEqual([]);

    const state = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        geist: document.fonts.check('700 16px Geist'),
        mono: document.fonts.check('400 16px "JetBrains Mono"'),
        faces: [...document.fonts].map((f) => `${f.family}:${f.status}`),
      };
    });

    expect(state.geist, `Geist must be loaded. Faces: ${state.faces.join(', ')}`).toBe(true);
    expect(fontRequests.some((p) => p.startsWith('/fonts/'))).toBe(true);
  });

  test('Geist is preloaded with crossorigin', async ({ page }) => {
    await goto(page, '/');
    const preload = page.locator('link[rel="preload"][as="font"]');
    await expect(preload).toHaveCount(1);
    // Without crossorigin the browser fetches the font twice, even same-origin.
    await expect(preload).toHaveAttribute('crossorigin', 'anonymous');
    await expect(preload).toHaveAttribute('type', 'font/woff2');
  });

  test('variable font covers every weight the site uses', async ({ page }) => {
    await goto(page, '/');
    const checks = await page.evaluate(async () => {
      await document.fonts.ready;
      // font-medium(500), font-semibold(600), font-bold(700), font-extrabold(800)
      return [400, 500, 600, 700, 800].map((w) => ({
        weight: w,
        ok: document.fonts.check(`${w} 16px Geist`),
      }));
    });
    for (const c of checks) {
      expect(c.ok, `Geist weight ${c.weight} must resolve from the variable font`).toBe(true);
    }
  });
});

test.describe('Images', () => {
  test('hero portrait serves a modern format at the right size', async ({ page }) => {
    const imageRequests: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'image') imageRequests.push(new URL(r.url()).pathname);
    });

    await goto(page, '/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1200);

    const img = page.locator('picture img').first();
    await expect(img).toHaveCount(1);

    const detail = await img.evaluate((el: HTMLImageElement) => ({
      width: el.getAttribute('width'),
      height: el.getAttribute('height'),
      loading: el.getAttribute('loading'),
      fetchpriority: el.getAttribute('fetchpriority'),
      alt: el.getAttribute('alt'),
      currentSrc: el.currentSrc,
      natural: `${el.naturalWidth}x${el.naturalHeight}`,
      complete: el.complete,
    }));

    // Explicit dimensions reserve layout space -> no CLS from the LCP image.
    expect(detail.width, 'width attribute prevents layout shift').toBe('448');
    expect(detail.height, 'height attribute prevents layout shift').toBe('560');
    expect(detail.loading).toBe('eager');
    expect(detail.fetchpriority).toBe('high');
    expect(detail.alt, 'portrait needs descriptive alt text').toBeTruthy();
    expect(detail.alt!.length).toBeGreaterThan(10);
    expect(detail.complete, 'portrait must actually load').toBe(true);

    // Chromium supports AVIF, so <picture> should have negotiated it.
    expect(detail.currentSrc, `chose ${detail.currentSrc}`).toMatch(/\.(avif|webp)$/);

    // The un-cropped 3:2 original must no longer be fetched.
    expect(
      imageRequests.filter((p) => p === '/images/mayank-portrait.jpg'),
      'the oversized original should not be requested'
    ).toEqual([]);
  });

  test('picture element offers AVIF and WebP sources', async ({ page }) => {
    await goto(page, '/');
    const types = await page
      .locator('picture source')
      .evaluateAll((els) => els.map((e) => e.getAttribute('type')));
    expect(types).toContain('image/avif');
    expect(types).toContain('image/webp');
  });

  test('portrait preload matches the format picture will choose', async ({ page }) => {
    await goto(page, '/');
    const preloads = await page
      .locator('link[rel="preload"][as="image"]')
      .evaluateAll((els) =>
        els.map((e) => ({ type: e.getAttribute('type'), srcset: e.getAttribute('imagesrcset') }))
      );
    expect(preloads.length).toBeGreaterThan(0);
    // A bare href preload would download a file <picture> then ignores.
    for (const p of preloads) {
      expect(p.type, 'image preload needs a type for format negotiation').toBeTruthy();
      expect(p.srcset, 'image preload needs imagesrcset').toBeTruthy();
    }
  });

  test('every image has intrinsic dimensions or explicit aspect handling', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      const missing = await page.evaluate(() =>
        [...document.querySelectorAll('img')]
          .filter((i) => !i.getAttribute('width') || !i.getAttribute('height'))
          .map((i) => i.getAttribute('src') || '(no src)')
      );
      expect(missing, `${path} images lacking width/height: ${missing.join(', ')}`).toEqual([]);
    }
  });
});

test.describe('Render-blocking and payload', () => {
  test('no third-party origins are contacted on load', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      const host = new URL(r.url()).host;
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        external.push(host);
      }
    });
    await goto(page, '/');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1200);

    expect(
      [...new Set(external)],
      'the page should be fully self-hosted at load time'
    ).toEqual([]);
  });

  test('zero client-side JS bundles are shipped', async ({ page }) => {
    const scripts: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'script') scripts.push(new URL(r.url()).pathname);
    });
    await goto(page, '/');
    await page.waitForLoadState('load');
    // Astro ships no framework runtime; interactivity is inline is:inline JS.
    expect(scripts, `unexpected external scripts: ${scripts.join(', ')}`).toEqual([]);
  });

  test('layout is stable (CLS) and paints quickly', async ({ page }) => {
    await goto(page, '/');
    await page.waitForLoadState('load');

    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as any[]) {
              if (!e.hadRecentInput) total += e.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(Math.round(total * 1000) / 1000), 2500);
        })
    );
    expect(cls, `CLS ${cls} exceeds the 0.1 "good" threshold`).toBeLessThan(0.1);

    const fcp = await page.evaluate(() => {
      const p = performance.getEntriesByType('paint') as any[];
      return p.find((e) => e.name === 'first-contentful-paint')?.startTime ?? 0;
    });
    // Generous ceiling: this is a local preview, so it guards regressions only.
    expect(fcp, `FCP ${Math.round(fcp)}ms`).toBeLessThan(3000);
  });
});
