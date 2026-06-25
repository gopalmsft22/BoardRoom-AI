import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-50">
      <div className="glass-soft border-x-0 border-t-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/" className="group flex items-center gap-3">
            <BrandMark size={32} />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-wide text-white">
                Boardroom<span className="text-gradient"> AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                Decision Intelligence
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
              Demo mode ready
            </span>
            <Link href="/" className="hidden px-3 py-2 text-sm text-white/70 hover:text-white sm:block">
              Home
            </Link>
            <Link href="/idea" className="btn btn-primary text-sm">
              Start a session
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
