export default function ReservationCard({ reservation, onEdit, onDelete, onRemovePast }) {
  const isPast = new Date(reservation.date) < new Date();

  return (
    <article className="relative p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col justify-between">
      {/* Croix pour les réservations passées */}
      {isPast && (
        <button
          onClick={() => onRemovePast(reservation.id)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold"
          aria-label="Supprimer de l'affichage"
        >
          ×
        </button>
      )}

      <div className="mb-2">
        <h2 className="text-lg font-semibold">
          {reservation.date} à {reservation.time}
        </h2>
        <p><span className="font-semibold">Client :</span> {reservation.client}</p>
        <p><span className="font-semibold">Prise en charge :</span> {reservation.from}</p>
        <p><span className="font-semibold">Destination :</span> {reservation.to}</p>
        {reservation.luggage && (
          <p className="mt-1 text-xs text-gray-300 flex items-center gap-1">
            🛄 Bagage volumineux (+15kg)
          </p>
        )}
        <p className={`mt-2 font-semibold ${
          reservation.status === "Acceptée" ? "text-green-400" :
          reservation.status === "Refusée" ? "text-red-500" :
          "text-yellow-400"
        }`}>
          {reservation.status}
        </p>
      </div>

      {!isPast && (
        <footer className="flex gap-2 mt-2">
          <button
            onClick={() => onEdit(reservation.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 transition py-1 rounded-lg text-sm"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(reservation.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 transition py-1 rounded-lg text-sm"
          >
            Supprimer
          </button>
        </footer>
      )}
    </article>
  );
}
