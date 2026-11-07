import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Keep e2e deterministic and offline-first: never call the live auth backend.
  await page.route(/https:\/\/[^/]*supabase\.co\//, (route) => route.abort());
});

test('boots a local workspace, captures text, and survives reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Welcome to OS-GOD' })).toBeVisible({ timeout: 20_000 });

  await page.keyboard.press('Control+n');
  const capture = page.getByRole('dialog', { name: 'Quick capture' });
  await expect(capture).toBeVisible();
  await capture.getByLabel('Capture title').fill('E2E persistent note');
  await capture.getByLabel('Capture body').fill('Stored in IndexedDB, not a mock.');
  await capture.getByRole('button', { name: 'Save locally' }).click();

  await expect(page.getByRole('dialog', { name: 'E2E persistent note' })).toBeVisible();
  await page.reload();
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  await palette.getByLabel('Search commands').fill('E2E persistent note');
  await expect(palette.getByRole('option', { name: /E2E persistent note/ })).toBeVisible();
});

test('command palette opens settings and exposes GitHub auth setup', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'Welcome to OS-GOD' })).toBeVisible({ timeout: 20_000 });
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Command palette' });
  await palette.getByLabel('Search commands').fill('settings');
  await palette.getByRole('option', { name: /Open settings/ }).click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
  await expect(page.getByText('Portable by design')).toBeVisible();
});

test('mobile shell uses bottom capture navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Capture' }).click();
  await expect(page.getByRole('dialog', { name: 'Quick capture' })).toBeVisible();
});
