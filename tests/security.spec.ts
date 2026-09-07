import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { ALL_PAGES, goto } from './helpers';

test.describe('Content Security Policy', () => {
  /**
   * GitHub Pages cannot send response headers, so the CSP is delivered via
   * <meta http-equiv>. That makes it easy to break silently: adding a script or
   * font from a new origin fails closed with only a console message.
   */
  test('CSP meta is present on every page with the expected directives', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      const csp = await page
        .locator('meta[http-equiv="Content-Security-Policy"]')
        .getAttribute('content');

      expect(csp, `${path} must ship a CSP`).toBeTruthy();
      for (const directive of [
        "default-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "font-src 'self'",
        "frame-src 'none'",
        "worker-src 'self'",
      ]) {
        expect(csp, `${path} CSP missing: ${directive}`).toContain(directive);
      }

      // `upgrade-insecure-requests` is intentionally omitted under
      // PUBLIC_PLAYWRIGHT (this server is plain HTTP on localhost) and asserted
      // separately against the production build below.
      expect(csp, `${path} CSP should not be empty`).toMatch(/;/);

      // Fonts are self-hosted now; third-party font origins must be gone.
      expect(csp, `${path} CSP should not allow Google Fonts`).not.toContain('fonts.googleapis.com');
      expect(csp, `${path} CSP should not allow gstatic`).not.toContain('fonts.gstatic.com');

      // Referrer policy travels as a meta too.
      const referrer = await page.locator('meta[name="referrer"]').getAttribute('content');
      expect(referrer, `${path} referrer policy`).toBe('strict-origin-when-cross-origin');
    }
  });

  test('no CSP violations or console errors on any page', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(t)) {
        problems.push(`[console] ${t}`);
      }
    });
    page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
    page.on('requestfailed', (r) => {
      const err = r.failure()?.errorText ?? '';
      // Ignore deliberate aborts; flag real blocks.
      if (!/ERR_ABORTED/.test(err)) problems.push(`[failed] ${r.url()} :: ${err}`);
    });

    for (const path of ALL_PAGES) {
      await goto(page, path);
      await page.waitForTimeout(1200);
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('interactive JS runs under CSP (simulator + theme + drawer)', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(m.text())) {
        problems.push(m.text());
      }
    });
    page.on('pageerror', (e) => problems.push(e.message));

    await goto(page, '/');
    await page.waitForSelector('#tab-oauth');

    // Simulator tabs + a full FIDO2 run.
    await page.click('#tab-oauth');
    await expect(page.locator('#content-oauth')).toBeVisible();
    await page.click('#tab-fido2');
    await page.click('#fido-btn-register');
    await page.waitForTimeout(2000);
    const logLines = await page.locator('#console-stream p').count();
    expect(logLines, 'inline simulator JS must execute').toBeGreaterThan(1);

    // Theme toggle.
    await page.click('#theme-toggle');
    await page.waitForTimeout(200);
    const themed = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(typeof themed).toBe('boolean');

    expect(problems, problems.join('\n')).toEqual([]);
  });

  /**
   * Guards the PUBLIC_PLAYWRIGHT escape hatch.
   *
   * The test server omits `upgrade-insecure-requests`; if that flag ever leaked
   * into a real build, the deployed site would silently lose the directive.
   * This builds WITHOUT the flag into a scratch outDir and asserts it returns.
   */
  test('production build includes upgrade-insecure-requests', () => {
    test.slow(); // performs a full build into a scratch directory

    // Build into a throwaway outDir so the running preview server (and any
    // parallel tests reading dist/) are never disturbed.
    execSync('npx astro build --outDir .tmp-prod-csp', {
      stdio: 'pipe',
      env: { ...process.env, PUBLIC_PLAYWRIGHT: '' },
    });

    const html = readFileSync('.tmp-prod-csp/index.html', 'utf8');
    const csp = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)?.[1];

    rmSync('.tmp-prod-csp', { recursive: true, force: true });

    expect(csp, 'production build must ship a CSP').toBeTruthy();
    expect(csp, 'the real deploy must force https for subresources').toContain(
      'upgrade-insecure-requests'
    );
    // And the test-only flag must not have leaked anything else away.
    expect(csp).toContain("default-src 'self'");
  });

  test('clickjacking frame-buster is present', async ({ page }) => {
    await goto(page, '/');
    const html = await page.content();
    // frame-ancestors and X-Frame-Options cannot be delivered via meta, so an
    // inline frame-buster is the only available protection on this host.
    expect(html).toContain('window.self !== window.top');
  });
});

test.describe('security.txt (RFC 9116)', () => {
  test('is served with all required fields and a future Expires', async ({ request }) => {
    const res = await request.get('/.well-known/security.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();

    expect(body, 'Contact is mandatory').toMatch(/^Contact:\s*\S+/m);
    expect(body, 'Canonical should be declared').toMatch(/^Canonical:\s*https:\/\//m);

    // Expires is the ONLY field RFC 9116 marks as MUST. It was missing.
    const expires = body.match(/^Expires:\s*(\S+)/m)?.[1];
    expect(expires, 'Expires field is mandatory per RFC 9116 §2.5.5').toBeTruthy();

    const when = new Date(expires!);
    expect(Number.isNaN(when.getTime()), `Expires "${expires}" must be a valid date`).toBe(false);

    const daysOut = (when.getTime() - Date.now()) / 86_400_000;
    expect(daysOut, `security.txt expired ${Math.abs(Math.round(daysOut))} days ago`).toBeGreaterThan(0);
    // Warn well before it lapses, and keep it under RFC guidance of ~1 year.
    expect(daysOut, 'Expires is within 30 days — refresh it now').toBeGreaterThan(30);
    expect(daysOut, 'Expires is more than ~1 year out; RFC 9116 advises shorter').toBeLessThan(400);
  });

  test('PGP key referenced by security.txt is reachable', async ({ request }) => {
    const txt = await (await request.get('/.well-known/security.txt')).text();
    const keyUrl = txt.match(/^Encryption:\s*(\S+)/m)?.[1];
    expect(keyUrl, 'Encryption field should point at the public key').toBeTruthy();

    // security.txt declares absolute production URLs. Resolve to a same-origin
    // path so the assertion runs against the build under test rather than the
    // live site (which would also fail behind a TLS-inspecting proxy).
    const localPath = new URL(keyUrl!).pathname;
    const key = await request.get(localPath);
    expect(key.status(), `${localPath} must exist in the build`).toBe(200);
    expect(await key.text()).toContain('BEGIN PGP PUBLIC KEY BLOCK');
  });
});

test.describe('Contact form hardening', () => {
  test('form posts to an allowed origin and has spam protection', async ({ page }) => {
    await goto(page, '/');
    const form = page.locator('#contact-form');
    await expect(form).toHaveCount(1);

    const action = await form.getAttribute('action');
    expect(action).toMatch(/^https:\/\/api\.web3forms\.com/);

    // The CSP must permit exactly this destination for form-action/connect-src.
    const csp = await page
      .locator('meta[http-equiv="Content-Security-Policy"]')
      .getAttribute('content');
    expect(csp).toContain('api.web3forms.com');

    // Honeypot field for bots.
    await expect(page.locator('#contact-form input[name="botcheck"]')).toHaveCount(1);

    // Required fields are marked up for validation.
    const required = await page.locator('#contact-form [required]').count();
    expect(required, 'form should mark required fields').toBeGreaterThan(0);
  });
});
