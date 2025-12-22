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
        EmailService $emailService
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

        $sent = $emailService->sendContactEmail(
            $email,
            sprintf('%s %s', $firstname, $lastname),
            $phone,
            $messageContent
        );

        if (!$sent) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de l\'envoi du message',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json([
            'success' => true,
            'message' => 'Message envoyé',
        ]);
    }
}

