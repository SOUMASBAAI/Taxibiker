import React, { useState, useEffect } from "react";
import DashboardHeader from "../components/user/DashboardHeader";
import authService from "../services/authService";
import WhatsappButton from "../components/WhatsappButton";
import { buildApiUrl } from "../config/api.js";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function UserSettings() {
  const [userInfo, setUserInfo] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleNavigation = (page) => {
    if (page === "reservation") {
      window.location.href = "/reservation";
    } else if (page === "home") {
      window.location.href = "/";
    } else if (page === "logout") {
      authService.logout();
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = authService.getUser();
        if (user) {
          setUserInfo({
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: user.email || "",
            phone: user.phone || "",
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des informations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUserInfoChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await authService.authenticatedRequest(
        buildApiUrl("user/update"),
        {
          method: "PATCH",
          body: JSON.stringify(userInfo),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Mettre à jour les informations utilisateur dans le localStorage
        authService.setUser(result.user);
        showNotification("success", "Informations mises à jour avec succès");
      } else {
        showNotification(
          "error",
          result.error || "Erreur lors de la mise à jour"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("error", "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification(
        "error",
        "Les nouveaux mots de passe ne correspondent pas"
      );
      return;
    }

    if (passwords.newPassword.length < 6) {
      showNotification(
        "error",
        "Le nouveau mot de passe doit contenir au moins 6 caractères"
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await authService.authenticatedRequest(
        buildApiUrl("user/change-password"),
        {
          method: "PATCH",
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        showNotification("success", "Mot de passe modifié avec succès");
      } else {
        showNotification(
          "error",
          result.error || "Erreur lors du changement de mot de passe"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("error", "Erreur lors du changement de mot de passe");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#222] to-[#111] text-white min-h-screen">
        <DashboardHeader onNavigate={handleNavigation} />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#222] to-[#111] text-white min-h-screen">
      <DashboardHeader onNavigate={handleNavigation} />

      {/* Décalage pour header fixe */}
      <div className="pt-24 px-4 sm:px-6 lg:px-12 min-h-screen pb-12">
        {/* En-tête */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-xl">
                <FaUser className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Paramètres du compte
                </h1>
                <p className="text-gray-300 text-sm sm:text-base">
                  Gérez vos informations personnelles et votre sécurité
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Informations personnelles */}
          <div className="bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaUser className="text-orange-500" />
              Informations personnelles
            </h2>

            <form onSubmit={handleUpdateUserInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={userInfo.firstname}
                    onChange={(e) =>
                      handleUserInfoChange("firstname", e.target.value)
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    value={userInfo.lastname}
                    onChange={(e) =>
                      handleUserInfoChange("lastname", e.target.value)
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      handleUserInfoChange("email", e.target.value)
                    }
                    className="w-full pl-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) =>
                      handleUserInfoChange("phone", e.target.value)
                    }
                    className="w-full pl-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                >
                  {isSaving ? "Sauvegarde..." : "Sauvegarder les informations"}
                </button>
              </div>
            </form>
          </div>

          {/* Changement de mot de passe */}
          <div className="bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaLock className="text-orange-500" />
              Changer le mot de passe
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                    className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className="w-full pl-10 pr-10 p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Le mot de passe doit contenir au moins 6 caractères.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                >
                  {isSaving ? "Modification..." : "Changer le mot de passe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {notification.type === "success" ? "✅" : "❌"}
            </span>
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <WhatsappButton number="33788268354" />
    </div>
  );
}
