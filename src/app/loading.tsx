export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#07090f]">
      {/* Header skeleton */}
      <div className="border-b border-white/[0.06] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-3 w-48 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-3 h-10 w-72 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Group heading */}
        <div>
          <div className="mb-5 h-6 w-40 animate-pulse rounded bg-white/[0.06]" />
          <div className="grid gap-5 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Match heading */}
        <div>
          <div className="mb-5 h-6 w-32 animate-pulse rounded bg-white/[0.06]" />
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-3">
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="h-28 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.02]"
                    style={{ animationDelay: `${(i * 3 + j) * 80}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Predictions heading */}
        <div>
          <div className="mb-5 h-6 w-52 animate-pulse rounded bg-white/[0.06]" />
          <div
            className="h-96 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            style={{ animationDelay: "200ms" }}
          />
        </div>
      </div>
    </div>
  );
}
