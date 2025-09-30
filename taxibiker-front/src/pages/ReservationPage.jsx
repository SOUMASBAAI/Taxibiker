import React, { useState, useRef } from "react";
import { FaPlane, FaTrain } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";

const libraries = ["places"];

export default function ReservationPage() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "VOTRE_API_KEY_GOOGLE",
    libraries,
  });

  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [stopChecked, setStopChecked] = useState(false);
  const [stopAddress, setStopAddress] = useState("");
  const [bagage, setBagage] = useState(false);
  const [transportPickup, setTransportPickup] = useState(null);
  const [transportDrop, setTransportDrop] = useState(null);

  const pickupRef = useRef(null);
  const dropRef = useRef(null);
  const stopRef = useRef(null);

  const basePrice = 20;
  const stopPrice = stopChecked ? 20 : 0;
  const bagagePrice = bagage ? 15 : 0;
  const totalPrice = basePrice + stopPrice + bagagePrice;

  if (!isLoaded) return <div>Chargement...</div>;

  // Créneaux horaires toutes les 30 min de 00:00 à 23:30
  const generateHours = () => {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      hours.push(`${h.toString().padStart(2, "0")}:00`);
      hours.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return hours;
  };

  return (
    <div className="bg-black text-white min-h-screen py-6 px-4 md:px-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[#DD5212]">
        Réservez votre course
      </h1>

      {/* Carte */}
      <div className="w-full max-w-2xl mx-auto h-72 md:h-80 mb-6 rounded-lg overflow-hidden">
        <GoogleMap
          center={{ lat: 48.8566, lng: 2.3522 }}
          zoom={12}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {pickupAddress && <Marker position={{ lat: 48.8566, lng: 2.3522 }} />}
          {dropAddress && <Marker position={{ lat: 48.8666, lng: 2.3622 }} />}
          {stopChecked && stopAddress && (
            <Marker position={{ lat: 48.8606, lng: 2.36 }} />
          )}
        </GoogleMap>
      </div>

      {/* Formulaire */}
      <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
        {/* Date et Horaire */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm mb-1">Date</label>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Horaire</label>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm"
            >
              <option value="">Sélectionner un horaire</option>
              {generateHours().map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Adresse de prise en charge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
          <div>
            <label className="block text-sm mb-1">Adresse de prise en charge</label>
            <Autocomplete
              onLoad={(auto) => (pickupRef.current = auto)}
              onPlaceChanged={() => {
                setPickupAddress(pickupRef.current.getPlace().formatted_address);
              }}
            >
              <input
                type="text"
                placeholder="Rue, code postal, ville..."
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm"
              />
            </Autocomplete>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTransportPickup("plane")}
              className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                transportPickup === "plane"
                  ? "bg-[#DD5212]"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <FaPlane /> 
            </button>
            <button
              onClick={() => setTransportPickup("train")}
              className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                transportPickup === "train"
                  ? "bg-[#DD5212]"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <FaTrain /> 
            </button>
          </div>
        </div>

        {/* Adresse d'arrivée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
          <div>
            <label className="block text-sm mb-1">Adresse d'arrivée</label>
            <Autocomplete
              onLoad={(auto) => (dropRef.current = auto)}
              onPlaceChanged={() => {
                setDropAddress(dropRef.current.getPlace().formatted_address);
              }}
            >
              <input
                type="text"
                placeholder="Rue, code postal, ville..."
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm"
              />
            </Autocomplete>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTransportDrop("plane")}
              className={`flex-1 flex items-center justify-center gap-1 p-2 rounded text-sm ${
                transportDrop === "plane"
                  ? "bg-[#DD5212]"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <FaPlane /> 
            </button>
            <button
              onClick={() => setTransportDrop("train")}
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

        {/* Stop supplémentaire */}
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            id="stop"
            checked={stopChecked}
            onChange={() => setStopChecked(!stopChecked)}
            className="accent-[#DD5212]"
          />
          <label htmlFor="stop">Stop supplémentaire (+20€)</label>
        </div>
        {stopChecked && (
          <div>
            <Autocomplete
              onLoad={(auto) => (stopRef.current = auto)}
              onPlaceChanged={() =>
                setStopAddress(stopRef.current.getPlace().formatted_address)
              }
            >
              <input
                type="text"
                placeholder="Adresse du stop"
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm mt-1"
              />
            </Autocomplete>
          </div>
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
          <label htmlFor="bagage">Bagage volumineux ou +15kg (+15€)</label>
        </div>

        {/* Estimation prix */}
        {pickupAddress && dropAddress && (
          <button
            className="w-full bg-[#DD5212] p-3 rounded text-white font-semibold text-base mt-2"
            onClick={() => {
              window.location.href = "/login";
            }}
          >
            Estimation: {totalPrice} € - Réserver
          </button>
        )}
      </div>
    </div>
  );
}
