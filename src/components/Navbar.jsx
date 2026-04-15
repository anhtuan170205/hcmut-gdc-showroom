import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-700 hover:bg-white hover:text-blue-700"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-sky-200 bg-sky-100/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-2 shadow-sm">
            <img
              src="/logo.jpg"
              alt="GameDev Club logo"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div>
            <div className="pixel-font text-[10px] leading-4 text-slate-900 md:text-xs">
              HCMUT GameDev Club
            </div>
            <div className="text-xs text-slate-600">
              Student Game Showcase
            </div>
          </div>
        </Link>

        <nav className="hidden items-center justify-center gap-2 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>

          <NavLink to="/submit" className={linkClass}>
            Upload
          </NavLink>

          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        </nav>

      </div>
    </header>
  );
}