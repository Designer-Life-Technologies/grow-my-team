import { expect, test } from "@playwright/test"

test.describe("Applicant Profile Test (Protected)", () => {
  test("redirects unauthenticated users to /applicant/login", async ({
    page,
  }) => {
    await page.goto("/profile/test")

    // Middleware should redirect to the applicant sign-in page.
    await expect(page).toHaveURL(/\/applicant\/login/)
  })

  test("allows unauthenticated users with nonce to reach the exchange screen", async ({
    page,
  }) => {
    await page.goto("/profile/test?n=test-nonce&applicantId=test-applicant")

    await expect(page).toHaveURL(/\/auth\/callback\?n=test-nonce/)
    await expect(page.getByText("Signing you in")).toBeVisible()
  })
})
