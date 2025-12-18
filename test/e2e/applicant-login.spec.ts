/**
 * Applicant login (magic link request) flow.
 *
 * This test verifies the UI can submit an email and displays a confirmation message.
 */
import { expect, test } from "@playwright/test"

test.describe("Applicant login page", () => {
  test("should request a login link and show confirmation", async ({
    page,
  }) => {
    await page.goto("/applicant/login")

    await expect(
      page.getByRole("heading", { name: "Applicant login" }),
    ).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()

    await page.getByLabel("Email").fill("applicant@example.com")
    await page.getByRole("button", { name: "Send login link" }).click()

    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible()
    await expect(page.getByText("applicant@example.com")).toBeVisible()
  })
})
