import React, { useState, useEffect } from "react";
import { FaPlane, FaTrain } from "react-icons/fa";
import { buildApiUrl } from "../config/api.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import reservationStorage from "../services/reservationStorage";
import Header from "../components/Header";
import DashboardHeader from "../components/user/DashboardHeader";
import WhatsappButton from "../components/WhatsappButton";
import Footer from "../components/Footer";

// Composant pour les suggestions d'adresse
const AddressInput = ({
  value,
  onChange,
  placeholder,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  onFocus,
  onBlur,
  className = "",
}) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm text-white ${className}`}
      onBlur={onBlur}
      onFocus={onFocus}
    />
    {showSuggestions && suggestions.length > 0 && (
      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-3 hover:bg-gray-700 cursor-pointer text-sm text-white border-b border-gray-700 last:border-b-0"
            onClick={() => onSelectSuggestion(suggestion)}
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
);

const libraries = ["geometry"];

export default function ReservationPage() {
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCw8oN9_Ms4FVHRtuP5fyy120s18_DUCSo",
    libraries,
  });

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = authService.isAuthenticated();

  // Fonction de navigation pour le DashboardHeader
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

  const [tripType, setTripType] = useState("classic"); // "classic" or "time"
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [stopChecked, setStopChecked] = useState(false);
  const [stopAddress, setStopAddress] = useState("");
  const [bagage, setBagage] = useState(false);
  const [transportPickup, setTransportPickup] = useState(null);
  const [transportDrop, setTransportDrop] = useState(null);
  const [pickupTransportRef, setPickupTransportRef] = useState("");
  const [dropTransportRef, setDropTransportRef] = useState("");
  const [showPickupTransportSuggestions, setShowPickupTransportSuggestions] =
    useState(false);
  const [showDropTransportSuggestions, setShowDropTransportSuggestions] =
    useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [stopLocation, setStopLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 });
  const [map, setMap] = useState(null);
  const [duration, setDuration] = useState(2); // For time-based trips (minimum 2 hours)
  const [routeDistance, setRouteDistance] = useState(null); // Distance in km from Google Maps

  // Price breakdown state
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("immediate");
  const [userCreditInfo, setUserCreditInfo] = useState(null);
  const [showRestoredMessage, setShowRestoredMessage] = useState(false);

  // Fonction pour sauvegarder les données du formulaire
  const saveFormData = () => {
    if (!isAuthenticated) {
      const formData = {
        tripType,
        date,
        hour,
        pickupAddress,
        dropAddress,
        stopChecked,
        stopAddress,
        bagage,
        transportPickup,
        transportDrop,
        pickupTransportRef,
        dropTransportRef,
        duration,
        paymentMethod,
        pickupLocation,
        dropLocation,
        stopLocation,
      };

      reservationStorage.saveReservationData(formData);
    }
  };

  // Restaurer les données sauvegardées seulement si l'utilisateur vient de se connecter
  useEffect(() => {
    // Vérifier si l'utilisateur vient de se connecter (présence d'un paramètre URL ou flag)
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogin = urlParams.get("from_login") === "true";

    // Ou vérifier s'il y a un flag dans sessionStorage (plus fiable)
    const justLoggedIn =
      sessionStorage.getItem("taxibiker_just_logged_in") === "true";

    if ((fromLogin || justLoggedIn) && isAuthenticated) {
      const savedData = reservationStorage.getReservationData();
      if (savedData) {
        console.log(
          "Restauration des données de réservation après connexion:",
          savedData
        );

        // Restaurer tous les champs du formulaire
        setTripType(savedData.tripType || "classic");
        setDate(savedData.date || new Date());
        setHour(savedData.hour || "");
        setPickupAddress(savedData.pickupAddress || "");
        setDropAddress(savedData.dropAddress || "");
        setStopChecked(savedData.stopChecked || false);
        setStopAddress(savedData.stopAddress || "");
        setBagage(savedData.bagage || false);
        setTransportPickup(savedData.transportPickup || null);
        setTransportDrop(savedData.transportDrop || null);
        setPickupTransportRef(savedData.pickupTransportRef || "");
        setDropTransportRef(savedData.dropTransportRef || "");
        setDuration(savedData.duration || 2);
        setPaymentMethod(savedData.paymentMethod || "immediate");

        // Restaurer les coordonnées si disponibles
        if (savedData.pickupLocation)
          setPickupLocation(savedData.pickupLocation);
        if (savedData.dropLocation) setDropLocation(savedData.dropLocation);
        if (savedData.stopLocation) setStopLocation(savedData.stopLocation);

        // Afficher un message à l'utilisateur
        setShowRestoredMessage(true);
        setTimeout(() => setShowRestoredMessage(false), 5000);
      }

      // Nettoyer le flag pour éviter la restauration lors des prochaines visites
      sessionStorage.removeItem("taxibiker_just_logged_in");

      // Nettoyer l'URL si nécessaire
      if (fromLogin) {
        window.history.replaceState({}, "", "/reservation");
      }
    } else if (isAuthenticated) {
      // Si l'utilisateur est connecté mais ne vient pas de se connecter,
      // nettoyer les anciennes données sauvegardées
      reservationStorage.clearReservationData();
    }
  }, [isAuthenticated]);

  // Sauvegarder automatiquement les données quand l'utilisateur modifie le formulaire
  useEffect(() => {
    if (!isAuthenticated && (pickupAddress || dropAddress || hour)) {
      // Sauvegarder avec un délai pour éviter trop d'appels
      const timeoutId = setTimeout(() => {
        saveFormData();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    tripType,
    date,
    hour,
    pickupAddress,
    dropAddress,
    stopChecked,
    stopAddress,
    bagage,
    transportPickup,
    transportDrop,
    duration,
    paymentMethod,
    isAuthenticated,
  ]);

  // Fetch user credit info on component mount
  React.useEffect(() => {
    const fetchUserCreditInfo = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await authService.authenticatedRequest(
          buildApiUrl("user/credit")
        );
        const data = await response.json();

        if (data.success) {
          setUserCreditInfo(data.credit);
          console.log("DEBUG - User credit info:", data.credit);
        } else {
          console.log("DEBUG - Failed to fetch credit info:", data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des infos de crédit:", error);
      }
    };

    fetchUserCreditInfo();
  }, [isAuthenticated]);

  // Calculate price from backend API
  const calculatePriceFromBackend = async () => {
    // For classic mode: need both addresses
    // For hourly mode: only need pickup address
    if (!pickupAddress) {
      return null;
    }

    if (tripType === "classic" && !dropAddress) {
      return null;
    }

    setIsCalculatingPrice(true);
    setPricingError(null);

    try {
      // Combine date and hour into datetime
      const pickupDateTime = new Date(date);
      if (hour) {
        const [hours, minutes] = hour.split(":");
        pickupDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }

      const requestData = {
        departure: pickupAddress,
        arrival: dropAddress || pickupAddress, // Use pickup as default for hourly mode
        mode: tripType === "time" ? "hourly" : "classic",
        datetime: pickupDateTime.toISOString(),
      };

      // Add mode-specific parameters
      if (tripType === "time") {
        requestData.hours = duration;
      } else {
        requestData.stops = stopChecked ? 1 : 0;
        // Add distance for zone calculation (needed for unknown zones)
        if (routeDistance) {
          requestData.distance = routeDistance;
        }
      }

      // Add excess baggage if checked
      requestData.excessBaggage = bagage ? 1 : 0;

      const response = await fetch(
        `${
          import.meta.env.PROD ? "/api" : "http://localhost:8000/api"
        }/pricing/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const result = await response.json();

      if (result.success) {
        setPriceBreakdown(result.data);
        setPricingError(null);
        return result.data.totalPrice;
      } else {
        console.error("Pricing error:", result.error);
        setPricingError(result.error || "Erreur lors du calcul du prix");
        setPriceBreakdown(null);
        return null;
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      setPricingError("Erreur lors du calcul du prix");
      setPriceBreakdown(null);
      return null;
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Calculate price only when locations are fully set (after suggestion selection)
  React.useEffect(() => {
    // For classic mode: need both locations
    // For hourly mode: just need pickup address and duration
    const canCalculate =
      tripType === "time"
        ? pickupAddress && duration >= 2
        : pickupLocation && dropLocation && pickupAddress && dropAddress;

    if (canCalculate) {
      // Small delay to ensure route distance is calculated
      const timer = setTimeout(() => {
        calculatePriceFromBackend();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPriceBreakdown(null);
      setPricingError(null);
    }
  }, [
    pickupLocation,
    dropLocation,
    pickupAddress,
    date,
    hour,
    tripType,
    duration,
    stopChecked,
    bagage,
    routeDistance,
  ]);

  const totalPrice = priceBreakdown?.totalPrice || null;

  // Clear departure transport reference when transport is deselected
  React.useEffect(() => {
    if (!transportPickup) {
      setPickupTransportRef("");
    }
  }, [transportPickup]);

  // Handle trip type change
  const handleTripTypeChange = (type) => {
    setTripType(type);
    // Reset location states when switching trip types
    setPickupLocation(null);
    setDropLocation(null);
    setStopLocation(null);
    setPickupAddress("");
    setDropAddress("");
    setStopAddress("");
    setStopChecked(false);
    setDirections(null);
  };

  // Transport suggestions data
  const airports = [
    "Aéroport Charles de Gaulle (CDG)",
    "Aéroport Orly (ORY)",
    "Aéroport de Nice (NCE)",
    "Aéroport de Lyon (LYS)",
    "Aéroport de Marseille (MRS)",
    "Aéroport de Toulouse (TLS)",
    "Aéroport de Bordeaux (BOD)",
    "Aéroport de Nantes (NTE)",
    "Aéroport de Strasbourg (SXB)",
    "Aéroport de Montpellier (MPL)",
  ];

  const trainStations = [
    "Gare du Nord",
    "Gare de Lyon",
    "Gare de l'Est",
    "Gare Montparnasse",
    "Gare Saint-Lazare",
    "Gare d'Austerlitz",
    "Gare de Bercy",
    "Gare de Châtelet-Les Halles",
    "Gare de La Défense",
    "Gare de Marne-la-Vallée",
  ];
  // Time picker with separate hour and minute columns
  const TimePicker = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const containerRef = React.useRef(null);
    const hourListRef = React.useRef(null);
    const minuteListRef = React.useRef(null);
    const itemHeight = 40;

    const hours = Array.from({ length: 24 }, (_, h) =>
      h.toString().padStart(2, "0")
    );
    const minutes = Array.from({ length: 60 }, (_, m) =>
      m.toString().padStart(2, "0")
    );

    const parseValue = (val) => {
      if (!val || !/^[0-2]\d:[0-5]\d$/.test(val)) return { h: 0, m: "00" };
      const [h, m] = val.split(":");
      return { h: Math.min(23, Math.max(0, parseInt(h, 10))), m };
    };

    const { h: selectedHour, m: selectedMinute } = parseValue(value);

    const scrollToIndex = (ref, index) => {
      if (!ref?.current) return;
      ref.current.scrollTo({ top: index * itemHeight, behavior: "smooth" });
    };

    React.useEffect(() => {
      if (open) {
        scrollToIndex(hourListRef, selectedHour);
        scrollToIndex(minuteListRef, parseInt(selectedMinute, 10));
      }
    }, [open, selectedHour, selectedMinute]);

    React.useEffect(() => {
      const handleClick = (e) => {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleHourSelect = (hour) => {
      onChange(`${hour}:${selectedMinute}`);
    };

    const handleMinuteSelect = (minute) => {
      onChange(`${hours[selectedHour]}:${minute}`);
    };

    return (
      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={value}
          readOnly
          placeholder="Sélectionner un horaire"
          onClick={() => setOpen((o) => !o)}
          className="w-full px-3 py-2.5 rounded-lg bg-gray-900/80 border border-gray-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DD5212]/50 focus:border-[#DD5212] hover:border-gray-500 transition cursor-pointer"
        />
        {open && (
          <div className="absolute z-20 mt-2 w-full rounded-lg bg-gray-900 border border-gray-700 shadow-lg p-3">
            <div className="flex gap-4">
              {/* Hours column */}
              <div className="flex-1">
                <h4 className="text-xs text-gray-400 mb-2 text-center">
                  Heures
                </h4>
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-900/70 via-transparent to-gray-900/70"></div>
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y border-[#DD5212]/40 h-10 pointer-events-none" />
                  <div
                    ref={hourListRef}
                    className="h-48 overflow-y-scroll no-scrollbar snap-y snap-mandatory"
                  >
                    {hours.map((h) => (
                      <div
                        key={h}
                        onClick={() => handleHourSelect(h)}
                        className={`h-10 flex items-center justify-center snap-start cursor-pointer transition text-sm ${
                          selectedHour === parseInt(h, 10)
                            ? "text-white font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="flex items-center justify-center text-white text-lg">
                :
              </div>

              {/* Minutes column */}
              <div className="flex-1">
                <h4 className="text-xs text-gray-400 mb-2 text-center">
                  Minutes
                </h4>
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-900/70 via-transparent to-gray-900/70"></div>
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y border-[#DD5212]/40 h-10 pointer-events-none" />
                  <div
                    ref={minuteListRef}
                    className="h-48 overflow-y-scroll no-scrollbar snap-y snap-mandatory"
                  >
                    {minutes.map((m) => (
                      <div
                        key={m}
                        onClick={() => handleMinuteSelect(m)}
                        className={`h-10 flex items-center justify-center snap-start cursor-pointer transition text-sm ${
                          selectedMinute === m
                            ? "text-white font-medium"
                            : "text-gray-400"
                        }`}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const generateHours = () => {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      hours.push(`${h.toString().padStart(2, "0")}:00`);
      hours.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return hours;
  };

  // iPhone-style time picker component
  const TimeWheelPicker = ({ value, onChange }) => {
    const hourListRef = React.useRef(null);
    const minuteListRef = React.useRef(null);
    const itemHeight = 40; // px per row; keep in sync with className h-10

    const hours = Array.from({ length: 24 }, (_, h) =>
      h.toString().padStart(2, "0")
    );
    const minutes = ["00", "30"];

    const parseValue = (val) => {
      if (!val || !/^[0-2]\d:[0-5]\d$/.test(val)) return { h: 0, m: "00" };
      const [h, m] = val.split(":");
      return { h: Math.min(23, Math.max(0, parseInt(h, 10))), m };
    };

    const { h: selectedHour, m: selectedMinute } = parseValue(value);

    const scrollToIndex = (ref, index) => {
      if (!ref?.current) return;
      ref.current.scrollTo({ top: index * itemHeight, behavior: "smooth" });
    };

    React.useEffect(() => {
      scrollToIndex(hourListRef, selectedHour);
      const minuteIndex = Math.max(0, minutes.indexOf(selectedMinute));
      scrollToIndex(minuteListRef, minuteIndex);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const snapScroll = (ref, items, isHour) => {
      if (!ref?.current) return;
      const pos = ref.current.scrollTop;
      const index = Math.min(
        items.length - 1,
        Math.max(0, Math.round(pos / itemHeight))
      );
      const newValue = isHour
        ? `${items[index]}:${selectedMinute}`
        : `${hours[selectedHour]}:${items[index]}`;
      onChange(newValue);
      scrollToIndex(ref, index);
    };

    return (
      <div className="w-full rounded-lg bg-gray-900/50 border border-gray-700 p-2">
        <div className="relative grid grid-cols-5 gap-2">
          {/* Hours column */}
          <div className="col-span-3">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-900/70 via-transparent to-gray-900/70"></div>
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y border-[#DD5212]/40 h-10 pointer-events-none" />
              <div
                ref={hourListRef}
                onScroll={(e) => {
                  // debounce snapping slightly
                  if (hourListRef._t) cancelAnimationFrame(hourListRef._t);
                  hourListRef._t = requestAnimationFrame(() =>
                    snapScroll(hourListRef, hours, true)
                  );
                }}
                className="h-48 overflow-y-scroll no-scrollbar snap-y snap-mandatory"
              >
                {hours.map((hStr) => (
                  <div
                    key={hStr}
                    onClick={() => onChange(`${hStr}:${selectedMinute}`)}
                    className={`h-10 flex items-center justify-center snap-start cursor-pointer transition text-sm ${
                      selectedHour === parseInt(hStr, 10)
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {hStr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="col-span-1 flex items-center justify-center text-white text-lg">
            :
          </div>

          {/* Minutes column */}
          <div className="col-span-1">
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-900/70 via-transparent to-gray-900/70"></div>
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-y border-[#DD5212]/40 h-10 pointer-events-none" />
              <div
                ref={minuteListRef}
                onScroll={() => {
                  if (minuteListRef._t) cancelAnimationFrame(minuteListRef._t);
                  minuteListRef._t = requestAnimationFrame(() =>
                    snapScroll(minuteListRef, minutes, false)
                  );
                }}
                className="h-48 overflow-y-scroll no-scrollbar snap-y snap-mandatory"
              >
                {minutes.map((mStr) => (
                  <div
                    key={mStr}
                    onClick={() => onChange(`${hours[selectedHour]}:${mStr}`)}
                    className={`h-10 flex items-center justify-center snap-start cursor-pointer transition text-sm ${
                      selectedMinute === mStr ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {mStr}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const calculateRoute = () => {
    // Only calculate route for classic trips with both pickup and drop locations
    if (
      tripType === "classic" &&
      pickupLocation &&
      dropLocation &&
      isLoaded &&
      window.google &&
      window.google.maps
    ) {
      try {
        const directionsService = new window.google.maps.DirectionsService();

        const waypoints = [];
        if (stopLocation) {
          waypoints.push({
            location: stopLocation,
            stopover: true,
          });
        }

        directionsService.route(
          {
            origin: pickupLocation,
            destination: dropLocation,
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false,
          },
          (result, status) => {
            if (status === "OK") {
              setDirections(result);
              // Extract distance in kilometers
              const distanceInMeters =
                result.routes?.[0]?.legs?.[0]?.distance?.value;
              if (distanceInMeters) {
                const distanceInKm = distanceInMeters / 1000;
                setRouteDistance(distanceInKm);
              }
              // Fit the map to the route bounds when available
              const routeBounds = result.routes?.[0]?.bounds;
              if (map && routeBounds) {
                map.fitBounds(routeBounds);
              }
            } else {
              console.error("Directions request failed due to " + status);
            }
          }
        );
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Google Maps:", error);
      }
    } else if (tripType === "time") {
      // For time-based trips, clear directions and center on pickup location
      setDirections(null);
      if (pickupLocation && map) {
        map.setCenter(pickupLocation);
        map.setZoom(15);
      }
    }
  };

  const getSuggestions = async (query, type) => {
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

  const searchPlace = async (query, type) => {
    if (!query.trim()) return;

    try {
      // Utiliser l'API Places (New) via fetch
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
            maxResultCount: 1,
            languageCode: "fr",
            regionCode: "FR",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places[0]) {
          const place = data.places[0];
          const location = {
            lat: place.location.latitude,
            lng: place.location.longitude,
          };

          if (type === "pickup") {
            setPickupAddress(place.formattedAddress);
            setPickupLocation(location);
            setShowPickupSuggestions(false);
          } else if (type === "drop") {
            setDropAddress(place.formattedAddress);
            setDropLocation(location);
            setShowDropSuggestions(false);
          } else if (type === "stop") {
            setStopAddress(place.formattedAddress);
            setStopLocation(location);
            setShowStopSuggestions(false);
          }
          calculateRoute();
        }
      } else {
        const errText = await response.text();
        console.error("Places searchText error:", errText);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de lieu:", error);
    }
  };

  const [searchTimeouts, setSearchTimeouts] = useState({});
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const [showStopSuggestions, setShowStopSuggestions] = useState(false);

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickupAddress(value);
    setShowPickupSuggestions(value.length > 2);

    // Clear existing timeout
    if (searchTimeouts.pickup) {
      clearTimeout(searchTimeouts.pickup);
    }

    // Set new timeout for suggestions
    const timeout = setTimeout(async () => {
      if (value.length > 2) {
        const suggestions = await getSuggestions(value, "pickup");
        setPickupSuggestions(suggestions);
      } else {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
      }
    }, 300);

    setSearchTimeouts((prev) => ({ ...prev, pickup: timeout }));
  };

  const handleDropChange = (e) => {
    const value = e.target.value;
    setDropAddress(value);
    setShowDropSuggestions(value.length > 2);

    if (searchTimeouts.drop) {
      clearTimeout(searchTimeouts.drop);
    }

    const timeout = setTimeout(async () => {
      if (value.length > 2) {
        const suggestions = await getSuggestions(value, "drop");
        setDropSuggestions(suggestions);
      } else {
        setDropSuggestions([]);
        setShowDropSuggestions(false);
      }
    }, 300);

    setSearchTimeouts((prev) => ({ ...prev, drop: timeout }));
  };

  const handleStopChange = (e) => {
    const value = e.target.value;
    setStopAddress(value);
    setShowStopSuggestions(value.length > 2);

    if (searchTimeouts.stop) {
      clearTimeout(searchTimeouts.stop);
    }

    const timeout = setTimeout(async () => {
      if (value.length > 2) {
        const suggestions = await getSuggestions(value, "stop");
        setStopSuggestions(suggestions);
      } else {
        setStopSuggestions([]);
        setShowStopSuggestions(false);
      }
    }, 300);

    setSearchTimeouts((prev) => ({ ...prev, stop: timeout }));
  };

  const selectPickupSuggestion = (suggestion) => {
    const address =
      suggestion.placePrediction?.text?.text ||
      suggestion.placePrediction?.place?.formattedAddress;
    setPickupAddress(address);
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);
    // Rechercher les coordonnées pour cette adresse
    searchPlace(address, "pickup");
  };

  const selectDropSuggestion = (suggestion) => {
    const address =
      suggestion.placePrediction?.text?.text ||
      suggestion.placePrediction?.place?.formattedAddress;
    setDropAddress(address);
    setShowDropSuggestions(false);
    setDropSuggestions([]);
    // Rechercher les coordonnées pour cette adresse
    searchPlace(address, "drop");
  };

  const selectStopSuggestion = (suggestion) => {
    const address =
      suggestion.placePrediction?.text?.text ||
      suggestion.placePrediction?.place?.formattedAddress;
    setStopAddress(address);
    setShowStopSuggestions(false);
    setStopSuggestions([]);
    // Rechercher les coordonnées pour cette adresse
    searchPlace(address, "stop");
  };

  // Recalculate route when stop is toggled or trip type changes
  React.useEffect(() => {
    if (stopChecked === false) {
      setStopLocation(null);
      setStopAddress("");
    }
    if (isLoaded) {
      calculateRoute();
    }
  }, [
    stopChecked,
    pickupLocation,
    dropLocation,
    stopLocation,
    tripType,
    isLoaded,
  ]);

  // Fermer les suggestions quand on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setShowPickupSuggestions(false);
        setShowDropSuggestions(false);
        setShowStopSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoaded) return <div>Chargement...</div>;

  return (
    <div className="bg-black min-h-screen">
      {/* Afficher le bon header selon l'état de connexion */}
      {isAuthenticated ? (
        <DashboardHeader onNavigate={handleNavigation} />
      ) : (
        <Header />
      )}

      <div className="pt-24 py-6 px-4 md:px-0">
        {/* Titre principal */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-white">
          Réservez votre course
        </h1>

        {/* Message de restauration des données */}
        {showRestoredMessage && (
          <div className="max-w-2xl mx-auto mb-6 bg-green-600/20 border border-green-500/50 rounded-lg p-4 text-center">
            <p className="text-green-400 font-medium">
              ✅ Vos informations de réservation ont été restaurées !
            </p>
            <p className="text-green-300 text-sm mt-1">
              Vous pouvez continuer votre réservation là où vous vous étiez
              arrêté.
            </p>
          </div>
        )}

        {/* Trip Type Selection */}
        <div className="max-w-2xl mx-auto mb-6">
          <label className="block text-sm font-medium text-white mb-3 text-center">
            Type de course
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTripTypeChange("classic")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition ${
                tripType === "classic"
                  ? "bg-[#DD5212] text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Course classique
            </button>
            <button
              type="button"
              onClick={() => handleTripTypeChange("time")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition ${
                tripType === "time"
                  ? "bg-[#DD5212] text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Course à la durée
            </button>
          </div>
        </div>

        {/* Carte */}
        <div className="w-full max-w-2xl mx-auto h-72 md:h-80 mb-6 rounded-lg overflow-hidden">
          <GoogleMap
            center={mapCenter}
            zoom={12}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true,
            }}
            onLoad={(m) => setMap(m)}
          >
            {/* Show route if directions are available */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "#000000",
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                  },
                  suppressMarkers: true, // We'll add custom markers
                }}
              />
            )}

            {/* Custom markers */}
            {pickupLocation && (
              <Marker
                position={pickupLocation}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill="#22C55E"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(24, 24),
                }}
                title="Point de prise en charge"
              />
            )}

            {dropLocation && (
              <Marker
                position={dropLocation}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill="#EF4444"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(24, 24),
                }}
                title="Point d'arrivée"
              />
            )}

            {stopLocation && (
              <Marker
                position={stopLocation}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" fill="#F59E0B"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(24, 24),
                }}
                title="Stop intermédiaire"
              />
            )}
          </GoogleMap>
        </div>

        {/* Formulaire */}
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Date et Horaire */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1 text-white">Date</label>
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                dateFormat="dd/MM/yyyy"
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-white">Horaire</label>
              <TimePicker value={hour} onChange={setHour} />
            </div>
          </div>

          {/* Adresse de prise en charge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
            <div>
              <label className="block text-sm mb-1 text-white">
                Adresse de prise en charge
                {tripType === "time" && (
                  <span className="text-orange-400 ml-2 text-xs">
                    (Paris uniquement)
                  </span>
                )}
              </label>
              <AddressInput
                value={pickupAddress}
                onChange={handlePickupChange}
                placeholder={
                  tripType === "time"
                    ? "Adresse à Paris..."
                    : "Rue, code postal, ville..."
                }
                suggestions={pickupSuggestions}
                showSuggestions={showPickupSuggestions}
                onSelectSuggestion={selectPickupSuggestion}
                onBlur={() =>
                  setTimeout(() => setShowPickupSuggestions(false), 200)
                }
                onFocus={() =>
                  pickupSuggestions.length > 0 && setShowPickupSuggestions(true)
                }
              />
              {tripType === "time" && (
                <p className="text-xs text-orange-400 mt-1">
                  ⚠️ Le service à la durée est disponible uniquement à Paris
                </p>
              )}
            </div>
            {tripType === "classic" && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newValue =
                      transportPickup === "plane" ? null : "plane";
                    setTransportPickup(newValue);
                    setShowPickupTransportSuggestions(newValue === "plane");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                    transportPickup === "plane"
                      ? "bg-[#DD5212]"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <FaPlane />
                </button>
                <button
                  onClick={() => {
                    const newValue =
                      transportPickup === "train" ? null : "train";
                    setTransportPickup(newValue);
                    setShowPickupTransportSuggestions(newValue === "train");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                    transportPickup === "train"
                      ? "bg-[#DD5212]"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <FaTrain />
                </button>
              </div>
            )}
          </div>

          {/* Transport suggestions for pickup */}
          {showPickupTransportSuggestions && (
            <div className="mt-2">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2">
                  {transportPickup === "plane"
                    ? "Aéroports disponibles"
                    : "Gares disponibles"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(transportPickup === "plane" ? airports : trainStations).map(
                    (location, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPickupAddress(location);
                          setShowPickupTransportSuggestions(false);
                          // Geocode the location to get coordinates
                          searchPlace(location, "pickup");
                        }}
                        className="text-left p-2 rounded bg-gray-700 hover:bg-gray-600 text-sm text-white transition"
                      >
                        {location}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pickup transport reference (flight/train number) */}
          {transportPickup && (
            <div className="mt-2">
              <label className="block text-sm mb-1 text-white">
                {transportPickup === "plane"
                  ? "Numéro de vol"
                  : "Numéro de train"}
              </label>
              <input
                type="text"
                value={pickupTransportRef}
                onChange={(e) => setPickupTransportRef(e.target.value)}
                placeholder={
                  transportPickup === "plane" ? "ex: AF1234" : "ex: TGV 8421"
                }
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm text-white"
              />
            </div>
          )}

          {/* Adresse d'arrivée - Only for classic trips */}
          {tripType === "classic" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                <div>
                  <label className="block text-sm mb-1 text-white">
                    Adresse d'arrivée
                  </label>
                  <AddressInput
                    value={dropAddress}
                    onChange={handleDropChange}
                    placeholder="Rue, code postal, ville..."
                    suggestions={dropSuggestions}
                    showSuggestions={showDropSuggestions}
                    onSelectSuggestion={selectDropSuggestion}
                    onBlur={() =>
                      setTimeout(() => setShowDropSuggestions(false), 200)
                    }
                    onFocus={() =>
                      dropSuggestions.length > 0 && setShowDropSuggestions(true)
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newValue =
                        transportDrop === "plane" ? null : "plane";
                      setTransportDrop(newValue);
                      setShowDropTransportSuggestions(newValue === "plane");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                      transportDrop === "plane"
                        ? "bg-[#DD5212]"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    <FaPlane />
                  </button>
                  <button
                    onClick={() => {
                      const newValue =
                        transportDrop === "train" ? null : "train";
                      setTransportDrop(newValue);
                      setShowDropTransportSuggestions(newValue === "train");
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                      transportDrop === "train"
                        ? "bg-[#DD5212]"
                        : "bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    <FaTrain />
                  </button>
                </div>
              </div>

              {/* Transport suggestions for drop */}
              {showDropTransportSuggestions && (
                <div className="mt-2">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white mb-2">
                      {transportDrop === "plane"
                        ? "Aéroports disponibles"
                        : "Gares disponibles"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(transportDrop === "plane"
                        ? airports
                        : trainStations
                      ).map((location, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setDropAddress(location);
                            setShowDropTransportSuggestions(false);
                            // Geocode the location to get coordinates
                            searchPlace(location, "drop");
                          }}
                          className="text-left p-2 rounded bg-gray-700 hover:bg-gray-600 text-sm text-white transition"
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Duration input - Only for time-based trips */}
          {tripType === "time" && (
            <div>
              <label className="block text-sm mb-1 text-white">
                Durée (heures)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) =>
                  setDuration(
                    Math.max(2, Math.min(5, parseInt(e.target.value) || 2))
                  )
                }
                min="2"
                step="1"
                max="5"
                placeholder="Nombre d'heures (minimum 2, maximum 5)"
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm text-white"
              />
            </div>
          )}

          {/* Stop - Only for classic trips */}
          {tripType === "classic" && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="stop"
                  checked={stopChecked}
                  onChange={() => setStopChecked(!stopChecked)}
                  className="accent-[#DD5212]"
                />
                <label htmlFor="stop" className="text-white">
                  Stop supplémentaire
                </label>
              </div>
              {stopChecked && (
                <div>
                  <AddressInput
                    value={stopAddress}
                    onChange={handleStopChange}
                    placeholder="Adresse du stop"
                    suggestions={stopSuggestions}
                    showSuggestions={showStopSuggestions}
                    onSelectSuggestion={selectStopSuggestion}
                    onBlur={() =>
                      setTimeout(() => setShowStopSuggestions(false), 200)
                    }
                    onFocus={() =>
                      stopSuggestions.length > 0 && setShowStopSuggestions(true)
                    }
                    className="mt-1"
                  />
                </div>
              )}
            </>
          )}

          {/* Bagage */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={bagage}
              onChange={() => setBagage(!bagage)}
              id="bagage"
              className="accent-[#DD5212]"
            />
            <label htmlFor="bagage" className="text-white">
              Bagage volumineux ou +15kg
            </label>
          </div>

          {/* Mode de paiement */}
          {userCreditInfo?.monthly_credit_enabled && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 mt-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-gradient-to-r from-[#DD5212] to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💳</span>
                </div>
                <h3 className="text-white font-bold text-lg">
                  Mode de paiement
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Paiement immédiat */}
                <div
                  className={`relative cursor-pointer transition-all duration-300 ${
                    paymentMethod === "immediate"
                      ? "ring-2 ring-[#DD5212] bg-gradient-to-br from-[#DD5212]/20 to-orange-600/10"
                      : "hover:bg-gray-700/30"
                  } rounded-xl border border-gray-600/50 p-4`}
                  onClick={() => setPaymentMethod("immediate")}
                >
                  <input
                    type="radio"
                    id="payment-immediate"
                    name="paymentMethod"
                    value="immediate"
                    checked={paymentMethod === "immediate"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="absolute top-4 right-4 accent-[#DD5212] scale-125"
                  />
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">💳</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-base mb-1">
                        Paiement immédiat
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Payez directement sur place lors de votre course
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                          ✓ Instantané
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paiement crédit */}
                <div
                  className={`relative cursor-pointer transition-all duration-300 ${
                    paymentMethod === "credit"
                      ? "ring-2 ring-[#DD5212] bg-gradient-to-br from-[#DD5212]/20 to-orange-600/10"
                      : "hover:bg-gray-700/30"
                  } rounded-xl border border-gray-600/50 p-4`}
                  onClick={() => setPaymentMethod("credit")}
                >
                  <input
                    type="radio"
                    id="payment-credit"
                    name="paymentMethod"
                    value="credit"
                    checked={paymentMethod === "credit"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="absolute top-4 right-4 accent-[#DD5212] scale-125"
                  />
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">📅</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-base mb-1">
                        Crédit mensuel
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Ajouté à votre facture de fin de mois
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                          📊 Crédit: {userCreditInfo?.current_credit}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info supplémentaire pour le crédit */}
              {paymentMethod === "credit" && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-blue-300 text-sm font-medium mb-1">
                        Paiement différé activé
                      </p>
                      <p className="text-blue-200/80 text-xs leading-relaxed">
                        Cette course sera ajoutée à votre crédit mensuel. Vous
                        recevrez une facture récapitulative en fin de mois.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading Animation */}
          {isCalculatingPrice && pickupAddress && dropAddress && (
            <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#DD5212]"></div>
                <span className="text-sm text-gray-300">
                  Calcul du prix en cours...
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {pricingError && !isCalculatingPrice && (
            <div className="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-200">⚠️ {pricingError}</p>
            </div>
          )}

          {/* Estimation prix button */}
          <button
            className="w-full bg-[#DD5212] p-3 rounded text-white font-semibold text-base mt-4 hover:bg-[#c14610] transition disabled:opacity-50"
            onClick={async () => {
              // Vérifier si l'utilisateur est connecté
              if (!authService.isAuthenticated()) {
                // Sauvegarder les données du formulaire avant la redirection
                saveFormData();
                // Sauvegarder l'URL de redirection après connexion
                reservationStorage.saveRedirectUrl("/reservation");
                navigate("/user/login");
                return;
              }

              // Créer la réservation
              try {
                // Combiner date et heure
                const reservationDateTime = new Date(date);
                if (hour) {
                  const [hours, minutes] = hour.split(":");
                  reservationDateTime.setHours(
                    parseInt(hours),
                    parseInt(minutes),
                    0,
                    0
                  );
                }

                const reservationData = {
                  departure: pickupAddress,
                  arrival: dropAddress || pickupAddress,
                  date: reservationDateTime.toISOString(),
                  mode: tripType === "time" ? "hourly" : "classic",
                  totalPrice: totalPrice,
                  hours: tripType === "time" ? duration : undefined,
                  stop: stopChecked ? stopAddress : null,
                  excessBaggage: bagage,
                  paymentMethod: paymentMethod,
                };

                const response = await authService.authenticatedRequest(
                  buildApiUrl("reservations"),
                  {
                    method: "POST",
                    body: JSON.stringify(reservationData),
                  }
                );

                const result = await response.json();

                if (result.success) {
                  // Nettoyer les données sauvegardées après succès
                  reservationStorage.clearReservationData();

                  alert(
                    `✅ Réservation confirmée !\n\nNuméro: #${result.reservation.id}\nMontant: ${result.reservation.price}€\n\nVous recevrez un email de confirmation.`
                  );
                  // Rediriger vers le dashboard
                  navigate("/dashboard");
                } else {
                  alert("❌ Erreur: " + (result.error || "Erreur inconnue"));
                }
              } catch (error) {
                console.error("Erreur lors de la réservation:", error);
                alert("❌ Erreur lors de la réservation. Veuillez réessayer.");
              }
            }}
            disabled={isCalculatingPrice || !totalPrice}
          >
            {isCalculatingPrice
              ? "Calcul en cours..."
              : totalPrice
              ? `Réserver - ${totalPrice.toFixed(2)}€`
              : "Réserver"}
          </button>
        </div>

        {/* Infos complémentaires */}
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mt-20 mb-6">
          Infos complémentaires
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Course de dernière minute",
              text: "Nous nous adaptons à vos besoins pour toute réservation rapide. Une majoration de 20€ sera appliquée.",
            },
            {
              title: "Chauffeur à disposition",
              text: "Profitez d’un chauffeur dédié pour vos trajets afin de ne pas vous soucier du temps entre vos rendez-vous.",
            },
            {
              title: "Bagages supplémentaires",
              text: "Certaines motos GOLDWING peuvent transporter 1 valise de 25kg + 1 cabine de 10kg. Option disponible sur réservation pour 15€.",
            },
            {
              title: "Trajets hors formule",
              text: "Toutes destinations possibles. Tarif : 2,50€/km + prise en charge (30€ jusqu’à 40km, 50€ au-delà). Demandez un devis gratuit.",
            },
            {
              title: "Délai d’attente",
              text: "10 minutes d’attente offertes, puis 1€/minute supplémentaire.",
            },
            {
              title: "Annulation",
              text: "Annulez jusqu’à 24h avant départ sans frais. Entre 24h et 1h : 30€. Moins d’1h : montant total de la course.",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-lg font-bold mb-2 text-[#DD5212]">
                {card.title}
              </h3>
              <p className="text-sm text-white/80">{card.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsappButton number="33612345678" />
    </div>
  );
}
