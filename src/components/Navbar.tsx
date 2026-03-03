import { Link, useLocation } from "react-router-dom";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: "HOME", path: "/" },
    { label: "ABOUT", path: "/about" },
    { label: "PROJECT", path: "/project" },
    { label: "EQUIPMENT", path: "/equipment" },
    { label: "CONTACT", path: "/contact" },
    { label: "ADMIN", path: "/admin" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tighter">
          GU SEONG MIN
        </Link>
        <div className="flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-xs font-medium tracking-widest transition-colors hover:text-black",
                location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path))
                  ? "text-black"
                  : "text-gray-400"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
