import { test, expect } from '@playwright/test'

test('settings page loads', async ({ page }) => {
  await page.goto('/dashboard/settings')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="settings"]')).toBeVisible({ timeout: 10000 })
})

test('settings page shows AI provider section', async ({ page }) => {
  await page.goto('/dashboard/settings')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('AI Provider')).toBeVisible()
})

test('settings page shows LM Studio option', async ({ page }) => {
  await page.goto('/dashboard/settings')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('LM Studio (Local)')).toBeVisible()
})

test('settings page has save button', async ({ page }) => {
  await page.goto('/dashboard/settings')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: /save settings/i })).toBeVisible()
})
