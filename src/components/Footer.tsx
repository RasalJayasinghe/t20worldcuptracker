"use client";

interface FooterProps {
  lastUpdated: string | null;
}

/* ── Inline SVG icons (no extra deps) ──────────────────── */

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.05] bg-[#07090f]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Top row: branding + socials ─────────────────── */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Made with love */}
          <p className="text-xs text-slate-500/70">
            Made with{" "}
            <span className="text-red-400/80">&hearts;</span> by{" "}
            <span className="font-medium text-slate-300/90">Rasal</span>
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/rasaljayasinghe/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <LinkedInIcon className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-white" />
            </a>
            <a
              href="https://x.com/rasaljaya"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <XIcon className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────── */}
        <div className="my-4 border-t border-white/[0.04]" />

        {/* ── Bottom row: data source + sync status ──────── */}
        <div className="flex flex-col items-center gap-2 text-[11px] text-slate-500/50 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center sm:justify-start sm:text-left">
            <span>
              Data from{" "}
              <a
                href="https://www.espncricinfo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400/70 underline underline-offset-2 transition hover:text-white"
              >
                ESPNcricinfo
              </a>
            </span>
            <span className="hidden text-white/10 sm:inline">|</span>
            <span>Predictions based on current form &amp; statistical simulations</span>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span>
                Last sync:{" "}
                {new Date(lastUpdated).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500/60 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </footer>
  );
}
