import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import authService from "../services/authService";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) return setError("Email invalide");
    if (!email || !password)
      return setError("Veuillez remplir tous les champs");

    setError("");
    setIsLoading(true);

    try {
      await authService.login(email, password);
      setSuccess("Connexion réussie ! Redirection...");

      // Rediriger vers le dashboard après 1 seconde
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.message || "Identifiants invalides");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-white text-4xl font-bold mb-3">Connexion</h1>
            <p className="text-gray-400 text-lg">
              Accédez à votre espace client
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-r-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border-l-4 border-green-500 text-green-300 px-4 py-3 rounded-r-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-white text-sm font-semibold mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-4 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-white text-sm font-semibold mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-4 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <a
                href="#"
                className="text-orange-400 text-sm hover:text-orange-300 transition-colors duration-200 font-medium"
              >
                Mot de passe oublié ?
              </a>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-200 font-semibold"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
