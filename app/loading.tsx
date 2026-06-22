// Shown while a server component streams in (route transitions, data fetches).
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="h-7 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
