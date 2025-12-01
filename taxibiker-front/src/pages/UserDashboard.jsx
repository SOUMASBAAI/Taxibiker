import React, { useEffect, useState } from "react";
import ViewReservationModal from "../Modal/ViewReservationModal";
import EditReservationModal from "../Modal/EditReservationModal";
import DashboardHeader from "../components/user/DashboardHeader";
import CreditCard from "../components/user/CreditCard";
import CreditHistoryModal from "../components/user/CreditHistoryModal";
import authService from "../services/authService";
import WhatsappButton from "../components/WhatsappButton";
import {
  FaMotorcycle,
  FaClock,
  FaEdit,
  FaTimes,
  FaEye,
  FaDownload,
} from "react-icons/fa";

export default function UserDashboard() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [creditInfo, setCreditInfo] = useState(null);
  const [isCreditLoading, setIsCreditLoading] = useState(true);
  const [showCreditHistory, setShowCreditHistory] = useState(false);

  const handleNavigation = (page) => {
    if (page === "reservation") {
      window.location.href = "/reservation";
    } else if (page === "home") {
      window.location.href = "/";
    } else if (page === "settings") {
      window.location.href = "/settings";
    } else if (page === "logout") {
      authService.logout();
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await authService.authenticatedRequest(
          "http://localhost:8000/api/reservations/my"
        );
        const data = await response.json();

        if (data.success) {
          // Convert API format to component format
          const formattedReservations = data.reservations.map((res) => {
            const dateTime = res.date.split(" ");
            const user = authService.getUser();

            return {
              id: res.id,
              date: dateTime[0],
              time: dateTime[1]?.substring(0, 5) || "00:00",
              from: res.departure,
              to: res.arrival,
              client: {
                firstname: user?.firstname || "",
                lastname: user?.lastname || "",
                phone: user?.phone || "",
                email: user?.email || "",
              },
              luggage: res.excessBaggage,
              stop: res.stop || "",
              status:
                res.status === "pending"
                  ? "En attente"
                  : res.status === "confirmed"
                  ? "Acceptée"
                  : res.status === "in_progress"
                  ? "En cours"
                  : res.status === "completed"
                  ? "Terminée"
                  : res.status === "cancelled"
                  ? "Annulée"
                  : "Refusée",
              price: parseFloat(res.price),
              type: res.type,
              hours: res.hours || null,
              isRegularized: res.isRegularized || false,
            };
          });

          setReservations(formattedReservations);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des réservations:", error);
        // Si erreur (non connecté), rediriger vers login
        if (error.message === "Non authentifié") {
          window.location.href = "/user/login";
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCreditInfo = async () => {
      try {
        const response = await authService.authenticatedRequest(
          "http://localhost:8000/api/user/credit"
        );
        const data = await response.json();

        if (data.success) {
          setCreditInfo(data.credit);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du crédit:", error);
      } finally {
        setIsCreditLoading(false);
      }
    };

    fetchReservations();
    fetchCreditInfo();
  }, []);

  const handleUpdateReservation = async (updated) => {
    try {
      // Convertir la date et l'heure en format ISO
      const dateTimeStr = `${updated.date} ${updated.time}`;
      const dateTime = new Date(dateTimeStr);

      const response = await authService.authenticatedRequest(
        `http://localhost:8000/api/reservations/${updated.id}/update`,
        {
          method: "PATCH",
          body: JSON.stringify({
            date: dateTime.toISOString(),
            excessBaggage: updated.luggage,
            stop: updated.stop || null,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Mettre à jour l'état local avec les données du backend
        const updatedReservation = result.reservation;
        const dateTime = updatedReservation.date.split(" ");

        setReservations((prev) =>
          prev.map((r) =>
            r.id === updated.id
              ? {
                  ...r,
                  date: dateTime[0],
                  time: dateTime[1]?.substring(0, 5) || "00:00",
                  luggage: updatedReservation.excessBaggage,
                  stop: updatedReservation.stop || "",
                }
              : r
          )
        );
        setNotification({
          type: "success",
          message: "Réservation modifiée avec succès",
        });
        setShowEditModal(false); // Fermer le modal d'édition
        setSelectedReservation(null);
        setTimeout(() => setNotification(null), 5000);
      } else {
        alert("Erreur lors de la modification: " + result.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la modification");
    }
  };

  const handleCancelReservation = async (id, e) => {
    if (e) e.stopPropagation();

    if (!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      return;
    }

    try {
      const response = await authService.authenticatedRequest(
        `http://localhost:8000/api/reservations/${id}/cancel`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (result.success) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "Annulée" } : r))
        );
        setNotification({
          type: "success",
          message: "Réservation annulée avec succès",
        });
        setShowEditModal(false); // Fermer le modal d'édition
        setShowViewModal(false); // Fermer le modal de vue
        setSelectedReservation(null);
        setTimeout(() => setNotification(null), 5000);
      } else {
        alert("Erreur lors de l'annulation: " + result.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'annulation");
    }
  };

  const handleViewReservation = (reservation, e) => {
    if (e) e.stopPropagation();
    setSelectedReservation(reservation);
    setShowViewModal(true);
    setShowEditModal(false);
  };

  const handleEditReservation = (reservation, e) => {
    if (e) e.stopPropagation();
    setSelectedReservation(reservation);
    setShowEditModal(true);
    setShowViewModal(false);
  };

  const handleCloseModals = () => {
    setSelectedReservation(null);
    setShowViewModal(false);
    setShowEditModal(false);
  };

  const handleDownloadInvoice = async (reservationId, isRegularized, e) => {
    if (e) e.stopPropagation();

    // Vérifier si la réservation est régularisée
    if (!isRegularized) {
      setNotification({
        type: "error",
        message:
          "Impossible de télécharger la facture avant régularisation du crédit",
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      const response = await authService.authenticatedRequest(
        `http://localhost:8000/api/invoice/${reservationId}`
      );

      if (response.ok) {
        const htmlContent = await response.text();
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `facture_${reservationId}_${
          new Date().toISOString().split("T")[0]
        }.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setNotification({
          type: "success",
          message: "Facture téléchargée avec succès",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        setNotification({
          type: "error",
          message:
            "Erreur lors du téléchargement: " +
            (errorData.error || "Erreur inconnue"),
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setNotification({
        type: "error",
        message: "Erreur lors du téléchargement de la facture",
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const today = new Date();

  const upcomingReservations = reservations.filter(
    (r) => r.status === "Acceptée" && new Date(r.date) >= today
  );

  const pendingConfirmationReservations = reservations.filter(
    (r) => r.status === "En attente"
  );

  const pastReservations = reservations.filter(
    (r) =>
      (r.status === "Acceptée" && new Date(r.date) < today) ||
      r.status === "Terminée" ||
      r.status === "Refusée" ||
      r.status === "Annulée"
  );

  return (
    <div className="bg-gradient-to-br from-[#222] to-[#111] text-white min-h-screen">
      <DashboardHeader onNavigate={handleNavigation} />

      {/* Décalage pour header fixe */}
      <div className="pt-24 px-4 sm:px-6 lg:px-12 min-h-screen pb-12">
        {/* Section de bienvenue professionnelle */}
        <div className="mb-8">
          {/* En-tête avec gradient */}
          <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-3 rounded-xl">
                <FaMotorcycle className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Bonjour, {authService.getUser()?.firstname || "Voyageur"}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base">
                  Bienvenue sur votre espace personnel TaxiBiker
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Crédit */}
        <CreditCard
          creditInfo={creditInfo}
          isLoading={isCreditLoading}
          onShowHistory={() => setShowCreditHistory(true)}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de vos réservations...</p>
          </div>
        )}

        {/* No Reservations Message */}
        {!isLoading && reservations.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl">
            <FaMotorcycle className="text-[#DD5212] text-6xl mb-4 mx-auto" />
            <h3 className="text-2xl font-semibold mb-2">Aucune réservation</h3>
            <p className="text-gray-400 mb-6">
              Vous n'avez pas encore effectué de réservation
            </p>
            <a
              href="/reservation"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              Faire une réservation
            </a>
          </div>
        )}

        {/* Tabs */}
        {!isLoading && reservations.length > 0 && (
          <>
            <div className="border-b border-gray-600 mb-6">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "upcoming"
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  À venir ({upcomingReservations.length})
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "pending"
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  En attente ({pendingConfirmationReservations.length})
                </button>
                <button
                  onClick={() => setActiveTab("past")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "past"
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  Passées ({pastReservations.length})
                </button>
              </nav>
            </div>

            <div className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl mb-6 text-center text-sm sm:text-base font-medium">
              Les modifications s'appliquent uniquement à l'heure, la date et le
              bagage. Pour changer de trajet, merci de refaire une réservation
              car le tarif varie selon le trajet.
            </div>
          </>
        )}

        {/* Réservations à venir */}
        {!isLoading && activeTab === "upcoming" && (
          <section className="mb-10">
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune réservation à venir
                </h3>
                <p className="text-gray-400">
                  Vos réservations confirmées apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingReservations.map((res) => (
                  <article
                    key={res.id}
                    className="group bg-black border border-gray-700/50 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewReservation(res)}
                  >
                    {/* Header avec badge statut */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                          <FaClock className="text-green-400 text-lg" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {res.date}
                          </h3>
                          <p className="text-sm text-gray-400">{res.time}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                        {res.status}
                      </span>
                    </div>

                    {/* Trajet */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Départ</p>
                          <p className="text-sm text-white font-medium line-clamp-2">
                            {res.from}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-3">
                        <div className="w-px h-6 bg-gray-600"></div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Arrivée</p>
                          <p className="text-sm text-white font-medium line-clamp-2">
                            {res.to}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Prix total
                        </span>
                        <span className="text-xl font-bold text-orange-400">
                          {res.price}€
                        </span>
                      </div>
                      {(res.luggage || res.stop) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
                          {res.luggage && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              <span>Bagage</span>
                            </div>
                          )}
                          {res.stop && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              <span>Stop</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Réservations à confirmer */}
        {!isLoading && activeTab === "pending" && (
          <section className="mb-10">
            {pendingConfirmationReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune réservation en attente
                </h3>
                <p className="text-gray-400">
                  Vos nouvelles réservations apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingConfirmationReservations.map((res) => (
                  <article
                    key={res.id}
                    className="group bg-black border border-gray-700/50 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                  >
                    {/* Header avec badge statut */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-500/20 p-2 rounded-lg">
                          <FaClock className="text-yellow-400 text-lg" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {res.date}
                          </h3>
                          <p className="text-sm text-gray-400">{res.time}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                        En attente
                      </span>
                    </div>

                    {/* Trajet */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Départ</p>
                          <p className="text-sm text-white font-medium line-clamp-2">
                            {res.from}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-3">
                        <div className="w-px h-6 bg-gray-600"></div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Arrivée</p>
                          <p className="text-sm text-white font-medium line-clamp-2">
                            {res.to}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Prix total
                        </span>
                        <span className="text-xl font-bold text-orange-400">
                          {res.price}€
                        </span>
                      </div>
                      {(res.luggage || res.stop) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
                          {res.luggage && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              <span>Bagage</span>
                            </div>
                          )}
                          {res.stop && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              <span>Stop</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleViewReservation(res, e)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-all group/btn"
                        title="Voir les détails"
                      >
                        <FaEye className="text-sm group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-medium">Voir</span>
                      </button>
                      <button
                        onClick={(e) => handleEditReservation(res, e)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/40 transition-all group/btn"
                        title="Modifier"
                      >
                        <FaEdit className="text-sm group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-medium">Modifier</span>
                      </button>
                      <button
                        onClick={(e) => handleCancelReservation(res.id, e)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all group/btn"
                        title="Annuler"
                      >
                        <FaTimes className="text-sm group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-medium">Annuler</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Réservations passées */}
        {!isLoading && activeTab === "past" && (
          <section>
            {pastReservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-xl font-semibold mb-2">
                  Aucune réservation passée
                </h3>
                <p className="text-gray-400">
                  L'historique de vos courses apparaîtra ici
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastReservations.map((res) => (
                  <article
                    key={res.id}
                    className="group bg-black border border-gray-700/50 rounded-2xl p-5 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                  >
                    {/* Header avec badge statut */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${
                            res.status === "Terminée"
                              ? "bg-green-500/20"
                              : res.status === "Acceptée"
                              ? "bg-blue-500/20"
                              : res.status === "Annulée" ||
                                res.status === "Refusée"
                              ? "bg-red-500/20"
                              : "bg-gray-500/20"
                          }`}
                        >
                          <FaClock
                            className={`text-lg ${
                              res.status === "Terminée"
                                ? "text-green-400"
                                : res.status === "Acceptée"
                                ? "text-blue-400"
                                : res.status === "Annulée" ||
                                  res.status === "Refusée"
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {res.date}
                          </h3>
                          <p className="text-sm text-gray-400">{res.time}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          res.status === "Terminée"
                            ? "bg-green-500/20 text-green-400"
                            : res.status === "Acceptée"
                            ? "bg-blue-500/20 text-blue-400"
                            : res.status === "Annulée" ||
                              res.status === "Refusée"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    {/* Trajet */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Départ</p>
                          <p className="text-sm text-white font-medium line-clamp-2">
                            {res.from}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pl-3">
                        <div className="w-px h-6 bg-gray-600"></div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Arrivée</p>
                          <p className="text-sm text-white font-medium line-clamp-2">
                            {res.to}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Prix total
                        </span>
                        <span className="text-xl font-bold text-orange-400">
                          {res.price}€
                        </span>
                      </div>
                      {(res.luggage || res.stop) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
                          {res.luggage && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              <span>Bagage</span>
                            </div>
                          )}
                          {res.stop && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              <span>Stop</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bouton de téléchargement de facture pour les courses terminées */}
                    {res.status === "Terminée" && (
                      <div className="mt-4">
                        <button
                          onClick={(e) =>
                            handleDownloadInvoice(res.id, res.isRegularized, e)
                          }
                          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all group/btn ${
                            res.isRegularized
                              ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40"
                              : "bg-gray-500/10 text-gray-400 border border-gray-500/20 cursor-not-allowed opacity-60"
                          }`}
                          title={
                            res.isRegularized
                              ? "Télécharger la facture"
                              : "Facture non disponible - crédit non régularisé"
                          }
                          disabled={!res.isRegularized}
                        >
                          <FaDownload
                            className={`text-sm transition-transform ${
                              res.isRegularized
                                ? "group-hover/btn:scale-110"
                                : ""
                            }`}
                          />
                          <span className="text-xs font-medium">
                            {res.isRegularized
                              ? "Télécharger facture"
                              : "Facture indisponible"}
                          </span>
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Modal de visualisation */}
      {showViewModal && selectedReservation && (
        <ViewReservationModal
          reservation={selectedReservation}
          onClose={handleCloseModals}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedReservation && (
        <EditReservationModal
          reservation={selectedReservation}
          onClose={handleCloseModals}
          onUpdate={handleUpdateReservation}
          onCancel={handleCancelReservation}
        />
      )}

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

      {/* Modal d'historique du crédit */}
      <CreditHistoryModal
        isOpen={showCreditHistory}
        onClose={() => setShowCreditHistory(false)}
      />

      {/* WhatsApp Button */}
      <WhatsappButton number="33612345678" />
    </div>
  );
}
