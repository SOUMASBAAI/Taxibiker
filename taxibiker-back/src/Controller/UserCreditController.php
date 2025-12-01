<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\CreditRegularization;
use App\Repository\UserRepository;
use App\Repository\CreditRegularizationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/user/credit', name: 'api_user_credit_')]
class UserCreditController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private CreditRegularizationRepository $creditRegularizationRepository
    ) {
    }

    #[Route('', name: 'get', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUserCredit(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_UNAUTHORIZED);
            }

            return $this->json([
                'success' => true,
                'credit' => [
                    'monthly_credit_enabled' => $user->isMonthlyCreditEnabled(),
                    'current_credit' => number_format((float) $user->getCurrentCredit(), 2, '.', ''),
                    'enabled' => $user->isMonthlyCreditEnabled(), // Garder pour compatibilité
                    'current_amount' => (float) $user->getCurrentCredit(),
                    'formatted_amount' => number_format((float) $user->getCurrentCredit(), 2, ',', ' ') . ' €'
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération du crédit: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/reset', name: 'reset', methods: ['POST'])]
    public function resetUserCredit(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['user_id'])) {
                return $this->json([
                    'success' => false,
                    'error' => 'ID utilisateur requis'
                ], Response::HTTP_BAD_REQUEST);
            }

            $user = $this->userRepository->find($data['user_id']);
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            // Enregistrer la régularisation avant de remettre le crédit à zéro
            $currentMonth = date('Y-m');
            $creditAmount = $user->getCurrentCredit();
            
            // Créer un enregistrement de régularisation
            $regularization = new CreditRegularization();
            $regularization->setUser($user);
            $regularization->setAmount($creditAmount);
            $regularization->setMonth($currentMonth);
            $regularization->setRegularizedAt(new \DateTime());
            $regularization->setNotes('Régularisation administrative');
            
            $this->entityManager->persist($regularization);
            
            // Remettre le crédit à zéro
            $user->resetCredit();
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Crédit remis à zéro avec succès',
                'new_credit' => (float) $user->getCurrentCredit()
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la remise à zéro du crédit: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/history', name: 'user_history', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getCurrentUserCreditHistory(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_UNAUTHORIZED);
            }

            if (!$user->isMonthlyCreditEnabled()) {
                return $this->json([
                    'success' => true,
                    'monthly_summary' => [],
                    'user' => [
                        'id' => $user->getId(),
                        'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                        'current_credit' => (float) $user->getCurrentCredit(),
                        'monthly_credit_enabled' => false
                    ]
                ]);
            }

            // Récupérer les réservations de l'utilisateur
            $classicReservations = $this->entityManager
                ->getRepository(\App\Entity\ClassicReservation::class)
                ->findBy(['client' => $user], ['date' => 'DESC']);

            $flatRateBookings = $this->entityManager
                ->getRepository(\App\Entity\FlatRateBooking::class)
                ->findBy(['client' => $user], ['date' => 'DESC']);

            // Grouper par mois
            $monthlyData = [];

            // Traiter les réservations classiques
            foreach ($classicReservations as $res) {
                if ($res->getPrice() && (float) $res->getPrice() > 0) {
                    $monthKey = $res->getDate()->format('Y-m');
                    $monthName = $res->getDate()->format('F Y');
                    
                    if (!isset($monthlyData[$monthKey])) {
                        $monthlyData[$monthKey] = [
                            'month' => $monthKey,
                            'month_name' => $monthName,
                            'total_rides' => 0,
                            'total_amount' => 0,
                            'regularized' => false, // Sera calculé plus tard
                            'rides' => []
                        ];
                    }
                    
                    $monthlyData[$monthKey]['total_rides']++;
                    $monthlyData[$monthKey]['total_amount'] += (float) $res->getPrice();
                    $monthlyData[$monthKey]['rides'][] = [
                        'id' => $res->getId(),
                        'date' => $res->getDate()->format('Y-m-d H:i:s'),
                        'type' => $res->getStatut() === 'cancelled' ? 'refund' : 'charge',
                        'amount' => (float) $res->getPrice(),
                        'description' => $res->getStatut() === 'cancelled' 
                            ? 'Remboursement - ' . $res->getDeparture() . ' → ' . $res->getArrival()
                            : 'Course - ' . $res->getDeparture() . ' → ' . $res->getArrival(),
                        'status' => $res->getStatut(),
                        'reservation_type' => 'classic'
                    ];
                }
            }

            // Traiter les réservations à la durée
            foreach ($flatRateBookings as $res) {
                if ($res->getPrice() && (float) $res->getPrice() > 0) {
                    $monthKey = $res->getDate()->format('Y-m');
                    $monthName = $res->getDate()->format('F Y');
                    
                    if (!isset($monthlyData[$monthKey])) {
                        $monthlyData[$monthKey] = [
                            'month' => $monthKey,
                            'month_name' => $monthName,
                            'total_rides' => 0,
                            'total_amount' => 0,
                            'regularized' => false, // Sera calculé plus tard
                            'rides' => []
                        ];
                    }
                    
                    $monthlyData[$monthKey]['total_rides']++;
                    $monthlyData[$monthKey]['total_amount'] += (float) $res->getPrice();
                    $monthlyData[$monthKey]['rides'][] = [
                        'id' => $res->getId(),
                        'date' => $res->getDate()->format('Y-m-d H:i:s'),
                        'type' => $res->getStatut() === 'cancelled' ? 'refund' : 'charge',
                        'amount' => (float) $res->getPrice(),
                        'description' => $res->getStatut() === 'cancelled' 
                            ? 'Remboursement - Course de ' . $res->getNumberOfHours() . 'h'
                            : 'Course de ' . $res->getNumberOfHours() . 'h - ' . $res->getDeparture(),
                        'status' => $res->getStatut(),
                        'reservation_type' => 'hourly'
                    ];
                }
            }

            // Calculer le statut de régularisation pour chaque mois
            foreach ($monthlyData as $monthKey => &$monthData) {
                $monthData['regularized'] = $this->isMonthActuallyRegularized($user, $monthKey, $monthData['rides']);
            }

            // Trier par mois (plus récent en premier)
            uksort($monthlyData, function($a, $b) {
                return strcmp($b, $a);
            });

            return $this->json([
                'success' => true,
                'user' => [
                    'id' => $user->getId(),
                    'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'current_credit' => (float) $user->getCurrentCredit(),
                    'monthly_credit_enabled' => $user->isMonthlyCreditEnabled()
                ],
                'monthly_summary' => array_values($monthlyData)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération de l\'historique: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{userId}/history', name: 'history', methods: ['GET'])]
    public function getUserCreditHistory(int $userId): JsonResponse
    {
        try {
            $user = $this->userRepository->find($userId);
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_NOT_FOUND);
            }

            if (!$user->isMonthlyCreditEnabled()) {
                return $this->json([
                    'success' => true,
                    'monthly_summary' => [],
                    'history' => [], // Garder pour compatibilité
                    'user' => [
                        'id' => $user->getId(),
                        'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                        'email' => $user->getEmail(),
                        'current_credit' => (float) $user->getCurrentCredit(),
                        'monthly_credit_enabled' => false
                    ]
                ]);
            }

            // Récupérer les réservations de l'utilisateur
            $classicReservations = $this->entityManager
                ->getRepository(\App\Entity\ClassicReservation::class)
                ->findBy(['client' => $user], ['date' => 'DESC']);

            $flatRateBookings = $this->entityManager
                ->getRepository(\App\Entity\FlatRateBooking::class)
                ->findBy(['client' => $user], ['date' => 'DESC']);

            // Grouper par mois (même logique que getCurrentUserCreditHistory)
            $monthlyData = [];
            $history = []; // Garder l'ancien format pour compatibilité

            // Traiter les réservations classiques
            foreach ($classicReservations as $res) {
                if ($res->getPrice() && (float) $res->getPrice() > 0) {
                    $monthKey = $res->getDate()->format('Y-m');
                    $monthName = $res->getDate()->format('F Y');
                    
                    if (!isset($monthlyData[$monthKey])) {
                        $monthlyData[$monthKey] = [
                            'month' => $monthKey,
                            'month_name' => $monthName,
                            'total_rides' => 0,
                            'total_amount' => 0,
                            'regularized' => false, // Sera calculé plus tard
                            'rides' => []
                        ];
                    }
                    
                    $rideData = [
                        'id' => $res->getId(),
                        'date' => $res->getDate()->format('Y-m-d H:i:s'),
                        'type' => $res->getStatut() === 'cancelled' ? 'refund' : 'charge',
                        'amount' => (float) $res->getPrice(),
                        'description' => $res->getStatut() === 'cancelled' 
                            ? 'Remboursement - ' . $res->getDeparture() . ' → ' . $res->getArrival()
                            : 'Course - ' . $res->getDeparture() . ' → ' . $res->getArrival(),
                        'status' => $res->getStatut(),
                        'reservation_type' => 'classic'
                    ];
                    
                    $monthlyData[$monthKey]['total_rides']++;
                    $monthlyData[$monthKey]['total_amount'] += (float) $res->getPrice();
                    $monthlyData[$monthKey]['rides'][] = $rideData;
                    $history[] = $rideData; // Pour compatibilité
                }
            }

            // Traiter les réservations à la durée
            foreach ($flatRateBookings as $res) {
                if ($res->getPrice() && (float) $res->getPrice() > 0) {
                    $monthKey = $res->getDate()->format('Y-m');
                    $monthName = $res->getDate()->format('F Y');
                    
                    if (!isset($monthlyData[$monthKey])) {
                        $monthlyData[$monthKey] = [
                            'month' => $monthKey,
                            'month_name' => $monthName,
                            'total_rides' => 0,
                            'total_amount' => 0,
                            'regularized' => false,
                            'rides' => []
                        ];
                    }
                    
                    $rideData = [
                        'id' => $res->getId(),
                        'date' => $res->getDate()->format('Y-m-d H:i:s'),
                        'type' => $res->getStatut() === 'cancelled' ? 'refund' : 'charge',
                        'amount' => (float) $res->getPrice(),
                        'description' => $res->getStatut() === 'cancelled' 
                            ? 'Remboursement - Course de ' . $res->getNumberOfHours() . 'h'
                            : 'Course de ' . $res->getNumberOfHours() . 'h - ' . $res->getDeparture(),
                        'status' => $res->getStatut(),
                        'reservation_type' => 'hourly'
                    ];
                    
                    $monthlyData[$monthKey]['total_rides']++;
                    $monthlyData[$monthKey]['total_amount'] += (float) $res->getPrice();
                    $monthlyData[$monthKey]['rides'][] = $rideData;
                    $history[] = $rideData; // Pour compatibilité
                }
            }

            // Calculer le statut de régularisation pour chaque mois
            foreach ($monthlyData as $monthKey => &$monthData) {
                $monthData['regularized'] = $this->isMonthActuallyRegularized($user, $monthKey, $monthData['rides']);
            }

            // Trier par mois (plus récent en premier)
            uksort($monthlyData, function($a, $b) {
                return strcmp($b, $a);
            });

            // Trier l'historique par date (plus récent en premier)
            usort($history, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });

            return $this->json([
                'success' => true,
                'user' => [
                    'id' => $user->getId(),
                    'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'email' => $user->getEmail(),
                    'current_credit' => (float) $user->getCurrentCredit(),
                    'monthly_credit_enabled' => $user->isMonthlyCreditEnabled()
                ],
                'monthly_summary' => array_values($monthlyData),
                'history' => $history, // Garder pour compatibilité
                'total_transactions' => count($history)
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la récupération de l\'historique: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Vérifie si un mois est réellement régularisé (pas de courses ajoutées après la régularisation)
     */
    private function isMonthActuallyRegularized(User $user, string $monthKey, array $rides): bool
    {
        // Vérifier si ce mois a été explicitement régularisé
        $isRegularized = $this->creditRegularizationRepository->isMonthRegularized($user, $monthKey);
        
        if (!$isRegularized) {
            return false;
        }

        // Si le crédit actuel de l'utilisateur est à 0, considérer que tout est régularisé
        $currentCredit = (float) $user->getCurrentCredit();
        if ($currentCredit == 0) {
            return true; // Crédit à 0 = tout est payé, même les courses ajoutées après la régularisation
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

        // Vérifier s'il y a des courses après la date de régularisation
        foreach ($rides as $ride) {
            $rideDate = new \DateTime($ride['date']);
            if ($rideDate > $lastRegularization->getRegularizedAt()) {
                return false; // Des courses ont été ajoutées après la régularisation et le crédit n'est pas à 0
            }
        }
        
        return true; // Toutes les courses sont antérieures à la régularisation
    }
}

