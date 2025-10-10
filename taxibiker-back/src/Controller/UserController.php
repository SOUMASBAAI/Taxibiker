<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/user', name: 'api_user_')]
class UserController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private UserRepository $userRepository
    ) {
    }

    #[Route('/update', name: 'update', methods: ['PATCH'])]
    public function updateUserInfo(Request $request, ValidatorInterface $validator): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Mise à jour des informations de base
            if (isset($data['firstname'])) {
                if (empty(trim($data['firstname']))) {
                    return $this->json(['error' => 'Le prénom ne peut pas être vide'], Response::HTTP_BAD_REQUEST);
                }
                $user->setFirstName(trim($data['firstname']));
            }

            if (isset($data['lastname'])) {
                if (empty(trim($data['lastname']))) {
                    return $this->json(['error' => 'Le nom ne peut pas être vide'], Response::HTTP_BAD_REQUEST);
                }
                $user->setLastName(trim($data['lastname']));
            }

            if (isset($data['email'])) {
                $email = trim($data['email']);
                
                // Validation de l'email
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return $this->json(['error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
                }

                // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
                $existingUser = $this->userRepository->findOneBy(['email' => $email]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
                }

                $user->setEmail($email);
            }

            if (isset($data['phone'])) {
                $phone = trim($data['phone']);
                
                // Validation du téléphone (optionnel, peut être vide)
                if (!empty($phone) && !preg_match('/^[0-9+\-\s()]{10,20}$/', $phone)) {
                    return $this->json(['error' => 'Format de téléphone invalide'], Response::HTTP_BAD_REQUEST);
                }
                
                $user->setPhoneNumber($phone);
            }

            // Validation avec Symfony Validator
            $errors = $validator->validate($user);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->json(['error' => implode(', ', $errorMessages)], Response::HTTP_BAD_REQUEST);
            }

            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Informations mises à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'email' => $user->getEmail(),
                    'firstname' => $user->getFirstName(),
                    'lastname' => $user->getLastName(),
                    'phone' => $user->getPhoneNumber(),
                    'roles' => $user->getRoles()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/change-password', name: 'change_password', methods: ['PATCH'])]
    public function changePassword(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['currentPassword'], $data['newPassword'])) {
            return $this->json(['error' => 'Mot de passe actuel et nouveau mot de passe requis'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier le mot de passe actuel
        if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return $this->json(['error' => 'Mot de passe actuel incorrect'], Response::HTTP_BAD_REQUEST);
        }

        // Validation du nouveau mot de passe
        $newPassword = $data['newPassword'];
        if (strlen($newPassword) < 6) {
            return $this->json(['error' => 'Le nouveau mot de passe doit contenir au moins 6 caractères'], Response::HTTP_BAD_REQUEST);
        }

        // Optionnel: validation plus stricte du mot de passe
        // if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $newPassword)) {
        //     return $this->json([
        //         'error' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
        //     ], Response::HTTP_BAD_REQUEST);
        // }

        try {
            // Hasher le nouveau mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
            $user->setPassword($hashedPassword);

            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Mot de passe modifié avec succès'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors du changement de mot de passe: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function getUserProfile(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'success' => true,
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
}
