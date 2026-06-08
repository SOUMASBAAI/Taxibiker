import { useState, useEffect } from "react";
import AdminHeader from "../components/admin/AdminHeader";
import ReservationCard from "../components/admin/ReservationCard";
import ReservationModal from "../components/admin/ReservationModal";
import EditReservationModal from "../Modal/EditReservationModal";
import authService from "../services/authService";
import { buildApiUrl } from "../config/api.js";

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);

  const mapApiStatusToUi = (apiStatus) => {
    switch (apiStatus) {
      case "pending":
        return "À confirmer";
      case "confirmed":
        return "Acceptée";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminée";
      case "cancelled":
      default:
        return "Annulée";
    }
  };

  const mapUiStatusToApi = (uiStatus) => {
    switch (uiStatus) {
      case "À confirmer":
        return "pending";
      case "Acceptée":
        return "confirmed";
      case "En cours":
        return "in_progress";
      case "Terminée":
        return "completed";
      case "Annulée":
      case "Refusée":
      default:
        return "cancelled";
    }
  };

  useEffect(() => {
    const user = authService.getUser();
    if (!user || !user.roles?.includes("ROLE_ADMIN")) {
      window.location.href = "/admin/login";
      return;
    }

    const fetchReservations = async () => {
      try {
        const response = await authService.authenticatedRequest(
          buildApiUrl("admin/reservations")
        );
        const data = await response.json();

        if (data.success) {
          // Convert API format to component format
          const formattedReservations = data.reservations.map((res) => ({
            id: res.id,
            firstname: res.client.name.split(" ")[0],
            lastname: res.client.name.split(" ").slice(1).join(" "),
            email: res.client.email,
            phone: res.client.phone,
            date: res.date.split(" ")[0],
            time: res.date.split(" ")[1]?.substring(0, 5) || "00:00",
            from: res.departure,
            to: res.arrival,
            status: mapApiStatusToUi(res.status),
            luggage: res.excessBaggage,
            stop: res.stop || "",
            notes: res.notes || "",
            price: parseFloat(res.price),
            type: res.type,
            hours: res.hours || null,
            paymentMethod: res.paymentMethod || "immediate",
          }));

          setReservations(formattedReservations);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des réservations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Réservations
  const handleUpdateReservation = async (updated) => {
    try {
      const dateTimeStr = `${updated.date}T${updated.time}:00`;
      const body = {
        type: updated.type,
        date: new Date(dateTimeStr).toISOString(),
        excessBaggage: updated.luggage,
        price: updated.price,
      };
      if (updated.type === "hourly") {
        body.hours = updated.hours;
      } else {
        body.stop = updated.stop || null;
      }

      const response = await authService.authenticatedRequest(
        buildApiUrl(`admin/reservations/${updated.id}`),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "Erreur lors de la modification");
        return;
      }

      const apiRes = result.reservation;
      const [datePart, timePart] = apiRes.date.split(" ");
      const formatted = {
        ...updated,
        date: datePart,
        time: timePart?.substring(0, 5) || updated.time,
        luggage: apiRes.excessBaggage,
        stop: apiRes.stop || "",
        notes: apiRes.notes || "",
        price: parseFloat(apiRes.price),
        hours: apiRes.hours ?? updated.hours,
        status: mapApiStatusToUi(apiRes.status),
      };

      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? formatted : r))
      );
      setEditingReservation(null);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la modification");
    }
  };
  const handleCancelReservation = async (id) => {
    // Appeler handleStatusChange qui fait la mise à jour dans la BDD
    await handleStatusChange(id, "Annulée");
  };

  const handleDeleteReservation = async (id, type) => {
    try {
      const response = await authService.authenticatedRequest(
        buildApiUrl(`admin/reservations/${id}`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setReservations((prev) =>
          prev.filter((r) => !(r.id === id && r.type === type))
        );
        setSelectedReservation(null);
      } else {
        alert("Erreur lors de la suppression: " + (result.error || "Erreur inconnue"));
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression de la course");
    }
  };

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      // Appeler l'API pour mettre à jour le statut dans la base de données
      const response = await authService.authenticatedRequest(
        buildApiUrl(`admin/reservations/${id}/status`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: mapUiStatusToApi(newStatus),
            type,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Mettre à jour l'état local uniquement si l'API a réussi
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        alert("Erreur lors de la mise à jour du statut: " + result.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Tri réservation
  const today = new Date();
  const pendingReservations = reservations.filter(
    (r) => r.status === "À confirmer"
  );
  const upcomingReservations = reservations.filter(
    (r) => r.status === "Acceptée"
  );
  const inProgressReservations = reservations.filter(
    (r) => r.status === "En cours"
  );
  const pastReservations = reservations.filter(
    (r) =>
      r.status === "Terminée" ||
      r.status === "Refusée" ||
      r.status === "Annulée"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#222] to-[#111] text-white">
      <AdminHeader />

      <div className="pt-24 px-4 sm:px-6 lg:px-12 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Réservations</h1>
          <p className="text-gray-400">
            Gérez toutes les réservations de vos clients
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-600 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              À confirmer ({pendingReservations.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "upcoming"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              À venir ({upcomingReservations.length})
            </button>
            <button
              onClick={() => setActiveTab("inProgress")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "inProgress"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              En cours ({inProgressReservations.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "past"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Passées ({pastReservations.length})
            </button>
          </nav>
        </div>

        <p className="text-center text-sm text-gray-400 mb-6">
          Les modifications de date, heure ou ajout de bagage seront prises en
          compte. Pour changer de trajet, créez une nouvelle réservation.
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des réservations...</p>
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && activeTab === "pending" && (
          <>
            {pendingReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune réservation à confirmer
                </h3>
                <p className="text-gray-400">
                  Les nouvelles réservations apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingReservations.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    onClick={() =>
                      setSelectedReservation((prev) =>
                        prev?.id === res.id ? null : res
                      )
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && activeTab === "upcoming" && (
          <>
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune réservation à venir
                </h3>
                <p className="text-gray-400">
                  Les réservations acceptées apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingReservations.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    onClick={() =>
                      setSelectedReservation((prev) =>
                        prev?.id === res.id ? null : res
                      )
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && activeTab === "inProgress" && (
          <>
            {inProgressReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">🏍️</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune course en cours
                </h3>
                <p className="text-gray-400">
                  Les courses actives apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inProgressReservations.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    onClick={() =>
                      setSelectedReservation((prev) =>
                        prev?.id === res.id ? null : res
                      )
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && activeTab === "past" && (
          <>
            {pastReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune réservation passée
                </h3>
                <p className="text-gray-400">L'historique apparaîtra ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pastReservations.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    onClick={() =>
                      setSelectedReservation((prev) =>
                        prev?.id === res.id ? null : res
                      )
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onEdit={(reservation) => {
            setEditingReservation(reservation);
            setSelectedReservation(null);
          }}
          onCancel={handleCancelReservation}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteReservation}
        />
      )}

      {editingReservation && (
        <EditReservationModal
          isAdmin
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onUpdate={handleUpdateReservation}
        />
      )}
    </div>
  );
}
