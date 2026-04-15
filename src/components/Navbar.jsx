import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { HiBars3BottomRight } from "react-icons/hi2";
import { CgClose } from "react-icons/cg";

const navLinks = [
  { id: 1, label: "Games", to: "/" },
  { id: 2, label: "Upload", to: "/submit" },
  { id: 3, label: "Admin", to: "/admin" },
];

export default function Navbar() {
  const [showNav, setShowNav] = useState(false);
  const [navBg, setNavBg] = useState(false);

  useEffect(() => {
    const handler = () => {
      setNavBg(window.scrollY > 20);
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const desktopLinkClass = ({ isActive }) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-700 hover:bg-white hover:text-blue-700"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `w-fit border-b pb-1 text-2xl font-medium transition sm:text-3xl ${
      isActive
        ? "border-blue-500 text-blue-600"
        : "border-sky-200 text-slate-700 hover:text-blue-700"
    }`;

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          navBg
            ? "border-b border-sky-200 bg-sky-100/95 shadow-sm backdrop-blur"
            : "bg-sky-100/90 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
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

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.id}
                to={link.to}
                end={link.to === "/"}
                className={desktopLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setShowNav(true)}
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <HiBars3BottomRight className="h-8 w-8 cursor-pointer text-slate-900" />
          </button>
        </div>
      </header>

      <div className="h-18 md:h-20" />

      <div
        onClick={() => setShowNav(false)}
        className={`fixed inset-0 z-60 bg-slate-900/25 transition-all duration-500 ${
          showNav ? "visible opacity-100" : "invisible opacity-0"
        }`}
      />

      <div
        className={`fixed right-0 top-0 z-70 flex h-full w-[85%] max-w-90 flex-col justify-center space-y-6 border-l border-sky-200 bg-sky-50 px-8 text-slate-900 shadow-xl transition-all duration-500 sm:w-[60%] ${
          showNav ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.id}
            to={link.to}
            end={link.to === "/"}
            className={mobileLinkClass}
            onClick={() => setShowNav(false)}
          >
            {link.label}
          </NavLink>
        ))}

        <CgClose
          onClick={() => setShowNav(false)}
          className="absolute right-5 top-5 h-7 w-7 cursor-pointer"
        />
      </div>
    </>
  );
}