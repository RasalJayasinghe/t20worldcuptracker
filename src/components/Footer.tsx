"use client";

interface FooterProps {
  lastUpdated: string | null;
}

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="border-t border-white/[0.05] bg-[#07090f]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-500/70 sm:flex-row">
          <div className="flex items-center gap-3">
            <span>
              Data sourced from{" "}
              <a
                href="https://www.espncricinfo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400/80 underline underline-offset-2 transition hover:text-white"
              >
                ESPNcricinfo
              </a>
            </span>
            <span className="text-white/10">|</span>
            <span>
              Predictions based on current form &amp; statistical simulations
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-slate-500/60">
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
