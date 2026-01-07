// src/components/WhatsappButton.jsx
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsappButton({ number = "33788268354" }) {
  // Détecte si l'utilisateur est sur mobile
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const link = isMobile
    ? `https://wa.me/${number}`
    : `https://web.whatsapp.com/send?phone=${number}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
    >
      <FaWhatsapp className="text-white text-2xl" />
    </a>
  );
}
