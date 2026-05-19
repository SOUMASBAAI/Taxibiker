<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;
use Twig\Environment;

class EmailService
{
    private bool $isEnabled;
    private LoggerInterface $logger;

    public function __construct(
        private ?MailerInterface $mailer,
        private Environment $twig,
        LoggerInterface $logger,
        private string $fromEmail = 'contact@taxibikerparis.com',
        private string $fromName = 'Taxi Biker Paris'
    ) {
        $this->logger = $logger;
        $this->isEnabled = $mailer !== null;
        
        if (!$this->isEnabled) {
            $this->logger->info('Service Email désactivé : Mailer non configuré');
        } else {
            $this->logger->info('Service Email activé avec succès', [
                'from_email' => $this->fromEmail,
                'from_name' => $this->fromName
            ]);
        }
    }

    // ===================================================================
    // NOTIFICATIONS RÉSERVATION (remplace WhatsApp)
    // ===================================================================

    /**
     * Envoie un email de confirmation de réservation au client
     */
    public function sendReservationConfirmation(string $toEmail, array $reservationData): bool
    {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation confirmation réservation', [
                'to' => $toEmail,
                'data' => $reservationData
            ]);
            return true;
        }

        try {
            $htmlContent = $this->twig->render('emails/reservation_confirmation.html.twig', $reservationData);

            $email = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($toEmail)
                ->subject('Taxi Biker Paris - Confirmation de votre réservation')
                ->html($htmlContent);

            $this->mailer->send($email);

            $this->logger->info('Email confirmation réservation envoyé', [
                'to' => $toEmail,
                'date' => $reservationData['date'] ?? '',
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email confirmation réservation', [
                'error' => $e->getMessage(),
                'to' => $toEmail,
            ]);
            return false;
        }
    }

    /**
     * Envoie un email de changement de statut au client
     */
    public function sendStatusUpdate(string $toEmail, array $reservationData, string $newStatus): bool
    {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation mise à jour statut', [
                'to' => $toEmail,
                'status' => $newStatus,
            ]);
            return true;
        }

        try {
            if ($newStatus === 'Acceptée') {
                $subject = 'Confirmation de transport - Taxi Biker Paris';
                $htmlContent = $this->twig->render('emails/transport_confirmation.html.twig', $reservationData);
            } else {
                $subjectMap = [
                    'Refusée'   => 'Votre réservation a été annulée',
                    'En cours'  => 'Votre course est en cours',
                    'Terminée'  => 'Votre course est terminée',
                ];
                $subject = 'Taxi Biker Paris - ' . ($subjectMap[$newStatus] ?? "Mise à jour de votre réservation");
                $htmlContent = $this->twig->render('emails/reservation_status_update.html.twig', [
                    ...$reservationData,
                    'status' => $newStatus,
                ]);
            }

            $email = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($toEmail)
                ->subject($subject)
                ->html($htmlContent);

            $this->mailer->send($email);

            $this->logger->info('Email mise à jour statut envoyé', [
                'to' => $toEmail,
                'status' => $newStatus,
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email mise à jour statut', [
                'error' => $e->getMessage(),
                'to' => $toEmail,
            ]);
            return false;
        }
    }

    /**
     * Envoie une notification à l'admin pour une nouvelle réservation
     */
    public function sendAdminNotification(string $adminEmail, array $reservationData): bool
    {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation notification admin', [
                'to' => $adminEmail,
                'data' => $reservationData,
            ]);
            return true;
        }

        try {
            $htmlContent = $this->twig->render('emails/admin_new_reservation.html.twig', $reservationData);

            $email = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($adminEmail)
                ->subject('Taxi Biker Paris - Nouvelle demande de course de ' . ($reservationData['firstname'] ?? '') . ' ' . ($reservationData['lastname'] ?? ''))
                ->html($htmlContent);

            $this->mailer->send($email);

            $this->logger->info('Email notification admin envoyé', [
                'to' => $adminEmail,
                'client' => ($reservationData['firstname'] ?? '') . ' ' . ($reservationData['lastname'] ?? ''),
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email notification admin', [
                'error' => $e->getMessage(),
                'to' => $adminEmail,
            ]);
            return false;
        }
    }

    // ===================================================================
    // EMAILS EXISTANTS (mot de passe, contact)
    // ===================================================================

    /**
     * Envoie un email de réinitialisation de mot de passe
     */
    public function sendPasswordResetEmail(string $to, string $firstName, string $resetToken): bool
    {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation envoi reset password', [
                'to' => $to,
                'token' => substr($resetToken, 0, 10) . '...'
            ]);
            return true;
        }

        try {
            $resetUrl = $this->generateResetUrl($resetToken);
            
            $htmlContent = $this->twig->render('emails/password_reset.html.twig', [
                'firstName' => $firstName,
                'resetUrl' => $resetUrl,
                'resetToken' => $resetToken
            ]);

            $email = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($to)
                ->subject('Taxi Biker Paris - Réinitialisation de votre mot de passe')
                ->html($htmlContent);

            $this->mailer->send($email);

            $this->logger->info('Email de reset password envoyé avec succès', [
                'to' => $to,
                'token' => substr($resetToken, 0, 10) . '...'
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email reset password', [
                'error' => $e->getMessage(),
                'to' => $to
            ]);
            return false;
        }
    }

    /**
     * Envoie les identifiants de connexion à un nouveau client créé par l'admin
     */
    public function sendClientAccountCredentials(
        string $to,
        string $firstName,
        string $email,
        string $plainPassword
    ): bool {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation envoi identifiants client', [
                'to' => $to,
                'email' => $email,
            ]);
            return true;
        }

        try {
            $htmlContent = $this->twig->render('emails/client_account_created.html.twig', [
                'firstName' => $firstName,
                'email' => $email,
                'password' => $plainPassword,
                'loginUrl' => $this->getFrontendBaseUrl() . '/user/login',
            ]);

            $message = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($to)
                ->subject('Taxi Biker Paris - Vos identifiants de connexion')
                ->html($htmlContent);

            $this->mailer->send($message);

            $this->logger->info('Email identifiants client envoyé', ['to' => $to]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email identifiants client', [
                'error' => $e->getMessage(),
                'to' => $to,
            ]);
            return false;
        }
    }

    /**
     * Génère l'URL de réinitialisation
     */
    private function generateResetUrl(string $token): string
    {
        return $this->getFrontendBaseUrl() . '/reset-password?token=' . $token;
    }

    private function getFrontendBaseUrl(): string
    {
        if (($_ENV['APP_ENV'] ?? 'dev') === 'prod') {
            return 'https://taxibikerparis.com';
        }

        return $_ENV['FRONTEND_URL'] ?? $this->detectFrontendUrl();
    }

    /**
     * Détecte l'URL du frontend en développement
     */
    private function detectFrontendUrl(): string
    {
        $portsToTry = [3000, 3001, 3002];
        
        foreach ($portsToTry as $port) {
            if ($this->isPortAccessible($port)) {
                $this->logger->info("Frontend Vite détecté sur le port $port");
                return "http://localhost:$port";
            }
        }
        
        $this->logger->warning("Aucun frontend détecté, utilisation du port par défaut 3000");
        return 'http://localhost:3000';
    }
    
    /**
     * Vérifie si un port est accessible
     */
    private function isPortAccessible(int $port): bool
    {
        $connection = @fsockopen('localhost', $port, $errno, $errstr, 1);
        if ($connection) {
            fclose($connection);
            return true;
        }
        return false;
    }

    /**
     * Envoie un email de confirmation de changement de mot de passe
     */
    public function sendPasswordChangedConfirmation(string $to, string $firstName): bool
    {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation confirmation changement password', [
                'to' => $to
            ]);
            return true;
        }

        try {
            $htmlContent = $this->twig->render('emails/password_changed.html.twig', [
                'firstName' => $firstName
            ]);

            $email = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($to)
                ->subject('Taxi Biker Paris - Mot de passe modifié')
                ->html($htmlContent);

            $this->mailer->send($email);

            $this->logger->info('Email de confirmation changement password envoyé', [
                'to' => $to
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email confirmation password', [
                'error' => $e->getMessage(),
                'to' => $to
            ]);
            return false;
        }
    }

    /**
     * Envoie un email depuis le formulaire de contact
     */
    public function sendContactEmail(
        string $fromEmail,
        string $fromName,
        string $phone,
        string $messageContent
    ): bool {
        if (!$this->isEnabled) {
            $this->logger->info('Email désactivé - Simulation envoi contact', [
                'from' => $fromEmail,
                'name' => $fromName,
                'phone' => $phone,
                'message' => mb_substr($messageContent, 0, 120) . '...',
            ]);
            return true;
        }

        try {
            $receiver = $_ENV['CONTACT_RECEIVER'] ?? $this->fromEmail;

            $htmlBody = sprintf(
                '<p><strong>Message de contact</strong></p>
                 <p><strong>Nom:</strong> %s</p>
                 <p><strong>Email:</strong> %s</p>
                 <p><strong>Téléphone:</strong> %s</p>
                 <p><strong>Message:</strong><br>%s</p>',
                htmlspecialchars($fromName, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                htmlspecialchars($fromEmail, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                htmlspecialchars($phone, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                nl2br(htmlspecialchars($messageContent, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'))
            );

            $email = (new Email())
                ->from(new Address($this->fromEmail, $this->fromName))
                ->to($receiver)
                ->replyTo($fromEmail)
                ->subject(sprintf('Taxi Biker Paris - Contact de %s', $fromName))
                ->html($htmlBody);

            $this->mailer->send($email);

            $this->logger->info('Email de contact envoyé', [
                'to' => $receiver,
                'reply_to' => $fromEmail,
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email de contact', [
                'error' => $e->getMessage(),
                'from' => $fromEmail,
            ]);
            return false;
        }
    }
}
