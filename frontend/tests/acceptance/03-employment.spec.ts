import { test, expect } from '@playwright/test'

test.describe('Employment Dashboard', () => {
  test('experience list page loads with add button', async ({ page }) => {
    await page.goto('/dashboard/experience')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="experience-list"]')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Add Employment' })).toBeVisible()
  })

  test('clicking Add Employment opens modal', async ({ page }) => {
    await page.goto('/dashboard/experience')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Add Employment' }).click()
    await expect(page.getByRole('dialog', { name: 'Add Employment' })).toBeVisible()
    await expect(page.getByLabel('Company')).toBeVisible()
    await expect(page.getByLabel('Title')).toBeVisible()
  })

  test('Add Employment modal can be dismissed', async ({ page }) => {
    await page.goto('/dashboard/experience')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: 'Add Employment' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
