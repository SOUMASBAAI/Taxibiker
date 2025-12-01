import React from "react";
import {
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaSuitcase,
  FaEuroSign,
} from "react-icons/fa";

export default function ReservationCard({ reservation, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Acceptée":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Refusée":
      case "Annulée":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "En cours":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Terminée":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getTypeIcon = (type) => {
    return type === "hourly" ? "⏰" : "🚕";
  };

  return (
    <article
      onClick={onClick}
      className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-600/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:scale-[1.02]"
    >
      {/* Header avec statut et type */}
      <div className="p-4 pb-0">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {getTypeIcon(reservation.type)}
            </div>
            <div>
              <h3 className="text-white font-bold text-base">
                #{reservation.id}
              </h3>
              <p className="text-gray-400 text-xs flex items-center gap-1">
                <FaClock className="text-xs" />
                {reservation.date} à {reservation.time}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
              reservation.status
            )}`}
          >
            {reservation.status}
          </span>
        </div>
      </div>

      {/* Informations client */}
      <div className="px-4 py-2 bg-gray-700/30 border-y border-gray-600/30">
        <div className="flex items-center gap-2">
          <FaUser className="text-gray-400 text-sm" />
          <span className="text-white font-medium text-sm">
            {reservation.firstname} {reservation.lastname || ""}
          </span>
        </div>
      </div>

      {/* Trajet */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Départ</p>
              <p className="text-white text-sm font-medium line-clamp-2">
                {reservation.from}
              </p>
            </div>
          </div>

          {reservation.stop && (
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-1">Arrêt</p>
                <p className="text-white text-sm font-medium line-clamp-2">
                  {reservation.stop}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Arrivée</p>
              <p className="text-white text-sm font-medium line-clamp-2">
                {reservation.to}
              </p>
            </div>
          </div>
        </div>

        {/* Options et prix */}
        <div className="pt-3 border-t border-gray-600/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {reservation.luggage && (
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                  <FaSuitcase className="text-xs" />
                  +15€
                </span>
              )}
              {reservation.type === "hourly" && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                  {reservation.hours}h
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white font-bold text-lg">
                <FaEuroSign className="text-sm" />
                {reservation.price + (reservation.luggage ? 15 : 0)}
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Mode de paiement</span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                reservation.paymentMethod === "credit"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              {reservation.paymentMethod === "credit"
                ? "📅 Crédit mensuel"
                : "💳 Paiement immédiat"}
            </span>
          </div>
        </div>
      </div>

      {/* Effet hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>
    </article>
  );
}
