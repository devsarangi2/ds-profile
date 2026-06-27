import { test, expect } from '@playwright/test'

test.describe('Skills Manager', () => {
  test('skills page loads with add form', async ({ page }) => {
    await page.goto('/dashboard/skills')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="skills-manager"]')).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('textbox', { name: 'Skill name' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible()
  })

  test('add skill button is disabled when input is empty', async ({ page }) => {
    await page.goto('/dashboard/skills')
    await page.waitForLoadState('networkidle')
    const addBtn = page.getByRole('button', { name: 'Add' })
    await expect(addBtn).toBeDisabled()
  })

  test('typing in skill name enables add button', async ({ page }) => {
    await page.goto('/dashboard/skills')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: 'Skill name' }).fill('TypeScript')
    await expect(page.getByRole('button', { name: 'Add' })).toBeEnabled()
  })
})
