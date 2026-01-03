<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/invoice', name: 'api_invoice_')]
class InvoiceController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository
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
                    'error' => 'Utilisateur non trouvé'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Chercher la réservation dans les deux types
            $reservation = null;
            $reservationType = 'classic';

            // Chercher dans les réservations classiques
            $classicReservation = $this->entityManager
                ->getRepository(\App\Entity\ClassicReservation::class)
                ->findOneBy(['id' => $reservationId, 'client' => $user]);

            if ($classicReservation) {
                $reservation = $classicReservation;
                $reservationType = 'classic';
            } else {
                // Chercher dans les réservations horaires
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
                    'error' => 'Réservation non trouvée'
                ], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que la course est terminée
            if ($reservation->getStatut() !== 'completed') {
                return $this->json([
                    'success' => false,
                    'error' => 'La facture n\'est disponible que pour les courses terminées'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Préparer les données de la facture
            $invoiceData = [
                'companyName' => 'TAXIBIKERPARIS',
                'address' => '123 Rue de la Taxi, Paris 75001',
                'phone' => '07 88 26 83 54',
                'email' => 'contact@taxibiker.fr',
                'clientName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'clientEmail' => $user->getEmail(),
                'clientPhone' => $user->getPhoneNumber(),
                'invoiceNumber' => 'FACT-' . date('Y') . '-' . str_pad($reservationId, 6, '0', STR_PAD_LEFT),
                'invoiceDate' => date('d/m/Y'),
                'serviceDate' => $reservation->getDate()->format('d/m/Y'),
                'serviceTime' => $reservation->getDate()->format('H:i'),
                'price' => (float) $reservation->getPrice(),
                'reservationType' => $reservationType
            ];

            // Ajouter les détails spécifiques selon le type de réservation
            if ($reservationType === 'classic') {
                /** @var \App\Entity\ClassicReservation $reservation */
                $invoiceData['service'] = 'Transport ' . $reservation->getDeparture() . ' → ' . $reservation->getArrival();
                $invoiceData['luggageFee'] = $reservation->isExcessBaggage() ? 15 : 0;
                $invoiceData['stopFee'] = $reservation->getStop() ? 10 : 0;
            } else {
                /** @var \App\Entity\FlatRateBooking $reservation */
                $invoiceData['service'] = 'Course de ' . $reservation->getNumberOfHours() . 'h - ' . $reservation->getDeparture();
                $invoiceData['luggageFee'] = $reservation->isExcessBaggage() ? 15 : 0;
                $invoiceData['stopFee'] = 0; // Pas de stop pour les courses horaires
            }

            $invoiceData['total'] = $invoiceData['price'] + $invoiceData['luggageFee'] + $invoiceData['stopFee'];

            // Générer le HTML de la facture
            $invoiceHTML = $this->generateInvoiceHTML($invoiceData);

            // Retourner le HTML pour téléchargement côté client
            return new Response($invoiceHTML, 200, [
                'Content-Type' => 'text/html',
                'Content-Disposition' => 'attachment; filename="facture_' . $invoiceData['invoiceNumber'] . '.html"'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => 'Erreur lors de la génération de la facture: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function generateInvoiceHTML(array $data): string
    {
        return '<!DOCTYPE html>
<html>
<head>
    <title>Facture - ' . $data['clientName'] . '</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #ddd;
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 2px solid #f97316;
            padding-bottom: 20px;
        }
        .company { 
            font-weight: bold; 
            font-size: 24px; 
            color: #f97316;
            margin-bottom: 10px;
        }
        .company-info {
            font-size: 14px;
            color: #666;
        }
        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .client-info, .invoice-details {
            flex: 1;
        }
        .invoice-details {
            text-align: right;
        }
        .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            color: #333;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .items-table th,
        .items-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .items-table .price {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            font-size: 18px;
            background-color: #f97316;
            color: white;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            .invoice-container { border: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company">' . $data['companyName'] . '</div>
            <div class="company-info">
                ' . $data['address'] . '<br>
                Tél: ' . $data['phone'] . ' | Email: ' . $data['email'] . '
            </div>
        </div>
        
        <div class="invoice-info">
            <div class="client-info">
                <div class="section-title">Facturé à:</div>
                <div>' . $data['clientName'] . '</div>
                <div>' . $data['clientEmail'] . '</div>
                <div>' . $data['clientPhone'] . '</div>
            </div>
            <div class="invoice-details">
                <div class="section-title">Facture</div>
                <div><strong>N°:</strong> ' . $data['invoiceNumber'] . '</div>
                <div><strong>Date:</strong> ' . $data['invoiceDate'] . '</div>
                <div><strong>Service:</strong> ' . $data['serviceDate'] . ' à ' . $data['serviceTime'] . '</div>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="price">Prix</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>' . $data['service'] . '</td>
                    <td class="price">' . number_format($data['price'], 2) . '€</td>
                </tr>';

        if ($data['luggageFee'] > 0) {
            $invoiceHTML .= '
                <tr>
                    <td>Supplément bagage</td>
                    <td class="price">' . number_format($data['luggageFee'], 2) . '€</td>
                </tr>';
        }

        if ($data['stopFee'] > 0) {
            $invoiceHTML .= '
                <tr>
                    <td>Supplément arrêt</td>
                    <td class="price">' . number_format($data['stopFee'], 2) . '€</td>
                </tr>';
        }

        $invoiceHTML .= '
                <tr class="total-row">
                    <td><strong>TOTAL</strong></td>
                    <td class="price"><strong>' . number_format($data['total'], 2) . '€</strong></td>
                </tr>
            </tbody>
        </table>
        
        <div class="footer">
            <p>Merci de votre confiance !</p>
            <p>Cette facture a été générée automatiquement le ' . date('d/m/Y à H:i') . '</p>
        </div>
    </div>
</body>
</html>';
    }
}
