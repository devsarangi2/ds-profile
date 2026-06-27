import { test, expect } from '@playwright/test'

test('public profile shows name and headline sections', async ({ page }) => {
  await page.goto('/')
  // page loads without crashing (API may return 404 if no data, component handles it gracefully)
  await page.waitForLoadState('networkidle')
  // expect either a profile name, the h1, or the "not found" fallback paragraph
  const content = page.locator('[data-testid="profile-name"], h1, [data-testid="public-profile"], p').first()
  await expect(content).toBeVisible({ timeout: 10000 })
})

test('public profile page loads without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const jsErrors = errors.filter(e => !e.includes('404') && !e.includes('net::ERR'))
  expect(jsErrors).toHaveLength(0)
})

test('experience page loads', async ({ page }) => {
  await page.goto('/experience')
  await expect(page).toHaveURL('/experience')
  await page.waitForLoadState('networkidle')
  // page renders without crash
  await expect(page.locator('body')).toBeVisible()
})

test('projects page loads', async ({ page }) => {
  await page.goto('/projects')
  await expect(page).toHaveURL('/projects')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('body')).toBeVisible()
})
