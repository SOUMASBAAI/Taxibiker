import React, { useState, useEffect } from "react";

export default function EditReservationModal({
  reservation,
  onClose,
  onUpdate,
  onCancel,
  isAdmin = false,
}) {
  const [editTime, setEditTime] = useState(reservation?.time || "");
  const [editDate, setEditDate] = useState(reservation?.date || "");
  const [editLuggage, setEditLuggage] = useState(reservation?.luggage || false);
  const [editStop, setEditStop] = useState(reservation?.stop || "");
  const [editHours, setEditHours] = useState(reservation?.hours || 2);
  const [price, setPrice] = useState(reservation?.price || 0);

  // États pour les suggestions d'adresse
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [showStopSuggestions, setShowStopSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Réinitialiser les valeurs quand la réservation change
  useEffect(() => {
    if (reservation) {
      setEditTime(reservation.time || "");
      setEditDate(reservation.date || "");
      setEditLuggage(reservation.luggage || false);
      setEditStop(reservation.stop || "");
      setEditHours(reservation.hours || 2);
      setPrice(reservation.price || 0);
    }
  }, [reservation]);

  // Calcul du prix basé sur les options (client + admin)
  useEffect(() => {
    const baggageFee = editLuggage ? 15 : 0;
    const stopFee = editStop && editStop.trim() ? 20 : 0;
    const originalStopFee =
      reservation?.stop && String(reservation.stop).trim() ? 20 : 0;
    const basePrice = Math.max(
      0,
      (reservation?.price || 0) -
        (reservation?.luggage ? 15 : 0) -
        originalStopFee
    );
    setPrice(basePrice + baggageFee + stopFee);
  }, [editLuggage, editStop, reservation]);

  // Fonction pour récupérer les suggestions d'adresse
  const getSuggestions = async (query) => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:autocomplete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "AIzaSyCw8oN9_Ms4FVHRtuP5fyy120s18_DUCSo",
            "X-Goog-FieldMask":
              "suggestions.placePrediction.place,suggestions.placePrediction.text",
          },
          body: JSON.stringify({
            input: query,
            languageCode: "fr",
            regionCode: "FR",
            includedPrimaryTypes: [
              "establishment",
              "street_address",
              "route",
              "locality",
              "administrative_area_level_1",
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.suggestions?.slice(0, 5) || [];
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de suggestions:", error);
    }
    return [];
  };

  // Gérer les changements dans le champ stop avec suggestions
  const handleStopChange = (e) => {
    const value = e.target.value;
    setEditStop(value);
    setShowStopSuggestions(value.length > 2);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for suggestions
    const timeout = setTimeout(async () => {
      if (value.length > 2) {
        const suggestions = await getSuggestions(value);
        setStopSuggestions(suggestions);
      } else {
        setStopSuggestions([]);
        setShowStopSuggestions(false);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  // Sélectionner une suggestion
  const selectStopSuggestion = (suggestion) => {
    const address =
      suggestion.placePrediction?.text?.text ||
      suggestion.placePrediction?.place?.formattedAddress;
    setEditStop(address);
    setShowStopSuggestions(false);
    setStopSuggestions([]);
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".stop-input-container")) {
        setShowStopSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmitModification = (e) => {
    e.preventDefault();

    const updatedReservation = {
      ...reservation,
      date: editDate,
      time: editTime,
      luggage: editLuggage,
      stop: editStop,
      hours: editHours,
      price: price,
      status:
        isAdmin
          ? reservation.status
          : editDate !== reservation.date || editTime !== reservation.time
            ? "En attente de confirmation"
            : reservation.status,
    };

    onUpdate(updatedReservation);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center px-4 z-50 overflow-y-auto py-4">
      <div className="bg-white/10 backdrop-blur-md text-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {isAdmin ? "Modifier la course (admin)" : "Modifier la réservation"}
          </h2>
          {isAdmin && (
            <p className="text-sm text-gray-400">
              Statut actuel : <span className="text-orange-400">{reservation.status}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmitModification} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Heure */}
          <div>
            <label className="block text-sm font-medium mb-2">Heure</label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {reservation.type === "hourly" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Durée (heures)
              </label>
              <input
                type="number"
                min="2"
                max="5"
                value={editHours}
                onChange={(e) =>
                  setEditHours(
                    Math.max(2, Math.min(5, parseInt(e.target.value, 10) || 2))
                  )
                }
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          )}

          {/* Trajet (non modifiable) */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-3 text-orange-400">
              🏍️ Trajet (non modifiable)
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-400">Départ</p>
                  <p className="font-medium">{reservation.from}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-3">
                <div className="w-px h-6 bg-gray-600"></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-400">Arrivée</p>
                  <p className="font-medium">{reservation.to}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bagage */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="editLuggage"
              checked={editLuggage}
              onChange={(e) => setEditLuggage(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="editLuggage" className="text-sm">
              Bagage volumineux ou +15kg
            </label>
          </div>

          {/* Stop (courses classiques uniquement) */}
          {reservation.type !== "hourly" && (
          <div className="stop-input-container">
            <label className="block text-sm font-medium mb-2">
              Stop supplémentaire (optionnel)
            </label>
            <div className="relative">
              <input
                type="text"
                value={editStop}
                onChange={handleStopChange}
                onFocus={() =>
                  stopSuggestions.length > 0 && setShowStopSuggestions(true)
                }
                onBlur={() =>
                  setTimeout(() => setShowStopSuggestions(false), 200)
                }
                placeholder="Adresse du stop..."
                className="w-full p-3 rounded-lg bg-white/10 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {showStopSuggestions && stopSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-48 overflow-y-auto">
                  {stopSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-700 cursor-pointer text-sm text-white border-b border-gray-700 last:border-b-0"
                      onClick={() => selectStopSuggestion(suggestion)}
                    >
                      <div className="font-medium">
                        {suggestion.placePrediction?.text?.text}
                      </div>
                      {suggestion.placePrediction?.place?.formattedAddress &&
                        suggestion.placePrediction?.place?.formattedAddress !==
                          suggestion.placePrediction?.text?.text && (
                          <div className="text-gray-400 text-xs mt-1">
                            {suggestion.placePrediction.place.formattedAddress}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Prix */}
          <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-semibold">Prix total</span>
              {isAdmin ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-28 text-right text-2xl font-bold text-orange-400 bg-white/10 border border-orange-500/50 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-2xl font-bold text-orange-400">€</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-orange-400">
                  {price}€
                </span>
              )}
            </div>
          </div>

          {/* Avertissement */}
          {!isAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ Les modifications de date/heure remettront votre réservation en
              attente de confirmation.
            </p>
          </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
