import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaTimes } from "react-icons/fa";

export default function EditClientModal({ client, onClose, onEdit }) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client) {
      setForm({
        firstname: client.firstname || "",
        lastname: client.lastname || "",
        email: client.email || "",
        phone: client.phone || "",
      });
    }
  }, [client]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.firstname || !form.lastname || !form.email) {
      setError("Prénom, nom et email sont obligatoires");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onEdit(form);
      onClose();
    } catch (error) {
      setError("Erreur lors de la modification du client");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl w-full max-w-lg text-white border border-gray-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-xl">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Modifier le client</h2>
              <p className="text-gray-300 text-sm">
                Mettre à jour les informations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              ℹ️ Les modifications seront appliquées immédiatement au compte du
              client.
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
              {isSubmitting ? "Modification..." : "Modifier le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
