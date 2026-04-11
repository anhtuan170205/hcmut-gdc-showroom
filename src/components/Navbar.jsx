import { Gamepad2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <a href="#home" className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500 p-2 text-white shadow-lg shadow-blue-500/25">
            <Gamepad2 className="h-5 w-5" />
          </div>

          <div>
            <div className="text-sm font-semibold text-white md:text-base">
              HCMUT Game Dev Club
            </div>
            <div className="text-xs text-slate-400">
              Student Game Showcase
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <a
            href="#home"
            className="rounded-2xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Home
          </a>
          <a
            href="#games"
            className="rounded-2xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Games
          </a>
          <a
            href="#upload"
            className="rounded-2xl px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Upload
          </a>
        </nav>

        <a
          href="#games"
          className="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:scale-[1.02] hover:bg-blue-400"
        >
          Explore
        </a>
      </div>
    </header>
  );
}