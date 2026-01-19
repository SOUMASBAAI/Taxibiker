<?php

namespace App\Service;

use Twilio\Rest\Client;
use Psr\Log\LoggerInterface;

class WhatsAppService
{
    private ?Client $twilioClient;
    private string $twilioWhatsAppNumber;
    private LoggerInterface $logger;
    private bool $isEnabled;
    private bool $useTemplates;
    private array $templateContentSids;

    public function __construct(
        ?string $twilioAccountSid,
        ?string $twilioAuthToken,
        ?string $twilioWhatsAppNumber,
        LoggerInterface $logger,
        ?string $appEnv = 'dev'
    ) {
        // Initialiser le logger en premier
        $this->logger = $logger;
        
        // Nettoyer les valeurs (enlever les guillemets si présents)
        $twilioAccountSid = $twilioAccountSid ? trim($twilioAccountSid, ' "\'') : null;
        $twilioAuthToken = $twilioAuthToken ? trim($twilioAuthToken, ' "\'') : null;
        $twilioWhatsAppNumber = $twilioWhatsAppNumber ? trim($twilioWhatsAppNumber, ' "\'') : null;
        
        // Log pour déboguer (dans error_log PHP ET dans fichier dédié)
        $this->logToFile('=== WhatsAppService Constructor ===');
        $this->logToFile('Account SID: ' . ($twilioAccountSid ? 'PRÉSENT (' . strlen($twilioAccountSid) . ' chars)' : 'VIDE'));
        $this->logToFile('Auth Token: ' . ($twilioAuthToken ? 'PRÉSENT (' . strlen($twilioAuthToken) . ' chars)' : 'VIDE'));
        $this->logToFile('WhatsApp Number: ' . ($twilioWhatsAppNumber ?: 'VIDE'));
        
        // Vérifier si les credentials Twilio sont configurés
        $this->isEnabled = !empty($twilioAccountSid) && !empty($twilioAuthToken) && !empty($twilioWhatsAppNumber);
        
        $this->logToFile('Service enabled: ' . ($this->isEnabled ? 'OUI' : 'NON'));
        
        if ($this->isEnabled) {
            $this->twilioClient = new Client($twilioAccountSid, $twilioAuthToken);
            // Normaliser le numéro WhatsApp : enlever le préfixe "whatsapp:" s'il existe
            $normalizedNumber = $this->normalizeWhatsAppNumber($twilioWhatsAppNumber);
            
            // Vérifier si le numéro est le sandbox Twilio
            $isSandbox = str_contains($normalizedNumber, '+14155238886');
            
            // En mode production, si le numéro n'est pas le sandbox, utiliser les templates
            // Sinon, utiliser les messages libres (sandbox/dev)
            $this->useTemplates = $appEnv === 'prod' && !$isSandbox;
            
            $this->twilioWhatsAppNumber = $normalizedNumber;
            $this->logToFile('Numéro WhatsApp normalisé: ' . $this->twilioWhatsAppNumber);
            $this->logToFile('Is Sandbox: ' . ($isSandbox ? 'OUI' : 'NON'));
            
            if ($isSandbox) {
                $this->logToFile('ATTENTION: Vous utilisez le numéro sandbox Twilio');
                $this->logToFile('Pour la production, vous devez avoir un numéro WhatsApp approuvé');
                $this->logToFile('IMPORTANT: Les destinataires doivent rejoindre le sandbox en envoyant le code JOIN');
            }
            
            $mode = $this->useTemplates ? 'templates (production)' : 'messages libres (sandbox/dev)';
            $this->logger->info("WhatsApp Service activé en mode: $mode", [
                'whatsapp_number' => $this->twilioWhatsAppNumber
            ]);
            
            $this->logToFile("Mode: $mode");
        } else {
            $this->twilioClient = null;
            $this->twilioWhatsAppNumber = '';
            $this->logger->info('WhatsApp Service désactivé : credentials Twilio non configurés');
        }
    }

    /**
     * Envoie un message WhatsApp à un numéro de téléphone
     */
    public function sendMessage(string $to, string $message): bool
    {
        // Log de débogage
        $this->logToFile('=== WhatsAppService::sendMessage ===');
        $this->logToFile('Service enabled: ' . ($this->isEnabled ? 'OUI' : 'NON'));
        $this->logToFile('To: ' . $to);
        $this->logToFile('WhatsApp Number: ' . $this->twilioWhatsAppNumber);
        
        // Si le service WhatsApp n'est pas configuré, on simule un envoi réussi
        if (!$this->isEnabled) {
            $this->logToFile('WhatsApp DÉSACTIVÉ - Message simulé');
            $this->logger->info('WhatsApp désactivé - Message simulé', [
                'to' => $to,
                'message' => substr($message, 0, 100) . '...'
            ]);
            return true;
        }

        try {
            $this->logToFile('Tentative d\'envoi WhatsApp...');
            // Format du numéro : +33XXXXXXXXX
            $formattedNumber = $this->formatPhoneNumber($to);
            $this->logToFile('Numéro formaté: ' . $formattedNumber);
            
            $fromAddress = "whatsapp:$this->twilioWhatsAppNumber";
            $toAddress = "whatsapp:$formattedNumber";
            $this->logToFile('From address: ' . $fromAddress);
            $this->logToFile('To address: ' . $toAddress);
            
            $this->logger->info('Envoi message WhatsApp', [
                'from' => $fromAddress,
                'to' => $toAddress,
                'message_preview' => substr($message, 0, 100) . (strlen($message) > 100 ? '...' : '')
            ]);

            $message = $this->twilioClient->messages->create(
                $toAddress,
                [
                    'from' => $fromAddress,
                    'body' => $message
                ]
            );

            $this->logToFile('Message WhatsApp envoyé avec succès! SID: ' . $message->sid);
            $this->logger->info('Message WhatsApp envoyé avec succès', [
                'sid' => $message->sid,
                'status' => $message->status,
                'from' => $fromAddress,
                'to' => $toAddress
            ]);

            return true;
        } catch (\Twilio\Exceptions\RestException $e) {
            $this->logToFile('=== ERREUR TWILIO ===');
            $this->logToFile('Code: ' . $e->getCode());
            $this->logToFile('Message: ' . $e->getMessage());
            
            $responseContent = null;
            try {
                $response = method_exists($e, 'getResponse') ? $e->getResponse() : null;
                $responseContent = $response && method_exists($response, 'getContent') ? $response->getContent() : null;
            } catch (\Exception $ex) {
                // Ignore errors when trying to get response
            }
            
            $this->logToFile('Response: ' . ($responseContent ?? 'N/A'));
            
            $this->logger->error('Erreur Twilio envoi WhatsApp', [
                'error_code' => $e->getCode(),
                'error_message' => $e->getMessage(),
                'error_status' => method_exists($e, 'getStatusCode') ? $e->getStatusCode() : null,
                'from' => "whatsapp:$this->twilioWhatsAppNumber",
                'to' => $to,
                'twilio_response' => $responseContent
            ]);
            return false;
        } catch (\Exception $e) {
            $this->logToFile('=== ERREUR GÉNÉRALE ===');
            $this->logToFile('Type: ' . get_class($e));
            $this->logToFile('Message: ' . $e->getMessage());
            $this->logToFile('Trace: ' . $e->getTraceAsString());
            
            $this->logger->error('Erreur générale envoi WhatsApp', [
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'from' => "whatsapp:$this->twilioWhatsAppNumber",
                'to' => $to
            ]);
            return false;
        }
    }

    /**
     * Envoie un message template WhatsApp (pour production)
     */
    public function sendTemplateMessage(string $to, string $templateName, array $parameters): bool
    {
        if (!$this->isEnabled) {
            $this->logger->info('WhatsApp désactivé - Template simulé', [
                'to' => $to,
                'template' => $templateName,
                'parameters' => $parameters
            ]);
            return true;
        }

        try {
            $this->logToFile('=== Envoi template WhatsApp ===');
            $formattedNumber = $this->formatPhoneNumber($to);
            $fromAddress = "whatsapp:$this->twilioWhatsAppNumber";
            $toAddress = "whatsapp:$formattedNumber";
            
            $this->logToFile('Template name: ' . $templateName);
            $this->logToFile('Parameters: ' . json_encode($parameters));
            $this->logToFile('From: ' . $fromAddress);
            $this->logToFile('To: ' . $toAddress);
            
            $this->logger->info('Envoi template WhatsApp', [
                'from' => $fromAddress,
                'to' => $toAddress,
                'template' => $templateName,
                'parameters' => $parameters
            ]);

            // Twilio Content API: utiliser le Content SID (commence par HX...)
            // Le templateName doit être le Content SID réel du template dans Twilio
            // Le format doit être: {"1": "value1", "2": "value2"} etc.
            $contentVariables = [];
            foreach ($parameters as $key => $value) {
                $contentVariables[$key] = (string)$value;
            }
            
            $this->logToFile('Content variables: ' . json_encode($contentVariables));
            $this->logToFile('Using Content SID: ' . $templateName);
            
            // Convertir le nom du template en Content SID si nécessaire
            $contentSid = $this->getTemplateContentSid($templateName);
            
            if (!$contentSid) {
                $this->logToFile('ERREUR: Content SID non trouvé pour le template: ' . $templateName);
                $this->logToFile('Vérifiez que le Content SID est configuré dans les variables d\'environnement');
                throw new \Exception("Content SID non configuré pour le template: $templateName");
            }
            
            $this->logToFile('Content SID résolu: ' . $contentSid);
            
            $message = $this->twilioClient->messages->create(
                $toAddress,
                [
                    'from' => $fromAddress,
                    'contentSid' => $contentSid,
                    'contentVariables' => json_encode($contentVariables)
                ]
            );
            
            $this->logToFile('Template envoyé! SID: ' . $message->sid);

            $this->logger->info('Template WhatsApp envoyé avec succès', [
                'sid' => $message->sid,
                'status' => $message->status,
                'from' => $fromAddress,
                'to' => $toAddress,
                'template' => $templateName
            ]);

            return true;
        } catch (\Twilio\Exceptions\RestException $e) {
            $this->logToFile('=== ERREUR TWILIO TEMPLATE ===');
            $this->logToFile('Code: ' . (string)$e->getCode());
            $this->logToFile('Message: ' . $e->getMessage());
            $this->logToFile('Template: ' . $templateName);
            $this->logToFile('From: ' . $fromAddress);
            $this->logToFile('To: ' . $toAddress);
            
            // Obtenir plus de détails de l'erreur
            $responseContent = null;
            $statusCode = null;
            try {
                $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : null;
                $this->logToFile('Status Code: ' . ($statusCode ?? 'N/A'));
                
                if (method_exists($e, 'getResponse') && $e->getResponse()) {
                    $response = $e->getResponse();
                    $responseContent = method_exists($response, 'getContent') ? $response->getContent() : null;
                    $this->logToFile('Response Content: ' . ($responseContent ?? 'N/A'));
                    
                    // Essayer de décoder si c'est du JSON
                    if ($responseContent) {
                        $decoded = json_decode($responseContent, true);
                        if ($decoded) {
                            $this->logToFile('Response JSON: ' . json_encode($decoded, JSON_PRETTY_PRINT));
                        }
                    }
                }
            } catch (\Exception $ex) {
                $this->logToFile('Erreur lors de la récupération de la réponse: ' . $ex->getMessage());
            }
            
            $this->logToFile('=== FIN ERREUR TWILIO TEMPLATE ===');
            
            $this->logger->error('Erreur Twilio envoi template WhatsApp', [
                'error_code' => $e->getCode(),
                'error_message' => $e->getMessage(),
                'error_status' => method_exists($e, 'getStatusCode') ? $e->getStatusCode() : null,
                'from' => "whatsapp:$this->twilioWhatsAppNumber",
                'to' => $to,
                'template' => $templateName,
                'twilio_response' => $responseContent
            ]);
            return false;
        } catch (\Exception $e) {
            $this->logger->error('Erreur générale envoi template WhatsApp', [
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'from' => "whatsapp:$this->twilioWhatsAppNumber",
                'to' => $to,
                'template' => $templateName
            ]);
            return false;
        }
    }

    /**
     * Envoie une notification de nouvelle réservation au client
     */
    public function sendReservationConfirmation(string $phoneNumber, array $reservationData): bool
    {
        if ($this->useTemplates) {
            // Mode production avec templates
            $parameters = [
                '1' => $reservationData['firstname'],
                '2' => $reservationData['date'],
                '3' => $reservationData['time'],
                '4' => $reservationData['from'],
                '5' => $reservationData['to'] ?? $reservationData['from'],
                '6' => (string)$reservationData['price']
            ];
            return $this->sendTemplateMessage($phoneNumber, 'reservation_confirmation', $parameters);
        } else {
            // Mode sandbox/dev avec messages libres
            $message = $this->buildReservationConfirmationMessage($reservationData);
            return $this->sendMessage($phoneNumber, $message);
        }
    }

    /**
     * Envoie une notification de changement de statut au client
     */
    public function sendStatusUpdate(string $phoneNumber, array $reservationData, string $newStatus): bool
    {
        if ($this->useTemplates) {
            // Mode production avec templates
            $templateName = match($newStatus) {
                'Acceptée' => 'reservation_accepted',
                'Refusée' => 'reservation_cancelled',
                default => null
            };
            
            if ($templateName) {
                $parameters = [
                    '1' => $reservationData['firstname'],
                    '2' => $reservationData['date'],
                    '3' => $reservationData['time']
                ];
                
                if ($templateName === 'reservation_accepted') {
                    $parameters['4'] = $reservationData['from'];
                    $parameters['5'] = $reservationData['to'];
                    $parameters['6'] = (string)$reservationData['price'];
                }
                
                return $this->sendTemplateMessage($phoneNumber, $templateName, $parameters);
            }
        }
        
        // Fallback vers message libre pour sandbox/dev ou statuts non mappés
        $message = $this->buildStatusUpdateMessage($reservationData, $newStatus);
        return $this->sendMessage($phoneNumber, $message);
    }

    /**
     * Envoie une notification à l'admin pour une nouvelle demande
     */
    public function sendAdminNotification(string $adminPhoneNumber, array $reservationData): bool
    {
        if ($this->useTemplates) {
            // Mode production avec templates
            $parameters = [
                '1' => $reservationData['firstname'],
                '2' => $reservationData['lastname'],
                '3' => $reservationData['phone'],
                '4' => $reservationData['email'],
                '5' => $reservationData['date'],
                '6' => $reservationData['time'],
                '7' => $reservationData['from'],
                '8' => $reservationData['to'] ?? $reservationData['from'],
                '9' => (string)$reservationData['price']
            ];
            return $this->sendTemplateMessage($adminPhoneNumber, 'admin_new_reservation', $parameters);
        } else {
            // Mode sandbox/dev avec messages libres
            $message = $this->buildAdminNotificationMessage($reservationData);
            return $this->sendMessage($adminPhoneNumber, $message);
        }
    }

    /**
     * Normalise le numéro WhatsApp en enlevant le préfixe "whatsapp:" s'il existe
     */
    private function normalizeWhatsAppNumber(string $number): string
    {
        // Enlever le préfixe "whatsapp:" s'il existe (insensible à la casse)
        $normalized = preg_replace('/^whatsapp:/i', '', trim($number));
        return $normalized;
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

    /**
     * Récupère le Content SID pour un nom de template donné
     * Les Content SIDs doivent être configurés dans les variables d'environnement
     */
    private function getTemplateContentSid(string $templateName): ?string
    {
        // Mapping des noms de templates vers les Content SIDs
        // Ces Content SIDs doivent être configurés dans .env
        $mapping = [
            'reservation_confirmation' => $_ENV['TWILIO_TEMPLATE_RESERVATION_CONFIRMATION'] ?? null,
            'reservation_accepted' => $_ENV['TWILIO_TEMPLATE_RESERVATION_ACCEPTED'] ?? null,
            'reservation_cancelled' => $_ENV['TWILIO_TEMPLATE_RESERVATION_CANCELLED'] ?? null,
            'admin_new_reservation' => $_ENV['TWILIO_TEMPLATE_ADMIN_NEW_RESERVATION'] ?? null,
        ];
        
        // Si le templateName est déjà un Content SID (commence par HX), l'utiliser directement
        if (str_starts_with($templateName, 'HX')) {
            return $templateName;
        }
        
        // Sinon, chercher dans le mapping
        return $mapping[$templateName] ?? null;
    }

    /**
     * Vérifie la configuration Twilio et retourne des informations de diagnostic
     * Utile pour le débogage des problèmes de configuration
     */
    public function getConfigurationStatus(): array
    {
        $status = [
            'enabled' => $this->isEnabled,
            'whatsapp_number' => $this->twilioWhatsAppNumber,
            'from_address' => $this->isEnabled ? "whatsapp:{$this->twilioWhatsAppNumber}" : null,
            'use_templates' => $this->useTemplates,
            'mode' => $this->useTemplates ? 'production (templates)' : 'sandbox/dev (free messages)'
        ];

        if ($this->isEnabled) {
            // Vérifications supplémentaires
            $status['checks'] = [
                'number_format' => $this->isValidPhoneNumber($this->twilioWhatsAppNumber),
                'number_starts_with_plus' => str_starts_with($this->twilioWhatsAppNumber, '+'),
                'is_sandbox_number' => str_contains($this->twilioWhatsAppNumber, '+14155238886')
            ];
        }

        return $status;
    }

    /**
     * Vérifie si un numéro de téléphone est au format valide (E.164)
     */
    private function isValidPhoneNumber(string $number): bool
    {
        // Format E.164: commence par + suivi de 1-15 chiffres
        return preg_match('/^\+[1-9]\d{1,14}$/', $number) === 1;
    }

    /**
     * Écrit dans un fichier de log dédié pour le débogage
     */
    private function logToFile(string $message): void
    {
        // Double logging : error_log PHP et fichier dédié
        error_log($message);
        
        // Écrire aussi dans un fichier dédié dans var/log
        try {
            $logDir = __DIR__ . '/../../var/log';
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }
            
            $logFile = $logDir . '/whatsapp_debug.log';
            $timestamp = date('Y-m-d H:i:s');
            $logEntry = "[$timestamp] $message" . PHP_EOL;
            @file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
        } catch (\Exception $e) {
            // Ignore les erreurs de logging
        }
    }
}
