import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { buildApiUrl } from "../config/api.js";
import authService from "../services/authService";
import {
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaPlus,
  FaClock,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import AdminHeader from "../components/admin/AdminHeader";
import ReservationCard from "../components/admin/ReservationCard";
import ReservationModal from "../components/admin/ReservationModal";
// import authService from "../services/authService";

// Weekly Calendar Component
const WeeklyCalendar = ({ reservations, onReservationClick, onDayClick }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date());

  // Get start and end of current week (Monday to Sunday)
  const getWeekDates = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(currentWeek);
  const today = new Date().toDateString();

  // Group confirmed reservations by date (only "Acceptée" and "En cours")
  const reservationsByDate = reservations.reduce((acc, res) => {
    if (res.status === "Acceptée" || res.status === "En cours") {
      const resDate = new Date(res.date).toDateString();
      if (!acc[resDate]) acc[resDate] = [];
      acc[resDate].push(res);
    }
    return acc;
  }, {});

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  // Navigation jour par jour pour mobile
  const nextDay = () => {
    const next = new Date(currentDay);
    next.setDate(next.getDate() + 1);
    setCurrentDay(next);
  };

  const prevDay = () => {
    const prev = new Date(currentDay);
    prev.setDate(prev.getDate() - 1);
    setCurrentDay(prev);
  };

  // Pour mobile, on affiche seulement le jour courant
  const _mobileDay = [currentDay];
  const mobileDayReservations =
    reservationsByDate[currentDay.toDateString()] || [];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
      {/* Navigation Desktop - Week */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <button
          onClick={() =>
            setCurrentWeek(
              new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
            )
          }
          className="flex items-center justify-center w-10 h-10 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-200 border border-blue-500/30"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-1">
            {weekDates[0].toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <p className="text-blue-300 text-sm">Calendrier des réservations</p>
        </div>

        <button
          onClick={() =>
            setCurrentWeek(
              new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
            )
          }
          className="flex items-center justify-center w-10 h-10 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-200 border border-blue-500/30"
        >
          <FaArrowRight className="text-sm" />
        </button>
      </div>

      {/* Navigation Mobile - Day */}
      <div className="flex md:hidden items-center justify-between mb-6">
        <button
          onClick={prevDay}
          className="flex items-center justify-center w-10 h-10 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-200 border border-blue-500/30"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-1">
            {currentDay.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          <p className="text-blue-300 text-sm">
            {mobileDayReservations.length} réservation
            {mobileDayReservations.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={nextDay}
          className="flex items-center justify-center w-10 h-10 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-200 border border-blue-500/30"
        >
          <FaArrowRight className="text-sm" />
        </button>
      </div>

      {/* Desktop Calendar - Week View */}
      <div className="hidden md:grid md:grid-cols-7 gap-4 min-h-[450px]">
        {weekDates.map((date, index) => {
          const dateString = date.toDateString();
          const dayReservations = reservationsByDate[dateString] || [];
          const isToday = dateString === today;
          const isPast = date < new Date() && !isToday;

          return (
            <div
              key={index}
              className="flex flex-col min-h-[200px] md:min-h-[400px]"
            >
              {/* Day Header - Clickable */}
              <div
                onClick={() => onDayClick(date)}
                className={`text-center p-3 md:p-4 rounded-xl mb-3 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
                  isToday
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25"
                    : isPast
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400 hover:from-gray-600 hover:to-gray-700"
                    : "bg-gradient-to-br from-blue-600/20 to-blue-700/20 text-white hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30"
                }`}
              >
                <div className="text-xs font-medium opacity-80 mb-1">
                  {weekDays[index]}
                </div>
                <div className="text-xl md:text-2xl font-bold mb-1">
                  {date.getDate()}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs opacity-75">
                  <FaPlus className="text-xs" />
                  <span>Ajouter</span>
                </div>
              </div>

              {/* Reservations for this day */}
              <div className="space-y-2 flex-1 min-h-[120px] md:min-h-[320px]">
                {dayReservations.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => onReservationClick(res)}
                    className={`p-2 md:p-3 rounded-xl text-xs cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg border ${
                      res.status === "Acceptée"
                        ? "bg-gradient-to-br from-green-600 to-green-700 text-white border-green-500/30 shadow-green-500/20"
                        : res.status === "À confirmer"
                        ? "bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-yellow-500/30 shadow-yellow-500/20"
                        : res.status === "Refusée"
                        ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500/30 shadow-red-500/20"
                        : "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/30 shadow-blue-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className="text-xs opacity-80" />
                      <span className="font-semibold">{res.time}</span>
                    </div>
                    <div className="font-medium mb-1">
                      {res.firstname} {res.lastname}
                    </div>
                    <div className="flex items-start gap-1 text-xs opacity-90">
                      <FaMapMarkerAlt className="text-xs mt-0.5 flex-shrink-0" />
                      <div className="truncate">
                        {res.tripType === "time" ? (
                          <>
                            {res.from} • {res.duration}h
                          </>
                        ) : (
                          <>
                            {res.from} → {res.to}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/20 text-right">
                      <span className="font-bold">{res.price}€</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Calendar - Day View */}
      <div className="block md:hidden">
        <div className="flex flex-col min-h-[300px]">
          {/* Day Header - Clickable */}
          <div
            onClick={() => onDayClick(currentDay)}
            className={`text-center p-3 rounded-xl mb-3 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${
              currentDay.toDateString() === today
                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25"
                : currentDay < new Date() && currentDay.toDateString() !== today
                ? "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-400 hover:from-gray-600 hover:to-gray-700"
                : "bg-gradient-to-br from-blue-600/20 to-blue-700/20 text-white hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30"
            }`}
          >
            <div className="text-xs font-medium opacity-80 mb-1">
              {currentDay.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div className="text-xl font-bold mb-1">{currentDay.getDate()}</div>
            <div className="flex items-center justify-center gap-1 text-xs opacity-75">
              <FaPlus className="text-xs" />
              <span>Ajouter</span>
            </div>
          </div>

          {/* Reservations for this day */}
          <div className="space-y-2 flex-1 min-h-[120px]">
            {mobileDayReservations.map((res) => (
              <div
                key={res.id}
                onClick={() => onReservationClick(res)}
                className={`p-2 rounded-xl text-xs cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg border ${
                  res.status === "Acceptée"
                    ? "bg-gradient-to-br from-green-600 to-green-700 text-white border-green-500/30 shadow-green-500/20"
                    : res.status === "À confirmer"
                    ? "bg-gradient-to-br from-yellow-600 to-yellow-700 text-white border-yellow-500/30 shadow-yellow-500/20"
                    : res.status === "Refusée"
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500/30 shadow-red-500/20"
                    : "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/30 shadow-blue-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="text-xs opacity-80" />
                  <span className="font-semibold">{res.time}</span>
                </div>
                <div className="font-medium mb-1">
                  {res.firstname} {res.lastname}
                </div>
                <div className="flex items-start gap-1 text-xs opacity-90">
                  <FaMapMarkerAlt className="text-xs mt-0.5 flex-shrink-0" />
                  <div className="truncate">
                    {res.tripType === "time" ? (
                      <>
                        {res.from} • {res.duration}h
                      </>
                    ) : (
                      <>
                        {res.from} → {res.to}
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/20 text-right">
                  <span className="font-bold">{res.price}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Reservation Modal Component
const AddReservationModal = ({
  isOpen,
  onClose,
  selectedDate,
  onAddReservation,
  clients = [],
}) => {
  const [tripType, setTripType] = useState("classic"); // "classic" or "time"
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    time: "",
    from: "",
    to: "",
    luggage: false,
    stop: "",
    price: 0,
    status: "Acceptée",
    duration: 1, // For time-based trips (in hours)
  });

  // Google Places API states
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [stopLocation, setStopLocation] = useState(null);
  const [showStopInput, setShowStopInput] = useState(false);
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [showStopSuggestions, setShowStopSuggestions] = useState(false);

  // Client search states
  const [clientSearch, setClientSearch] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const stopRef = useRef(null);
  const clientRef = useRef(null);

  // Client search functions
  const handleClientSearch = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    setSelectedClient(null);

    if (value.length >= 2) {
      const filteredClients = clients.filter(
        (client) =>
          client.firstname.toLowerCase().includes(value.toLowerCase()) ||
          client.lastname.toLowerCase().includes(value.toLowerCase()) ||
          client.email.toLowerCase().includes(value.toLowerCase()) ||
          client.phone.includes(value)
      );
      setClientSuggestions(filteredClients);
      setShowClientSuggestions(true);
    } else {
      setClientSuggestions([]);
      setShowClientSuggestions(false);
    }
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(`${client.firstname} ${client.lastname}`);
    setForm((prev) => ({
      ...prev,
      firstname: client.firstname,
      lastname: client.lastname,
      email: client.email,
      phone: client.phone,
    }));
    setShowClientSuggestions(false);
  };

  const clearClientSelection = () => {
    setSelectedClient(null);
    setClientSearch("");
    setForm((prev) => ({
      ...prev,
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
    }));
  };

  // Google Places API functions
  const searchPlace = async (query, type) => {
    if (!query || query.length < 3) return;

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "AIzaSyCw8oN9_Ms4FVHRtuP5fyy120s18_DUCSo",
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location",
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: "fr",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Places searchText error:", errorText);
        return;
      }

      const data = await response.json();
      return data.places || [];
    } catch (error) {
      console.error("Error searching places:", error);
      return [];
    }
  };

  const handleFromChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, from: value }));
    setFromLocation(null);

    if (value.length >= 3) {
      const suggestions = await searchPlace(value, "from");
      setFromSuggestions(suggestions || []);
      setShowFromSuggestions(true);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  const handleToChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, to: value }));
    setToLocation(null);

    if (value.length >= 3) {
      const suggestions = await searchPlace(value, "to");
      setToSuggestions(suggestions || []);
      setShowToSuggestions(true);
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  const handleStopChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, stop: value }));
    setStopLocation(null);

    if (value.length >= 3) {
      const suggestions = await searchPlace(value, "stop");
      setStopSuggestions(suggestions || []);
      setShowStopSuggestions(true);
    } else {
      setStopSuggestions([]);
      setShowStopSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion, type) => {
    const address = suggestion.formattedAddress;
    const location = suggestion.location;

    if (type === "from") {
      setForm((prev) => ({ ...prev, from: address }));
      setFromLocation(location);
      setShowFromSuggestions(false);
    } else if (type === "to") {
      setForm((prev) => ({ ...prev, to: address }));
      setToLocation(location);
      setShowToSuggestions(false);
    } else if (type === "stop") {
      setForm((prev) => ({ ...prev, stop: address }));
      setStopLocation(location);
      setShowStopSuggestions(false);
    }
  };

  // Calculate distance and price
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculatePrice = () => {
    if (tripType === "classic") {
      // Classic trip: departure to arrival
      if (fromLocation && toLocation) {
        const distance = calculateDistance(
          fromLocation.latitude,
          fromLocation.longitude,
          toLocation.latitude,
          toLocation.longitude
        );

        // Base price calculation (similar to ReservationPage)
        let basePrice = 0;
        if (distance <= 5) {
          basePrice = 15;
        } else if (distance <= 10) {
          basePrice = 25;
        } else if (distance <= 20) {
          basePrice = 35;
        } else if (distance <= 30) {
          basePrice = 45;
        } else {
          basePrice = 55;
        }

        // Add luggage fee if applicable
        const luggageFee = form.luggage ? 15 : 0;
        const stopFee = stopLocation ? 10 : 0;

        const totalPrice = basePrice + luggageFee + stopFee;
        setForm((prev) => ({ ...prev, price: totalPrice }));
      } else {
        // If no valid locations, set price to 0
        setForm((prev) => ({ ...prev, price: 0 }));
      }
    } else {
      // Time-based trip: departure + duration
      if (fromLocation) {
        // Base price: 20€ per hour
        const basePrice = form.duration * 20;

        // Add luggage fee if applicable
        const luggageFee = form.luggage ? 15 : 0;
        const stopFee = stopLocation ? 10 : 0;

        const totalPrice = basePrice + luggageFee + stopFee;
        setForm((prev) => ({ ...prev, price: totalPrice }));
      } else {
        // If no departure location, set price to 0
        setForm((prev) => ({ ...prev, price: 0 }));
      }
    }
  };

  // Recalculate price when form fields change
  useEffect(() => {
    calculatePrice();
  }, [
    fromLocation,
    toLocation,
    stopLocation,
    form.luggage,
    tripType,
    form.duration,
  ]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
      if (stopRef.current && !stopRef.current.contains(event.target)) {
        setShowStopSuggestions(false);
      }
      if (clientRef.current && !clientRef.current.contains(event.target)) {
        setShowClientSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    // Reset location states when switching trip types
    setFromLocation(null);
    setToLocation(null);
    setStopLocation(null);
    setForm((prev) => ({
      ...prev,
      from: "",
      to: "",
      stop: "",
      price: 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier que le prix est calculé
    if (form.price === 0 || form.price === null) {
      alert("Veuillez sélectionner des adresses valides pour calculer le prix");
      return;
    }

    // Vérifier que les locations sont définies pour le calcul de prix
    if (tripType === "classic" && (!fromLocation || !toLocation)) {
      alert("Veuillez sélectionner des adresses valides depuis les suggestions");
      return;
    }
    
    if (tripType === "time" && !fromLocation) {
      alert("Veuillez sélectionner une adresse de départ valide depuis les suggestions");
      return;
    }

    const newReservation = {
      id: Date.now(), // Simple ID generation (sera remplacé par l'ID du backend)
      ...form,
      date: selectedDate.toISOString().split("T")[0],
      price: parseInt(form.price) || 0,
      to: tripType === "classic" ? form.to : form.from, // Pour time-based, to = from
      tripType: tripType,
      duration: tripType === "time" ? form.duration : null,
    };
    
    try {
      // Appeler la fonction qui envoie au backend
      await onAddReservation(newReservation);
      
      // Réinitialiser le formulaire seulement après succès
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        time: "",
        from: "",
        to: "",
        luggage: false,
        stop: "",
        price: 0,
        status: "Acceptée",
        duration: 1,
      });
      setFromLocation(null);
      setToLocation(null);
      setStopLocation(null);
      setSelectedClient(null);
      setClientSearch("");
      onClose();
    } catch (error) {
      // Erreur déjà gérée dans handleAddReservation
      // Ne pas fermer le modal en cas d'erreur
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Ajouter une réservation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            Date:{" "}
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Trip Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Type de course
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTripTypeChange("classic")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  tripType === "classic"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Course classique
              </button>
              <button
                type="button"
                onClick={() => handleTripTypeChange("time")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  tripType === "time"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Course à la durée
              </button>
            </div>
          </div>

          {/* Client Search */}
          <div ref={clientRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rechercher un client
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clientSearch}
                onChange={handleClientSearch}
                onFocus={() => setShowClientSuggestions(true)}
                placeholder="Nom, prénom, email ou téléphone..."
                className="flex-1 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
              {selectedClient && (
                <button
                  type="button"
                  onClick={clearClientSelection}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Effacer
                </button>
              )}
            </div>
            {showClientSuggestions &&
              clientSuggestions &&
              clientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {clientSuggestions.map((client, index) => (
                    <div
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">
                        {client.firstname} {client.lastname}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {client.email} • {client.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Manual Client Entry (if no client selected) */}
          {!selectedClient && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* Selected Client Display */}
          {selectedClient && (
            <div className="p-3 bg-green-600/20 border border-green-600 rounded-lg">
              <div className="text-green-300 text-sm font-medium">
                Client sélectionné: {selectedClient.firstname}{" "}
                {selectedClient.lastname}
              </div>
              <div className="text-green-400 text-xs">
                {selectedClient.email} • {selectedClient.phone}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Heure
            </label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div ref={fromRef} className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Départ {fromLocation && <span className="text-green-400 text-xs">✓</span>}
            </label>
            <input
              type="text"
              name="from"
              value={form.from}
              onChange={handleFromChange}
              onFocus={() => setShowFromSuggestions(true)}
              placeholder="Adresse de départ"
              className={`w-full p-2 rounded-lg text-white border focus:outline-none ${
                fromLocation
                  ? "bg-gray-700 border-green-500 focus:border-green-400"
                  : "bg-gray-700 border-gray-600 focus:border-orange-500"
              }`}
              required
            />
            {!fromLocation && form.from && (
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ Sélectionnez une adresse depuis les suggestions ci-dessus
              </p>
            )}
            {showFromSuggestions &&
              fromSuggestions &&
              fromSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {fromSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(suggestion, "from")}
                      className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">
                        {suggestion.displayName?.text ||
                          suggestion.formattedAddress}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {suggestion.formattedAddress}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {tripType === "classic" ? (
            <div ref={toRef} className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Arrivée {toLocation && <span className="text-green-400 text-xs">✓</span>}
              </label>
              <input
                type="text"
                name="to"
                value={form.to}
                onChange={handleToChange}
                onFocus={() => setShowToSuggestions(true)}
                placeholder="Adresse d'arrivée"
                className={`w-full p-2 rounded-lg text-white border focus:outline-none ${
                  toLocation
                    ? "bg-gray-700 border-green-500 focus:border-green-400"
                    : "bg-gray-700 border-gray-600 focus:border-orange-500"
                }`}
                required
              />
              {!toLocation && form.to && (
                <p className="text-xs text-yellow-400 mt-1">
                  ⚠️ Sélectionnez une adresse depuis les suggestions ci-dessus
                </p>
              )}
              {showToSuggestions &&
                toSuggestions &&
                toSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {toSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => selectSuggestion(suggestion, "to")}
                        className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                      >
                        <div className="text-white font-medium">
                          {suggestion.displayName?.text ||
                            suggestion.formattedAddress}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {suggestion.formattedAddress}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Durée (heures)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="1"
                max="24"
                placeholder="Nombre d'heures"
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Prix: 20€ par heure + options
              </p>
            </div>
          )}

          {/* Stop Address - Only for classic trips */}
          {tripType === "classic" && (
            <>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Arrêt intermédiaire
                </label>
                <button
                  type="button"
                  onClick={() => setShowStopInput(!showStopInput)}
                  className="text-orange-400 hover:text-orange-300 text-sm"
                >
                  {showStopInput ? "Masquer" : "Ajouter un arrêt"}
                </button>
              </div>

              {showStopInput && (
                <div ref={stopRef} className="relative">
                  <input
                    type="text"
                    name="stop"
                    value={form.stop}
                    onChange={handleStopChange}
                    onFocus={() => setShowStopSuggestions(true)}
                    placeholder="Adresse d'arrêt (optionnel)"
                    className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
                  />
                  {showStopSuggestions &&
                    stopSuggestions &&
                    stopSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {stopSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => selectSuggestion(suggestion, "stop")}
                            className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                          >
                            <div className="text-white font-medium">
                              {suggestion.displayName?.text ||
                                suggestion.formattedAddress}
                            </div>
                            <div className="text-gray-300 text-sm">
                              {suggestion.formattedAddress}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Prix calculé (€)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              readOnly
              className={`w-full p-2 rounded-lg text-white border cursor-not-allowed ${
                form.price > 0
                  ? "bg-green-600/20 border-green-500"
                  : "bg-gray-600 border-gray-500"
              }`}
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.price > 0
                ? "Prix calculé automatiquement selon la distance et les options"
                : "⚠️ Sélectionnez des adresses depuis les suggestions pour calculer le prix"}
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="luggage"
              checked={form.luggage}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm text-gray-300">Bagages</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

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
          price: parseFloat(res.price),
          type: res.type,
          hours: res.hours || null,
        }));

        setReservations(formattedReservations);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      throw error;
    }
  };

  // Fetch real reservations from API
  useEffect(() => {
    const user = authService.getUser();
    if (!user || !user.roles?.includes("ROLE_ADMIN")) {
      window.location.href = "/admin/login";
      return;
    }
    setAuthChecked(true);

    const loadReservations = async () => {
      try {
        await fetchReservations();
      } catch (error) {
        console.error("Erreur lors du chargement des réservations:", error);
        // En cas d'erreur, garder les données mockées pour le développement
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, []);

  // Réservations
  const handleUpdateReservation = (updated) => {
    setReservations((prev) => {
      const updatedReservations = prev.map((r) =>
        r.id === updated.id
          ? { ...updated, price: updated.price + (updated.luggage ? 15 : 0) }
          : r
      );

      // Sort reservations by date and time
      return updatedReservations.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        return a.time.localeCompare(b.time);
      });
    });
  };
  const handleCancelReservation = async (id) => {
    // Appeler handleStatusChange qui fait la mise à jour dans la BDD
    await handleStatusChange(id, "Annulée");
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
        setReservations((prev) => {
          const updatedReservations = prev.map((r) =>
            r.id === id ? { ...r, status: newStatus } : r
          );

          // Sort reservations by date and time
          return updatedReservations.sort((a, b) => {
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date);
            }
            return a.time.localeCompare(b.time);
          });
        });
      } else {
        alert("Erreur lors de la mise à jour du statut: " + result.error);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  // Add reservation handlers
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleAddReservation = async (newReservation) => {
    try {
      // Envoyer la réservation au backend
      const response = await authService.authenticatedRequest(
        buildApiUrl("admin/reservations"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstname: newReservation.firstname,
            lastname: newReservation.lastname,
            email: newReservation.email,
            phone: newReservation.phone,
            date: newReservation.date,
            time: newReservation.time,
            from: newReservation.from,
            to: newReservation.tripType === "classic" ? newReservation.to : newReservation.from,
            stop: newReservation.stop || null,
            luggage: newReservation.luggage || false,
            price: newReservation.price,
            tripType: newReservation.tripType || "classic",
            duration: newReservation.duration || null,
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.reservation) {
        // Recharger toutes les réservations depuis le backend
        await fetchReservations();
      } else {
        alert("Erreur lors de la création de la réservation: " + (result.error || "Erreur inconnue"));
        throw new Error(result.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      alert("Erreur lors de la création de la réservation: " + error.message);
      throw error; // Re-throw pour que handleSubmit puisse gérer l'erreur
    }
  };

  // Tri réservation
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const pendingReservations = reservations.filter(
    (r) => r.status === "À confirmer"
  );
  const upcomingReservations = reservations.filter(
    (r) => r.status === "Acceptée"
  );
  const todaysReservations = reservations.filter(
    (r) =>
      r.date === todayString &&
      (r.status === "Acceptée" || r.status === "En cours")
  );

  const totalClients = clients.length;
  const upcomingReservationsCount = upcomingReservations.length;
  const totalRevenue = reservations
    .filter((r) => r.status === "Acceptée")
    .reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <AdminHeader />

      <div className="pt-24 px-4 sm:px-6 lg:px-12 space-y-8 pb-12">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-4 rounded-2xl">
              <FaChartLine className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Tableau de Bord
              </h1>
              <p className="text-blue-200 text-lg">
                Vue d'ensemble de votre activité TaxiBiker
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-2xl border border-blue-500/30 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaUsers className="text-blue-200 text-xl" />
                  <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">
                    Total Clients
                  </p>
                </div>
                <p className="text-4xl font-bold text-white">{totalClients}</p>
                <p className="text-blue-200 text-sm mt-1">
                  Clients enregistrés
                </p>
              </div>
              <div className="bg-blue-500/30 p-4 rounded-2xl">
                <FaUsers className="text-3xl text-blue-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 shadow-2xl border border-green-500/30 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaCalendarAlt className="text-green-200 text-xl" />
                  <p className="text-green-100 text-sm font-medium uppercase tracking-wide">
                    Réservations
                  </p>
                </div>
                <p className="text-4xl font-bold text-white">
                  {upcomingReservationsCount}
                </p>
                <p className="text-green-200 text-sm mt-1">À venir</p>
              </div>
              <div className="bg-green-500/30 p-4 rounded-2xl">
                <FaCalendarAlt className="text-3xl text-green-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 shadow-2xl border border-purple-500/30 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaMotorcycle className="text-purple-200 text-xl" />
                  <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">
                    Chiffre d'Affaires
                  </p>
                </div>
                <p className="text-4xl font-bold text-white">{totalRevenue}€</p>
                <p className="text-purple-200 text-sm mt-1">
                  Revenus confirmés
                </p>
              </div>
              <div className="bg-purple-500/30 p-4 rounded-2xl">
                <FaMotorcycle className="text-3xl text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-6"></div>
                <FaMotorcycle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Chargement en cours
              </h3>
              <p className="text-gray-400">Récupération des données...</p>
            </div>
          </div>
        )}

        {/* No Reservations Message */}
        {!isLoading && reservations.length === 0 && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12">
            <div className="text-center">
              <div className="bg-orange-500/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <FaMotorcycle className="text-4xl text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Aucune réservation
              </h3>
              <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                Les nouvelles réservations de vos clients apparaîtront ici
              </p>
              <Link
                to="/reservation"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <FaPlus className="text-sm" />
                Créer une réservation
              </Link>
            </div>
          </div>
        )}

        {/* Weekly Calendar */}
        {!isLoading && reservations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-3 rounded-xl">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Calendrier de la semaine
                  </h2>
                  <p className="text-gray-400">
                    Gérez vos réservations par jour
                  </p>
                </div>
              </div>
              <Link
                to="/admin/reservations"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl font-medium transition-all duration-200 border border-blue-500/30"
              >
                <FaEye className="text-sm" />
                Voir toutes
              </Link>
            </div>
            <WeeklyCalendar
              reservations={reservations}
              onReservationClick={(res) =>
                setSelectedReservation((prev) =>
                  prev?.id === res.id ? null : res
                )
              }
              onDayClick={handleDayClick}
            />
          </section>
        )}

        {/* Recent Pending Reservations */}
        {!isLoading && pendingReservations.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-3 rounded-xl">
                  <FaClock className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Réservations à confirmer
                  </h2>
                  <p className="text-gray-400">
                    Action requise sur {pendingReservations.length} réservation
                    {pendingReservations.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Link
                to="/admin/reservations"
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl font-medium transition-all duration-200 border border-yellow-500/30"
              >
                <FaEye className="text-sm" />
                Voir toutes
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingReservations.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  onClick={() =>
                    setSelectedReservation((prev) =>
                      prev?.id === res.id ? null : res
                    )
                  }
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
                      <span className="text-yellow-400 text-sm font-medium">
                        En attente
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaClock className="text-xs" />
                      <span className="text-sm">{res.time}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {res.firstname} {res.lastname}
                    </h3>
                    <p className="text-gray-400 text-sm">{res.email}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaMapMarkerAlt className="text-orange-400 text-sm" />
                      <span className="text-sm truncate">{res.from}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <FaMapMarkerAlt className="text-blue-400 text-sm" />
                      <span className="text-sm truncate">{res.to}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <span className="text-2xl font-bold text-white">
                      {res.price}€
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all duration-200">
                        <FaCheckCircle className="text-sm" />
                      </button>
                      <button className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-200">
                        <FaTimesCircle className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onUpdate={handleUpdateReservation}
          onCancel={handleCancelReservation}
          onStatusChange={handleStatusChange}
        />
      )}

      {showAddModal && selectedDate && (
        <AddReservationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          selectedDate={selectedDate}
          onAddReservation={handleAddReservation}
          clients={clients}
        />
      )}
    </div>
  );
}
