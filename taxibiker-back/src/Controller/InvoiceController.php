<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Twig\Environment;

#[Route('/api/invoice', name: 'api_invoice_')]
class InvoiceController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Environment $twig,
        private ParameterBagInterface $parameterBag
    ) {
    }

    #[Route('/{reservationId}', name: 'generate', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function generateInvoice(int $reservationId): Response
    {
        try {
            /** @var \App\Entity\User $user */
            $user = $this->getUser();

            if (!$user) {
                return $this->json([
                    'success' => false,
                    'error' => 'Utilisateur non trouvé',
                ], Response::HTTP_UNAUTHORIZED);
            }

            $reservation = null;
            $reservationType = 'classic';

            $classicReservation = $this->entityManager
                ->getRepository(\App\Entity\ClassicReservation::class)
                ->findOneBy(['id' => $reservationId, 'client' => $user]);

            if ($classicReservation) {
                $reservation = $classicReservation;
            } else {
                $flatRateBooking = $this->entityManager
                    ->getRepository(\App\Entity\FlatRateBooking::class)
                    ->findOneBy(['id' => $reservationId, 'client' => $user]);

                if ($flatRateBooking) {
                    $reservation = $flatRateBooking;
                    $reservationType = 'hourly';
                }
            }

            if (!$reservation) {
                return $this->json([
                    'success' => false,
                    'error' => 'Réservation non trouvée',
                ], Response::HTTP_NOT_FOUND);
            }

            if ($reservation->getStatut() !== 'completed') {
                return $this->json([
                    'success' => false,
                    'error' => 'La facture n\'est disponible que pour les courses terminées',
                ], Response::HTTP_BAD_REQUEST);
            }

            $invoiceData = [
                'companyName' => $this->parameterBag->get('company.name'),
                'address' => $this->parameterBag->get('company.address'),
                'phone' => $this->parameterBag->get('company.phone'),
                'email' => $this->parameterBag->get('company.email'),
                'companyRcs' => $this->parameterBag->get('company.rcs'),
                'clientName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'invoiceNumber' => 'FACT-' . date('Y') . '-' . str_pad((string) $reservationId, 6, '0', STR_PAD_LEFT),
                'invoiceDate' => date('d/m/Y'),
                'serviceDate' => $reservation->getDate()->format('d/m/Y'),
                'serviceTime' => $this->formatServiceTime($reservation->getDate()),
                'price' => (float) $reservation->getPrice(),
                'paymentLabel' => 'course',
            ];

            if ($reservationType === 'classic') {
                /** @var \App\Entity\ClassicReservation $reservation */
                $invoiceData['service'] = 'Transport ' . $reservation->getDeparture() . ' → ' . $reservation->getArrival();
                $invoiceData['luggageFee'] = $reservation->isExcessBaggage() ? 15 : 0;
                $invoiceData['stopFee'] = $reservation->getStop() ? 10 : 0;
            } else {
                /** @var \App\Entity\FlatRateBooking $reservation */
                $invoiceData['service'] = 'Course de ' . $reservation->getNumberOfHours() . 'h - ' . $reservation->getDeparture();
                $invoiceData['luggageFee'] = $reservation->isExcessBaggage() ? 15 : 0;
                $invoiceData['stopFee'] = 0;
            }

            $invoiceData['total'] = $invoiceData['price'] + $invoiceData['luggageFee'] + $invoiceData['stopFee'];

            $invoiceHTML = $this->twig->render('invoice/invoice.html.twig', $invoiceData);

            return new Response($invoiceHTML, 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename="facture_' . $invoiceData['invoiceNumber'] . '.html"',
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la génération de la facture: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function formatServiceTime(\DateTimeInterface $date): string
    {
        $hour = (int) $date->format('G');
        $minutes = (int) $date->format('i');

        if ($minutes === 0) {
            return $hour . 'h';
        }

        return $hour . 'h' . str_pad((string) $minutes, 2, '0', STR_PAD_LEFT);
    }
}
