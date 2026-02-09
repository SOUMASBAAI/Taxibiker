import { useState } from "react";
import {
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaMotorcycle,
  FaPlus,
  FaBars,
  FaTimes,
  FaUser,
  FaCalendarCheck,
} from "react-icons/fa";
import authService from "../../services/authService";
import logo from "../../assets/equipements/logo.jpeg";



export default function DashboardHeader({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = authService.getUser();

  const navigationItems = [
    {
      id: "home",
      label: "Accueil",
      icon: FaHome,
      action: () => onNavigate("home"),
    },
    {
      id: "dashboard",
      label: "Mes courses",
      icon: FaCalendarCheck,
      action: () => (window.location.href = "/dashboard"),
      isActive: window.location.pathname === "/dashboard",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: FaCog,
      action: () => onNavigate("settings"),
      isActive: window.location.pathname === "/settings",
    },
  ];

  return (
    <header className="bg-black/95 backdrop-blur-lg fixed top-0 w-full z-50 border-b border-gray-800/50 shadow-2xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo et Branding */}
          <div className="flex items-center gap-3">
            
            <div>
              <a
                                href="/"
                                className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hover:from-orange-400 hover:to-orange-300 transition-all duration-300"
                              >
                               <img
                    src={logo}
                    alt="Taxi Biker Paris"
                    className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-300"
                  />
                              </a>
              <p className="text-xs text-gray-400 -mt-1">Dashboard</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Menu de navigation */}
            <nav className="flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    item.isActive
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="text-sm" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Séparateur */}
            <div className="w-px h-8 bg-gray-700"></div>

            {/* Bouton CTA principal */}
            <button
              onClick={() => onNavigate("reservation")}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105"
            >
              <FaPlus className="text-xs" />
              Nouvelle course
            </button>

            {/* Profil utilisateur */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-xs text-gray-400">Client</p>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-2.5 rounded-xl border border-gray-600">
                  <FaUser className="text-gray-300 text-sm" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              <button
                onClick={() => onNavigate("logout")}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                title="Se déconnecter"
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
        <div className="lg:hidden bg-black/98 backdrop-blur-lg border-t border-gray-800/50">
          <div className="px-4 py-6 space-y-4">
            {/* Profil mobile */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-500/20">
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-xl">
                <FaUser className="text-gray-300 text-lg" />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>

            {/* Bouton CTA mobile */}
            <button
              onClick={() => {
                onNavigate("reservation");
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg"
            >
              <FaPlus className="text-sm" />
              Nouvelle course
            </button>

            {/* Navigation mobile */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    item.isActive
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="text-lg" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Déconnexion mobile */}
            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => {
                  onNavigate("logout");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-all"
              >
                <FaSignOutAlt className="text-lg" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
