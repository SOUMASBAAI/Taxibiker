import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import Header from "../components/Header";
import { buildApiUrl } from "../config/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(buildApiUrl("forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <FaCheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-white text-4xl font-bold mb-4">
                Email envoyé !
              </h1>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {message}
              </p>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-8">
                <p className="text-orange-300 text-sm">
                  <strong>Vérifiez votre boîte email</strong> (y compris les
                  spams) et cliquez sur le lien de réinitialisation.
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  to="/user/login"
                  className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Retour à la connexion
                </Link>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                    setMessage("");
                  }}
                  className="w-full text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium py-2"
                >
                  Renvoyer un email
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaEnvelope className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-white text-4xl font-bold mb-3">
              Mot de passe oublié ?
            </h1>

            <p className="text-gray-400 text-lg">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-300 px-4 py-3 rounded-r-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-white text-sm font-semibold mb-2"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                placeholder="votre@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </div>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <Link
                to="/user/login"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium"
              >
                <FaArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
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
};

export default ForgotPassword;
