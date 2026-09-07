import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('SEO & Accessibility Audits', () => {
  
  test('should have correct SEO Meta Tags', async ({ page }) => {
    await page.goto('/');

    // Check Page Title
    await expect(page).toHaveTitle(/Mayank Raj Jaiswal | Enterprise Security Architect/);

    // Check Meta Description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Enterprise Security Architect/);

    // Check Canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://mayankrajjaiswal.com/');
  });

  test('should have valid JSON-LD Schema', async ({ page }) => {
    await page.goto('/');

    // The homepage emits a ProfilePage whose mainEntity is the Person.
    const jsonLdScript = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLdScript).toBeTruthy();

    const data = JSON.parse(jsonLdScript || '{}');
    expect(data['@type']).toBe('ProfilePage');

    const person = data['mainEntity'];
    expect(person['@type']).toBe('Person');
    expect(person['name']).toBe('Mayank Raj Jaiswal');
    expect(person['jobTitle']).toBe('Enterprise Security Architect');
  });

  test('should pass basic accessibility audits', async ({ page }) => {
    await page.goto('/');

    // target-size is asserted separately below, where the WCAG 2.5.8 inline-link
    // exception is applied to specific selectors rather than to the whole page.
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .disableRules(['target-size'])
      .analyze();

    // Report the rule + selectors on failure instead of dumping whole nodes.
    const summary = accessibilityScanResults.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`
    );

    expect(summary, summary.join('\n')).toEqual([]);
  });

  // WCAG 2.5.8 exempts targets whose function is available via an inline link in
  // a block of text. WebKit reports the header wordmark, the skip link (measured
  // while still sr-only) and the inline /blog link under target-size anyway.
  // Those three are excluded here so the rule still guards genuine controls —
  // buttons, the theme toggle and the mobile drawer — rather than being disabled
  // wholesale. Revisit if the header gains real icon-only controls.
  test('touch targets meet 24px minimum (excluding inline text links)', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['target-size'])
      .exclude('a[href="#main-content"]')
      .exclude('header a[href="/"]')
      .exclude('a[href="/blog"]')
      .analyze();

    const summary = results.violations.flatMap((v) =>
      v.nodes.map((n) => `${v.id}: ${n.target.join(' ')} :: ${n.any[0]?.message ?? ''}`)
    );

    expect(summary, summary.join('\n')).toEqual([]);
  });

});
