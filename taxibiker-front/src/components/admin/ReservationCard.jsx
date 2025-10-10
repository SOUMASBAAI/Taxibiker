import React from "react";

export default function ReservationCard({ reservation, onClick }) {
  return (
    <article
      onClick={onClick}
      className="cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex flex-col gap-2 text-sm sm:text-base"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{reservation.date} à {reservation.time}</h3>
        <span
          className={`font-semibold ${
            reservation.status === "Acceptée" ? "text-green-400" :
            reservation.status === "Refusée" || reservation.status === "Annulée" ? "text-red-500" :
            "text-yellow-400"
          }`}
        >
          {reservation.status}
        </span>
      </div>

      <p><span className="font-semibold">Client :</span> {reservation.firstname || "Nom non défini"}</p>
      <p><span className="font-semibold">Prise :</span> {reservation.from}</p>
      <p><span className="font-semibold">Destination :</span> {reservation.to}</p>
      {reservation.stop && <p><span className="font-semibold">Stop :</span> {reservation.stop}</p>}
      <p><span className="font-semibold">Bagage :</span> {reservation.luggage ? "Oui (+15€)" : "Non"}</p>
      <p><span className="font-semibold">Prix :</span> {reservation.price + (reservation.luggage ? 15 : 0)} €</p>
    </article>
  );
}
