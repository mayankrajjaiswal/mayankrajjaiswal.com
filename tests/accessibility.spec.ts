import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALL_PAGES, THEMES, goto, applyTheme, summarize } from './helpers';

/**
 * Full WCAG 2.2 AA sweep across every route in both themes.
 *
 * Previously only the homepage in its default theme was audited, which let six
 * colour-contrast failures survive on blog pages and in dark mode. The matrix
 * below is the regression guard for that gap.
 */
test.describe('WCAG 2.2 AA — every page, both themes', () => {
  for (const path of ALL_PAGES) {
    for (const theme of THEMES) {
      test(`${path} [${theme}]`, async ({ page }) => {
        await goto(page, path);
        await applyTheme(page, theme);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          // Asserted separately in touch-targets.spec.ts, where the WCAG 2.5.8
          // inline-text-link exception is applied to named selectors.
          .disableRules(['target-size'])
          .analyze();

        const found = summarize(results.violations);
        expect(found, found.join('\n')).toEqual([]);
      });
    }
  }
});

test.describe('Contrast rules that previously regressed', () => {
  /**
   * `text-slate-400 dark:text-slate-500` measures 2.56:1 in light and 4.23:1 in
   * dark — it fails in BOTH themes, so it is banned outright. Same for
   * `slate-500` paired with itself. Catching this in the built HTML is faster
   * and more precise than waiting for axe to find the rendered result.
   */
  test('no banned colour pairings in built markup', async ({ page }) => {
    const banned = [
      'text-slate-400 dark:text-slate-500',
      'text-slate-500 dark:text-slate-500',
      'text-slate-400 dark:text-slate-600',
    ];

    for (const path of ALL_PAGES) {
      await goto(page, path);
      const html = await page.content();
      for (const cls of banned) {
        // The decorative portrait placeholder is exempt: it is an aria-hidden
        // SVG behind the image, not text.
        const occurrences = html.split(cls).length - 1;
        const allowed = cls === 'text-slate-400 dark:text-slate-600' ? 1 : 0;
        expect(
          occurrences,
          `"${cls}" appears ${occurrences}x on ${path} (max ${allowed}). ` +
            `Use text-slate-600 dark:text-slate-400 instead — see DESIGN_SYSTEM.md §10.`
        ).toBeLessThanOrEqual(allowed);
      }
    }
  });

  /**
   * The simulator switcher was two bare <button>s with no ARIA tab semantics
   * and no aria-selected/aria-controls -- a screen-reader user got two
   * unlabelled buttons with no indication which was active (WCAG 4.1.2).
   */
  test('simulator tabs expose full ARIA tab pattern and respond to arrow keys', async ({ page }) => {
    await goto(page, '/');

    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toHaveCount(1);

    const fidoTab = page.locator('#tab-fido2');
    const oauthTab = page.locator('#tab-oauth');
    await expect(fidoTab).toHaveAttribute('role', 'tab');
    await expect(oauthTab).toHaveAttribute('role', 'tab');
    await expect(fidoTab).toHaveAttribute('aria-controls', 'content-fido2');
    await expect(oauthTab).toHaveAttribute('aria-controls', 'content-oauth');

    // FIDO2 tab selected by default.
    await expect(fidoTab).toHaveAttribute('aria-selected', 'true');
    await expect(oauthTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#content-fido2')).toHaveAttribute('role', 'tabpanel');
    await expect(page.locator('#content-oauth')).toHaveAttribute('role', 'tabpanel');

    // Arrow-key navigation switches the active tab (WAI-ARIA tab pattern).
    await fidoTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(oauthTab).toHaveAttribute('aria-selected', 'true');
    await expect(fidoTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#content-oauth')).toBeVisible();
    await expect(page.locator('#content-fido2')).toBeHidden();
  });

  /**
   * Every status update in the simulator (registration progress, terminal
   * log lines) was silent to assistive tech -- aria-live was absent from the
   * entire codebase. Same gap existed on the contact form's error/success
   * regions.
   */
  test('live regions exist for simulator status, terminal log, and contact form', async ({ page }) => {
    await goto(page, '/');

    await expect(page.locator('#fido-status-text')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('#oauth-status-text')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('#console-stream')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('#console-stream')).toHaveAttribute('role', 'log');

    await expect(page.locator('#contact-form-error')).toHaveAttribute('aria-live', 'assertive');
    await expect(page.locator('#contact-form-success')).toHaveAttribute('aria-live', 'polite');
  });

  /**
   * The header's scroll-spy IntersectionObserver used to watch every
   * <section id>, including several (Media, Recognition, Timeline,
   * SecuritySimulator, ...) with no corresponding nav link. Scrolling into any
   * of those matched no link and cleared every nav item's active state, so
   * the header looked broken mid-page. It should now only watch sections a
   * nav link actually points at, and never de-highlight everything.
   */
  test('scroll-spy does not clear the active nav item when scrolling into an untracked section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page, '/');

    // The observer's rootMargin ('-20% 0px -60% 0px') only fires within a
    // narrow central band relative to the *viewport*, so a section much
    // taller than the viewport (e.g. #projects, a long card grid) only ever
    // has a sliver inside that band and can fail the 0.1 intersection
    // threshold outright -- that's a pre-existing property of this observer
    // setup, unrelated to the fix under test. Use #research (short, tracked)
    // and #media (short, untracked) so the scroll lands solidly inside each.
    const scrollSectionToCenter = async (id: string) => {
      await page.evaluate((sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) throw new Error(`#${sectionId} not found`);
        const rect = el.getBoundingClientRect();
        // rect.top is viewport-relative; add the current scroll offset to get
        // the section's absolute document position, then scroll so its
        // vertical center lands at 30% down the viewport -- inside the
        // observer's visible band (rootMargin '-20% 0px -60% 0px' keeps only
        // roughly the 20%-40% vertical slice of the viewport "visible" to it).
        const absoluteCenter = window.scrollY + rect.top + rect.height / 2;
        window.scrollTo(0, absoluteCenter - window.innerHeight * 0.3);
      }, id);
    };

    // Poll rather than a single fixed wait: the observer callback fires
    // asynchronously, and CI/parallel-worker CPU contention (documented in
    // CLAUDE.md as a known cause of flakiness on this suite) can push that
    // past a short fixed timeout even though the app itself is correct.
    const activeNavLinkCount = () => page.locator('[data-nav-link].font-semibold').count();

    await scrollSectionToCenter('research');
    await expect
      .poll(activeNavLinkCount, { message: 'a tracked section should have an active nav link', timeout: 5_000 })
      .toBeGreaterThan(0);

    // #media has no corresponding header nav link.
    await scrollSectionToCenter('media');
    // A brief settle so any (incorrect) clearing has time to happen before we
    // assert it didn't -- unlike the "greater than 0" check above, there is no
    // later state to poll toward if this one is wrong.
    await page.waitForTimeout(600);
    const activeInUntracked = await page.locator('[data-nav-link].font-semibold').count();
    expect(
      activeInUntracked,
      'nav should keep its last active item while scrolled through an untracked section, not clear it'
    ).toBeGreaterThan(0);
  });

  /** Interactive states are only reachable via JS, so axe cannot find them cold. */
  test('simulator tab states pass contrast in both themes', async ({ page }) => {
    for (const theme of THEMES) {
      await goto(page, '/');
      await applyTheme(page, theme);

      for (const tab of ['#tab-oauth', '#tab-fido2']) {
        await page.click(tab);
        await page.waitForTimeout(150);
        const results = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze();
        const found = summarize(results.violations);
        expect(found, `after clicking ${tab} in ${theme}:\n${found.join('\n')}`).toEqual([]);
      }
    }
  });
});

test.describe('Document structure', () => {
  test('exactly one h1 per page, no skipped heading levels', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);

      const info = await page.evaluate(() => {
        const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
          level: Number(h.tagName[1]),
          text: (h.textContent || '').trim().slice(0, 50),
        }));
        const skips: string[] = [];
        for (let i = 1; i < hs.length; i++) {
          if (hs[i].level - hs[i - 1].level > 1) {
            skips.push(`h${hs[i - 1].level} -> h${hs[i].level} at "${hs[i].text}"`);
          }
        }
        return {
          h1s: hs.filter((h) => h.level === 1).map((h) => h.text),
          skips,
          lang: document.documentElement.lang,
          landmarks: {
            main: document.querySelectorAll('main').length,
            nav: document.querySelectorAll('nav').length,
          },
          imagesMissingAlt: [...document.querySelectorAll('img')].filter(
            (i) => !i.hasAttribute('alt')
          ).length,
        };
      });

      expect(info.h1s, `${path} h1 count (found: ${JSON.stringify(info.h1s)})`).toHaveLength(1);
      expect(info.skips, `${path} heading skips`).toEqual([]);
      expect(info.lang, `${path} lang attribute`).toBe('en');
      expect(info.landmarks.main, `${path} <main> landmark`).toBe(1);
      expect(info.imagesMissingAlt, `${path} images missing alt`).toBe(0);
    }
  });

  /**
   * The visible hero headline must BE the h1. It was previously a <p> with a
   * separate sr-only h1, so the largest text on the page carried no semantic
   * weight.
   */
  test('homepage h1 is the visible headline and names the entity', async ({ page }) => {
    await goto(page, '/');

    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    const detail = await h1.evaluate((el) => ({
      accessibleText: (el.textContent || '').replace(/\s+/g, ' ').trim(),
      fontSize: parseFloat(getComputedStyle(el).fontSize),
      isSrOnly: el.classList.contains('sr-only'),
      visibleText: (el.innerText || '').replace(/\s+/g, ' ').trim(),
    }));

    expect(detail.isSrOnly, 'h1 must not be visually hidden').toBe(false);
    expect(detail.accessibleText).toContain('Mayank Raj Jaiswal');
    expect(detail.accessibleText).toContain('Building Trust');
    // Visually dominant: comfortably larger than body copy.
    expect(detail.fontSize, 'h1 rendered font size').toBeGreaterThan(24);
    // The design headline must still be visible, not hidden behind aria tricks.
    expect(detail.visibleText).toContain('Building Trust');
  });

  test('blog posts have no duplicate h1 from MDX content', async ({ page }) => {
    for (const path of ALL_PAGES.filter((p) => p.startsWith('/blog/') && p !== '/blog/')) {
      await goto(page, path);
      const h1s = await page.locator('h1').allTextContents();
      expect(h1s, `${path} should have exactly one h1, got ${h1s.length}`).toHaveLength(1);
      // The article body should start at h2, not repeat the title.
      const articleH1 = await page.locator('article h1').count();
      expect(articleH1, `${path} article body must not contain its own h1`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('Keyboard operability', () => {
  /**
   * Exercised across every route, not just '/'. A prior regression on /404/
   * (no id="main-content" on its <main>) passed CI because this test only ever
   * checked the homepage — the skip link resolved on every page except one.
   */
  for (const path of ALL_PAGES) {
    test(`skip link works on ${path}`, async ({ page }) => {
      await goto(page, path);

      const skip = page.locator('a[href="#main-content"]');
      await expect(skip, `${path}: a skip link must exist`).toHaveCount(1);

      await expect(
        page.locator('#main-content'),
        `${path}: skip link target #main-content must exist`
      ).toHaveCount(1);

      // It must be the first focusable element in the DOM, so it is reachable
      // before the nav. (WebKit omits links from sequential tab order unless
      // the user enables "Press Tab to highlight each item", so pressing Tab
      // is not a portable way to assert this — focus it directly instead.)
      const isFirstFocusable = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        return focusable[0]?.getAttribute('href') === '#main-content';
      });
      expect(isFirstFocusable, `${path}: skip link must be the first focusable element`).toBe(true);

      // Visually hidden until focused, then clearly visible.
      const before = await skip.evaluate((el) => el.getBoundingClientRect().height);
      expect(before, `${path}: skip link should be visually hidden when unfocused`).toBeLessThan(2);

      await skip.focus();
      const after = await skip.evaluate((el) => el.getBoundingClientRect().height);
      expect(after, `${path}: skip link must become visible on focus`).toBeGreaterThan(20);

      // And it actually moves focus into the main landmark.
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeVisible();
      expect(new URL(page.url()).hash).toBe('#main-content');
    });
  }

  test('all interactive elements have an accessible name', async ({ page }) => {
    for (const path of ALL_PAGES) {
      await goto(page, path);
      const unnamed = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('a,button,input,select,textarea')) {
          if (el.closest('#mobile-drawer')) continue;
          const type = el.getAttribute('type');
          if (type === 'hidden') continue;
          // Skip anything genuinely removed from the a11y tree (e.g. the
          // display:none anti-spam honeypot): it is unreachable by definition.
          if (el.getAttribute('aria-hidden') === 'true') continue;
          if ((el as HTMLElement).offsetParent === null && getComputedStyle(el).position !== 'fixed') {
            continue;
          }
          const name =
            (el.getAttribute('aria-label') || '').trim() ||
            (el.textContent || '').trim() ||
            (el.getAttribute('title') || '').trim() ||
            (el.getAttribute('placeholder') || '').trim() ||
            (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim()) ||
            '';
          if (!name) out.push(`${el.tagName}#${el.id || '(no id)'}`);
        }
        return out;
      });
      expect(unnamed, `${path} elements without accessible names`).toEqual([]);
    }
  });
});
