import React, { useState } from "react";
import Header from "../components/Header"; 
import Footer from "../components/Footer"; 
import WhatsappButton from "../components/WhatsappButton";
import taxiImage from "../assets/taxi.jpg";
import taxiImage2 from "../assets/taxi_team.jpg";
import { FaShieldAlt, FaMotorcycle, FaTachometerAlt, FaDollarSign } from "react-icons/fa";

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!form.firstname || !form.lastname) return setError("Nom et prénom obligatoires");
    if (!phoneRegex.test(form.phone)) return setError("Numéro de téléphone invalide");
    if (!emailRegex.test(form.email)) return setError("Email invalide");
    if (!form.message) return setError("Message obligatoire");

    setError("");
    setSuccess("Votre message a été envoyé avec succès !");
    console.log("Formulaire envoyé :", form);
    setForm({ firstname: "", lastname: "", email: "", phone: "", message: "" });
  };

  const equipments = [
    {
      title: "Casque de sécurité",
      description: "Casque intégral pour une protection optimale lors de votre trajet.",
      imageUrl: "https://images.unsplash.com/photo-1600185368270-2cfbb73d2f5e?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Charlotte hygiène",
      description: "Charlotte jetable pour maintenir une hygiène irréprochable.",
      imageUrl: "https://images.unsplash.com/photo-1588776814546-9df7f7c4889d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Gel hydroalcoolique",
      description: "Gel désinfectant pour les mains, disponible à bord.",
      imageUrl: "https://images.unsplash.com/photo-1588776814778-1f0570c8a504?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Jupe thermique",
      description: "Jupe thermique pour maintenir une température agréable.",
      imageUrl: "https://images.unsplash.com/photo-1605902711622-cfb43c443f13?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Gants de protection",
      description: "Gants adaptés pour une conduite sécurisée et confortable.",
      imageUrl: "https://images.unsplash.com/photo-1600185368015-b3f94a6d5085?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Porte-bagages",
      description: "Espace sécurisé pour transporter vos bagages en toute sécurité.",
      imageUrl: "https://images.unsplash.com/photo-1596495577886-3aa5f2b6f5d1?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <>
      <Header />

      <main className="bg-black text-white">
        {/* Hero Section */}
       <section
  className="relative w-full min-h-screen flex flex-col justify-end"
  style={{
    backgroundImage: `url(${taxiImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  {/* Overlay sombre avec gradient pour plus d'élégance */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30"></div>

  <div className="relative z-10 text-center px-4 pb-32 md:pb-48">
    <h1 className="text-3xl md:text-5xl font-bold mb-6">
      Prenez le volant de votre confort avec TaxiBiker
    </h1>
    <button className="bg-[#DD5212] hover:bg-orange-600 transition py-3 px-6 rounded-lg font-semibold text-white text-lg">
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
            Nos chauffeurs connaissent la ville comme leur poche pour vous garantir un trajet rapide, sûr et confortable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
                Nos motos sont conçues pour vous offrir un trajet agréable et fluide.
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
    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Qui sommes-nous ?</h2>
    <p className="text-gray-300 mb-4">
      TaxiBaker est votre service de transport fiable et rapide. Nos chauffeurs expérimentés vous garantissent un trajet sûr et confortable.
    </p>
    <p className="text-gray-300">
      Notre mission est de rendre chaque trajet agréable, en alliant ponctualité, sécurité et confort.
    </p>
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
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
    {equipments.map((item, index) => (
      <div
        key={index}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-48 object-cover rounded-t-3xl"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#DD5212] mb-2">{item.title}</h3>
          <p className="text-white text-sm">{item.description}</p>
        </div>
      </div>
    ))}
  </div>
</section>


        {/* Formulaire de contact */}
        <section className="py-16 px-4 max-w-3xl mx-auto bg-[#1A1A1A] rounded-lg shadow-lg flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-center mb-4">Contactez TaxiBiker</h2>
          <p className="text-gray-400 text-center mb-6">
            Remplissez le formulaire et nous vous répondrons rapidement.
          </p>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="Prénom"
                className="p-2 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="Nom"
                className="p-2 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="p-2 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0123456789"
              className="p-2 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Votre message..."
              className="p-2 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
              required
            />
            <button
              type="submit"
              className="bg-[#DD5212] text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Envoyer
            </button>
          </form>
        </section>
        <Footer />
      </main>

      {/* Bouton WhatsApp flottant */}
      <WhatsappButton number="33612345678" />
      
    </>
  );
}
