<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\ClassicReservation;
use App\Entity\FlatRateBooking;
use App\Repository\CreditRegularizationRepository;
use App\Service\WhatsAppService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[Route('/api', name: 'api_')]
class ReservationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private CreditRegularizationRepository $creditRegularizationRepository,
        private WhatsAppService $whatsAppService,
        private ParameterBagInterface $parameterBag
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

            // Gestion du mode de paiement
            $paymentMethod = $data['paymentMethod'] ?? 'immediate';
            
            // Valider le mode de paiement
            if ($paymentMethod === 'credit' && !$user->isMonthlyCreditEnabled()) {
                return $this->json([
                    'error' => 'Le paiement à crédit n\'est pas activé pour votre compte'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Définir le mode de paiement sur la réservation
            $reservation->setPaymentMethod($paymentMethod);
            
            // Si paiement à crédit, ajouter au crédit de l'utilisateur
            if ($paymentMethod === 'credit') {
                $user->addToCredit($reservation->getPrice());
            }

            $this->entityManager->flush();

            // Envoi des notifications WhatsApp
            $this->sendWhatsAppNotifications($reservation, $user, $data);

            $responseMessage = $paymentMethod === 'credit'
                ? 'Réservation créée avec succès. Le montant a été ajouté à votre crédit mensuel.'
                : 'Réservation créée avec succès. Paiement sur place requis.';

            return $this->json([
                'success' => true,
                'message' => $responseMessage,
                'reservation' => [
                    'id' => $reservation->getId(),
                    'departure' => $reservation->getDeparture(),
                    'arrival' => $reservation->getArrival(),
                    'date' => $date->format('Y-m-d H:i:s'),
                    'price' => $reservation->getPrice(),
                    'status' => $reservation->getStatut(),
                    'type' => $mode,
                    'payment_method' => $paymentMethod
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
                'excessBaggage' => $res->isExcessBaggage(),
                'paymentMethod' => $res->getPaymentMethod()
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
                'excessBaggage' => $res->isExcessBaggage(),
                'paymentMethod' => $res->getPaymentMethod()
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
                'excessBaggage' => $res->isExcessBaggage(),
                'paymentMethod' => $res->getPaymentMethod(),
                'isRegularized' => $this->isReservationRegularized($user, $res->getDate(), $res->getPaymentMethod())
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
                'excessBaggage' => $res->isExcessBaggage(),
                'paymentMethod' => $res->getPaymentMethod(),
                'isRegularized' => $this->isReservationRegularized($user, $res->getDate(), $res->getPaymentMethod())
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
        $requestedType = $data['type'] ?? null;
        
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

        // Choisir le bon repository en fonction du type fourni pour éviter les collisions d'ID
        $reservation = null;

        if ($requestedType === 'hourly') {
            $reservation = $this->entityManager
                ->getRepository(FlatRateBooking::class)
                ->find($id);

            if (!$reservation) {
                // Fallback: tenter dans les réservations classiques si rien trouvé
                $reservation = $this->entityManager
                    ->getRepository(ClassicReservation::class)
                    ->find($id);
            }
        } elseif ($requestedType === 'classic') {
            $reservation = $this->entityManager
                ->getRepository(ClassicReservation::class)
                ->find($id);

            if (!$reservation) {
                $reservation = $this->entityManager
                    ->getRepository(FlatRateBooking::class)
                    ->find($id);
            }
        } else {
            // Pas de type fourni : on tente les deux (comportement existant)
            $reservation = $this->entityManager
                ->getRepository(ClassicReservation::class)
                ->find($id);

            if (!$reservation) {
                $reservation = $this->entityManager
                    ->getRepository(FlatRateBooking::class)
                    ->find($id);
            }
        }

        if (!$reservation) {
            return $this->json(['error' => 'Réservation non trouvée'], Response::HTTP_NOT_FOUND);
        }

        try {
            $oldStatus = $reservation->getStatut();
            $reservation->setStatut($backendStatus);
            $this->entityManager->flush();

            // Envoyer notification WhatsApp si le statut a changé
            if ($oldStatus !== $backendStatus) {
                $this->sendStatusUpdateNotification($reservation, $backendStatus);
            }

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
            
            // Si l'utilisateur a le crédit activé, soustraire le montant de son crédit
            if ($user->isMonthlyCreditEnabled()) {
                $currentCredit = $user->getCurrentCredit();
                $reservationPrice = $reservation->getPrice();
                $newCredit = bcsub($currentCredit, $reservationPrice, 2);
                
                // S'assurer que le crédit ne devient pas négatif
                if (bccomp($newCredit, '0.00', 2) >= 0) {
                    $user->setCurrentCredit($newCredit);
                }
            }
            
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

    /**
     * Vérifie si une réservation est régularisée
     */
    private function isReservationRegularized(User $user, \DateTime $reservationDate, string $paymentMethod = 'immediate'): bool
    {
        // Si le paiement n'est pas à crédit, la facture est toujours disponible
        if ($paymentMethod !== 'credit') {
            return true;
        }
        
        // Si l'utilisateur n'a pas le crédit mensuel activé, toutes les réservations sont considérées comme régularisées
        if (!$user->isMonthlyCreditEnabled()) {
            return true;
        }

        // Si le crédit actuel est à 0, tout est régularisé
        if ((float) $user->getCurrentCredit() == 0) {
            return true;
        }

        // Vérifier si le mois de la réservation a été régularisé
        $monthKey = $reservationDate->format('Y-m');
        $isMonthRegularized = $this->creditRegularizationRepository->isMonthRegularized($user, $monthKey);
        
        if (!$isMonthRegularized) {
            return false;
        }

        // Si le crédit n'est pas à 0, vérifier s'il y a eu des courses ajoutées après la régularisation
        $lastRegularization = $this->entityManager
            ->getRepository(\App\Entity\CreditRegularization::class)
            ->createQueryBuilder('cr')
            ->andWhere('cr.user = :user')
            ->andWhere('cr.month = :month')
            ->setParameter('user', $user)
            ->setParameter('month', $monthKey)
            ->orderBy('cr.regularizedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        
        if (!$lastRegularization) {
            return false;
        }

        // Vérifier si cette réservation spécifique est antérieure à la régularisation
        return $reservationDate <= $lastRegularization->getRegularizedAt();
    }

    /**
     * Envoie les notifications WhatsApp pour une nouvelle réservation
     */
    private function sendWhatsAppNotifications($reservation, User $user, array $data): void
    {
        try {
            // Log pour déboguer
            error_log('=== DÉBUT sendWhatsAppNotifications ===');
            error_log('User phone: ' . $user->getPhoneNumber());
            
            // Préparer les données pour les notifications
            $reservationData = [
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhoneNumber(),
                'date' => $reservation->getDate()->format('d/m/Y'),
                'time' => $reservation->getDate()->format('H:i'),
                'price' => $reservation->getPrice(),
                'paymentMethod' => $reservation->getPaymentMethod()
            ];
            
            error_log('Reservation data prepared: ' . json_encode($reservationData));

            // Ajouter les données spécifiques selon le type de réservation
            if ($reservation instanceof ClassicReservation) {
                $reservationData['type'] = 'classic';
                $reservationData['from'] = $reservation->getDeparture();
                $reservationData['to'] = $reservation->getArrival();
                $reservationData['stop'] = $reservation->getStop();
                $reservationData['luggage'] = $reservation->isExcessBaggage();
            } elseif ($reservation instanceof FlatRateBooking) {
                $reservationData['type'] = 'time';
                $reservationData['from'] = $reservation->getDeparture();
                $reservationData['to'] = $reservation->getArrival();
                $reservationData['duration'] = $reservation->getNumberOfHours();
                $reservationData['luggage'] = $reservation->isExcessBaggage();
            }

            // Notification au client
            error_log('Envoi notification client...');
            $result = $this->whatsAppService->sendReservationConfirmation(
                $user->getPhoneNumber(),
                $reservationData
            );
            error_log('Résultat envoi client: ' . ($result ? 'SUCCÈS' : 'ÉCHEC'));

            // Notification à l'admin
            $adminPhoneNumber = $this->parameterBag->get('admin.whatsapp_number');
            error_log('Admin phone number: ' . ($adminPhoneNumber ?? 'NON CONFIGURÉ'));
            if ($adminPhoneNumber) {
                error_log('Envoi notification admin...');
                $adminResult = $this->whatsAppService->sendAdminNotification(
                    $adminPhoneNumber,
                    $reservationData
                );
                error_log('Résultat envoi admin: ' . ($adminResult ? 'SUCCÈS' : 'ÉCHEC'));
            }

            error_log('=== FIN sendWhatsAppNotifications ===');

        } catch (\Exception $e) {
            // Log l'erreur mais ne pas faire échouer la réservation
            error_log('=== ERREUR sendWhatsAppNotifications ===');
            error_log('Erreur envoi WhatsApp: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
        }
    }

    /**
     * Envoie une notification WhatsApp pour un changement de statut
     */
    private function sendStatusUpdateNotification($reservation, string $newStatus): void
    {
        try {
            $user = $reservation->getClient();
            
            // Mapper les statuts backend vers les statuts affichés
            $statusMap = [
                'confirmed' => 'Acceptée',
                'cancelled' => 'Refusée',
                'in_progress' => 'En cours',
                'completed' => 'Terminée'
            ];
            
            $displayStatus = $statusMap[$newStatus] ?? $newStatus;
            
            // Préparer les données de la réservation
            $reservationData = [
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
                'date' => $reservation->getDate()->format('d/m/Y'),
                'time' => $reservation->getDate()->format('H:i'),
                'price' => $reservation->getPrice()
            ];

            // Ajouter les données spécifiques selon le type
            if ($reservation instanceof ClassicReservation) {
                $reservationData['from'] = $reservation->getDeparture();
                $reservationData['to'] = $reservation->getArrival();
            } elseif ($reservation instanceof FlatRateBooking) {
                $reservationData['from'] = $reservation->getDeparture();
                $reservationData['to'] = $reservation->getArrival();
            }

            // Envoyer la notification
            $this->whatsAppService->sendStatusUpdate(
                $user->getPhoneNumber(),
                $reservationData,
                $displayStatus
            );

        } catch (\Exception $e) {
            // Log l'erreur mais ne pas faire échouer la mise à jour
            error_log('Erreur envoi WhatsApp changement statut: ' . $e->getMessage());
        }
    }
}

