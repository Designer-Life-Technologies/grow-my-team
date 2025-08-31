import { expect, test } from "@playwright/test"

// E2E tests for the Set Password page and the redirect from Signup

test.describe("Set Password Page", () => {
  test("should display the set password form", async ({ page }) => {
    await page.goto("/set-password")

    await expect(page.getByLabel("New password", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Confirm new password")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Set password", exact: true }),
    ).toBeVisible()
  })

  test("should show error when passwords do not match", async ({ page }) => {
    await page.goto("/set-password")

    await page.getByLabel("New password", { exact: true }).fill("abc12345")
    await page.getByLabel("Confirm new password").fill("abc123456")
    await page
      .getByRole("button", { name: "Set password", exact: true })
      .click()

    await expect(page.getByText("Passwords do not match")).toBeVisible()
    await expect(page).toHaveURL(/\/set-password$/)
  })

  test("should allow setting password and then redirect to login", async ({
    page,
  }) => {
    await page.goto("/set-password")

    await page
      .getByLabel("New password", { exact: true })
      .fill("a-strong-password-123")
    await page.getByLabel("Confirm new password").fill("a-strong-password-123")
    await page
      .getByRole("button", { name: "Set password", exact: true })
      .click()

    await expect(
      page.getByText("Your password has been set. You can now sign in."),
    ).toBeVisible()

    await expect(page).toHaveURL(/\/login$/)
  })
})
