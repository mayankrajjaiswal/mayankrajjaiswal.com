import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { goto, CASE_STUDY_SLUGS } from './helpers';

test.describe('Media & Press section', () => {
  test('renders with at least one verifiable appearance', async ({ page }) => {
    await goto(page, '/');
    const section = page.locator('#media');
    await expect(section).toHaveCount(1);

    const cards = section.locator('[data-glow]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('every media item with a url links out safely', async ({ page }) => {
    await goto(page, '/');
    const links = page.locator('#media a[href^="http"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = await link.getAttribute('rel');
      expect(rel, 'external media links need rel="noopener"').toContain('noopener');
    }
  });
});

test.describe('Advisory & Recognition section', () => {
  test('renders recognition cards', async ({ page }) => {
    await goto(page, '/');
    const section = page.locator('#recognition');
    await expect(section).toHaveCount(1);
    expect(await section.locator('h3').count()).toBeGreaterThan(0);
  });
});

test.describe('Now & Uses pages', () => {
  test('/now/ renders with a single h1 and dated content', async ({ page }) => {
    await goto(page, '/now/');
    await expect(page.locator('h1')).toHaveText('Now');
    expect(await page.locator('main').count()).toBe(1);
  });

  test('/uses/ renders with a single h1 and category sections', async ({ page }) => {
    await goto(page, '/uses/');
    await expect(page.locator('h1')).toHaveText('Uses');
    expect(await page.locator('main section h2').count()).toBeGreaterThan(0);
  });

  test('both pages are linked from the footer', async ({ page }) => {
    await goto(page, '/');
    await expect(page.locator('footer a[href="/now/"]')).toHaveCount(1);
    await expect(page.locator('footer a[href="/uses/"]')).toHaveCount(1);
  });
});

test.describe('Blog tag archive routes', () => {
  test('a tag link on the blog index resolves to a real archive page', async ({ page, request }) => {
    await goto(page, '/blog/');
    const tagLink = page.locator('a[href^="/blog/tag/"]').first();
    await expect(tagLink).toHaveCount(1);

    const href = await tagLink.getAttribute('href');
    const res = await request.get(href!);
    expect(res.status(), `${href} must resolve`).toBe(200);
  });

  test('tag archive page lists only posts carrying that tag', async ({ page }) => {
    await goto(page, '/blog/tag/iam/');
    await expect(page.locator('h1')).toHaveText('IAM');

    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test('tag archive page is discoverable from the sitemap', async ({ request }) => {
    const sitemap = await request.get('/sitemap-0.xml');
    const xml = await sitemap.text();
    expect(xml).toContain('/blog/tag/iam/');
  });
});

test.describe('Project case studies', () => {
  for (const slug of CASE_STUDY_SLUGS) {
    test(`/projects/${slug}/ renders a full case study`, async ({ page }) => {
      await goto(page, `/projects/${slug}/`);

      await expect(page.locator('h1')).toHaveCount(1);
      const headings = await page.locator('article h2').allTextContents();
      for (const required of ['The Problem', 'Constraints', 'Approach', 'Outcome', 'Technologies']) {
        expect(headings, `${slug} is missing an "${required}" section`).toContain(required);
      }
    });
  }

  test('case studies are linked from their project card on the homepage', async ({ page }) => {
    await goto(page, '/');
    const caseStudyLinks = page.locator('#projects a[href^="/projects/"]');
    expect(await caseStudyLinks.count()).toBe(CASE_STUDY_SLUGS.length);
  });

  test('every case-study project card link resolves without a redirect', async ({ page, request }) => {
    await goto(page, '/');
    const hrefs = await page.locator('#projects a[href^="/projects/"]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href'))
    );
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const res = await request.get(href!, { maxRedirects: 0 });
      expect(res.status(), `${href} must resolve directly`).toBe(200);
    }
  });
});

test.describe('Book & scholarly-article structured data', () => {
  test('homepage emits a Book node with a verifiable publisher link', async ({ page }) => {
    await goto(page, '/');
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = scripts.map((s) => JSON.parse(s));

    const book = nodes.find((n) => n['@type'] === 'Book');
    expect(book, 'homepage must emit a Book JSON-LD node').toBeTruthy();
    expect(book.name).toContain('Implementing Enterprise Cybersecurity');
    expect(book.url).toMatch(/^https:\/\//);
    expect(book.author['@id']).toBe('https://mayankrajjaiswal.com/#person');
  });

  test('homepage emits a ScholarlyArticle node linking to IEEE Xplore', async ({ page }) => {
    await goto(page, '/');
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = scripts.map((s) => JSON.parse(s));

    const article = nodes.find((n) => n['@type'] === 'ScholarlyArticle');
    expect(article, 'homepage must emit a ScholarlyArticle JSON-LD node').toBeTruthy();
    expect(article.url).toContain('ieeexplore.ieee.org');
  });

  test('blog posts do not duplicate the Book/ScholarlyArticle nodes', async ({ page }) => {
    await goto(page, '/blog/passwordless-fido2-passkeys/');
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = scripts.map((s) => JSON.parse(s));
    expect(nodes.some((n) => n['@type'] === 'Book')).toBe(false);
  });

  test('research section links out to the real publisher and IEEE Xplore', async ({ page }) => {
    await goto(page, '/');
    const researchSection = page.locator('#research');
    await expect(researchSection.getByRole('link', { name: /View Publication/ }).first()).toHaveCount(1);

    const hrefs = await researchSection.locator('a[href^="http"]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href'))
    );
    expect(hrefs.some((h) => h?.includes('riverpublishers.com'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('ieeexplore.ieee.org'))).toBe(true);
  });
});

test.describe('Content accuracy fixes', () => {
  test('book title is corrected everywhere it appears', () => {
    for (const file of ['src/data/research.ts', 'public/llms.txt']) {
      const src = readFileSync(file, 'utf8');
      expect(src, `${file} still contains the old mis-title`).not.toContain('Cybersecurity Handbook');
      expect(src, `${file} should contain the real book title`).toContain(
        'Implementing Enterprise Cybersecurity'
      );
    }
  });

  test('humans.txt claims WCAG 2.2 AA, not AAA', () => {
    const src = readFileSync('public/humans.txt', 'utf8');
    expect(src, 'humans.txt should not overclaim AAA compliance').not.toMatch(/WCAG\s+AAA/);
    expect(src).toMatch(/WCAG\s+2\.2\s+AA/);
  });

  test('llms.txt blog links are all trailing-slashed', () => {
    const src = readFileSync('public/llms.txt', 'utf8');
    const blogUrls = [...src.matchAll(/https:\/\/mayankrajjaiswal\.com\/blog\/[a-z0-9-]+/g)].map((m) => m[0]);
    expect(blogUrls.length).toBeGreaterThan(0);
    for (const url of blogUrls) {
      const followedByChar = src[src.indexOf(url) + url.length];
      expect(
        followedByChar === '/',
        `llms.txt blog URL is missing a trailing slash: ${url}`
      ).toBe(true);
    }
  });
});

test.describe('Projects data links', () => {
  test('every project url or caseStudySlug resolves without a redirect', async ({ request }) => {
    const src = readFileSync('src/data/projects.ts', 'utf8');
    const slugs = [...src.matchAll(/caseStudySlug:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(slugs.length).toBe(CASE_STUDY_SLUGS.length);
    for (const slug of slugs) {
      expect(CASE_STUDY_SLUGS as readonly string[]).toContain(slug);
      const res = await request.get(`/projects/${slug}/`);
      expect(res.status()).toBe(200);
    }
  });
});
