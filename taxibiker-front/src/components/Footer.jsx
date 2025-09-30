import { Mail, Phone, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#111] to-[#000] text-white px-6 py-10 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Logo + Slogan */}
        <div>
          <h2 className="text-xl font-bold mb-2">🚖 TaxiBiker</h2>
          <p className="text-gray-400 text-sm italic">
            "Votre trajet, notre priorité 🚀"
          </p>
        </div>

        {/* Liens légaux */}
        <div>
          <h3 className="font-semibold mb-2">Informations</h3>
          <ul className="space-y-1 text-gray-300 text-sm">
            <li>
              <a href="/conditions" className="hover:text-[#DD5212] transition">
                Conditions d’utilisation
              </a>
            </li>
            <li>
              <a href="/mentions-legales" className="hover:text-[#DD5212] transition">
                Mentions légales
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-gray-400" />
              01 23 45 67 89
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              contact@taxibike.com
            </li>
          </ul>
        </div>

        {/* Réseaux */}
        <div>
          <h3 className="font-semibold mb-2">Suivez-nous</h3>
          <a
            href="https://instagram.com/taxibike"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-[#DD5212] transition text-sm"
          >
            <Instagram size={18} />
            Instagram
          </a>
        </div>
      </div>

      {/* Bas de page */}
      <div className="border-t border-white/10 mt-8 pt-4 text-center text-xs text-gray-400">
        <p>© 2025 TaxiBike. Tous droits réservés.</p>
        <p className="mt-1">
          Ce site est une réalisation de <span className="text-white font-semibold">ISAKODE</span>.
        </p>
      </div>
    </footer>
  );
}
