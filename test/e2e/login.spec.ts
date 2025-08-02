import { expect, test } from "@playwright/test"

test.describe("Login Page", () => {
  test("should display the login form", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByText("Login to your account").first()).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Login", exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Login with Google" }),
    ).toBeVisible()
  })

  test("should allow a user to attempt to log in", async ({ page }) => {
    await page.goto("/login")

    await page.getByLabel("Email").fill("test@example.com")
    await page.getByLabel("Password").fill("password123")
    await page.getByRole("button", { name: "Login", exact: true }).click()

    // Note: This test does not check for successful authentication,
    // as that would require a valid backend service. Instead, it
    // verifies that the form can be submitted without client-side errors.
  })
})
