import React from "react";

export default function ViewReservationModal({ reservation, onClose }) {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center px-4 z-50 overflow-y-auto py-4">
      <div className="bg-white/10 backdrop-blur-md text-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Détails de la réservation</h2>
        </div>

        <div className="space-y-4">
          {/* Date et heure */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-orange-400">
              📅 Date et heure
            </h3>
            <p className="text-lg">
              {reservation.date} à {reservation.time}
            </p>
          </div>

          {/* Trajet */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-3 text-orange-400">🏍️ Trajet</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-400">Départ</p>
                  <p className="font-medium">{reservation.from}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-3">
                <div className="w-px h-6 bg-gray-600"></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-400">Arrivée</p>
                  <p className="font-medium">{reservation.to}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          {(reservation.luggage || reservation.stop) && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-orange-400">⚙️ Options</h3>
              <div className="space-y-2">
                {reservation.luggage && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    <span>Bagage volumineux</span>
                  </div>
                )}
                {reservation.stop && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    <span>Stop inclus: {reservation.stop}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {reservation.notes && (
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-orange-400">📝 Notes</h3>
              <p className="text-gray-200 whitespace-pre-wrap">{reservation.notes}</p>
            </div>
          )}

          {/* Prix */}
          <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Prix total</span>
              <span className="text-2xl font-bold text-orange-400">
                {reservation.price}€
              </span>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-orange-400">📊 Statut</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                reservation.status === "En attente"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : reservation.status === "Acceptée"
                  ? "bg-green-500/20 text-green-400"
                  : reservation.status === "Terminée"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {reservation.status}
            </span>
          </div>
        </div>

        {/* Bouton fermer */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
