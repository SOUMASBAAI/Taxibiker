import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminSidebar({ active, setActive }) {
  const [isOpen, setIsOpen] = useState(true); // pour responsive

  const menuItems = [
    { label: "Réservations", key: "reservations" },
    { label: "Clients", key: "clients" },
    { label: "Factures", key: "invoices" },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-black text-white min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>
        <ul className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setActive(item.key)}
                className={`w-full text-left py-2 px-3 rounded transition ${
                  active === item.key ? "bg-orange-600" : "hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Sidebar Mobile */}
      <div className="md:hidden flex items-center justify-between bg-black p-4">
        <h2 className="text-xl font-bold">Admin</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white"
          aria-label="Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black backdrop-blur-md border-t border-white/10 p-4">
          <ul className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => {
                    setActive(item.key);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded transition ${
                    active === item.key ? "bg-orange-600" : "hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
