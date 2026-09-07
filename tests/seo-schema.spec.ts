import { test, expect } from '@playwright/test';
import { ALL_PAGES, BLOG_SLUGS, goto, isValidOrcidChecksum } from './helpers';

test.describe('Meta tags', () => {
  test('every page has unique, well-formed title/description/canonical', async ({ page }) => {
    const seenTitles = new Map<string, string>();
    const seenDescriptions = new Map<string, string>();

    for (const path of ALL_PAGES) {
      await goto(page, path);
      const meta = await page.evaluate(() => ({
        title: document.title,
        description:
          document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '',
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
        ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? '',
        twitterCard:
          document.querySelector('meta[property="twitter:card"]')?.getAttribute('content') ?? '',
      }));

      expect(meta.title, `${path} title`).toBeTruthy();
      expect(meta.description.length, `${path} description length`).toBeGreaterThan(50);
      expect(meta.canonical, `${path} canonical`).toMatch(/^https:\/\/mayankrajjaiswal\.com\//);
      expect(meta.viewport, `${path} viewport`).toContain('width=device-width');
      expect(meta.ogTitle, `${path} og:title`).toBeTruthy();
      expect(meta.ogImage, `${path} og:image`).toMatch(/^https:\/\//);
      expect(meta.twitterCard, `${path} twitter:card`).toBe('summary_large_image');

      // Duplicate titles/descriptions across pages dilute search relevance.
      const dupTitle = seenTitles.get(meta.title);
      expect(dupTitle, `${path} duplicates title of ${dupTitle}`).toBeUndefined();
      seenTitles.set(meta.title, path);

      const dupDesc = seenDescriptions.get(meta.description);
      expect(dupDesc, `${path} duplicates description of ${dupDesc}`).toBeUndefined();
      seenDescriptions.set(meta.description, path);

      // og:url and canonical must agree, or crawlers get conflicting signals.
      expect(meta.ogUrl, `${path} og:url vs canonical`).toBe(meta.canonical);
    }
  });

  test('no placeholder verification keys are shipped', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      const html = await page.content();
      // These shipped live as literal "YOUR_..._KEY_HERE" values.
      expect(html, `${path} contains a placeholder key`).not.toMatch(/YOUR_[A-Z_]*KEY_HERE/);
      expect(html, `${path} contains REPLACE_WITH token`).not.toContain('REPLACE_WITH_TOKEN');
    }
  });

  test('canonical URLs use trailing slashes consistently', async ({ page }) => {
    for (const path of ALL_PAGES) {
      if (path === '/404/') continue; // not indexed
      await goto(page, path);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(canonical, `${path} canonical must end in /`).toMatch(/\/$/);
    }
  });
});

test.describe('Structured data', () => {
  test('homepage emits valid ProfilePage -> Person graph', async ({ page }) => {
    await goto(page, '/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(raw).toBeTruthy();

    const data = JSON.parse(raw!);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('ProfilePage');

    const person = data.mainEntity;
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Mayank Raj Jaiswal');
    expect(person.jobTitle).toBe('Enterprise Security Architect');
    expect(person.url).toMatch(/^https:\/\/mayankrajjaiswal\.com/);
    expect(person.image).toMatch(/^https:\/\//);
    expect(Array.isArray(person.knowsAbout)).toBe(true);
    expect(person.knowsAbout.length).toBeGreaterThan(3);
    expect(person.worksFor?.name).toBeTruthy();
    expect(Array.isArray(person.alumniOf)).toBe(true);
  });

  /**
   * Regression guard for a real defect: the site shipped an ORCID that fails the
   * ISO 7064 MOD 11-2 check digit every ORCID must satisfy. orcid.org returns
   * HTTP 200 even for non-existent iDs, so a link check would NOT have caught it.
   */
  test('every sameAs URL is well-formed, and any ORCID passes its checksum', async ({ page }) => {
    await goto(page, '/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const person = JSON.parse(raw!).mainEntity;
    const sameAs: string[] = person.sameAs ?? [];

    expect(sameAs.length, 'at least one sameAs profile').toBeGreaterThan(0);

    for (const url of sameAs) {
      expect(url, `${url} must be absolute https`).toMatch(/^https:\/\//);

      const orcidMatch = url.match(/orcid\.org\/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])/);
      if (orcidMatch) {
        expect(
          isValidOrcidChecksum(orcidMatch[1]),
          `ORCID ${orcidMatch[1]} fails its ISO 7064 MOD 11-2 check digit — ` +
            `it cannot be a real iD. Verify at https://pub.orcid.org/v3.0/<id>/person`
        ).toBe(true);
      }
    }
  });

  test('self-test: ORCID checksum validator is correct', () => {
    // Known-valid public ORCID (Josiah Carberry, ORCID's own demo record).
    expect(isValidOrcidChecksum('0000-0002-1825-0097')).toBe(true);
    // The invalid iD that was previously live on this site.
    expect(isValidOrcidChecksum('0009-0005-7281-291X')).toBe(false);
    expect(isValidOrcidChecksum('not-an-orcid')).toBe(false);
  });

  test('blog posts emit TechArticle + BreadcrumbList', async ({ page }) => {
    await goto(page, '/blog/passwordless-fido2-passkeys/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length, 'expected profile + article + breadcrumb blocks').toBeGreaterThanOrEqual(2);

    const types = blocks.map((b) => JSON.parse(b)['@type']);
    expect(types).toContain('TechArticle');
    expect(types).toContain('BreadcrumbList');

    const article = blocks.map((b) => JSON.parse(b)).find((d) => d['@type'] === 'TechArticle');
    expect(article.headline).toBeTruthy();
    expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(article.author?.name).toBe('Mayank Raj Jaiswal');
  });

  test('all JSON-LD on every page is parseable', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      for (const [i, b] of blocks.entries()) {
        expect(() => JSON.parse(b), `${path} JSON-LD block ${i} must parse`).not.toThrow();
      }
    }
  });
});

test.describe('Crawlability', () => {
  test('robots.txt allows crawling and points at the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Allow: /');
    expect(body).toMatch(/Sitemap:\s*https:\/\/mayankrajjaiswal\.com\/sitemap-index\.xml/);
  });

  test('sitemap lists every blog post and excludes 404', async ({ request }) => {
    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);

    const sitemap = await request.get('/sitemap-0.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();

    for (const slug of BLOG_SLUGS) {
      expect(xml, `sitemap must list ${slug}`).toContain(`/blog/${slug}/`);
    }
    expect(xml, 'sitemap must not list the 404 page').not.toMatch(/\/404\/?</);

    // Every sitemap URL should be trailing-slashed, matching canonicals.
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(5);
    for (const loc of locs) {
      expect(loc, `${loc} should end in /`).toMatch(/\/$/);
    }
  });

  test('RSS feed is valid and sorted newest-first', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');

    const xml = await res.text();
    expect(xml).toContain('<rss version="2.0"');

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    expect(items.length, 'every post should appear in the feed').toBe(BLOG_SLUGS.length);

    // Regression guard: rss.xml.ts previously omitted .sort(), so the feed came
    // out in filesystem order.
    const dates = items.map((i) => {
      const d = i.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1];
      return d ? new Date(d).getTime() : 0;
    });
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates, 'RSS items must be newest-first').toEqual(sorted);

    // Links must be trailing-slashed absolute URLs.
    for (const item of items) {
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? '';
      expect(link).toMatch(/^https:\/\/mayankrajjaiswal\.com\/blog\/[^/]+\/$/);
    }
  });
});

test.describe('Internal linking', () => {
  /**
   * Regression guard for the 301 chain: internal hrefs pointed at /blog/foo
   * while the host canonicalises to /blog/foo/, so every internal blog link
   * cost a redirect hop.
   */
  test('no internal link points at a redirecting URL', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const a of document.querySelectorAll('a[href]')) {
          const href = a.getAttribute('href')!;
          if (!href.startsWith('/')) continue;          // external or hash
          if (href.startsWith('/#')) continue;           // same-page anchor
          if (/\.[a-z0-9]{2,5}$/i.test(href)) continue;  // real file (.xml, .txt, .pdf…)
          if (!href.endsWith('/')) out.push(href);
        }
        return out;
      });
      expect(
        bad,
        `${path} has directory links without a trailing slash (each costs a 301): ${bad.join(', ')}`
      ).toEqual([]);
    }
  });

  test('every internal link resolves without redirect or error', async ({ page, request }) => {
    // Deliberately deferred uploads — tracked in README "Known Gaps" and
    // asserted in content.spec.ts. Remove once the files are added.
    const KNOWN_MISSING = ['/resume/resume.pdf', '/resume/mayank_press_kit.zip'];

    await goto(page, '/');
    const links = await page.evaluate(() =>
      [...new Set([...document.querySelectorAll('a[href^="/"]')]
        .map((a) => a.getAttribute('href')!)
        .filter((h) => !h.startsWith('/#')))]
    );
    expect(links.length, 'expected internal links to check').toBeGreaterThan(3);

    for (const href of links) {
      if (KNOWN_MISSING.includes(href)) continue;
      const res = await request.get(href, { maxRedirects: 0 });
      expect(
        res.status(),
        `${href} returned ${res.status()} — expected 200 with no redirect hop`
      ).toBe(200);
    }
  });

  test('all same-page anchor targets exist', async ({ page }) => {
    await goto(page, '/');
    const missing = await page.evaluate(() => {
      const out: string[] = [];
      for (const a of document.querySelectorAll('a[href*="#"]')) {
        const href = a.getAttribute('href')!;
        const id = href.slice(href.indexOf('#') + 1);
        if (!id) continue;
        if (!document.getElementById(id)) out.push(href);
      }
      return out;
    });
    expect(missing, `anchors with no matching id: ${missing.join(', ')}`).toEqual([]);
  });

  test('external links are safely attributed', async ({ page }) => {
    await goto(page, '/');
    const unsafe = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="http"]')]
        .filter((a) => !a.getAttribute('href')!.includes('mayankrajjaiswal.com'))
        .filter((a) => {
          const rel = a.getAttribute('rel') || '';
          return a.getAttribute('target') === '_blank' && !rel.includes('noopener');
        })
        .map((a) => a.getAttribute('href')!)
    );
    expect(unsafe, 'target=_blank links need rel="noopener"').toEqual([]);
  });
});
