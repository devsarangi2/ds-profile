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

test('clicking New Variant opens modal', async ({ page }) => {
  await page.goto('/dashboard/variants')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'New Variant' }).click()
  await expect(page.getByRole('dialog', { name: 'Create Variant' })).toBeVisible()
})
