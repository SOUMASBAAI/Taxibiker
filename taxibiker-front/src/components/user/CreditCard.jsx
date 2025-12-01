import React from "react";
import { FaCreditCard, FaCalendarAlt, FaHistory } from "react-icons/fa";

export default function CreditCard({ creditInfo, isLoading, onShowHistory }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <FaCreditCard className="text-green-400 text-xl" />
            </div>
            <div className="flex-1">
              <div className="h-6 bg-gray-600 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!creditInfo?.enabled) {
    return null;
  }

  const hasCredit = creditInfo.current_amount > 0;

  return (
    <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-4 sm:p-6 mb-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-3 rounded-xl">
            <FaCreditCard className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Crédit Mensuel
            </h2>
            <p className="text-green-200 text-sm">
              Paiement en fin de mois activé
            </p>
          </div>
        </div>
        <div className="bg-green-500/20 px-3 py-1 rounded-full">
          <span className="text-green-400 text-xs font-semibold">ACTIF</span>
        </div>
      </div>

      {/* Montant du crédit */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2">Montant à régler</p>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
            {creditInfo.formatted_amount}
          </div>
          {hasCredit ? (
            <p className="text-green-400 text-sm">
              À régler avant la fin du mois
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Aucun montant en cours</p>
          )}
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
          <FaCalendarAlt className="text-green-400 text-sm mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium mb-1">
              Facturation mensuelle
            </p>
            <p className="text-green-200 text-xs">
              Vos courses sont facturées à la fin de chaque mois
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-green-500/20">
        <button
          onClick={onShowHistory}
          className="w-full flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg font-medium transition-colors border border-green-500/30 text-sm"
        >
          <FaHistory className="text-xs" />
          Historique
        </button>
      </div>
    </div>
  );
}
