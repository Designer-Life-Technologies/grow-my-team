import { expect, test } from "@playwright/test"

test.describe("Application profile route protections", () => {
  test("redirects unauthenticated visitors to the PIN entry flow", async ({
    page,
  }) => {
    await page.goto("/application/123/profiletest")

    // Middleware should bounce the user to /application/[id]/pin
    await expect(page).toHaveURL(
      /\/application\/123\/pin\?next=%2Fapplication%2F123%2Fprofiletest$/,
    )

    await expect(page.getByText("Application ID: 123")).toBeVisible()
    await expect(page.getByText("Enter your PIN")).toBeVisible()
  })

  test("still redirects nonce-prefixed requests to the PIN entry page", async ({
    page,
  }) => {
    await page.goto(
      "/application/123/profiletest?n=test-nonce&applicantId=test-applicant",
    )

    await expect(page).toHaveURL(
      /\/application\/123\/pin\?next=%2Fapplication%2F123%2Fprofiletest$/,
    )
    await expect(page.getByText("Enter your PIN")).toBeVisible()
  })
})
