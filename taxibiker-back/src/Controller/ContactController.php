<?php

namespace App\Controller;

use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

class ContactController extends AbstractController
{
    #[Route('/api/contact', name: 'api_contact', methods: ['POST'])]
    public function sendContactMessage(
        Request $request,
        ?MailerInterface $mailer = null
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];

        $firstname = trim($data['firstname'] ?? '');
        $lastname = trim($data['lastname'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $messageContent = trim($data['message'] ?? '');

        if (!$firstname || !$lastname || !$email || !$phone || !$messageContent) {
            return $this->json([
                'success' => false,
                'error' => 'Tous les champs sont obligatoires',
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'success' => false,
                'error' => 'Email invalide',
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!$mailer) {
            // Mailer non configuré : ne pas bloquer l'envoi, logguer l'info
            return $this->json([
                'success' => true,
                'message' => 'Simulation envoi (mailer non configuré)',
            ]);
        }

        try {
            $adminEmail = $_ENV['CONTACT_RECEIVER'] ?? 'contact@taxibikerparis.com';

            $emailMessage = (new Email())
                ->from($email)
                ->to($adminEmail)
                ->subject(sprintf('Nouveau message de contact - %s %s', $firstname, $lastname))
                ->text(
                    sprintf(
                        "Nom: %s %s\nEmail: %s\nTéléphone: %s\n\nMessage:\n%s",
                        $firstname,
                        $lastname,
                        $email,
                        $phone,
                        $messageContent
                    )
                );

            $mailer->send($emailMessage);

            return $this->json([
                'success' => true,
                'message' => 'Message envoyé',
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de l\'envoi: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

