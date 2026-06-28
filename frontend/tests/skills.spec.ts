import { test, expect } from '@playwright/test'

test('skills manager loads', async ({ page }) => {
  await page.goto('/dashboard/skills')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="skills-manager"]')).toBeVisible({ timeout: 10000 })
})

test('skills manager shows add skill form', async ({ page }) => {
  await page.goto('/dashboard/skills')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('textbox', { name: 'Skill name' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
})
