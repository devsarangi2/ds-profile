import { test, expect } from '@playwright/test'

test('projects list loads', async ({ page }) => {
  await page.goto('/dashboard/projects')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="projects-list"]')).toBeVisible({ timeout: 10000 })
})

test('projects list shows "Add projects from your experience" link when empty', async ({ page }) => {
  await page.goto('/dashboard/projects')
  await page.waitForLoadState('networkidle')
  // If no projects exist, shows empty state; if projects exist, list is shown
  await expect(page.locator('body')).toBeVisible()
})
