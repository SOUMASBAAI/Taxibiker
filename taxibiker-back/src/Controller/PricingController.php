<?php

namespace App\Controller;

use App\Service\ZonePricingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_')]
class PricingController extends AbstractController
{
    private ZonePricingService $zonePricingService;

    public function __construct(ZonePricingService $zonePricingService)
    {
        $this->zonePricingService = $zonePricingService;
    }

    /**
     * Calculate price for a route
     */
    #[Route('/pricing/calculate', name: 'pricing_calculate', methods: ['POST'])]
    public function calculatePrice(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['departure']) || !isset($data['arrival'])) {
            return $this->json([
                'error' => 'Departure and arrival addresses are required'
            ], 400);
        }

        $departure = $data['departure'];
        $arrival = $data['arrival'];
        $distance = isset($data['distance']) ? (float) $data['distance'] : null;
        
        // Parse datetime if provided (format: Y-m-d H:i:s or ISO 8601)
        $dateTime = null;
        if (isset($data['datetime'])) {
            try {
                // Parse datetime and convert to Europe/Paris timezone
                $dateTime = new \DateTime($data['datetime']);
                $dateTime->setTimezone(new \DateTimeZone('Europe/Paris'));
            } catch (\Exception $e) {
                return $this->json([
                    'error' => 'Invalid datetime format. Use ISO 8601 format (e.g., 2024-01-15T20:30:00)'
                ], 400);
            }
        }
        
        // Get pricing mode (default: 'classic')
        $mode = isset($data['mode']) ? $data['mode'] : 'classic';
        if (!in_array($mode, ['classic', 'hourly'])) {
            return $this->json([
                'error' => 'Mode must be either "classic" or "hourly"'
            ], 400);
        }
        
        // Get number of hours for hourly mode
        $hours = isset($data['hours']) ? (float) $data['hours'] : null;
        if ($mode === 'hourly' && $hours !== null) {
            if ($hours < 2) {
                return $this->json([
                    'error' => 'Hourly mode requires a minimum of 2 hours'
                ], 400);
            }
            if ($hours > 5) {
                return $this->json([
                    'error' => 'Hourly mode has a maximum of 5 hours'
                ], 400);
            }
        }
        
        // Get number of additional stops (default: 0, maximum: 1)
        // Note: Stops are only applicable in classic mode
        $numberOfStops = isset($data['stops']) ? (int) $data['stops'] : 0;
        if ($numberOfStops < 0 || $numberOfStops > 1) {
            return $this->json([
                'error' => 'Number of stops must be 0 or 1 (only one additional stop is allowed)'
            ], 400);
        }
        
        // Get excess baggage count (default: 0)
        $excessBaggage = isset($data['excessBaggage']) ? (int) $data['excessBaggage'] : 0;
        if ($excessBaggage < 0) {
            return $this->json([
                'error' => 'Excess baggage must be 0 or greater'
            ], 400);
        }
        
        // Check if booking is within 1 hour (urgent booking fee)
        $isUrgent = false;
        if ($dateTime) {
            $now = new \DateTime();
            
            // Calculate difference in seconds
            $diffInSeconds = $dateTime->getTimestamp() - $now->getTimestamp();
            $diffInHours = $diffInSeconds / 3600;
            
            // If pickup time is between 0 and 1 hour from now (future booking within 1 hour)
            if ($diffInHours > 0 && $diffInHours < 1) {
                $isUrgent = true;
            }
        }

        try {
            $result = $this->zonePricingService->calculatePrice(
                $departure, 
                $arrival, 
                $distance, 
                $dateTime, 
                $numberOfStops,
                $mode,
                $hours,
                $excessBaggage,
                $isUrgent
            );
            
            return $this->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error calculating price: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all zones and pricing information
     */
    #[Route('/pricing/zones', name: 'pricing_zones', methods: ['GET'])]
    public function getZones(): JsonResponse
    {
        try {
            $zonesInfo = $this->zonePricingService->getZonesInfo();
            
            return $this->json([
                'success' => true,
                'data' => $zonesInfo
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error fetching zones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pricing grid
     */
    #[Route('/pricing/grid', name: 'pricing_grid', methods: ['GET'])]
    public function getPricingGrid(): JsonResponse
    {
        $grid = [
            [
                'from' => 'Paris',
                'to' => 'Paris',
                'price' => 50.00,
                'description' => 'Trajet intra-muros'
            ],
            [
                'from' => 'Paris',
                'to' => 'Proche Banlieue',
                'price' => 65.00,
                'description' => 'Paris vers banlieue premium (Neuilly, Levallois, Vincennes, etc.)'
            ],
            [
                'from' => 'Paris',
                'to' => 'Banlieue Standard',
                'price' => 55.00,
                'description' => 'Paris vers banlieue standard (Nanterre, Montreuil, Créteil, etc.)'
            ],
            [
                'from' => 'Proche Banlieue',
                'to' => 'Proche Banlieue',
                'price' => 45.00,
                'description' => 'Entre banlieues premium'
            ],
            [
                'from' => 'Banlieue Standard',
                'to' => 'Banlieue Standard',
                'price' => 40.00,
                'description' => 'Entre banlieues standard'
            ],
            [
                'from' => 'Proche Banlieue',
                'to' => 'Banlieue Standard',
                'price' => 50.00,
                'description' => 'Entre banlieue premium et standard'
            ],
            [
                'from' => 'Autres zones',
                'to' => 'Toute destination',
                'price' => 'Variable',
                'description' => 'Prix calculé au kilomètre (base 30€ + distance × tarif/km)'
            ]
        ];

        return $this->json([
            'success' => true,
            'data' => $grid
        ]);
    }
}

