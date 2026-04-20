import { expect, test } from '@playwright/test';

test('golden path: generate, start, six rounds stream into results', async ({ page }) => {
  await page.goto('/?fast=1');

  // Roster is rendered on first paint (US2, SC-first-load).
  const rosterItems = page.getByTestId('horse-roster').getByRole('listitem');
  await expect(rosterItems).toHaveCount(20);
  const rosterColors = await rosterItems.evaluateAll(els =>
    els.map(el => getComputedStyle(el.querySelector<HTMLElement>('[style*="--horse-color"]')!).getPropertyValue('--horse-color').trim()),
  );
  expect(new Set(rosterColors).size).toBe(20);

  await page.getByRole('button', { name: /generate/i }).click();

  // Schedule preview shows six rounds with canonical distances (US3).
  const scheduleItems = page.getByTestId('race-schedule').getByRole('listitem');
  await expect(scheduleItems).toHaveCount(6);
  const expectedDistances = ['1200 m', '1400 m', '1600 m', '1800 m', '2000 m', '2200 m'];
  for (let i = 0; i < 6; i += 1)
    await expect(page.getByTestId(`round-distance-${i}`)).toHaveText(expectedDistances[i]!);

  await page.getByRole('button', { name: /start/i }).click();
  const cards = page.getByTestId('round-result');
  await expect(cards).toHaveCount(6, { timeout: 20_000 });
  for (let i = 0; i < 6; i += 1)
    await expect(cards.nth(i)).toContainText(`Round ${i + 1}`);
});
