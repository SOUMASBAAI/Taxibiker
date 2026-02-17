<?php

namespace App\Controller;

use App\Entity\ClassicReservation;
use App\Entity\CreditRegularization;
use App\Entity\FlatRateBooking;
use App\Entity\PasswordResetToken;
use App\Entity\PredefinedReservation;
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

#[Route('/api/admin/clients', name: 'api_admin_clients_')]
class ClientController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function getClients(): JsonResponse
    {
        try {
            // Récupérer tous les clients (utilisateurs avec ROLE_USER uniquement)
            $clients = $this->userRepository->findClients();
            
            $clientsData = [];
            foreach ($clients as $client) {
                $clientsData[] = [
                    'id' => $client->getId(),
                    'firstname' => $client->getFirstName(),
                    'lastname' => $client->getLastName(),
                    'email' => $client->getEmail(),
                    'phone' => $client->getPhoneNumber(),
                    'roles' => $client->getRoles(),
                    'monthly_credit_enabled' => $client->isMonthlyCreditEnabled(),
                    'current_credit' => (float) $client->getCurrentCredit()
                ];
            }

            return $this->json([
                'success' => true,
                'clients' => $clientsData,
                'total' => count($clientsData)
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération des clients: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function createClient(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Validation des données requises
            if (!isset($data['firstname'], $data['lastname'], $data['email'], $data['password'])) {
                return $this->json([
                    'success' => false,
                    'error' => 'Prénom, nom, email et mot de passe sont requis'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si l'email existe déjà
            $existingUser = $this->userRepository->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json([
                    'success' => false,
                    'error' => 'Un utilisateur avec cet email existe déjà'
                ], Response::HTTP_CONFLICT);
            }

            // Créer le nouveau client
            $client = new User();
            $client->setFirstName($data['firstname']);
            $client->setLastName($data['lastname']);
            $client->setEmail($data['email']);
            $client->setRoles(['ROLE_USER']);
            
            if (isset($data['phone']) && !empty($data['phone'])) {
                // Validation basique du numéro de téléphone
                if (!preg_match('/^[0-9\s\-\(\)\+]{10,20}$/', $data['phone'])) {
                    return $this->json([
                        'success' => false,
                        'error' => 'Numéro de téléphone invalide'
                    ], Response::HTTP_BAD_REQUEST);
                }
                $client->setPhoneNumber($data['phone']);
            }

            // Gérer le crédit mensuel (par défaut false si non spécifié)
            if (isset($data['monthly_credit_enabled'])) {
                $client->setMonthlyCreditEnabled((bool) $data['monthly_credit_enabled']);
            }

            // Hasher le mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($client, $data['password']);
            $client->setPassword($hashedPassword);

            // Valider l'entité
            $errors = $this->validator->validate($client);
            if (count($errors) > 0) {
                $errorMessages = [];
                foreach ($errors as $error) {
                    $errorMessages[] = $error->getMessage();
                }
                return $this->json([
                    'success' => false,
                    'error' => 'Données invalides: ' . implode(', ', $errorMessages)
                ], Response::HTTP_BAD_REQUEST);
            }

            // Sauvegarder en base
            $this->entityManager->persist($client);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Client créé avec succès',
                'client' => [
                    'id' => $client->getId(),
                    'firstname' => $client->getFirstName(),
                    'lastname' => $client->getLastName(),
                    'email' => $client->getEmail(),
                    'phone' => $client->getPhoneNumber(),
                    'roles' => $client->getRoles(),
                    'monthly_credit_enabled' => $client->isMonthlyCreditEnabled(),
                    'current_credit' => (float) $client->getCurrentCredit()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la création du client: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteClient(int $id): JsonResponse
    {
        try {
            $client = $this->userRepository->find($id);
            
            if (!$client) {
                return $this->json([
                    'success' => false,
                    'error' => 'Client non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que c'est bien un client (ROLE_USER) et non un admin
            if (!in_array('ROLE_USER', $client->getRoles()) || in_array('ROLE_ADMIN', $client->getRoles())) {
                return $this->json([
                    'success' => false,
                    'error' => 'Impossible de supprimer cet utilisateur'
                ], Response::HTTP_FORBIDDEN);
            }

            // Supprimer toutes les réservations et données associées au client
            $classicReservations = $this->entityManager->getRepository(ClassicReservation::class)->findBy(['client' => $client]);
            foreach ($classicReservations as $reservation) {
                $this->entityManager->remove($reservation);
            }

            $predefinedReservations = $this->entityManager->getRepository(PredefinedReservation::class)->findBy(['client' => $client]);
            foreach ($predefinedReservations as $reservation) {
                $this->entityManager->remove($reservation);
            }

            $flatRateBookings = $this->entityManager->getRepository(FlatRateBooking::class)->findBy(['client' => $client]);
            foreach ($flatRateBookings as $booking) {
                $this->entityManager->remove($booking);
            }

            $creditRegularizations = $this->entityManager->getRepository(CreditRegularization::class)->findBy(['user' => $client]);
            foreach ($creditRegularizations as $regularization) {
                $this->entityManager->remove($regularization);
            }

            $passwordResetTokens = $this->entityManager->getRepository(PasswordResetToken::class)->findBy(['user' => $client]);
            foreach ($passwordResetTokens as $token) {
                $this->entityManager->remove($token);
            }

            // Supprimer le client
            $this->entityManager->remove($client);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Client supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la suppression du client: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function getClient(int $id): JsonResponse
    {
        try {
            $client = $this->userRepository->find($id);
            
            if (!$client) {
                return $this->json([
                    'success' => false,
                    'error' => 'Client non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que c'est bien un client
            if (!in_array('ROLE_USER', $client->getRoles())) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            return $this->json([
                'success' => true,
                'client' => [
                    'id' => $client->getId(),
                    'firstname' => $client->getFirstName(),
                    'lastname' => $client->getLastName(),
                    'email' => $client->getEmail(),
                    'phone' => $client->getPhoneNumber(),
                    'roles' => $client->getRoles(),
                    'monthly_credit_enabled' => $client->isMonthlyCreditEnabled(),
                    'current_credit' => (float) $client->getCurrentCredit()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération du client: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function updateClient(int $id, Request $request): JsonResponse
    {
        try {
            $client = $this->userRepository->find($id);
            
            if (!$client) {
                return $this->json([
                    'success' => false,
                    'error' => 'Client non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que c'est bien un client
            if (!in_array('ROLE_USER', $client->getRoles())) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            $data = json_decode($request->getContent(), true);

            // Mettre à jour les champs fournis
            if (isset($data['firstname'])) {
                $client->setFirstName($data['firstname']);
            }
            if (isset($data['lastname'])) {
                $client->setLastName($data['lastname']);
            }
            if (isset($data['email'])) {
                // Vérifier si l'email est déjà utilisé par un autre utilisateur
                $existingUser = $this->userRepository->findOneBy(['email' => $data['email']]);
                if ($existingUser && $existingUser->getId() !== $client->getId()) {
                    return $this->json([
                        'success' => false,
                        'error' => 'Cet email est déjà utilisé par un autre compte'
                    ], Response::HTTP_CONFLICT);
                }
                $client->setEmail($data['email']);
            }
            if (isset($data['phone'])) {
                if (!empty($data['phone']) && !preg_match('/^[0-9\s\-\(\)\+]{10,20}$/', $data['phone'])) {
                    return $this->json([
                        'success' => false,
                        'error' => 'Numéro de téléphone invalide'
                    ], Response::HTTP_BAD_REQUEST);
                }
                $client->setPhoneNumber($data['phone']);
            }

            // Gérer le crédit mensuel
            if (isset($data['monthly_credit_enabled'])) {
                $client->setMonthlyCreditEnabled((bool) $data['monthly_credit_enabled']);
            }

            // Sauvegarder les modifications
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Client mis à jour avec succès',
                'client' => [
                    'id' => $client->getId(),
                    'firstname' => $client->getFirstName(),
                    'lastname' => $client->getLastName(),
                    'email' => $client->getEmail(),
                    'phone' => $client->getPhoneNumber(),
                    'roles' => $client->getRoles(),
                    'monthly_credit_enabled' => $client->isMonthlyCreditEnabled(),
                    'current_credit' => (float) $client->getCurrentCredit()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la mise à jour du client: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
