import { useState, useEffect } from "react";
import AdminHeader from "../components/admin/AdminHeader";
import ClientTable from "../components/admin/ClientTable";
import EditClientModal from "../components/admin/EditClientModal";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  // Fonction pour afficher les notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Récupérer les clients depuis l'API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/api/admin/clients");
      const result = await response.json();

      if (result.success) {
        setClients(result.clients);
      } else {
        showNotification(
          "error",
          result.error || "Erreur lors du chargement des clients"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("error", "Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Ajouter un client
  const handleAddClient = async (newClientData) => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClientData),
      });

      const result = await response.json();

      if (result.success) {
        setClients((prev) => [...prev, result.client]);
        showNotification("success", "Client ajouté avec succès");
      } else {
        showNotification(
          "error",
          result.error || "Erreur lors de l'ajout du client"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("error", "Erreur de connexion au serveur");
    }
  };

  // Modifier un client
  const handleEditClient = async (updatedClientData) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/clients/${editingClient.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedClientData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setClients((prev) =>
          prev.map((c) => (c.id === editingClient.id ? result.client : c))
        );
        showNotification("success", "Client modifié avec succès");
        setEditingClient(null);
      } else {
        showNotification(
          "error",
          result.error || "Erreur lors de la modification du client"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("error", "Erreur de connexion au serveur");
    }
  };

  // Ouvrir le modal d'édition
  const handleOpenEditModal = (client) => {
    setEditingClient(client);
  };
  const handleRemoveClient = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/clients/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        showNotification("success", "Client supprimé avec succès");
      } else {
        showNotification(
          "error",
          result.error || "Erreur lors de la suppression du client"
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      showNotification("error", "Erreur de connexion au serveur");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#222] to-[#111] text-white">
      <AdminHeader />

      <div className="pt-24 px-4 sm:px-6 lg:px-12 pb-12">
        

        <ClientTable
          clients={clients}
          onAdd={handleAddClient}
          onRemove={handleRemoveClient}
          onEdit={handleOpenEditModal}
          isLoading={isLoading}
        />
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

      {/* Modal d'édition de client */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onEdit={handleEditClient}
        />
      )}
    </div>
  );
}
