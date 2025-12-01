import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCreditCard,
} from "react-icons/fa";

export default function AddClientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    monthly_credit_enabled: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.firstname || !form.lastname || !form.email || !form.password) {
      setError("Tous les champs obligatoires doivent être remplis");
      return;
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onAdd(form);
      onClose();
    } catch (error) {
      setError("Erreur lors de l'ajout du client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8 rounded-2xl w-full max-w-lg text-white border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500 p-3 rounded-xl">
            <FaUser className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Nouveau client</h2>
            <p className="text-gray-300 text-sm">Créer un compte client</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prénom <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="firstname"
                  placeholder="Prénom"
                  value={form.firstname}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Nom"
                  value={form.lastname}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="email@exemple.com"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Téléphone</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="06 12 34 56 78"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mot de passe <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mot de passe (min. 6 caractères)"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FaCreditCard className="text-green-400 text-xl" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  Crédit mensuel
                </h3>
                <p className="text-green-200 text-sm">
                  Autoriser le client à payer à la fin du mois
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="monthly_credit_enabled"
                  checked={form.monthly_credit_enabled}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              ℹ️ Le client recevra ses identifiants par email et pourra se
              connecter immédiatement.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white font-medium transition-all duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? "Création..." : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
