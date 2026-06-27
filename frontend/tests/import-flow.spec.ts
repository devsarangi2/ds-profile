import { test, expect } from '@playwright/test'

test('import flow page loads', async ({ page }) => {
  await page.goto('/dashboard/import')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="import-flow"]')).toBeVisible({ timeout: 10000 })
})

test('import flow shows PDF dropzone', async ({ page }) => {
  await page.goto('/dashboard/import')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="pdf-dropzone"]')).toBeVisible()
})

test('import flow shows step indicators', async ({ page }) => {
  await page.goto('/dashboard/import')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('upload', { exact: false })).toBeVisible()
  await expect(page.getByText('processing', { exact: false })).toBeVisible()
  await expect(page.getByText('review', { exact: false })).toBeVisible()
})
