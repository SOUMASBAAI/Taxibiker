import { useState } from "react";
import {
  FaUser,
  FaPlus,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaCreditCard,
  FaHistory,
  FaCheck,
} from "react-icons/fa";
import AddClientModal from "./AddClientModal";
import RegularizeCreditModal from "./RegularizeCreditModal";
import ClientCreditHistoryModal from "./ClientCreditHistoryModal";
import { buildApiUrl } from "../../config/api.js";

export default function ClientTable({
  clients,
  onAdd,
  onRemove,
  onEdit,
  onUpdateClient,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [regularizeClient, setRegularizeClient] = useState(null);
  const [historyClient, setHistoryClient] = useState(null);

  const handleRegularizeCredit = async (clientId) => {
    try {
      const response = await fetch(buildApiUrl("user/credit/reset"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: clientId }),
      });

      const result = await response.json();

      if (result.success) {
        // Mettre à jour le client dans la liste
        if (onUpdateClient) {
          onUpdateClient({ ...regularizeClient, current_credit: 0 });
        }
        alert("Crédit régularisé avec succès !");
      } else {
        alert("Erreur lors de la régularisation : " + result.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    }
  };

  return (
    <section className="mb-12">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-xl">
              <FaUser className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Gestion des clients
              </h2>
              <p className="text-blue-200 text-sm">
                {clients.length} client{clients.length > 1 ? "s" : ""}{" "}
                enregistré{clients.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
          >
            <FaPlus className="text-sm" />
            <span className="hidden sm:inline">Nouveau client</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {/* Contenu des clients */}
      <div className="bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-300">
              Chargement des clients...
            </span>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="mx-auto text-4xl text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Aucun client
            </h3>
            <p className="text-gray-500">
              Commencez par ajouter votre premier client
            </p>
          </div>
        ) : (
          <>
            {/* Vue tableau pour desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Crédit mensuel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {clients.map((client, index) => (
                    <tr
                      key={client.id}
                      className={`hover:bg-white/5 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-gray-800/20" : "bg-gray-900/20"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-500/20 p-2 rounded-lg">
                            <span className="text-blue-400 font-mono text-sm">
                              #{client.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-2.5 rounded-xl">
                            <FaUser className="text-gray-300 text-sm" />
                          </div>
                          <div>
                            <div className="text-white font-semibold">
                              {client.firstname} {client.lastname}
                            </div>
                            <div className="text-gray-400 text-sm">Client</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FaEnvelope className="text-xs text-gray-500" />
                            <span className="text-sm">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <FaPhone className="text-xs text-gray-500" />
                              <span className="text-sm">{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaCreditCard
                              className={`text-sm ${
                                client.monthly_credit_enabled
                                  ? "text-green-400"
                                  : "text-gray-500"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                client.monthly_credit_enabled
                                  ? "text-green-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {client.monthly_credit_enabled
                                ? "Activé"
                                : "Désactivé"}
                            </span>
                          </div>
                          {client.monthly_credit_enabled &&
                            client.current_credit > 0 && (
                              <div className="text-xs text-orange-400 font-medium">
                                Doit: {client.current_credit.toFixed(2)}€
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onEdit(client)}
                            className="flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 p-2 rounded-lg font-medium transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
                            title="Modifier"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          {client.monthly_credit_enabled && (
                            <>
                              <button
                                onClick={() => setHistoryClient(client)}
                                className="flex items-center justify-center bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 p-2 rounded-lg font-medium transition-all duration-200 border border-green-500/30 hover:border-green-500/50"
                                title="Historique"
                              >
                                <FaHistory className="text-sm" />
                              </button>
                              {client.current_credit > 0 && (
                                <button
                                  onClick={() => setRegularizeClient(client)}
                                  className="flex items-center justify-center bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 hover:text-orange-300 p-2 rounded-lg font-medium transition-all duration-200 border border-orange-500/30 hover:border-orange-500/50"
                                  title="Régulariser"
                                >
                                  <FaCheck className="text-sm" />
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => onRemove(client.id)}
                            className="flex items-center justify-center bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 p-2 rounded-lg font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                            title="Supprimer"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vue cartes pour mobile et tablette */}
            <div className="lg:hidden divide-y divide-gray-700/50">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 sm:p-6 hover:bg-white/5 transition-colors duration-200"
                >
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-2.5 rounded-xl">
                        <FaUser className="text-gray-300 text-sm" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">
                          {client.firstname} {client.lastname}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <span>ID: #{client.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaCreditCard
                          className={`text-sm ${
                            client.monthly_credit_enabled
                              ? "text-green-400"
                              : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            client.monthly_credit_enabled
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-500"
                          }`}
                        >
                          {client.monthly_credit_enabled
                            ? "Crédit OK"
                            : "Pas de crédit"}
                        </span>
                      </div>
                      {client.monthly_credit_enabled &&
                        client.current_credit > 0 && (
                          <div className="bg-orange-500/10 px-2 py-1 rounded text-xs text-orange-400 font-medium">
                            Doit: {client.current_credit.toFixed(2)}€
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaEnvelope className="text-xs text-gray-500 w-4" />
                      <span className="text-sm break-all">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <FaPhone className="text-xs text-gray-500 w-4" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(client)}
                      className="flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 p-3 rounded-lg font-medium transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 flex-1"
                      title="Modifier"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    {client.monthly_credit_enabled && (
                      <button
                        onClick={() => setHistoryClient(client)}
                        className="flex items-center justify-center bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 p-3 rounded-lg font-medium transition-all duration-200 border border-green-500/30 hover:border-green-500/50 flex-1"
                        title="Historique crédit"
                      >
                        <FaHistory className="text-sm" />
                      </button>
                    )}
                    {client.monthly_credit_enabled &&
                      client.current_credit > 0 && (
                        <button
                          onClick={() => setRegularizeClient(client)}
                          className="flex items-center justify-center bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 hover:text-orange-300 p-3 rounded-lg font-medium transition-all duration-200 border border-orange-500/30 hover:border-orange-500/50 flex-1"
                          title="Régulariser"
                        >
                          <FaCheck className="text-sm" />
                        </button>
                      )}
                    <button
                      onClick={() => onRemove(client.id)}
                      className="flex items-center justify-center bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 p-3 rounded-lg font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50 flex-1"
                      title="Supprimer"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal d'ajout de client */}
      {isOpen && (
        <AddClientModal
          onClose={() => setIsOpen(false)}
          onAdd={(newClient) => {
            onAdd(newClient);
            setIsOpen(false);
          }}
        />
      )}

      {/* Modal de régularisation de crédit */}
      {regularizeClient && (
        <RegularizeCreditModal
          client={regularizeClient}
          onClose={() => setRegularizeClient(null)}
          onRegularize={handleRegularizeCredit}
        />
      )}

      {/* Modal d'historique de crédit client */}
      {historyClient && (
        <ClientCreditHistoryModal
          client={historyClient}
          isOpen={!!historyClient}
          onClose={() => setHistoryClient(null)}
        />
      )}
    </section>
  );
}
