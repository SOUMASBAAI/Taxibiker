import { useState } from "react";
import Header from "../components/Header";
import WhatsappButton from "../components/WhatsappButton";

export default function Register() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!form.firstname || !form.lastname) return setError("Nom et prénom obligatoires");
    if (!phoneRegex.test(form.phone)) return setError("Téléphone invalide");
    if (!emailRegex.test(form.email)) return setError("Email invalide");
    if (!passwordRegex.test(form.password)) return setError("Mot de passe invalide");

    setError("");
    alert("Compte créé avec succès !");
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-black flex flex-col items-center justify-center pt-24 px-4">
        <h1 className="text-white text-3xl md:text-4xl font-bold mb-8 text-center">
          Créer un compte
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <input
            type="text"
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            placeholder="Prénom"
            aria-label="Prénom"
            className="p-3 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-white"
            required
          />

          <input
            type="text"
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            placeholder="Nom"
            aria-label="Nom"
            className="p-3 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-white"
            required
          />

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Téléphone"
            aria-label="Téléphone"
            className="p-3 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-white"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            aria-label="Email"
            className="p-3 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-white"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            aria-label="Mot de passe"
            className="p-3 rounded bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-white"
            required
          />

          <button
            type="submit"
            className="bg-[#DD5212] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            S'inscrire
          </button>
        </form>
      </main>
      {/* Bouton WhatsApp flottant */}
      <WhatsappButton number="33612345678" />
    </>
  );
}
