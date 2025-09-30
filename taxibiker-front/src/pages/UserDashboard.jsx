import React, { useEffect, useState } from "react";

export default function UserDashboard() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const mockReservations = [
      {
        id: 1,
        date: "2025-09-01",
        time: "10:00",
        from: "Aéroport CDG",
        to: "Paris centre",
        status: "En attente",
        luggage: true,
      },
      {
        id: 2,
        date: "2025-08-15",
        time: "15:30",
        from: "Paris centre",
        to: "Gare de Lyon",
        status: "Acceptée",
        luggage: false,
      },
      {
        id: 3,
        date: "2025-08-10",
        time: "09:00",
        from: "Montmartre",
        to: "Orly",
        status: "Refusée",
        luggage: false,
      },
    ];

    const pending = localStorage.getItem("pendingReservation");
    if (pending) {
      const parsed = JSON.parse(pending);
      parsed.id = Date.now();
      mockReservations.unshift(parsed);
      localStorage.removeItem("pendingReservation");
    }

    setReservations(mockReservations);
  }, []);

  const handleConfirm = (id) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "En attente" } : r
      )
    );
    alert(
      "Votre demande de course a bien été envoyée. Elle sera traitée prochainement."
    );
  };

  const handleRemovePast = (id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const upcomingReservations = reservations.filter(
    (r) => r.status === "En attente"
  );
  const pendingReservations = reservations.filter(
    (r) => r.status === "À confirmer"
  );
  const pastReservations = reservations.filter(
    (r) => r.status === "Acceptée" || r.status === "Refusée"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#222] to-[#111] text-white px-4 py-8 sm:px-6 lg:px-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
        Mon tableau de bord
      </h1>

      <div className="space-y-10">
        {/* Réservations en cours */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">🚕 Réservations en cours</h2>
          {upcomingReservations.length === 0 ? (
            <p className="text-gray-400 text-center">Aucune réservation en cours.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingReservations.map((res) => (
                <article
                  key={res.id}
                  className="relative p-3 sm:p-4 rounded-md bg-white/5 border border-white/10 text-xs sm:text-sm"
                >
                  <h2 className="text-sm sm:text-base font-semibold mb-1">
                    {res.date} à {res.time}
                  </h2>
                  <p className="mb-1 leading-tight">
                    <span className="font-semibold">Prise :</span> {res.from}
                  </p>
                  <p className="mb-1 leading-tight">
                    <span className="font-semibold">Destination :</span> {res.to}
                  </p>
                  {res.luggage && (
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-300 leading-tight">
                      🛄 Bagage volumineux
                    </p>
                  )}
                  <p className="mt-1 font-semibold text-yellow-400">{res.status}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Réservations à confirmer */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">✅ Réservations à confirmer</h2>
          {pendingReservations.length === 0 ? (
            <p className="text-gray-400 text-center">Aucune réservation à confirmer.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingReservations.map((res) => (
                <article
                  key={res.id}
                  className="relative p-3 sm:p-4 rounded-md bg-white/5 border border-white/10 text-xs sm:text-sm"
                >
                  <h2 className="text-sm sm:text-base font-semibold mb-1">
                    {res.date} à {res.time}
                  </h2>
                  <p className="mb-1 leading-tight">
                    <span className="font-semibold">Prise :</span> {res.from}
                  </p>
                  <p className="mb-1 leading-tight">
                    <span className="font-semibold">Destination :</span> {res.to}
                  </p>
                  {res.luggage && (
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-300 leading-tight">
                      🛄 Bagage volumineux
                    </p>
                  )}
                  <p className="mt-1 font-semibold text-yellow-400">{res.status}</p>

                  <button
                    onClick={() => handleConfirm(res.id)}
                    className="w-full bg-[#DD5212] hover:bg-[#c4410d] transition py-1.5 rounded-md text-xs sm:text-sm mt-2"
                  >
                    Confirmer ma réservation
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Réservations passées */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">📜 Réservations passées</h2>
          {pastReservations.length === 0 ? (
            <p className="text-gray-400 text-center">Aucune réservation passée.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pastReservations.map((res) => (
                <article
                  key={res.id}
                  className="relative p-3 sm:p-4 rounded-md bg-white/5 border border-white/10 text-xs sm:text-sm"
                >
                  {/* Croix suppression */}
                  <button
                    onClick={() => handleRemovePast(res.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm sm:text-base font-bold"
                    aria-label="Supprimer de l'affichage"
                  >
                    ×
                  </button>

                  <h2 className="text-sm sm:text-base font-semibold mb-1">
                    {res.date} à {res.time}
                  </h2>
                  <p className="mb-1 leading-tight">
                    <span className="font-semibold">Prise :</span> {res.from}
                  </p>
                  <p className="mb-1 leading-tight">
                    <span className="font-semibold">Destination :</span> {res.to}
                  </p>
                  {res.luggage && (
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-300 leading-tight">
                      🛄 Bagage volumineux
                    </p>
                  )}
                  <p
                    className={`mt-1 font-semibold ${
                      res.status === "Acceptée"
                        ? "text-green-400"
                        : res.status === "Refusée"
                        ? "text-red-500"
                        : "text-yellow-400"
                    }`}
                  >
                    {res.status}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
