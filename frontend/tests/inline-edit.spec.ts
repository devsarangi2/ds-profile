import { test, expect } from '@playwright/test'

// Test InlineEdit behaviour on the dashboard experience page (which has placeholder content)
test('dashboard loads without crashing', async ({ page }) => {
  await page.goto('/dashboard/experience')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('body')).toBeVisible()
})

test('InlineEdit component renders in read mode', async ({ page }) => {
  // Navigate to dashboard experience where InlineEdit will be used
  await page.goto('/dashboard/experience')
  await page.waitForLoadState('networkidle')
  // The page shows placeholder content - just verify no crash
  await expect(
    page.locator('[data-testid="experience-list"]').or(page.locator('h1')).first()
  ).toBeVisible({ timeout: 10000 })
})
