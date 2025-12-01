import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaHistory,
  FaCreditCard,
  FaEye,
  FaCheck,
  FaTimes as FaTimesCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import authService from "../../services/authService";
import MonthlyDetailModal from "./MonthlyDetailModal";

export default function CreditHistoryModal({ isOpen, onClose }) {
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showMonthDetail, setShowMonthDetail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCreditHistory();
    }
  }, [isOpen]);

  const fetchCreditHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.authenticatedRequest(
        "http://localhost:8000/api/user/credit/history"
      );
      const data = await response.json();

      if (data.success) {
        setMonthlySummary(data.monthly_summary || []);
        setUserInfo(data.user);
      } else {
        setError(data.error || "Erreur lors du chargement de l'historique");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMonthDetail = (monthData) => {
    setSelectedMonth(monthData);
    setShowMonthDetail(true);
  };

  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8 rounded-2xl w-full max-w-4xl text-white border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-3 rounded-xl">
                <FaHistory className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Historique du Crédit</h2>
                <p className="text-gray-300 text-sm">
                  Résumé mensuel de vos courses
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

          {/* Résumé du crédit */}
          {userInfo && (
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCreditCard className="text-blue-400 text-lg" />
                  <div>
                    <h3 className="text-white font-semibold">Crédit actuel</h3>
                    <p className="text-blue-200 text-sm">
                      Statut:{" "}
                      {userInfo.monthly_credit_enabled ? "Activé" : "Désactivé"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      userInfo.current_credit > 0
                        ? "text-orange-400"
                        : "text-green-400"
                    }`}
                  >
                    {userInfo.current_credit.toFixed(2)}€
                  </div>
                  <p className="text-gray-300 text-xs">
                    {monthlySummary.length} mois d'historique
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-300">
                  Chargement de l'historique...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">
                  Erreur
                </h3>
                <p className="text-gray-400">{error}</p>
              </div>
            ) : !userInfo?.monthly_credit_enabled ? (
              <div className="text-center py-12">
                <FaCreditCard className="mx-auto text-4xl text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Crédit mensuel désactivé
                </h3>
                <p className="text-gray-500">
                  Votre compte n'utilise pas le système de crédit mensuel
                </p>
              </div>
            ) : monthlySummary.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="mx-auto text-4xl text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Aucun historique
                </h3>
                <p className="text-gray-500">
                  Vous n'avez pas encore de courses avec crédit mensuel
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {monthlySummary.map((month) => (
                  <div
                    key={month.month}
                    className="bg-black/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                          <FaCalendarAlt className="text-blue-400 text-lg" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {formatMonthName(month.month)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>
                              {month.total_rides} course
                              {month.total_rides > 1 ? "s" : ""}
                            </span>
                            <span>•</span>
                            <span className="text-orange-400 font-medium">
                              {month.total_amount.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Statut de régularisation */}
                        <div className="flex items-center gap-2">
                          {month.regularized ? (
                            <>
                              <FaCheck className="text-green-400 text-sm" />
                              <span className="text-green-400 text-sm font-medium">
                                Régularisé
                              </span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="text-orange-400 text-sm" />
                              <span className="text-orange-400 text-sm font-medium">
                                En attente
                              </span>
                            </>
                          )}
                        </div>

                        {/* Bouton pour voir les détails */}
                        <button
                          onClick={() => handleViewMonthDetail(month)}
                          className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 text-sm"
                        >
                          <FaEye className="text-xs" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Modal de détail mensuel */}
      {showMonthDetail && selectedMonth && (
        <MonthlyDetailModal
          monthData={selectedMonth}
          isOpen={showMonthDetail}
          onClose={() => {
            setShowMonthDetail(false);
            setSelectedMonth(null);
          }}
        />
      )}
    </>
  );
}
