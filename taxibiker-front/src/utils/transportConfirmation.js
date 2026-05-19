export const COMPANY_INFO = {
  name: "TAXI BIKER PARIS",
  rcs: "917 876 773",
  phone: "+(33)7 88 26 83 54",
  email: "Contact@taxibikerparis.com",
  driverName: "Cédric",
};

export function formatTransportDate(dateStr) {
  if (!dateStr) return "—";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year.slice(-2)}`;
}

export function formatTransportTime(timeStr) {
  if (!timeStr) return "—";
  const [h, min] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const minutes = parseInt(min, 10);
  if (Number.isNaN(hour)) return timeStr;
  return minutes === 0 ? `${hour}h` : `${hour}h${String(minutes).padStart(2, "0")}`;
}

export function mapPaymentLabel(paymentMethod) {
  return paymentMethod === "credit" ? "en compte" : "à la course";
}

export function buildTransportInfos(departure, arrival) {
  const locations = `${departure || ""} ${arrival || ""}`.toLowerCase();
  if (/cdg|orly|bourget|lbg|aéroport|aeroport|airport|terminal/i.test(locations)) {
    return "✈️";
  }
  if (
    /gare|sncf|montparnasse|nord|lyon|est|ouest|stade de france|train/i.test(
      locations
    )
  ) {
    return "🚆";
  }
  return "";
}
