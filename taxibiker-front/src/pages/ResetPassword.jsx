import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Header from "../components/Header";
import { API_BASE_URL } from "../config/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Validation du token au chargement
  useEffect(() => {
    if (!token) {
      setError("Token manquant dans l'URL");
      setIsVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserInfo(data.user);
      } else {
        setError(data.error || "Token invalide ou expiré");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsVerifying(false);
    }
  };

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    return regex.test(pwd);
  };

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[\W_]/.test(pwd)) strength++;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError(
        "Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
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

  // Page de succès
  if (isSuccess) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <FaCheckCircle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-white text-4xl font-bold mb-4">
                Mot de passe modifié !
              </h1>

              <p className="text-gray-300 text-lg mb-8">
                Votre mot de passe a été modifié avec succès. Vous pouvez
                maintenant vous connecter avec votre nouveau mot de passe.
              </p>

              <button
                onClick={() => navigate("/user/login")}
                className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Se connecter
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Page de vérification du token
  if (isVerifying) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-white text-2xl font-bold">
                Vérification du lien...
              </h1>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Page d'erreur
  if (error && !userInfo) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <FaExclamationTriangle className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-white text-4xl font-bold mb-4">
                Lien invalide
              </h1>

              <p className="text-gray-300 text-lg mb-8">{error}</p>

              <div className="space-y-4">
                <Link
                  to="/forgot-password"
                  className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] block text-center"
                >
                  Demander un nouveau lien
                </Link>

                <Link
                  to="/user/login"
                  className="w-full text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium py-2 block text-center"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];
  const strengthLabels = [
    "Très faible",
    "Faible",
    "Moyen",
    "Fort",
    "Très fort",
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 py-12 pt-32">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <FaLock className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-white text-4xl font-bold mb-3">
              Nouveau mot de passe
            </h1>

            {userInfo && (
              <p className="text-gray-400 text-lg">
                Bonjour {userInfo.firstname}, créez votre nouveau mot de passe
              </p>
            )}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-white text-sm font-semibold mb-2"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Votre nouveau mot de passe"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i < passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">
                    Force :{" "}
                    <span className="text-white font-medium">
                      {strengthLabels[passwordStrength - 1] || "Très faible"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-white text-sm font-semibold mb-2"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="Confirmez votre mot de passe"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
              <h3 className="font-medium text-white mb-3">
                Exigences du mot de passe :
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className={password.length >= 12 ? "text-green-400" : ""}>
                  • Au moins 12 caractères
                </li>
                <li className={/[a-z]/.test(password) ? "text-green-400" : ""}>
                  • Une lettre minuscule
                </li>
                <li className={/[A-Z]/.test(password) ? "text-green-400" : ""}>
                  • Une lettre majuscule
                </li>
                <li className={/\d/.test(password) ? "text-green-400" : ""}>
                  • Un chiffre
                </li>
                <li className={/[\W_]/.test(password) ? "text-green-400" : ""}>
                  • Un caractère spécial
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !password ||
                !confirmPassword ||
                !validatePassword(password)
              }
              className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Modification en cours...
                </div>
              ) : (
                "Modifier le mot de passe"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/user/login"
              className="text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default ResetPassword;
