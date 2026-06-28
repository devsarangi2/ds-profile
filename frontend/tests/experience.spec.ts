import { test, expect } from '@playwright/test'

test('experience list shows Add Employment button', async ({ page }) => {
  await page.goto('/dashboard/experience')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('button', { name: 'Add Employment' })).toBeVisible({ timeout: 10000 })
})

test('experience list loads', async ({ page }) => {
  await page.goto('/dashboard/experience')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="experience-list"]')).toBeVisible({ timeout: 10000 })
})

test('clicking Add Employment shows modal', async ({ page }) => {
  await page.goto('/dashboard/experience')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Add Employment' }).click()
  await expect(page.getByRole('dialog', { name: 'Add Employment' })).toBeVisible()
  await expect(page.getByLabel('Company')).toBeVisible()
  await expect(page.getByLabel('Title')).toBeVisible()
})
