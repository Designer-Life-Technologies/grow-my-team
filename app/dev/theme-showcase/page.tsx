"use client"
import { ClientLogo } from "@/components/layout"
import { ThemeModeToggle, ThemeSelector, useTheme } from "@/components/theme"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ThemeShowcase() {
  const { currentTheme, isDark } = useTheme()

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Theme Showcase</h1>
        <p className="text-lg text-[var(--color-textSecondary)] mb-6">
          Explore and test the different themes and components
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <Label htmlFor="theme-selector" className="mb-2">
              Theme
            </Label>
            <ThemeSelector />
          </div>

          <div className="flex flex-col items-center">
            <Label className="mb-2">Mode</Label>
            <ThemeModeToggle />
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold mb-2">Current Theme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>ID:</strong> {currentTheme.id}
              </p>
              <p>
                <strong>Name:</strong> {currentTheme.name}
              </p>
              <p>
                <strong>Mode:</strong> {isDark ? "Dark" : "Light"}
              </p>
            </div>
            <div>
              <p>
                <strong>Company:</strong> {currentTheme.branding.companyName}
              </p>
              <div className="mt-2">
                <strong>Logo:</strong>
                <ClientLogo />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Object.entries(
            isDark ? currentTheme.colors.dark : currentTheme.colors.light,
          ).map(([name, color]) => (
            <div key={name} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-md mb-2 border border-[var(--color-border)]"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium">{name}</span>
              <span className="text-xs text-[var(--color-textSecondary)]">
                {color}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        <Card>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
            <div className="flex flex-col gap-2">
              <Label>Default</Label>
              <Button>Default Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Secondary</Label>
              <Button variant="secondary">Secondary Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Destructive</Label>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Outline</Label>
              <Button variant="outline">Outline Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Ghost</Label>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Link</Label>
              <Button variant="link">Link Button</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Button Sizes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Button Sizes</h2>
        <Card>
          <CardContent className="flex flex-wrap gap-4 items-end py-6">
            <div className="flex flex-col gap-2">
              <Label>Small</Label>
              <Button size="sm">Small Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Default</Label>
              <Button>Default Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Large</Label>
              <Button size="lg">Large Button</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Icon</Label>
              <Button size="icon">
                <span>+</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inputs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Inputs</h2>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="default-input">Default Input</Label>
              <Input id="default-input" placeholder="Enter text here" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input
                id="disabled-input"
                placeholder="Disabled input"
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invalid-input">Invalid Input</Label>
              <Input
                id="invalid-input"
                placeholder="Invalid input"
                aria-invalid="true"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="file-input">File Input</Label>
              <Input id="file-input" type="file" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This is the main content area of the card. It can contain any
                elements.
              </p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>With interactive elements</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input placeholder="Enter something..." />
              <div className="flex gap-2">
                <Input placeholder="First name" className="flex-1" />
                <Input placeholder="Last name" className="flex-1" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
}
