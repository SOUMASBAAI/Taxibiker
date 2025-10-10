<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\ClassicReservation;
use App\Entity\FlatRateBooking;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class ReservationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    /**
     * Créer une nouvelle réservation
     */
    #[Route('/reservations', name: 'create_reservation', methods: ['POST'])]
    public function createReservation(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'error' => 'Vous devez être connecté pour réserver'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        // Validation des données
        if (!isset($data['departure'], $data['date'], $data['mode'], $data['totalPrice'])) {
            return $this->json([
                'error' => 'Données manquantes (departure, date, mode, totalPrice requis)'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $date = new \DateTime($data['date']);
            $mode = $data['mode']; // 'classic' ou 'hourly'
            
            if ($mode === 'hourly') {
                // Course à la durée (FlatRateBooking)
                $reservation = new FlatRateBooking();
                $reservation->setClient($user);
                $reservation->setDeparture($data['departure']);
                $reservation->setArrival($data['arrival'] ?? $data['departure']); // Pour mode durée, arrival = departure
                $reservation->setDate($date);
                $reservation->setNumberOfHours($data['hours'] ?? 2);
                $reservation->setExcessBaggage($data['excessBaggage'] ?? false);
                $reservation->setPrice((string) $data['totalPrice']);
                $reservation->setStatut('pending'); // En attente de validation
                
            } else {
                // Course classique (ClassicReservation)
                if (!isset($data['arrival'])) {
                    return $this->json([
                        'error' => 'Adresse d\'arrivée requise pour une course classique'
                    ], Response::HTTP_BAD_REQUEST);
                }
                
                $reservation = new ClassicReservation();
                $reservation->setClient($user);
                $reservation->setDeparture($data['departure']);
                $reservation->setArrival($data['arrival']);
                $reservation->setDate($date);
                $reservation->setExcessBaggage($data['excessBaggage'] ?? false);
                $reservation->setPrice((string) $data['totalPrice']);
                $reservation->setStop($data['stop'] ?? null); // Adresse du stop éventuel
                $reservation->setStatut('pending');
            }

            $this->entityManager->persist($reservation);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Réservation créée avec succès',
                'reservation' => [
                    'id' => $reservation->getId(),
                    'departure' => $reservation->getDeparture(),
                    'arrival' => $reservation->getArrival(),
                    'date' => $date->format('Y-m-d H:i:s'),
                    'price' => $reservation->getPrice(),
                    'status' => $reservation->getStatut(),
                    'type' => $mode
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la création de la réservation: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer toutes les réservations (Admin)
     */
    #[Route('/admin/reservations', name: 'admin_reservations', methods: ['GET'])]
    public function getAllReservations(): JsonResponse
    {
        // TODO: Réactiver la vérification d'authentification admin plus tard
        /** @var User|null $user */
        $user = $this->getUser();

        // Temporairement désactivé pour permettre l'accès sans authentification
        /*
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier si l'utilisateur est admin
        if (!in_array('ROLE_ADMIN', $user->getRoles())) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        */

        // Récupérer toutes les réservations classiques
        $classicReservations = $this->entityManager
            ->getRepository(ClassicReservation::class)
            ->findAll();

        // Récupérer toutes les réservations à la durée
        $flatRateBookings = $this->entityManager
            ->getRepository(FlatRateBooking::class)
            ->findAll();

        $allReservations = [];

        // Formatter les réservations classiques
        foreach ($classicReservations as $res) {
            $allReservations[] = [
                'id' => $res->getId(),
                'type' => 'classic',
                'client' => [
                    'id' => $res->getClient()->getId(),
                    'name' => $res->getClient()->getFirstName() . ' ' . $res->getClient()->getLastName(),
                    'email' => $res->getClient()->getEmail(),
                    'phone' => $res->getClient()->getPhoneNumber()
                ],
                'departure' => $res->getDeparture(),
                'arrival' => $res->getArrival(),
                'stop' => $res->getStop(),
                'date' => $res->getDate()->format('Y-m-d H:i:s'),
                'price' => $res->getPrice(),
                'status' => $res->getStatut(),
                'excessBaggage' => $res->isExcessBaggage()
            ];
        }

        // Formatter les réservations à la durée
        foreach ($flatRateBookings as $res) {
            $allReservations[] = [
                'id' => $res->getId(),
                'type' => 'hourly',
                'client' => [
                    'id' => $res->getClient()->getId(),
                    'name' => $res->getClient()->getFirstName() . ' ' . $res->getClient()->getLastName(),
                    'email' => $res->getClient()->getEmail(),
                    'phone' => $res->getClient()->getPhoneNumber()
                ],
                'departure' => $res->getDeparture(),
                'arrival' => $res->getArrival(),
                'hours' => $res->getNumberOfHours(),
                'date' => $res->getDate()->format('Y-m-d H:i:s'),
                'price' => $res->getPrice(),
                'status' => $res->getStatut(),
                'excessBaggage' => $res->isExcessBaggage()
            ];
        }

        // Trier par date (plus récentes en premier)
        usort($allReservations, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return $this->json([
            'success' => true,
            'reservations' => $allReservations,
            'total' => count($allReservations)
        ]);
    }

    /**
     * Récupérer les réservations de l'utilisateur connecté
     */
    #[Route('/reservations/my', name: 'my_reservations', methods: ['GET'])]
    public function getMyReservations(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer les réservations de l'utilisateur
        $classicReservations = $this->entityManager
            ->getRepository(ClassicReservation::class)
            ->findBy(['client' => $user], ['date' => 'DESC']);

        $flatRateBookings = $this->entityManager
            ->getRepository(FlatRateBooking::class)
            ->findBy(['client' => $user], ['date' => 'DESC']);

        $allReservations = [];

        foreach ($classicReservations as $res) {
            $allReservations[] = [
                'id' => $res->getId(),
                'type' => 'classic',
                'departure' => $res->getDeparture(),
                'arrival' => $res->getArrival(),
                'stop' => $res->getStop(),
                'date' => $res->getDate()->format('Y-m-d H:i:s'),
                'price' => $res->getPrice(),
                'status' => $res->getStatut(),
                'excessBaggage' => $res->isExcessBaggage()
            ];
        }

        foreach ($flatRateBookings as $res) {
            $allReservations[] = [
                'id' => $res->getId(),
                'type' => 'hourly',
                'departure' => $res->getDeparture(),
                'hours' => $res->getNumberOfHours(),
                'date' => $res->getDate()->format('Y-m-d H:i:s'),
                'price' => $res->getPrice(),
                'status' => $res->getStatut(),
                'excessBaggage' => $res->isExcessBaggage()
            ];
        }

        return $this->json([
            'success' => true,
            'reservations' => $allReservations,
            'total' => count($allReservations)
        ]);
    }

    /**
     * Mettre à jour le statut d'une réservation (Admin)
     */
    #[Route('/admin/reservations/{id}/status', name: 'admin_update_status', methods: ['PUT', 'PATCH'])]
    public function updateReservationStatus(Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['status'])) {
            return $this->json(['error' => 'Statut manquant'], Response::HTTP_BAD_REQUEST);
        }

        $newStatus = $data['status'];
        
        // Map French status to backend status
        $statusMap = [
            'À confirmer' => 'pending',
            'En attente' => 'pending',
            'Acceptée' => 'confirmed',
            'En cours' => 'in_progress',
            'Terminée' => 'completed',
            'Annulée' => 'cancelled',
            'Refusée' => 'cancelled'
        ];

        $backendStatus = $statusMap[$newStatus] ?? $newStatus;

        // Chercher dans les réservations classiques
        $reservation = $this->entityManager
            ->getRepository(ClassicReservation::class)
            ->find($id);

        if (!$reservation) {
            // Chercher dans les réservations à la durée
            $reservation = $this->entityManager
                ->getRepository(FlatRateBooking::class)
                ->find($id);
        }

        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        try {
            $reservation->setStatut($backendStatus);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'reservation' => [
                    'id' => $reservation->getId(),
                    'status' => $backendStatus
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mettre à jour une réservation complète (Admin)
     */
    #[Route('/admin/reservations/{id}', name: 'admin_update_reservation', methods: ['PUT', 'PATCH'])]
    public function updateReservation(Request $request, int $id): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Chercher la réservation
        $reservation = $this->entityManager
            ->getRepository(ClassicReservation::class)
            ->find($id);

        $isClassic = true;
        if (!$reservation) {
            $reservation = $this->entityManager
                ->getRepository(FlatRateBooking::class)
                ->find($id);
            $isClassic = false;
        }

        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        try {
            // Mettre à jour les champs modifiables
            if (isset($data['date'])) {
                $date = new \DateTime($data['date']);
                $reservation->setDate($date);
            }

            if (isset($data['excessBaggage'])) {
                $reservation->setExcessBaggage((bool) $data['excessBaggage']);
            }

            if (isset($data['price'])) {
                $reservation->setPrice((string) $data['price']);
            }

            if (isset($data['status'])) {
                $statusMap = [
                    'À confirmer' => 'pending',
                    'En attente' => 'pending',
                    'Acceptée' => 'confirmed',
                    'En cours' => 'in_progress',
                    'Terminée' => 'completed',
                    'Annulée' => 'cancelled',
                    'Refusée' => 'cancelled'
                ];
                $backendStatus = $statusMap[$data['status']] ?? $data['status'];
                $reservation->setStatut($backendStatus);
            }

            if ($isClassic && isset($data['stop'])) {
                $reservation->setStop($data['stop']);
            }

            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Réservation mise à jour avec succès'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Annuler une réservation (Utilisateur)
     * Uniquement pour les réservations en attente
     */
    #[Route('/reservations/{id}/cancel', name: 'user_cancel_reservation', methods: ['POST'])]
    public function cancelReservation(int $id): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Chercher la réservation
        $reservation = $this->entityManager
            ->getRepository(ClassicReservation::class)
            ->find($id);

        if (!$reservation) {
            $reservation = $this->entityManager
                ->getRepository(FlatRateBooking::class)
                ->find($id);
        }

        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que la réservation appartient à l'utilisateur
        if ($reservation->getClient()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Cette réservation ne vous appartient pas'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que la réservation est en attente
        if ($reservation->getStatut() !== 'pending') {
            return $this->json([
                'error' => 'Vous ne pouvez annuler que les réservations en attente de validation'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $reservation->setStatut('cancelled');
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Réservation annulée avec succès',
                'reservation' => [
                    'id' => $reservation->getId(),
                    'status' => 'cancelled'
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de l\'annulation: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Modifier une réservation (Utilisateur)
     * Uniquement date, heure et baggage pour les réservations en attente
     */
    #[Route('/reservations/{id}/update', name: 'user_update_reservation', methods: ['PATCH'])]
    public function updateMyReservation(Request $request, int $id): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        // Chercher la réservation
        $reservation = $this->entityManager
            ->getRepository(ClassicReservation::class)
            ->find($id);

        $isClassic = true;
        if (!$reservation) {
            $reservation = $this->entityManager
                ->getRepository(FlatRateBooking::class)
                ->find($id);
            $isClassic = false;
        }

        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que la réservation appartient à l'utilisateur
        if ($reservation->getClient()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Cette réservation ne vous appartient pas'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que la réservation est en attente
        if ($reservation->getStatut() !== 'pending') {
            return $this->json([
                'error' => 'Vous ne pouvez modifier que les réservations en attente de validation'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Mettre à jour uniquement les champs autorisés
            if (isset($data['date'])) {
                $date = new \DateTime($data['date']);
                $reservation->setDate($date);
            }

            if (isset($data['excessBaggage'])) {
                $reservation->setExcessBaggage((bool) $data['excessBaggage']);
            }

            // Le stop peut être modifié pour les réservations classiques
            if ($isClassic && isset($data['stop'])) {
                $reservation->setStop($data['stop']);
            }

            $this->entityManager->flush();

            // Retourner la réservation mise à jour
            $response = [
                'id' => $reservation->getId(),
                'type' => $isClassic ? 'classic' : 'hourly',
                'departure' => $reservation->getDeparture(),
                'arrival' => $reservation->getArrival(),
                'date' => $reservation->getDate()->format('Y-m-d H:i:s'),
                'price' => $reservation->getPrice(),
                'status' => $reservation->getStatut(),
                'excessBaggage' => $reservation->isExcessBaggage()
            ];

            if ($isClassic) {
                $response['stop'] = $reservation->getStop();
            } else {
                $response['hours'] = $reservation->getNumberOfHours();
            }

            return $this->json([
                'success' => true,
                'message' => 'Réservation modifiée avec succès',
                'reservation' => $response
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la modification: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

