import { test, expect } from '@playwright/test'

test.describe('Public Profile', () => {
  test('public profile page loads at root', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
    expect(errors).toHaveLength(0)
  })

  test('experience page renders', async ({ page }) => {
    await page.goto('/experience')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/experience')
    await expect(page.locator('body')).toBeVisible()
  })

  test('projects page renders', async ({ page }) => {
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/projects')
    await expect(page.locator('body')).toBeVisible()
  })

  test('public nav links work', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Navigation links exist
    await expect(page.getByRole('link', { name: 'Experience' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible()
  })

  test('unknown URL redirects to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await expect(page).toHaveURL('/')
  })
})
