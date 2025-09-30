import { useState } from "react";
import { Menu, X } from "lucide-react";
import { FiBell } from "react-icons/fi"; // Cloche notification

export default function AdminHeader({ onLogout, notifications = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Accueil", href: "/" },
    { label: "Réservations", href: "/admin/reservations" },
    { label: "Clients", href: "/admin/clients" },
    { label: "Factures", href: "/admin/invoices" },
    { label: "Déconnexion", action: onLogout },
  ];

  return (
    <header className="bg-black text-white fixed top-0 w-full z-50 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold">TAXIBIKER</div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-8 font-medium">
              {menuItems.map((item, index) =>
                item.action ? (
                  <li key={index}>
                    <button
                      onClick={item.action}
                      className="hover:underline hover:underline-offset-4 transition"
                    >
                      {item.label}
                    </button>
                  </li>
                ) : (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="hover:underline hover:underline-offset-4 transition"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>

            {/* Cloche notification */}
            <div className="relative ml-4">
              <FiBell size={24} className="text-white" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>

          {/* Burger Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none"
            aria-label="Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10 p-4">
          <ul className="flex flex-col items-center space-y-6 font-medium">
            {menuItems.map((item, index) =>
              item.action ? (
                <li key={index}>
                  <button
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="hover:underline hover:underline-offset-4 transition"
                  >
                    {item.label}
                  </button>
                </li>
              ) : (
                <li key={index}>
                  <a
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="hover:underline hover:underline-offset-4 transition"
                  >
                    {item.label}
                  </a>
                </li>
              )
            )}

            {/* Cloche Mobile */}
            <li className="relative">
              <FiBell size={24} className="text-white" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                  {notifications.length}
                </span>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
