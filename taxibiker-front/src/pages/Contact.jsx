import { useState } from "react";
import Header from "../components/Header"; // Ton header global
import WhatsappButton from "../components/WhatsappButton";
import { buildApiUrl } from "../config/api.js";

export default function ContactForm() {
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black flex flex-col items-center justify-center pt-24 px-4">
        <section
          aria-labelledby="contact-title"
          className="bg-[#1A1A1A] p-6 rounded-lg w-full max-w-md flex flex-col gap-4 shadow-lg"
        >
          <header className="text-center">
            <h1
              id="contact-title"
              className="text-white text-2xl font-bold mb-2"
            >
              Contactez TaxiBiker
            </h1>
            <p className="text-gray-400 text-sm">
              Remplissez le formulaire et nous vous répondrons rapidement.
            </p>
          </header>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </section>
      </main>
      {/* Bouton WhatsApp flottant */}
      <WhatsappButton number="33612345678" />
    </>
  );
}
