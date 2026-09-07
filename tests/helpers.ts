import type { Page } from '@playwright/test';

/**
 * Every route the site publishes, used to drive per-page test matrices.
 *
 * Paths are trailing-slashed to match `trailingSlash: 'always'` in
 * astro.config.mjs — requesting '/404' (no slash) returns a real 404 rather
 * than the 404 page itself.
 */
export const ALL_PAGES = [
  '/',
  '/blog/',
  '/blog/passwordless-fido2-passkeys/',
  '/blog/zero-trust-multi-cloud-architecture/',
  '/404/',
] as const;

/** Blog post slugs, mirroring src/content/blog/*.mdx. */
export const BLOG_SLUGS = [
  'future-of-iam-and-ai',
  'hardening-mobile-payments-tokenization-knox',
  'passwordless-fido2-passkeys',
  'pkcs11-hsm-envelope-encryption-architecture',
  'post-quantum-cryptography-pki-migration',
  'securing-ai-pipelines-threat-modeling',
  'zero-trust-multi-cloud-architecture',
] as const;

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/**
 * Kills transitions and animations.
 *
 * Required before any colour-contrast assertion that follows a theme switch:
 * axe samples computed colours, and mid-transition it reads blended values that
 * belong to neither theme, producing failures that do not exist in either.
 */
export const NO_MOTION_CSS =
  '*, *::before, *::after { transition: none !important; animation: none !important; }';

/**
 * Navigate and settle.
 *
 * Uses `commit` rather than `load`/`networkidle` on purpose: the service worker
 * holds a connection open, so the page never reaches network idle and those
 * wait states time out.
 */
export async function goto(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'commit' });
  await page.waitForLoadState('domcontentloaded');
}

/** Apply a theme deterministically, with motion disabled. */
export async function applyTheme(page: Page, theme: Theme) {
  await page.evaluate((t) => {
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, theme);
  await page.addStyleTag({ content: NO_MOTION_CSS });
  await page.waitForTimeout(250);
}

/** Compact one-line-per-violation summary, so failures are readable in CI. */
export function summarize(violations: any[]): string[] {
  return violations.flatMap((v) =>
    v.nodes.map(
      (n: any) =>
        `${v.id} [${v.impact}] ${n.target.join(' ')} :: ${(n.any?.[0]?.message ?? '').slice(0, 160)}`
    )
  );
}

/**
 * Validates an ORCID iD's ISO 7064 MOD 11-2 check digit.
 *
 * Exists because an ORCID that failed this check was live in the site's JSON-LD
 * `sameAs`; the ORCID web page returns HTTP 200 even for non-existent iDs, so
 * only the checksum reliably catches a malformed one.
 */
export function isValidOrcidChecksum(orcid: string): boolean {
  const digits = orcid.replace(/-/g, '');
  if (!/^\d{15}[\dX]$/.test(digits)) return false;
  let total = 0;
  for (const ch of digits.slice(0, 15)) total = (total + Number(ch)) * 2;
  const remainder = (12 - (total % 11)) % 11;
  return (remainder === 10 ? 'X' : String(remainder)) === digits[15];
}
