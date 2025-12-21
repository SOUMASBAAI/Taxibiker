import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "../components/Header";
import WhatsappButton from "../components/WhatsappButton";
import authService from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, ""); // que chiffres
      setForm({ ...form, [name]: phoneValue });
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!form.firstname || !form.lastname)
      return setError("Nom et prénom obligatoires");
    if (!phoneRegex.test(form.phone))
      return setError("Téléphone invalide (10 à 15 chiffres uniquement)");
    if (!emailRegex.test(form.email)) return setError("Email invalide");
    if (!passwordRegex.test(form.password))
      return setError(
        "Mot de passe invalide : min. 12 caractères, majuscule, minuscule, chiffre et caractère spécial."
      );
    if (form.password !== form.confirmPassword)
      return setError("Les mots de passe ne correspondent pas.");
    if (!form.acceptTerms)
      return setError("Vous devez accepter les conditions d'utilisation.");

    setError("");

    try {
      const userData = {
        firstname: form.firstname,
        lastname: form.lastname,
        phone: form.phone,
        email: form.email,
        password: form.password,
      };

      const response = await authService.register(userData);

      setSuccess("Compte créé avec succès ! Redirection...");
      setForm({
        firstname: "",
        lastname: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      });

      // Rediriger vers la page de réservation après 1.5 secondes
      setTimeout(() => navigate("/reservation"), 1500);
    } catch (err) {
      setError(
        err.message ||
          "Impossible de créer le compte. Vérifiez votre connexion."
      );
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-white text-4xl font-bold mb-3">
              Créer un compte
            </h1>
            <p className="text-gray-400 text-lg">
              Rejoignez la communauté TaxiBiker
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-white text-sm font-semibold mb-2"
                >
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastname"
                  className="block text-white text-sm font-semibold mb-2"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-white text-sm font-semibold mb-2"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>

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
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  required
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
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  required
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

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 bg-gray-800 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                  required
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor="acceptTerms"
                  className="text-gray-300 cursor-pointer"
                >
                  J'accepte les{" "}
                  <Link
                    to="/terms"
                    className="text-orange-400 hover:text-orange-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link
                    to="/privacy"
                    className="text-orange-400 hover:text-orange-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    politique de confidentialité
                  </Link>{" "}
                  de TaxiBiker.
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#DD5212] to-orange-600 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-[#DD5212] transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Créer mon compte
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/user/login"
                className="text-orange-400 hover:text-orange-300 transition-colors duration-200 font-semibold"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>

      <WhatsappButton number="33612345678" />
    </>
  );
}
