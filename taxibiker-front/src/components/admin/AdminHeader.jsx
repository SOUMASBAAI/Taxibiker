import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMotorcycle,
  FaUserShield,
} from "react-icons/fa";

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FaTachometerAlt,
      path: "/admin/dashboard",
    },
    {
      id: "clients",
      label: "Clients",
      icon: FaUsers,
      path: "/admin/clients",
    },
    {
      id: "reservations",
      label: "Réservations",
      icon: FaCalendarAlt,
      path: "/admin/reservations",
    },
  ];

  return (
    <header className="bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-lg text-white fixed top-0 w-full z-50 border-b border-blue-500/30 shadow-2xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo et Branding Admin */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg">
              <FaMotorcycle className="text-white text-xl" />
            </div>
            <div>
              <Link
                to="/admin/dashboard"
                className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent hover:from-blue-400 hover:to-blue-300 transition-all duration-300"
              >
                TAXIBIKER
              </Link>
              <p className="text-xs text-blue-300 -mt-1">Administration</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Menu de navigation */}
            <nav className="flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="text-sm" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Séparateur */}
            <div className="w-px h-8 bg-gray-700"></div>

            {/* Profil Admin */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Admin Cédric</p>
                <p className="text-xs text-blue-300">Administrateur</p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl border border-blue-500">
                  <FaUserShield className="text-white text-sm" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <button
                onClick={() => {
                  // Logique de déconnexion ici
                  window.location.href = "/admin/login";
                }}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                title="Déconnexion"
              >
                <FaSignOutAlt className="text-sm" />
              </button>
            </div>
          </div>

          {/* Menu Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            aria-label="Menu"
          >
            {isOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="lg:hidden bg-gray-900/98 backdrop-blur-lg border-t border-blue-500/30">
          <div className="px-4 py-6 space-y-4">
            {/* Profil admin mobile */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-500/20">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl">
                <FaUserShield className="text-white text-lg" />
              </div>
              <div>
                <p className="text-white font-semibold">Admin Cédric</p>
                <p className="text-blue-300 text-sm">Administrateur système</p>
              </div>
            </div>

            {/* Navigation mobile */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="text-lg" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Déconnexion mobile */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => {
                  // Logique de déconnexion ici
                  window.location.href = "/admin/login";
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-all"
              >
                <FaSignOutAlt className="text-lg" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
