import { test, expect } from '@playwright/test'

test('dashboard sidebar shows all nav items', async ({ page }) => {
  await page.goto('/dashboard/experience')
  await expect(page.getByRole('link', { name: 'Experience' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Skills' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Variants' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Import' })).toBeVisible()
})

test('public profile loads at root', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="public-profile"]')).toBeVisible()
})

test('dashboard redirects to experience', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard\/experience/)
})

test('unknown route redirects to home', async ({ page }) => {
  await page.goto('/this-does-not-exist')
  await expect(page).toHaveURL('/')
})
