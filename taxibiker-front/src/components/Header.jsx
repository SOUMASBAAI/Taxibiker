import { useState } from "react";
import { Menu, X } from "lucide-react"; // icônes burger + close

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-black text-white fixed top-0 w-full z-50 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Nom du site */}
          <div className="text-2xl font-bold">TAXIBIKER</div>

          {/* Menu Desktop */}
          <ul className="hidden md:flex space-x-8 font-medium">
            <li>
              <a
                href="#"
                className="hover:underline underline-offset-8 decoration-2 decoration-orange-500 transition"
              >
                Accueil
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:underline underline-offset-8 decoration-2 decoration-orange-500 transition"
              >
                Nous contacter
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:underline underline-offset-8 decoration-2 decoration-orange-500 transition"
              >
                Connexion
              </a>
            </li>
          </ul>

          {/* Bouton Burger Mobile */}
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
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10">
          <ul className="flex flex-col items-center space-y-6 py-6 font-medium">
            <li>
              <a
                href="#"
                className="hover:underline underline-offset-8 decoration-2 decoration-orange-500 transition"
                onClick={() => setIsOpen(false)}
              >
                Accueil
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:underline underline-offset-8 decoration-2 decoration-orange-500 transition"
                onClick={() => setIsOpen(false)}
              >
                Nous contacter
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:underline underline-offset-8 decoration-2 decoration-orange-500 transition"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
