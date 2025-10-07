export default function Loading() {
  return (
    <section className="mx-auto max-w-3xl opacity-60">
      <div className="h-9 w-2/3 animate-pulse rounded bg-foreground/10" />
      <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-foreground/10" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-lg bg-foreground/10" />
        <div className="h-32 animate-pulse rounded-lg bg-foreground/10" />
      </div>
    </section>
  )
}
