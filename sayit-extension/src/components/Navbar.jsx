import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Volume2, Mic, History, BarChart3, Sparkles } from "lucide-react";

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Sparkles },
    { path: "/pronunciation", label: "Pronounce", icon: Volume2 },
    { path: "/practice", label: "Practice", icon: Mic },
    { path: "/progress", label: "Progress", icon: BarChart3 },
    { path: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 text-sky-400 font-bold text-xl tracking-wide group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <span className="text-white">Say<span className="text-sky-400">It</span></span>
          </Link>


          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
