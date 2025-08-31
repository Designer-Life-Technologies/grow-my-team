import { expect, test } from "@playwright/test"

test("should navigate to the theme showcase page", async ({ page }) => {
  // Go directly to the theme showcase page under dev routes
  await page.goto("/dev/theme-showcase")

  // Verify we're on the theme showcase page
  await expect(page).toHaveURL(/\/dev\/theme-showcase/)
  await expect(
    page.getByRole("heading", { name: "Theme Showcase" }),
  ).toBeVisible()
})

test("theme showcase page displays theme components", async ({ page }) => {
  // Go directly to the theme showcase page
  await page.goto("/dev/theme-showcase")

  // Verify key sections are present
  await expect(
    page.getByRole("heading", { name: "Color Palette" }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Buttons" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Button Sizes" }),
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Inputs" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Cards" })).toBeVisible()
  // Verify current theme info is displayed
  await expect(page.getByText("Current Theme")).toBeVisible()
})

test("theme mode toggle works", async ({ page }) => {
  // Go to the theme showcase page
  await page.goto("/dev/theme-showcase")

  // Find the current theme mode
  const themeToggleButton = page
    .locator("button")
    .filter({ hasText: /light|dark|system/i })
    .first()

  // Click the theme toggle button to change mode
  const initialMode = await themeToggleButton.textContent()
  await themeToggleButton.click()

  // Verify the mode has changed
  await expect(themeToggleButton).not.toHaveText(initialMode || "")
})

test("theme selector changes theme", async ({ page }) => {
  // Go to the theme showcase page
  await page.goto("/dev/theme-showcase")

  // Find the theme selector dropdown
  const themeSelector = page.locator("select").first()

  // Check if we have multiple themes to test with
  const optionsCount = await themeSelector.evaluate(
    (select: HTMLSelectElement) => select.options.length,
  )
  if (optionsCount <= 1) {
    // Skip test if only one theme is available
    console.log("Skipping theme selector test - only one theme available")
    return
  }

  // Get the current selected option value
  const initialSelectedValue = await themeSelector.evaluate(
    (select: HTMLSelectElement) => select.value,
  )

  // Find an option with a different value
  const differentOptionIndex = await themeSelector.evaluate(
    (select: HTMLSelectElement) => {
      const currentValue = select.value
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value !== currentValue) {
          return i
        }
      }
      return -1
    },
  )

  if (differentOptionIndex === -1) {
    console.log(
      "Skipping theme selector test - could not find a different theme",
    )
    return
  }

  // Select the different theme
  await themeSelector.selectOption({ index: differentOptionIndex })

  // Wait for theme change to apply
  await page.waitForTimeout(500)

  // Get the new selected value
  const newSelectedValue = await themeSelector.evaluate(
    (select: HTMLSelectElement) => select.value,
  )

  // Verify the theme has changed
  expect(newSelectedValue).not.toEqual(initialSelectedValue)
})
