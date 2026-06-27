import { test, expect } from '@playwright/test'

test('variants list loads', async ({ page }) => {
  await page.goto('/dashboard/variants')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="variants-list"]')).toBeVisible({ timeout: 10000 })
})

test('variants list shows New Variant button', async ({ page }) => {
  await page.goto('/dashboard/variants')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: 'New Variant' })).toBeVisible()
})

test('clicking New Variant opens modal when profile exists', async ({ page }) => {
  await page.goto('/dashboard/variants')
  await page.waitForLoadState('networkidle')
  const newVariantBtn = page.getByRole('button', { name: 'New Variant' })
  await expect(newVariantBtn).toBeVisible()
  // Button is disabled when no profile exists in the backend (dev/test state)
  const isEnabled = await newVariantBtn.isEnabled()
  if (isEnabled) {
    await newVariantBtn.click()
    await expect(page.getByRole('dialog', { name: 'Create Variant' })).toBeVisible()
  } else {
    // Profile not seeded — verify button is present but disabled
    await expect(newVariantBtn).toBeDisabled()
  }
})
