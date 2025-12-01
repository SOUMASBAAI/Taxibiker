<?php

namespace App\Service;

use Twilio\Rest\Client;
use Psr\Log\LoggerInterface;

class WhatsAppService
{
    private Client $twilioClient;
    private string $twilioWhatsAppNumber;
    private LoggerInterface $logger;

    public function __construct(
        string $twilioAccountSid,
        string $twilioAuthToken,
        string $twilioWhatsAppNumber,
        LoggerInterface $logger
    ) {
        $this->twilioClient = new Client($twilioAccountSid, $twilioAuthToken);
        $this->twilioWhatsAppNumber = $twilioWhatsAppNumber;
        $this->logger = $logger;
    }

    /**
     * Envoie un message WhatsApp à un numéro de téléphone
     */
    public function sendMessage(string $to, string $message): bool
    {
        try {
            // Format du numéro : +33XXXXXXXXX
            $formattedNumber = $this->formatPhoneNumber($to);
            
            $this->logger->info('Envoi message WhatsApp', [
                'to' => $formattedNumber,
                'message' => $message
            ]);

            $message = $this->twilioClient->messages->create(
                "whatsapp:$formattedNumber", // To
                [
                    'from' => "whatsapp:$this->twilioWhatsAppNumber",
                    'body' => $message
                ]
            );

            $this->logger->info('Message WhatsApp envoyé avec succès', [
                'sid' => $message->sid,
                'to' => $formattedNumber
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi WhatsApp', [
                'error' => $e->getMessage(),
                'to' => $to
            ]);
            return false;
        }
    }

    /**
     * Envoie une notification de nouvelle réservation au client
     */
    public function sendReservationConfirmation(string $phoneNumber, array $reservationData): bool
    {
        $message = $this->buildReservationConfirmationMessage($reservationData);
        return $this->sendMessage($phoneNumber, $message);
    }

    /**
     * Envoie une notification de changement de statut au client
     */
    public function sendStatusUpdate(string $phoneNumber, array $reservationData, string $newStatus): bool
    {
        $message = $this->buildStatusUpdateMessage($reservationData, $newStatus);
        return $this->sendMessage($phoneNumber, $message);
    }

    /**
     * Envoie une notification à l'admin pour une nouvelle demande
     */
    public function sendAdminNotification(string $adminPhoneNumber, array $reservationData): bool
    {
        $message = $this->buildAdminNotificationMessage($reservationData);
        return $this->sendMessage($adminPhoneNumber, $message);
    }

    /**
     * Formate le numéro de téléphone au format international
     */
    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Supprime tous les espaces et caractères spéciaux
        $cleaned = preg_replace('/[^0-9+]/', '', $phoneNumber);
        
        // Si le numéro commence par 0, on le remplace par +33
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '+33' . substr($cleaned, 1);
        }
        
        // Si le numéro ne commence pas par +, on ajoute +33
        if (!str_starts_with($cleaned, '+')) {
            $cleaned = '+33' . $cleaned;
        }
        
        return $cleaned;
    }

    /**
     * Construit le message de confirmation de réservation
     */
    private function buildReservationConfirmationMessage(array $data): string
    {
        $date = $data['date'] ?? '';
        $time = $data['time'] ?? '';
        $from = $data['from'] ?? '';
        $to = $data['to'] ?? '';
        $price = $data['price'] ?? '';
        $type = $data['type'] ?? 'classic';

        $message = "🚕 *TAXIBIKER - Confirmation de réservation*\n\n";
        $message .= "Bonjour {$data['firstname']},\n\n";
        $message .= "Votre demande de course a été reçue :\n\n";
        $message .= "📅 *Date :* $date\n";
        $message .= "🕒 *Heure :* $time\n";
        
        if ($type === 'time') {
            $message .= "📍 *Départ :* $from\n";
            $message .= "⏱️ *Durée :* {$data['duration']}h\n";
        } else {
            $message .= "📍 *Départ :* $from\n";
            $message .= "🏁 *Arrivée :* $to\n";
            
            if (!empty($data['stop'])) {
                $message .= "🛑 *Arrêt :* {$data['stop']}\n";
            }
        }
        
        if (!empty($data['luggage']) && $data['luggage']) {
            $message .= "🧳 *Bagage volumineux :* Oui\n";
        }
        
        $message .= "💰 *Prix :* {$price}€\n\n";
        $message .= "Votre réservation est *en attente de confirmation*.\n";
        $message .= "Vous recevrez une notification dès qu'elle sera validée.\n\n";
        $message .= "Merci de votre confiance ! 🙏";

        return $message;
    }

    /**
     * Construit le message de mise à jour de statut
     */
    private function buildStatusUpdateMessage(array $data, string $status): string
    {
        $message = "🚕 *TAXIBIKER - Mise à jour*\n\n";
        $message .= "Bonjour {$data['firstname']},\n\n";
        
        switch ($status) {
            case 'Acceptée':
                $message .= "✅ *Bonne nouvelle !*\n";
                $message .= "Votre réservation du {$data['date']} à {$data['time']} a été *confirmée* !\n\n";
                $message .= "📍 {$data['from']} → {$data['to']}\n";
                $message .= "💰 Prix : {$data['price']}€\n\n";
                $message .= "Nous serons là à l'heure ! 🚕";
                break;
                
            case 'Refusée':
                $message .= "❌ *Réservation annulée*\n";
                $message .= "Nous sommes désolés, votre réservation du {$data['date']} à {$data['time']} n'a pas pu être confirmée.\n\n";
                $message .= "N'hésitez pas à faire une nouvelle demande pour d'autres créneaux. 🙏";
                break;
                
            case 'En cours':
                $message .= "🚗 *Course en cours*\n";
                $message .= "Votre chauffeur est en route !\n";
                $message .= "Merci de vous tenir prêt(e). 👍";
                break;
                
            case 'Terminée':
                $message .= "🏁 *Course terminée*\n";
                $message .= "Merci d'avoir choisi TAXIBIKER !\n";
                $message .= "N'hésitez pas à nous faire part de vos commentaires. ⭐";
                break;
        }

        return $message;
    }

    /**
     * Construit le message de notification admin
     */
    private function buildAdminNotificationMessage(array $data): string
    {
        $message = "🔔 *NOUVELLE DEMANDE DE COURSE*\n\n";
        $message .= "👤 *Client :* {$data['firstname']} {$data['lastname']}\n";
        $message .= "📞 *Téléphone :* {$data['phone']}\n";
        $message .= "📧 *Email :* {$data['email']}\n\n";
        $message .= "📅 *Date :* {$data['date']}\n";
        $message .= "🕒 *Heure :* {$data['time']}\n";
        
        if ($data['type'] === 'time') {
            $message .= "📍 *Départ :* {$data['from']}\n";
            $message .= "⏱️ *Durée :* {$data['duration']}h\n";
        } else {
            $message .= "📍 *Départ :* {$data['from']}\n";
            $message .= "🏁 *Arrivée :* {$data['to']}\n";
            
            if (!empty($data['stop'])) {
                $message .= "🛑 *Arrêt :* {$data['stop']}\n";
            }
        }
        
        if (!empty($data['luggage']) && $data['luggage']) {
            $message .= "🧳 *Bagage volumineux :* Oui\n";
        }
        
        $message .= "💰 *Prix :* {$data['price']}€\n";
        
        if (!empty($data['paymentMethod'])) {
            $paymentText = $data['paymentMethod'] === 'credit' ? 'Crédit mensuel' : 'Paiement immédiat';
            $message .= "💳 *Paiement :* $paymentText\n";
        }
        
        $message .= "\n⚡ *Action requise dans le dashboard admin*";

        return $message;
    }
}
