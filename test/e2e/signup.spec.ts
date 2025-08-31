import { expect, test } from "@playwright/test"

test.describe("Signup Page", () => {
  test("should display the signup form", async ({ page }) => {
    await page.goto("/signup")

    await expect(page.getByLabel("Company name (optional)")).toBeVisible()
    await expect(page.getByLabel("First name")).toBeVisible()
    await expect(page.getByLabel("Last name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()

    await expect(
      page.getByRole("button", { name: "Create account", exact: true }),
    ).toBeVisible()

    await expect(
      page.getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible()
  })

  test("should allow switching from signup to login via link", async ({
    page,
  }) => {
    await page.goto("/signup")

    await page.getByRole("link", { name: "Sign in", exact: true }).click()

    await expect(page).toHaveURL(/\/login$/)

    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible()

    await expect(
      page.getByRole("link", { name: "Sign up", exact: true }),
    ).toBeVisible()
  })
})

// Cross-page navigation tests

test.describe("Auth navigation", () => {
  test("should switch from login to signup via link", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible()

    await page.getByRole("link", { name: "Sign up", exact: true }).click()

    await expect(page).toHaveURL(/\/signup$/)

    // Wait for form to fully mount after animation
    await expect(
      page.getByRole("button", { name: "Create account", exact: true }),
    ).toBeVisible()

    await expect(page.getByLabel("First name")).toBeVisible()
    await expect(page.getByLabel("Last name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
  })
})
