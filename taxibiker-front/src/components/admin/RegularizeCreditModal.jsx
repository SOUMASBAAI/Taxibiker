import React, { useState } from "react";
import {
  FaTimes,
  FaCreditCard,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function RegularizeCreditModal({
  client,
  onClose,
  onRegularize,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRegularize = async () => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir régulariser le crédit de ${client.firstname} ${client.lastname} ?\n\nCette action remettra son crédit à 0.00€.`
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onRegularize(client.id);
      onClose();
    } catch (error) {
      setError("Erreur lors de la régularisation du crédit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!client) return null;

  const hasCredit = client.current_credit > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8 rounded-2xl w-full max-w-lg text-white border border-gray-700/50 shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-xl">
              <FaCreditCard className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Régulariser le Crédit</h2>
              <p className="text-gray-300 text-sm">
                Client: {client.firstname} {client.lastname}
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

        {/* Informations du crédit */}
        <div className="bg-black/30 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FaCreditCard
                className={`text-2xl ${
                  hasCredit ? "text-orange-400" : "text-gray-500"
                }`}
              />
              <span className="text-gray-300 text-lg">Crédit actuel</span>
            </div>
            <div
              className={`text-4xl font-bold mb-2 ${
                hasCredit ? "text-orange-400" : "text-gray-500"
              }`}
            >
              {client.current_credit.toFixed(2)}€
            </div>
            {hasCredit ? (
              <p className="text-orange-300 text-sm">Montant à régulariser</p>
            ) : (
              <p className="text-gray-400 text-sm">
                Aucun montant à régulariser
              </p>
            )}
          </div>
        </div>

        {/* Informations sur la régularisation */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-2">
                À propos de la régularisation
              </h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Le crédit du client sera remis à 0.00€</li>
                <li>• Cette action confirme le paiement du montant dû</li>
                <li>• L'historique des transactions sera conservé</li>
                <li>
                  • Le client pourra continuer à utiliser son crédit mensuel
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white font-medium transition-all duration-200"
          >
            Annuler
          </button>
          <button
            onClick={handleRegularize}
            disabled={isSubmitting || !hasCredit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Régularisation...
              </>
            ) : (
              <>
                <FaCheck className="text-sm" />
                {hasCredit
                  ? "Régulariser le crédit"
                  : "Aucun crédit à régulariser"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
