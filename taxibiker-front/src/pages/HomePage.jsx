import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import DashboardHeader from "../components/user/DashboardHeader";
import Footer from "../components/Footer";
import WhatsappButton from "../components/WhatsappButton";
import authService from "../services/authService";
import { buildApiUrl } from "../config/api.js";
import taxiImage from "../assets/taxi.jpg";
import casqueImg from "../assets/equipements/casque.png";
import gantsImg from "../assets/equipements/gants.png";
import giletImg from "../assets/equipements/gilet.png";
import vesteImg from "../assets/equipements/veste.png";
import taxiImage2 from "../assets/taxi_team.jpg";
import {
  FaShieldAlt,
  FaMotorcycle,
  FaTachometerAlt,
  FaDollarSign,
} from "react-icons/fa";

export default function HomePage() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = authService.isAuthenticated();

  // Handle hash navigation (when coming from another page with #contact)
  useEffect(() => {
    if (window.location.hash === "#contact") {
      setTimeout(() => {
        const contactSection = document.getElementById("contact");
        if (contactSection) {
          contactSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100); // Small delay to ensure page is loaded
    }
  }, []);

  // Fonction de navigation pour le DashboardHeader
  const handleNavigation = (page) => {
    if (page === "reservation") {
      window.location.href = "/reservation";
    } else if (page === "home") {
      window.location.href = "/";
    } else if (page === "settings") {
      window.location.href = "/settings";
    } else if (page === "logout") {
      authService.logout();
      window.location.href = "/";
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!form.firstname || !form.lastname)
      return setError("Nom et prénom obligatoires");
    if (!phoneRegex.test(form.phone))
      return setError("Numéro de téléphone invalide");
    if (!emailRegex.test(form.email)) return setError("Email invalide");
    if (!form.message) return setError("Message obligatoire");

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      setSuccess("Votre message a été envoyé avec succès !");
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error("Erreur envoi contact:", err);
      setError(err.message || "Impossible d'envoyer votre message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const equipments = [
    {
      title: "Casque de sécurité",
      description:
        "Casque intégral pour une protection optimale lors de votre trajet.",
      imageUrl: casqueImg,
    },
    {
      title: "Charlotte hygiène",
      description:
        "Charlotte jetable pour maintenir une hygiène irréprochable.",
      imageUrl:
        "https://images.unsplash.com/photo-1588776814546-9df7f7c4889d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Gel hydroalcoolique",
      description: "Gel désinfectant pour les mains, disponible à bord.",
      imageUrl: giletImg,
    },
    {
      title: "Jupe thermique",
      description: "Jupe thermique pour maintenir une température agréable.",
      imageUrl:
        "https://images.unsplash.com/photo-1605902711622-cfb43c443f13?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Gants de protection",
      description: "Gants adaptés pour une conduite sécurisée et confortable.",
      imageUrl: gantsImg,
    },
    {
      title: "Porte-bagages",
      description:
        "Espace sécurisé pour transporter vos bagages en toute sécurité.",
      imageUrl: vesteImg,
    },
  ];

  return (
    <>
      {/* Afficher le bon header selon l'état de connexion */}
      {isAuthenticated ? (
        <DashboardHeader onNavigate={handleNavigation} />
      ) : (
        <Header />
      )}

      <main className="bg-black text-white">
        {/* Hero Section */}
        <section
          className="relative w-full min-h-screen flex flex-col justify-end"
          style={{
            backgroundImage: `url(${taxiImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="relative z-10 text-center px-4 pb-32 md:pb-48">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Service haut de gamme pour vos déplacements
            </h1>
            <button
              onClick={() => (window.location.href = "/reservation")}
              className="bg-[#DD5212] hover:bg-orange-600 transition py-3 px-6 rounded-lg font-semibold text-white text-lg"
            >
              Réserver votre course
            </button>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 px-4 max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            À chaque déplacement, un chauffeur expérimenté
          </h2>
          <p className="mb-12 text-gray-300">
            Profitez d’un service optimisé, sûr et agréable à chaque trajet à
            travers Paris et l’Île-de-France.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <FaShieldAlt className="text-[#DD5212] text-5xl mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sécurité</h3>
              <p className="text-gray-300 text-sm">
                Conduite prudente et respect des règles pour votre tranquillité.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FaMotorcycle className="text-[#DD5212] text-5xl mb-4" />
              <h3 className="font-semibold text-lg mb-2">Confort</h3>
              <p className="text-gray-300 text-sm">
                Nos motos sont conçues pour vous offrir un trajet agréable et
                fluide.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FaTachometerAlt className="text-[#DD5212] text-5xl mb-4" />
              <h3 className="font-semibold text-lg mb-2">Rapidité</h3>
              <p className="text-gray-300 text-sm">
                Trajets optimisés pour vous faire gagner du temps.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <FaDollarSign className="text-[#DD5212] text-5xl mb-4" />
              <h3 className="font-semibold text-lg mb-2">Coût</h3>
              <p className="text-gray-300 text-sm">
                Tarifs transparents et compétitifs pour tous vos déplacements.
              </p>
            </div>
          </div>
        </section>

        {/* Qui sommes-nous */}
        <section className="py-16 px-4 max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8">
          {/* Texte */}
          <div className="md:w-1/2 p-6 md:bg-black/50 rounded-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Qui sommes-nous ?
            </h2>
            <p className="text-gray-300 mb-4">
              Bienvenue chez TaxiBikerParis, votre partenaire de transport privé
              à Paris et en Île-de-France. Nous mettons à votre disposition un
              service de transport fiable, rapide et confortable, pensé pour
              répondre à tous vos besoins de déplacement qu’il s’agisse d’un
              trajet professionnel, personnel ou touristique. Notre équipe de
              chauffeurs expérimentés et courtois s’engage à vous offrir une
              expérience de voyage sécurisée, agréable et ponctuelle. Chez
              TaxiBikerParis, nous croyons que le transport ne se résume pas à
              un simple déplacement. C’est une véritable expérience de
              confiance, où sécurité, confort et sérénité sont au cœur de notre
              mission.
            </p>
            <p className="text-gray-300 mb-6">
              Notre mission est de rendre chaque trajet agréable, en alliant
              ponctualité, sécurité et confort.
            </p>
            <button
              onClick={() => (window.location.href = "/reservation")}
              className="bg-[#DD5212] hover:bg-orange-600 transition py-3 px-6 rounded-lg font-semibold text-white text-lg"
            >
              Réserver votre course
            </button>
          </div>

          {/* Image */}
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <img
              src={taxiImage2}
              alt="Équipe TaxiBaker"
              className="w-full max-w-sm h-auto rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Équipements */}
        {/* Équipements */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">
            Nos équipements pour votre confort et sécurité
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {equipments.map((item, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl md:rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-orange-500/30 flex flex-col"
              >
                <div className="relative overflow-hidden flex-1">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full min-h-[180px] md:min-h-[280px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-2 md:p-4 space-y-1 md:space-y-2 flex-shrink-0">
                  <h3 className="text-sm md:text-lg font-bold text-[#DD5212] group-hover:text-orange-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed group-hover:text-white transition-colors duration-300 hidden sm:block">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formulaire de contact */}
        <section id="contact" className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            Contactez TaxiBiker
          </h2>
          <p className="text-gray-300 text-center mb-8">
            Remplissez le formulaire et nous vous répondrons rapidement.
          </p>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  placeholder="Prénom"
                  className="p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  placeholder="Nom"
                  className="p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0123456789"
                className="p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Votre message..."
                className="p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#DD5212] text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          </div>
        </section>

        <Footer />
      </main>

      {/* Bouton WhatsApp flottant */}
      <WhatsappButton number="33788268354" />
    </>
  );
}
