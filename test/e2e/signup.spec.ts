import { expect, test } from "@playwright/test"

test.describe("Signup Page", () => {
  test("should display the signup form", async ({ page }) => {
    await page.goto("/signup")

    await expect(page.getByLabel("Company name (optional)")).toBeVisible()
    await expect(page.getByLabel("First name")).toBeVisible()
    await expect(page.getByLabel("Last name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Confirm password")).toBeVisible()

    await expect(
      page.getByRole("button", { name: "Create account", exact: true }),
    ).toBeVisible()

    await expect(
      page.getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible()
  })

  test("should show error when passwords do not match", async ({ page }) => {
    await page.goto("/signup")

    await page.getByLabel("First name").fill("Ada")
    await page.getByLabel("Last name").fill("Lovelace")
    await page.getByLabel("Email").fill("ada@example.com")
    await page.getByLabel("Password", { exact: true }).fill("hunter2")
    await page.getByLabel("Confirm password").fill("hunter3")

    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click()

    await expect(page.getByText("Passwords do not match")).toBeVisible()
    await expect(page).toHaveURL(/\/signup$/)
  })

  test("should require a valid email format", async ({ page }) => {
    await page.goto("/signup")

    await page.getByLabel("First name").fill("Grace")
    await page.getByLabel("Last name").fill("Hopper")
    await page.getByLabel("Email").fill("invalid-email")
    await page
      .getByLabel("Password", { exact: true })
      .fill("correcthorsebatterystaple")
    await page.getByLabel("Confirm password").fill("correcthorsebatterystaple")

    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click()

    // Browser-native validation should block submit; email should be invalid
    const emailValid = await page
      .locator("#email")
      .evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(emailValid).toBeFalsy()

    // No navigation away from signup
    await expect(page).toHaveURL(/\/signup$/)
    // No success banner should appear
    await expect(
      page.getByText("Account created. You can now sign in."),
    ).toHaveCount(0)
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
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Confirm password")).toBeVisible()
  })
})
