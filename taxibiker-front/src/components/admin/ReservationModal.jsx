import { useState } from "react";

export default function ReservationModal({
  reservation,
  onClose,
  onUpdate,
  onCancel,
  onStatusChange,
}) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    companyName: "TAXIBIKER Cédric",
    address: "123 Rue de la Taxi, Paris 75001",
    phone: "01 23 45 67 89",
    email: "contact@taxibiker.fr",
    clientName: `${reservation.firstname} ${reservation.lastname}`,
    service: `Transport ${reservation.from} → ${reservation.to}`,
    date: reservation.date,
    time: reservation.time,
    price: reservation.price,
    luggageFee: reservation.luggage ? 15 : 0,
    total: reservation.price + (reservation.luggage ? 15 : 0),
  });

  const handleInvoiceChange = (field, value) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const downloadInvoice = () => {
    // Create a simple HTML invoice that can be printed
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture - ${invoiceData.clientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company { font-weight: bold; font-size: 18px; }
          .client-info, .invoice-info { margin-bottom: 20px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${invoiceData.companyName}</div>
          <div>${invoiceData.address}</div>
          <div>Tél: ${invoiceData.phone} | Email: ${invoiceData.email}</div>
        </div>
        
        <div class="client-info">
          <strong>Client:</strong> ${invoiceData.clientName}
        </div>
        
        <div class="invoice-info">
          <strong>Date du service:</strong> ${invoiceData.date} à ${
      invoiceData.time
    }
        </div>
        
        <div class="items">
          <div class="item">
            <span>${invoiceData.service}</span>
            <span>${invoiceData.price}€</span>
          </div>
          ${
            invoiceData.luggageFee > 0
              ? `
          <div class="item">
            <span>Supplément bagage</span>
            <span>${invoiceData.luggageFee}€</span>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="item total">
          <span>TOTAL</span>
          <span>${invoiceData.total}€</span>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture_${reservation.firstname}_${reservation.lastname}_${reservation.date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendInvoiceToClient = () => {
    // Create a simple HTML invoice that can be sent to client
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture - ${invoiceData.clientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company { font-weight: bold; font-size: 18px; }
          .client-info, .invoice-info { margin-bottom: 20px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 10px 0; }
          .total { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${invoiceData.companyName}</div>
          <div>${invoiceData.address}</div>
          <div>Tél: ${invoiceData.phone} | Email: ${invoiceData.email}</div>
        </div>
        
        <div class="client-info">
          <strong>Client:</strong> ${invoiceData.clientName}
        </div>
        
        <div class="invoice-info">
          <strong>Date du service:</strong> ${invoiceData.date} à ${
      invoiceData.time
    }
        </div>
        
        <div class="items">
          <div class="item">
            <span>${invoiceData.service}</span>
            <span>${invoiceData.price}€</span>
          </div>
          ${
            invoiceData.luggageFee > 0
              ? `
          <div class="item">
            <span>Supplément bagage</span>
            <span>${invoiceData.luggageFee}€</span>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="item total">
          <span>TOTAL</span>
          <span>${invoiceData.total}€</span>
        </div>
      </body>
      </html>
    `;

    // Create mailto link with the invoice as attachment
    const subject = `Facture TAXIBIKER - Service du ${invoiceData.date}`;
    const body = `Bonjour ${reservation.firstname},\n\nVeuillez trouver ci-joint votre facture pour le service de transport du ${invoiceData.date}.\n\nTotal: ${invoiceData.total}€\n\nCordialement,\nTAXIBIKER Cédric`;

    // Create a temporary text file with invoice content for email attachment
    const _invoiceText = `FACTURE TAXIBIKER Cédric
    
Client: ${invoiceData.clientName}
Date du service: ${invoiceData.date} à ${invoiceData.time}

Détails:
- ${invoiceData.service}: ${invoiceData.price}€
${
  invoiceData.luggageFee > 0
    ? `- Supplément bagage: ${invoiceData.luggageFee}€`
    : ""
}

TOTAL: ${invoiceData.total}€

Contact:
${invoiceData.phone}
${invoiceData.email}`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#222] p-6 rounded-2xl w-full max-w-lg text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Détails de la réservation</h2>

        {/* Informations du client */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-orange-400">
            Informations du client
          </h3>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-sm text-gray-400">Nom complet :</span>
              <p className="text-gray-200 mt-1">
                {reservation.firstname} {reservation.lastname}
              </p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-400">Email :</span>
              <p className="text-gray-200 mt-1 break-words">
                {reservation.email || "Non renseigné"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-400">Téléphone :</span>
              <p className="text-gray-200 mt-1">
                {reservation.phone || "Non renseigné"}
              </p>
            </div>
          </div>
        </div>

        {/* Informations de la réservation */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-orange-400">
            Informations de la réservation
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <span className="font-semibold">Date :</span>
              <p className="text-gray-300">{reservation.date}</p>
            </div>
            <div>
              <span className="font-semibold">Heure :</span>
              <p className="text-gray-300">{reservation.time}</p>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <span className="font-semibold">Départ :</span>
          <p className="text-gray-300">{reservation.from}</p>
        </div>

        <div className="mb-3">
          <span className="font-semibold">Arrivée :</span>
          <p className="text-gray-300">{reservation.to}</p>
        </div>

        <div className="mb-3">
          <span className="font-semibold">Bagage supplémentaire :</span>
          <p className="text-gray-300">
            {reservation.luggage ? "Oui (+15€)" : "Non"}
          </p>
        </div>

        <div className="mb-4">
          <span className="font-semibold">Stop :</span>
          <p className="text-gray-300">{reservation.stop || "Aucun"}</p>
        </div>

        <div className="mb-4">
          <span className="font-semibold">Prix :</span>
          <p className="text-gray-300">{reservation.price}€</p>
        </div>

        <div className="mb-4">
          <span className="font-semibold">Statut :</span>
          <p className="text-gray-300">{reservation.status}</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition"
          >
            Fermer
          </button>
          {reservation.status !== "En cours" &&
            reservation.status !== "Terminée" &&
            reservation.status !== "Refusée" &&
            reservation.status !== "Annulée" && (
              <button
                onClick={() => {
                  if (reservation.status === "Acceptée") {
                    onStatusChange(reservation.id, "Annulée", reservation.type);
                  } else {
                    onStatusChange(reservation.id, "Refusée", reservation.type);
                  }
                  onClose();
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition"
              >
                {reservation.status === "Acceptée" ? "Annuler" : "Refuser"}
              </button>
            )}
          {reservation.status === "À confirmer" && (
            <button
              onClick={() => {
                onStatusChange(reservation.id, "Acceptée", reservation.type);
                onClose();
              }}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition"
            >
              Confirmer
            </button>
          )}
          {reservation.status === "Acceptée" && (
            <button
              onClick={() => {
                onStatusChange(reservation.id, "En cours", reservation.type);
                onClose();
              }}
              className="px-4 py-2 rounded bg-blue-600 "
            >
              Démarrer
            </button>
          )}
          {reservation.status === "En cours" && (
            <button
              onClick={() => {
                onStatusChange(reservation.id, "Terminée", reservation.type);
                onClose();
              }}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 transition"
            >
              Terminer
            </button>
          )}
          {reservation.status === "Terminée" && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition"
            >
              Créer une facture
            </button>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-2xl w-full max-w-lg text-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Modifier la facture</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom de l'entreprise
                </label>
                <input
                  type="text"
                  value={invoiceData.companyName}
                  onChange={(e) =>
                    handleInvoiceChange("companyName", e.target.value)
                  }
                  className="w-full p-2 rounded bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={invoiceData.address}
                  onChange={(e) =>
                    handleInvoiceChange("address", e.target.value)
                  }
                  className="w-full p-2 rounded bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={invoiceData.phone}
                    onChange={(e) =>
                      handleInvoiceChange("phone", e.target.value)
                    }
                    className="w-full p-2 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={invoiceData.email}
                    onChange={(e) =>
                      handleInvoiceChange("email", e.target.value)
                    }
                    className="w-full p-2 rounded bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nom du client
                </label>
                <input
                  type="text"
                  value={invoiceData.clientName}
                  onChange={(e) =>
                    handleInvoiceChange("clientName", e.target.value)
                  }
                  className="w-full p-2 rounded bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Service
                </label>
                <input
                  type="text"
                  value={invoiceData.service}
                  onChange={(e) =>
                    handleInvoiceChange("service", e.target.value)
                  }
                  className="w-full p-2 rounded bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Prix transport
                  </label>
                  <input
                    type="number"
                    value={invoiceData.price}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      handleInvoiceChange("price", price);
                      handleInvoiceChange(
                        "total",
                        price + invoiceData.luggageFee
                      );
                    }}
                    className="w-full p-2 rounded bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supplément bagage
                  </label>
                  <input
                    type="number"
                    value={invoiceData.luggageFee}
                    onChange={(e) => {
                      const luggageFee = parseFloat(e.target.value) || 0;
                      handleInvoiceChange("luggageFee", luggageFee);
                      handleInvoiceChange(
                        "total",
                        invoiceData.price + luggageFee
                      );
                    }}
                    className="w-full p-2 rounded bg-white text-black"
                  />
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">TOTAL:</span>
                  <span className="font-bold text-lg">
                    {invoiceData.total}€
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  downloadInvoice();
                  setShowInvoiceModal(false);
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition"
              >
                Télécharger
              </button>
              <button
                onClick={() => {
                  sendInvoiceToClient();
                  setShowInvoiceModal(false);
                }}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition"
              >
                Envoyer au client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
