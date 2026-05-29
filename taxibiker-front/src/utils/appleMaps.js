function escapeIcs(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcsDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function parseReservationDateTime(dateStr, timeStr) {
  const [year, month, day] = (dateStr || "").split("-").map(Number);
  const [hours, minutes] = (timeStr || "00:00").split(":").map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);
}

function getTripDurationHours(reservation) {
  if (reservation.type === "hourly" || reservation.tripType === "time") {
    return Number(reservation.hours || reservation.duration) || 2;
  }
  return 1;
}

function hasValidStop(stop) {
  return Boolean(stop && stop !== "Aucun");
}

export function buildAppleMapsDirectionsUrl(reservation) {
  const from = reservation.from?.trim();
  const to = (reservation.to || reservation.from)?.trim();
  const stop = reservation.stop?.trim();

  const url = new URL("https://maps.apple.com/");
  url.searchParams.set("dirflg", "d");

  if (from) {
    url.searchParams.set("saddr", from);
  }

  if (hasValidStop(stop) && to) {
    url.searchParams.append("daddr", stop);
    url.searchParams.append("daddr", to);
  } else if (to) {
    url.searchParams.set("daddr", to);
  } else if (from) {
    url.searchParams.set("q", from);
  }

  return url.toString();
}

export function buildAppleCalendarIcs(reservation) {
  const start = parseReservationDateTime(reservation.date, reservation.time);
  const end = new Date(start);
  end.setHours(end.getHours() + getTripDurationHours(reservation));

  const clientName = `${reservation.firstname || ""} ${reservation.lastname || ""}`.trim();
  const isHourly =
    reservation.type === "hourly" || reservation.tripType === "time";
  const mapsUrl = buildAppleMapsDirectionsUrl(reservation);

  const descriptionLines = [
    `Client : ${clientName}`,
    reservation.phone ? `Tél : ${reservation.phone}` : null,
    `Départ : ${reservation.from || "—"}`,
    isHourly
      ? `Course horaire : ${getTripDurationHours(reservation)}h`
      : `Arrivée : ${reservation.to || "—"}`,
    hasValidStop(reservation.stop)
      ? `Stop : ${reservation.stop}`
      : null,
    reservation.luggage ? "Bagage supplémentaire : oui" : null,
    `Prix : ${reservation.price}€ TTC`,
    `Itinéraire Apple Maps : ${mapsUrl}`,
  ].filter(Boolean);

  const summary = `Taxi Biker Paris - ${clientName || "Course"}`;
  const location = isHourly
    ? reservation.from
    : `${reservation.from || ""} → ${reservation.to || ""}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Taxi Biker Paris//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:taxibiker-reservation-${reservation.id}@taxibikerparis.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(descriptionLines.join("\n"))}`,
    `URL:${escapeIcs(mapsUrl)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadAppleCalendarEvent(reservation) {
  const icsContent = buildAppleCalendarIcs(reservation);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `course_${reservation.id}_${reservation.date}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openAppleMapsDirections(reservation) {
  const url = buildAppleMapsDirectionsUrl(reservation);
  window.open(url, "_blank", "noopener,noreferrer");
}

export function addConfirmedRideToAppleMaps(reservation) {
  downloadAppleCalendarEvent(reservation);
  openAppleMapsDirections(reservation);
}

export const CONFIRMED_APPLE_MAPS_STATUSES = ["Acceptée", "En cours"];
