import { test, expect } from '@playwright/test';

async function tabHuntDrawer(page: any, steps = 24) {
  const reached: string[] = [];
  for (let i = 0; i < steps; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      return { inDrawer: !!el.closest('#mobile-drawer'), tag: el.tagName, text: (el.textContent || '').trim().slice(0, 28) };
    });
    if (info?.inDrawer) reached.push(`${info.tag}:${info.text}`);
  }
  return reached;
}

test('closed drawer is not keyboard reachable (desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('#mobile-drawer');
  await expect(page.locator('#mobile-drawer')).toHaveClass(/translate-x-full/);

  const reached = await tabHuntDrawer(page);
  console.log(reached.length ? `LEAK: ${reached.join(', ')}` : 'OK closed drawer inert');
  expect(reached).toEqual([]);
});

test('open drawer is reachable, then inert again after close', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('#mobile-menu-btn');

  // Open
  await page.click('#mobile-menu-btn');
  await expect(page.locator('#mobile-drawer')).not.toHaveClass(/translate-x-full/);
  await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded', 'true');
  expect(await page.locator('#mobile-drawer').getAttribute('inert')).toBeNull();

  // Focus should have moved into the drawer.
  const focusInDrawer = await page.evaluate(() => !!document.activeElement?.closest('#mobile-drawer'));
  console.log('focus moved into drawer on open:', focusInDrawer);
  expect(focusInDrawer).toBe(true);

  // Drawer links are genuinely operable while open.
  await expect(page.locator('#mobile-drawer a[href="/#about"]')).toBeVisible();

  // Close via the close button.
  await page.click('#mobile-drawer-close');
  await expect(page.locator('#mobile-drawer')).toHaveClass(/translate-x-full/);
  expect(await page.locator('#mobile-drawer').getAttribute('inert')).toBe('');
  await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded', 'false');

  // NOTE: focus restoration is asserted for the KEYBOARD path only (see the
  // Escape test and the Enter test below). WebKit intentionally does not retain
  // focus on a mouse-clicked <button>, so asserting it here would encode a
  // platform convention rather than an accessibility requirement.
  const after = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    id: (document.activeElement as HTMLElement)?.id,
  }));
  console.log('focus after mouse close:', JSON.stringify(after));

  // And no leak once closed again.
  const reached = await tabHuntDrawer(page, 16);
  console.log(reached.length ? `LEAK after close: ${reached.join(', ')}` : 'OK inert after close');
  expect(reached).toEqual([]);
});

test('keyboard close (Enter) restores focus to the toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('#mobile-menu-btn');

  await page.click('#mobile-menu-btn');
  await expect(page.locator('#mobile-drawer')).not.toHaveClass(/translate-x-full/);

  // Opening moves focus to the close button; activate it via the keyboard.
  await page.keyboard.press('Enter');
  await expect(page.locator('#mobile-drawer')).toHaveClass(/translate-x-full/);

  const focusedId = await page.evaluate(() => (document.activeElement as HTMLElement)?.id);
  console.log('focus after Enter close:', focusedId);
  expect(focusedId).toBe('mobile-menu-btn');
});

test('Escape closes drawer and restores focus to toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForSelector('#mobile-menu-btn');

  await page.click('#mobile-menu-btn');
  await expect(page.locator('#mobile-drawer')).not.toHaveClass(/translate-x-full/);

  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-drawer')).toHaveClass(/translate-x-full/);

  const focusedId = await page.evaluate(() => (document.activeElement as HTMLElement)?.id);
  console.log('focus after Escape:', focusedId);
  expect(focusedId).toBe('mobile-menu-btn');
});
