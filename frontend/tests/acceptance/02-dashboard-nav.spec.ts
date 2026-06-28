import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation', () => {
  test('dashboard redirects to experience', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/dashboard\/experience/)
  })

  test('sidebar has all nav items', async ({ page }) => {
    await page.goto('/dashboard/experience')
    await page.waitForLoadState('networkidle')
    const navLinks = ['Experience', 'Projects', 'Skills', 'Variants', 'Import']
    for (const label of navLinks) {
      await expect(page.getByRole('link', { name: label })).toBeVisible()
    }
  })

  test('can navigate to each dashboard section', async ({ page }) => {
    const sections = [
      { path: '/dashboard/experience', testId: 'experience-list' },
      { path: '/dashboard/projects', testId: 'projects-list' },
      { path: '/dashboard/skills', testId: 'skills-manager' },
      { path: '/dashboard/variants', testId: 'variants-list' },
      { path: '/dashboard/import', testId: 'import-flow' },
      { path: '/dashboard/settings', testId: 'settings' },
    ]
    for (const { path, testId } of sections) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      await expect(page.locator(`[data-testid="${testId}"]`)).toBeVisible({ timeout: 10000 })
    }
  })

  test('dark mode toggle button is visible', async ({ page }) => {
    await page.goto('/dashboard/experience')
    await page.waitForLoadState('networkidle')
    const toggleButton = page.getByRole('button', { name: 'Toggle dark mode' })
    await expect(toggleButton).toBeVisible()
    // Click once and verify the html class reflects the change
    const htmlEl = page.locator('html')
    const wasDark = (await htmlEl.getAttribute('class') ?? '').includes('dark')
    await toggleButton.click()
    if (wasDark) {
      await expect(htmlEl).not.toHaveClass(/dark/)
    } else {
      await expect(htmlEl).toHaveClass(/dark/)
    }
  })
})
