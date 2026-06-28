import { test, expect } from '@playwright/test'

test.describe('AI Settings', () => {
  test('settings page loads with provider options', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="settings"]')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('AI Provider')).toBeVisible()
    await expect(page.getByText('LM Studio (Local)')).toBeVisible()
    await expect(page.getByText('OpenRouter')).toBeVisible()
  })

  test('LM Studio is selected by default', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')
    // Wait for settings to load from API (component syncs from fetched settings)
    await expect(page.locator('[data-testid="settings"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[type="radio"][value="lmstudio"]')).toBeChecked()
  })

  test('selecting OpenRouter shows API Key section', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="settings"]')).toBeVisible({ timeout: 10000 })
    await page.locator('input[type="radio"][value="openrouter"]').check()
    // The API Key heading appears when a provider with requiresKey is selected
    await expect(page.getByRole('heading', { name: 'API Key' })).toBeVisible()
  })

  test('settings save button is present', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: /save settings/i })).toBeVisible()
  })
})
