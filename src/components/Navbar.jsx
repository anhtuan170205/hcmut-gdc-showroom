export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 py-4 md:px-8">
        <a href="#home" className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-100 p-2">
            <img
              src="/logo.png"
              alt="GameDev Club logo"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div>
            <div className="pixel-font text-[10px] leading-4 text-slate-900 md:text-xs">
              HCMUT GameDev Club
            </div>
            <div className="text-xs text-slate-500">
              Student Game Showcase
            </div>
          </div>
        </a>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          <a
            href="#home"
            className="rounded-lg px-4 py-2 text-sm text-slate-700 transition hover:bg-sky-50"
          >
            Home
          </a>
          <a
            href="#games"
            className="rounded-lg px-4 py-2 text-sm text-slate-700 transition hover:bg-sky-50"
          >
            Games
          </a>
          <a
            href="#upload"
            className="rounded-lg px-4 py-2 text-sm text-slate-700 transition hover:bg-sky-50"
          >
            Upload
          </a>
        </nav>

        <div className="flex justify-end">
          <a
            href="#games"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Explore
          </a>
        </div>
      </div>
    </header>
  );
}