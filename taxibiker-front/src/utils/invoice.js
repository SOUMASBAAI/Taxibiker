import { COMPANY_INFO, formatTransportDate, formatTransportTime, mapPaymentLabel } from "./transportConfirmation";

export const COMPANY_ADDRESS = "6 rue d'Armaillé, 75017 Paris";

export function buildInvoiceNumber(reservationId) {
  const year = new Date().getFullYear();
  const padded = String(reservationId ?? 0).padStart(6, "0");
  return `FACT-${year}-${padded}`;
}

export function buildInvoiceDataFromReservation(reservation, overrides = {}) {
  const price = Number(reservation.price) || 0;
  const luggageFee = reservation.luggage ? 15 : 0;
  const stopFee = reservation.stop && reservation.stop !== "Aucun" ? 10 : 0;

  return {
    companyName: `${COMPANY_INFO.name} ${COMPANY_INFO.driverName}`,
    address: COMPANY_ADDRESS,
    phone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    rcs: COMPANY_INFO.rcs,
    clientName: `${reservation.firstname} ${reservation.lastname}`,
    invoiceNumber: buildInvoiceNumber(reservation.id),
    invoiceDate: new Date().toLocaleDateString("fr-FR"),
    date: formatTransportDate(reservation.date),
    time: formatTransportTime(reservation.time),
    service: `Transport ${reservation.from} → ${reservation.to}`,
    price,
    luggageFee,
    stopFee,
    total: price + luggageFee + stopFee,
    paymentLabel: mapPaymentLabel(reservation.paymentMethod || "immediate"),
    ...overrides,
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildInvoiceHTML(data) {
  const d = data;
  const luggageRow =
    d.luggageFee > 0
      ? `
          <div class="item">
            <span>Supplément bagage</span>
            <span>${d.luggageFee}€</span>
          </div>`
      : "";
  const stopRow =
    d.stopFee > 0
      ? `
          <div class="item">
            <span>Supplément arrêt</span>
            <span>${d.stopFee}€</span>
          </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture - ${escapeHtml(d.clientName)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #f97316; padding-bottom: 16px; }
    .company { font-weight: bold; font-size: 18px; color: #f97316; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .meta-block { flex: 1; min-width: 200px; }
    .client-info, .invoice-info { margin-bottom: 12px; }
    .items { margin: 20px 0; }
    .item { display: flex; justify-content: space-between; margin: 10px 0; padding: 4px 0; border-bottom: 1px solid #eee; }
    .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; margin-top: 8px; }
    .legal { margin-top: 28px; font-size: 12px; color: #444; border-top: 1px solid #ddd; padding-top: 16px; text-align: center; }
    .legal p { margin: 4px 0; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">${escapeHtml(d.companyName)}</div>
    <div>${escapeHtml(d.address)}</div>
    <div>Tél: ${escapeHtml(d.phone)} | Email: ${escapeHtml(d.email)}</div>
  </div>

  <div class="meta">
    <div class="meta-block client-info">
      <strong>Client:</strong> ${escapeHtml(d.clientName)}
    </div>
    <div class="meta-block invoice-info" style="text-align: right;">
      <div><strong>N° de série:</strong> ${escapeHtml(d.invoiceNumber)}</div>
      <div><strong>Date facture:</strong> ${escapeHtml(d.invoiceDate)}</div>
    </div>
  </div>

  <div class="invoice-info">
    <strong>Date du service:</strong> ${escapeHtml(d.date)} à ${escapeHtml(d.time)}
  </div>
  <div class="invoice-info">
    <strong>Paiement:</strong> ${escapeHtml(d.paymentLabel)}
  </div>

  <div class="items">
    <div class="item">
      <span>${escapeHtml(d.service)}</span>
      <span>${d.price}€</span>
    </div>
    ${luggageRow}
    ${stopRow}
  </div>

  <div class="item total">
    <span>TOTAL TTC</span>
    <span>${d.total}€</span>
  </div>
  <p style="font-size: 13px; color: #555; margin-top: 8px;"><em>Dont 10 % de TVA incluse</em></p>

  <div class="legal">
    <p>Ordre de mission (arrêté du 06-01-1993 art3)</p>
    <p>Transport réservé par l'entreprise</p>
    <p><strong>${escapeHtml(d.companyName)}</strong></p>
    <p>RCS ${escapeHtml(d.rcs)}</p>
    <p>${escapeHtml(d.phone)} — ${escapeHtml(d.email)}</p>
  </div>
</body>
</html>`;
}
