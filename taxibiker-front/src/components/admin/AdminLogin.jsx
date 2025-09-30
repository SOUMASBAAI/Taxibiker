import { useState } from "react";
import Footer from "../components/../Footer"; // 👈 j'importe ton footer

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Regex pour valider l'email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Regex pour valider le mot de passe
  const validatePassword = (pw) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).{12,}$/;
    return regex.test(pw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Le mot de passe doit comporter au moins 12 caractères et contenir majuscules, minuscules, chiffres et caractères spéciaux."
      );
      return;
    }

    setError("");
    console.log("Email:", email);
    console.log("Password:", password);
    // Ici tu peux appeler ton API et rediriger vers le dashboard
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Contenu principal */}
      <main className="flex flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-[#242424] w-full max-w-md p-8 rounded-lg shadow-lg flex flex-col"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Admin Login
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <label className="text-white mb-1">Email</label>
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 px-4 py-2 rounded bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          <label className="text-white mb-1">Mot de passe</label>
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 px-4 py-2 rounded bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          <div className="mb-6 text-right">
            <a href="#" className="text-orange-500 hover:underline text-sm">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#DD5212] text-white rounded-lg hover:bg-orange-600 transition font-semibold"
          >
            Se connecter
          </button>
        </form>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
