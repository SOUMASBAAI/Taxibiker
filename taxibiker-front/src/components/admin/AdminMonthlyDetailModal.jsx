import React from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaPlus,
  FaMinus,
  FaMotorcycle,
  FaClock,
  FaUser,
} from "react-icons/fa";

export default function AdminMonthlyDetailModal({
  monthData,
  client,
  isOpen,
  onClose,
}) {
  if (!isOpen || !monthData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "confirmed":
        return "text-green-400";
      case "completed":
        return "text-blue-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmée";
      case "completed":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8 rounded-2xl w-full max-w-4xl text-white border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-xl">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Détail - {formatMonthName(monthData.month)}
              </h2>
              <p className="text-gray-300 text-sm">
                <FaUser className="inline mr-1" />
                {client.firstname} {client.lastname} • {monthData.total_rides}{" "}
                course
                {monthData.total_rides > 1 ? "s" : ""} •{" "}
                {monthData.total_amount.toFixed(2)}€
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

        {/* Résumé du mois */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {monthData.total_rides}
              </div>
              <p className="text-gray-300 text-sm">
                Course{monthData.total_rides > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {monthData.total_amount.toFixed(2)}€
              </div>
              <p className="text-gray-300 text-sm">Montant total</p>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  monthData.regularized ? "text-green-400" : "text-orange-400"
                }`}
              >
                {monthData.regularized ? "Oui" : "Non"}
              </div>
              <p className="text-gray-300 text-sm">Régularisé</p>
            </div>
          </div>
        </div>

        {/* Liste des courses */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMotorcycle className="text-orange-400" />
            Courses du mois
          </h3>

          {monthData.rides && monthData.rides.length > 0 ? (
            <div className="space-y-3">
              {monthData.rides.map((ride, index) => (
                <div
                  key={`${ride.id}-${index}`}
                  className="bg-black/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          ride.type === "charge"
                            ? "bg-orange-500/20"
                            : "bg-green-500/20"
                        }`}
                      >
                        {ride.type === "charge" ? (
                          <FaPlus className="text-orange-400 text-sm" />
                        ) : (
                          <FaMinus className="text-green-400 text-sm" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-medium text-sm">
                            {ride.description}
                          </p>
                          <span
                            className={`text-lg font-bold ${
                              ride.type === "charge"
                                ? "text-orange-400"
                                : "text-green-400"
                            }`}
                          >
                            {ride.type === "charge" ? "+" : "-"}
                            {ride.amount.toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-gray-400">
                            <FaClock className="text-xs" />
                            <span>{formatDate(ride.date)}</span>
                            <span>•</span>
                            <span>ID: #{ride.id}</span>
                            <span>•</span>
                            <span>
                              {ride.reservation_type === "classic"
                                ? "Course classique"
                                : "Course horaire"}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full ${getStatusColor(
                              ride.status
                            )} bg-current/10`}
                          >
                            {getStatusText(ride.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaMotorcycle className="mx-auto text-3xl text-gray-500 mb-3" />
              <p className="text-gray-400">
                Aucune course trouvée pour ce mois
              </p>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
