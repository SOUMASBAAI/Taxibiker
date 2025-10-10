import { useState } from "react";
import {
  FaUser,
  FaPlus,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaEdit,
} from "react-icons/fa";
import AddClientModal from "./AddClientModal";

export default function ClientTable({
  clients,
  onAdd,
  onRemove,
  onEdit,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

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
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105"
          >
            <FaPlus className="text-sm" />
            Nouveau client
          </button>
        </div>
      </div>

      {/* Tableau des clients */}
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
          <div className="overflow-x-auto">
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
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onEdit(client)}
                          className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
                        >
                          <FaEdit className="text-xs" />
                          Modifier
                        </button>
                        <button
                          onClick={() => onRemove(client.id)}
                          className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                        >
                          <FaTrash className="text-xs" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </section>
  );
}
