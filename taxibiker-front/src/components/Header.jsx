import { useState } from "react";
import { FaBars, FaTimes, FaMotorcycle, FaUser } from "react-icons/fa";
import logo from "@/assets/equipements/logo.jpeg";
// ou ../../assets/equipements/logo.jpeg selon ton arborescence


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const handleContactClick = (e) => {
    e.preventDefault();

    // Check if we're already on the homepage
    if (window.location.pathname === "/") {
      // Scroll to contact section
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // Navigate to homepage with hash
      window.location.href = "/#contact";
    }

    // Close mobile menu if open
    setIsOpen(false);
  };

  const navigationItems = [
    {
      id: "home",
      label: "Accueil",
      href: "/",
    },
    {
      id: "contact",
      label: "Contact",
      href: "#contact",
      onClick: handleContactClick,
    },
  ];

  return (
    <>
      <header className="bg-black/95 backdrop-blur-lg text-white fixed top-0 w-full z-50 border-b border-gray-800/50 shadow-2xl">
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
      className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
    />
                </a>
                
              </div>
            </div>

            {/* Navigation Desktop */}
            <div className="hidden lg:flex items-center gap-8">
              {/* Menu de navigation */}
              <nav className="flex items-center gap-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={item.onClick}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Séparateur */}
              <div className="w-px h-8 bg-gray-700"></div>

              {/* Bouton Réserver */}
              <a
                href="/reservation"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <FaMotorcycle className="text-xs" />
                Réserver votre course
              </a>

              {/* Séparateur */}
              <div className="w-px h-8 bg-gray-700"></div>

              {/* Bouton de connexion */}
              <a
                href="/user/login"
                className="flex items-center justify-center p-3 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                title="Se connecter"
              >
                <FaUser className="text-sm" />
              </a>
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
      </header>

      {/* Menu Mobile */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-80 bg-black/98 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-screen">
          {/* Header mobile */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
             
              <div>
                <h2 className="text-lg font-bold text-white">TAXIBIKERPARIS</h2>
                <p className="text-xs text-gray-400">Menu</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              aria-label="Fermer le menu"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Navigation mobile */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={item.onClick || (() => setIsOpen(false))}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Section de connexion mobile */}
          <div className="p-6 border-t border-gray-800/50 space-y-3">
            <a
              href="/reservation"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-semibold shadow-lg w-full"
              onClick={() => setIsOpen(false)}
            >
              <FaMotorcycle className="text-sm" />
              Réserver votre course
            </a>
            <a
              href="/user/login"
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-all w-full"
              onClick={() => setIsOpen(false)}
            >
              <FaUser className="text-sm" />
              Se connecter
            </a>
            <p className="text-center text-xs text-gray-400">
              Accédez à votre espace personnel
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
