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

    // Fetch JSON-LD script content
    const jsonLdScript = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdScript).toBeTruthy();

    const data = JSON.parse(jsonLdScript || '{}');
    expect(data['@type']).toBe('Person');
    expect(data['name']).toBe('Mayank Raj Jaiswal');
    expect(data['jobTitle']).toBe('Enterprise Security Architect');
  });

  test('should pass basic accessibility audits', async ({ page }) => {
    await page.goto('/');
    
    // Inject and run axe-core accessibility checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

});
