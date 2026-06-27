import { test, expect } from '@playwright/test'

test.describe('PDF Import Flow', () => {
  test('import page shows 3-step wizard', async ({ page }) => {
    await page.goto('/dashboard/import')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="import-flow"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="pdf-dropzone"]')).toBeVisible()
    // Step indicators (step labels are rendered as capitalized text)
    await expect(page.getByText('upload', { exact: false })).toBeVisible()
    await expect(page.getByText('processing', { exact: false })).toBeVisible()
    await expect(page.getByText('review', { exact: false })).toBeVisible()
  })

  test('import page accepts PDF file input', async ({ page }) => {
    await page.goto('/dashboard/import')
    await page.waitForLoadState('networkidle')
    // The hidden file input with accept=".pdf,application/pdf" must be present in the DOM
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
    const acceptAttr = await fileInput.getAttribute('accept')
    expect(acceptAttr).toContain('pdf')
  })
})
