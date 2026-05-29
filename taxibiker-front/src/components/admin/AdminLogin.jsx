import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "../components/../Footer"; // 👈 j'importe ton footer
import authService from "../../services/authService";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
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
    setIsSubmitting(true);

    try {
      const data = await authService.login(email, password);

      const roles = data.user?.roles || [];
      const isAdmin = roles.includes("ROLE_ADMIN");

      if (!isAdmin) {
        authService.logout();
        setError("Accès refusé : vous devez être administrateur.");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message || "Connexion impossible");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-12 rounded bg-white text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <FaEyeSlash className="w-5 h-5" />
              ) : (
                <FaEye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="mb-6 text-right">
            <Link
              to="/forgot-password"
              className="text-orange-500 hover:underline text-sm transition-colors duration-200"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-[#DD5212] text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
