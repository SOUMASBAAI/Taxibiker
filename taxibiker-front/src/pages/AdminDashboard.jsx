import React, { useState } from "react";

import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import ReservationCard from "../components/admin/ReservationCard";
import ClientList from "../components/admin/ClientList";
import InvoiceForm from "../components/admin/InvoiceForm";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [reservations, setReservations] = useState([
    {
      id: 1,
      client: "Jean Dupont",
      date: "2025-09-20",
      time: "14:00",
      from: "Place de la République",
      to: "Gare du Nord",
      luggage: true,
      status: "En attente",
    },
    {
      id: 2,
      client: "Marie Martin",
      date: "2025-09-15",
      time: "10:00",
      from: "Aéroport CDG",
      to: "Hôtel Paris",
      luggage: false,
      status: "Acceptée",
    },
  ]);

  const handleEdit = (id) => alert(`Modifier réservation ${id}`);
  const handleDelete = (id) =>
    setReservations(reservations.filter((r) => r.id !== id));
  const handleRemovePast = (id) =>
    setReservations(reservations.filter((r) => r.id !== id));

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <AdminHeader
        isLoggedIn={true}
        onLogout={() => (window.location.href = "/")}
        setActiveTab={setActiveTab} // pour changer l'onglet via le menu mobile
      />

      <div className="flex pt-24">
        {/* Sidebar uniquement desktop */}
        <aside className="hidden md:flex md:flex-col w-64 bg-black p-4 fixed h-full">
          <button
            className={`py-2 px-4 rounded mb-2 text-left w-full ${
              activeTab === "reservations" ? "bg-black font-bold" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("reservations")}
          >
            Réservations
          </button>
          <button
            className={`py-2 px-4 rounded mb-2 text-left w-full ${
              activeTab === "clients" ? "bg-gray-800 font-bold" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("clients")}
          >
            Clients
          </button>
          <button
            className={`py-2 px-4 rounded mb-2 text-left w-full ${
              activeTab === "invoices" ? "bg-gray-800 font-bold" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            Factures
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:ml-64 overflow-x-hidden">
          {activeTab === "reservations" && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRemovePast={handleRemovePast}
                />
              ))}
            </section>
          )}

          {activeTab === "clients" && (
            <section className="mt-4">
              <h2 className="text-2xl font-bold mb-4">Liste des clients</h2>
              <ClientList />
            </section>
          )}

          {activeTab === "invoices" && (
            <section className="mt-4">
              <h2 className="text-2xl font-bold mb-4">Créer une facture</h2>
              <InvoiceForm />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
