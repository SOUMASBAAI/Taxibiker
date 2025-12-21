<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\PasswordResetToken;
use App\Repository\UserRepository;
use App\Repository\PasswordResetTokenRepository;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private UserRepository $userRepository,
        private PasswordResetTokenRepository $passwordResetTokenRepository,
        private EmailService $emailService
    ) {
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, ValidatorInterface $validator): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation des données
        if (!isset($data['firstname'], $data['lastname'], $data['email'], $data['password'], $data['phone'])) {
            return $this->json(['error' => 'Données manquantes'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'email existe déjà
        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['error' => 'Un compte existe déjà avec cet email'], Response::HTTP_CONFLICT);
        }

        // Validation de l'email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
        }

        // Validation du mot de passe (min 12 caractères, majuscule, minuscule, chiffre, caractère spécial)
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/', $data['password'])) {
            return $this->json([
                'error' => 'Mot de passe invalide : min. 12 caractères, majuscule, minuscule, chiffre et caractère spécial.'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validation du téléphone
        if (!preg_match('/^[0-9]{10,15}$/', $data['phone'])) {
            return $this->json(['error' => 'Téléphone invalide (10 à 15 chiffres uniquement)'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = new User();
            $user->setFirstName($data['firstname']);
            $user->setLastName($data['lastname']);
            $user->setEmail($data['email']);
            $user->setPhoneNumber($data['phone']);
            $user->setRoles(['ROLE_USER']);

            // Hasher le mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);

            $this->entityManager->persist($user);
            $this->entityManager->flush();

            // Générer le token JWT
            $token = $this->jwtManager->create($user);

            return $this->json([
                'message' => 'Compte créé avec succès',
                'token' => $token,
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstname' => $user->getFirstName(),
                    'lastname' => $user->getLastName(),
                    'phone' => $user->getPhoneNumber(),
                    'roles' => $user->getRoles()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la création du compte: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return $this->json(['error' => 'Email et mot de passe requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return $this->json(['error' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        // Générer le token JWT
        $token = $this->jwtManager->create($user);

        return $this->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
                'phone' => $user->getPhoneNumber(),
                'roles' => $user->getRoles()
            ]
        ]);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getCurrentUser(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstname' => $user->getFirstName(),
            'lastname' => $user->getLastName(),
            'phone' => $user->getPhoneNumber(),
            'roles' => $user->getRoles()
        ]);
    }

    /**
     * Demande de réinitialisation de mot de passe
     */
    #[Route('/forgot-password', name: 'forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'])) {
            return $this->json(['error' => 'Email requis'], Response::HTTP_BAD_REQUEST);
        }

        // Validation de l'email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

        // Toujours retourner succès pour éviter l'énumération d'emails
        if (!$user) {
            return $this->json([
                'message' => 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
            ]);
        }

        try {
            // Supprimer les anciens tokens de cet utilisateur
            $this->passwordResetTokenRepository->deleteUserTokens($user);

            // Vérifier le nombre de tentatives récentes (protection anti-spam)
            $activeTokensCount = $this->passwordResetTokenRepository->countActiveTokensForUser($user);
            if ($activeTokensCount >= 3) {
                return $this->json([
                    'error' => 'Trop de demandes de réinitialisation. Veuillez patienter avant de réessayer.'
                ], Response::HTTP_TOO_MANY_REQUESTS);
            }

            // Créer un nouveau token
            $resetToken = new PasswordResetToken();
            $resetToken->setUser($user);

            $this->entityManager->persist($resetToken);
            $this->entityManager->flush();

            // Envoyer l'email
            try {
                $emailSent = $this->emailService->sendPasswordResetEmail(
                    $user->getEmail(),
                    $user->getFirstName(),
                    $resetToken->getToken()
                );

                if (!$emailSent) {
                    // Log l'erreur mais continue le processus pour des raisons de sécurité
                    error_log('Failed to send password reset email to: ' . $user->getEmail());
                }
            } catch (\Exception $emailException) {
                // Log l'erreur mais continue le processus pour des raisons de sécurité
                error_log('Exception while sending password reset email: ' . $emailException->getMessage());
            }

            return $this->json([
                'message' => 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation.'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la demande de réinitialisation: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Vérification de la validité d'un token de réinitialisation
     */
    #[Route('/reset-password/verify', name: 'verify_reset_token', methods: ['POST'])]
    public function verifyResetToken(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['token'])) {
            return $this->json(['error' => 'Token requis'], Response::HTTP_BAD_REQUEST);
        }

        $resetToken = $this->passwordResetTokenRepository->findValidToken($data['token']);

        if (!$resetToken) {
            return $this->json([
                'error' => 'Token invalide ou expiré'
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->json([
            'valid' => true,
            'user' => [
                'email' => $resetToken->getUser()->getEmail(),
                'firstname' => $resetToken->getUser()->getFirstName()
            ]
        ]);
    }

    /**
     * Réinitialisation effective du mot de passe
     */
    #[Route('/reset-password', name: 'reset_password', methods: ['POST'])]
    public function resetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['token'], $data['password'])) {
            return $this->json(['error' => 'Token et nouveau mot de passe requis'], Response::HTTP_BAD_REQUEST);
        }

        // Validation du mot de passe (même règles que l'inscription)
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/', $data['password'])) {
            return $this->json([
                'error' => 'Mot de passe invalide : min. 12 caractères, majuscule, minuscule, chiffre et caractère spécial.'
            ], Response::HTTP_BAD_REQUEST);
        }

        $resetToken = $this->passwordResetTokenRepository->findValidToken($data['token']);

        if (!$resetToken) {
            return $this->json([
                'error' => 'Token invalide ou expiré'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = $resetToken->getUser();

            // Hasher le nouveau mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);

            // Marquer le token comme utilisé
            $resetToken->markAsUsed();

            $this->entityManager->flush();

            // Envoyer email de confirmation
            $this->emailService->sendPasswordChangedConfirmation(
                $user->getEmail(),
                $user->getFirstName()
            );

            // Nettoyer les tokens expirés
            $this->passwordResetTokenRepository->cleanupExpiredTokens();

            return $this->json([
                'message' => 'Mot de passe modifié avec succès'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la réinitialisation: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

