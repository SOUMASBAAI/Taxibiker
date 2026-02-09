<?php

namespace App\Service;

use App\Repository\RateRepository;
use App\Repository\ZoneRepository;
use App\Repository\ZoneLocationRepository;
use App\Repository\ZonePricingRepository;
use App\Repository\TimeBasedFeeRepository;
use App\Repository\PredefinedRouteRepository;
use App\Entity\Zone;

class ZonePricingService
{
    private RateRepository $rateRepository;
    private ZoneRepository $zoneRepository;
    private ZoneLocationRepository $zoneLocationRepository;
    private ZonePricingRepository $zonePricingRepository;
    private TimeBasedFeeRepository $timeBasedFeeRepository;
    private PredefinedRouteRepository $predefinedRouteRepository;
    
    // Cache for better performance
    private ?array $zonesCache = null;
    private ?array $locationsCache = null;
    private ?array $pricingCache = null;

    public function __construct(
        RateRepository $rateRepository,
        ZoneRepository $zoneRepository,
        ZoneLocationRepository $zoneLocationRepository,
        ZonePricingRepository $zonePricingRepository,
        TimeBasedFeeRepository $timeBasedFeeRepository,
        PredefinedRouteRepository $predefinedRouteRepository
    ) {
        $this->rateRepository = $rateRepository;
        $this->zoneRepository = $zoneRepository;
        $this->zoneLocationRepository = $zoneLocationRepository;
        $this->zonePricingRepository = $zonePricingRepository;
        $this->timeBasedFeeRepository = $timeBasedFeeRepository;
        $this->predefinedRouteRepository = $predefinedRouteRepository;
    }

    /**
     * Calculate price based on departure and arrival addresses
     */
    public function calculatePrice(
        string $departure, 
        string $arrival, 
        ?float $distance = null,
        ?\DateTimeInterface $dateTime = null,
        ?int $numberOfStops = 0,
        ?string $mode = 'classic',
        ?float $hours = null,
        ?int $excessBaggage = 0,
        ?bool $isUrgent = false
    ): array
    {
        // Validate mode
        if (!in_array($mode, ['classic', 'hourly'])) {
            $mode = 'classic';
        }
        
        // Calculate base price based on mode
        if ($mode === 'hourly') {
            // Validate that departure is in Paris for hourly mode
            $departureZone = $this->detectZone($departure);
            if (!$departureZone || $departureZone->getCode() !== 'PARIS') {
                throw new \InvalidArgumentException('Le service à la durée est disponible uniquement à Paris. Veuillez sélectionner une adresse de prise en charge à Paris.');
            }
            
            $basePrice = $this->calculateHourlyPrice($hours);
        } else {
            // First, check if this is a predefined route
            $predefinedPrice = $this->checkPredefinedRoute($departure, $arrival);
            
            if ($predefinedPrice !== null) {
                $basePrice = $predefinedPrice;
            } else {
                // Fall back to zone-based calculation
                $departureZone = $this->detectZone($departure);
                $arrivalZone = $this->detectZone($arrival);
                $basePrice = $this->getPriceForZones($departureZone, $arrivalZone, $distance);
            }
        }
        
        // Calculate time-based fee
        $timeBasedFee = 0.0;
        $timeBasedFeeName = null;
        if ($dateTime) {
            $timeFee = $this->timeBasedFeeRepository->findFeeForTime($dateTime);
            
            if ($timeFee) {
                $timeBasedFee = (float) $timeFee->getFee();
                $timeBasedFeeName = $timeFee->getName();
            }
        }
        
        // Calculate stop fee (20€ for one additional stop)
        // Note: Stop fee is NOT applied in hourly mode
        $stopFee = 0.0;
        $hasStop = $numberOfStops === 1;
        if ($hasStop && $mode === 'classic') {
            $rate = $this->rateRepository->findOneBy([]);
            $stopFee = $rate ? (float) $rate->getStop() : 20.00; // Default 20€ for the stop
        }
        
        // Calculate weekend/holiday fee (15€)
        $weekendHolidayFee = 0.0;
        $isWeekendOrHoliday = false;
        $weekendHolidayReason = null;
        if ($dateTime) {
            if ($this->isWeekend($dateTime)) {
                $rate = $this->rateRepository->findOneBy([]);
                $weekendHolidayFee = $rate ? (float) $rate->getWeekendRate() : 15.00;
                $isWeekendOrHoliday = true;
                $weekendHolidayReason = 'Weekend';
            } elseif ($this->isFrenchHoliday($dateTime)) {
                $rate = $this->rateRepository->findOneBy([]);
                $weekendHolidayFee = $rate ? (float) $rate->getHolyday() : 15.00; // Note: "holyday" is the DB field name
                $isWeekendOrHoliday = true;
                $weekendHolidayReason = 'French Holiday';
            }
        }
        
        // Calculate excess baggage fee
        $excessBaggageFee = 0.0;
        if ($excessBaggage > 0) {
            $rate = $this->rateRepository->findOneBy([]);
            $baggageRate = $rate ? (float) $rate->getExcessBaggage() : 15.00;
            $excessBaggageFee = $excessBaggage * $baggageRate;
        }
        
        // Calculate urgent booking fee (booking within 1 hour)
        $urgentBookingFee = 0.0;
        if ($isUrgent) {
            $urgentBookingFee = 15.00; // 15€ for bookings within 1 hour
        }
        
        $totalPrice = $basePrice + $timeBasedFee + $stopFee + $weekendHolidayFee + $excessBaggageFee + $urgentBookingFee;

        $result = [
            'mode' => $mode,
            'basePrice' => $basePrice,
            'timeBasedFee' => $timeBasedFee,
            'timeBasedFeeName' => $timeBasedFeeName,
            'stopFee' => $stopFee,
            'numberOfStops' => $numberOfStops,
            'weekendHolidayFee' => $weekendHolidayFee,
            'weekendHolidayReason' => $weekendHolidayReason,
            'excessBaggageFee' => $excessBaggageFee,
            'excessBaggage' => $excessBaggage,
            'urgentBookingFee' => $urgentBookingFee,
            'isUrgent' => $isUrgent,
            'totalPrice' => $totalPrice,
            'price' => $totalPrice, // Keep for backward compatibility
        ];
        
        // Add zone info for classic mode
        if ($mode === 'classic') {
            $departureZone = $this->detectZone($departure);
            $arrivalZone = $this->detectZone($arrival);
            $result['departureZone'] = $departureZone ? $departureZone->getCode() : 'UNKNOWN';
            $result['arrivalZone'] = $arrivalZone ? $arrivalZone->getCode() : 'UNKNOWN';
            $result['priceType'] = $distance && (!$departureZone || !$arrivalZone) ? 'distance_based' : 'fixed_rate';
        } else {
            // Add hourly mode specific info
            $result['hours'] = $hours;
            $result['priceType'] = 'hourly';
        }
        
        return $result;
    }
    
    /**
     * Check if route exists in predefined routes
     */
    private function checkPredefinedRoute(string $departure, string $arrival): ?float
    {
        $allRoutes = $this->predefinedRouteRepository->findAll();
        
        $departureNormalized = $this->normalizeAddress($departure);
        $arrivalNormalized = $this->normalizeAddress($arrival);
        
        // Extract key words from addresses (airport names, major locations, etc.)
        $departureKeywords = $this->extractKeywords($departureNormalized);
        $arrivalKeywords = $this->extractKeywords($arrivalNormalized);
        
        foreach ($allRoutes as $route) {
            $routeDepartureNormalized = $this->normalizeAddress($route->getDeparture());
            $routeArrivalNormalized = $this->normalizeAddress($route->getArrival());
            
            $routeDepartureKeywords = $this->extractKeywords($routeDepartureNormalized);
            $routeArrivalKeywords = $this->extractKeywords($routeArrivalNormalized);
            
            // Check if key words match
            $departureMatches = $this->matchKeywords($departureKeywords, $routeDepartureKeywords) ||
                               strpos($departureNormalized, $routeDepartureNormalized) !== false ||
                               strpos($routeDepartureNormalized, $departureNormalized) !== false;
            
            $arrivalMatches = $this->matchKeywords($arrivalKeywords, $routeArrivalKeywords) ||
                             strpos($arrivalNormalized, $routeArrivalNormalized) !== false ||
                             strpos($routeArrivalNormalized, $arrivalNormalized) !== false;
            
            if ($departureMatches && $arrivalMatches) {
                return (float) $route->getPrice();
            }
        }
        
        return null;
    }
    
    /**
     * Extract key words from normalized address (airports, major locations, etc.)
     */
    private function extractKeywords(string $normalizedAddress): array
    {
        $keywords = [];
        
        // Extract airport names
        if (preg_match('/AEROPORT\s+([A-Z\s]+?)(?:,|\s+\d+|$)/i', $normalizedAddress, $matches)) {
            $airportName = trim($matches[1]);
            // Remove common words
            $airportName = preg_replace('/\b(DE|DU|LA|LE|LES|PARIS)\b/i', '', $airportName);
            $airportName = preg_replace('/\s+/', ' ', trim($airportName));
            if (!empty($airportName)) {
                $keywords[] = $airportName;
            }
        }
        
        // Extract major location names (after comma or before postal code)
        if (preg_match('/,\s*([A-Z\s]+?)(?:\s+\d+|$)/', $normalizedAddress, $matches)) {
            $location = trim($matches[1]);
            $location = preg_replace('/\b(DE|DU|LA|LE|LES)\b/i', '', $location);
            $location = preg_replace('/\s+/', ' ', trim($location));
            if (!empty($location) && strlen($location) > 3) {
                $keywords[] = $location;
            }
        }
        
        // Extract postal codes if present
        if (preg_match('/\b(\d{5})\b/', $normalizedAddress, $matches)) {
            $keywords[] = $matches[1];
        }
        
        return array_filter(array_unique($keywords));
    }
    
    /**
     * Check if two keyword arrays match (at least 50% of keywords match)
     */
    private function matchKeywords(array $keywords1, array $keywords2): bool
    {
        if (empty($keywords1) || empty($keywords2)) {
            return false;
        }
        
        $matched = 0;
        foreach ($keywords1 as $keyword1) {
            foreach ($keywords2 as $keyword2) {
                // Check if keywords are similar (contain each other or are contained)
                if (strpos($keyword1, $keyword2) !== false || strpos($keyword2, $keyword1) !== false) {
                    $matched++;
                    break;
                }
            }
        }
        
        // At least 50% of keywords should match
        $matchRatio = $matched / max(count($keywords1), count($keywords2));
        return $matchRatio >= 0.5;
    }
    
    /**
     * Calculate price for hourly mode
     * Minimum 2 hours, maximum 5 hours, 80€ per hour
     * Special offers: 3h = 200€, 5h = 350€
     */
    private function calculateHourlyPrice(?float $hours): float
    {
        // Minimum 2 hours required
        if ($hours === null || $hours < 2) {
            $hours = 2;
        }
        
        // Maximum 5 hours
        if ($hours > 5) {
            $hours = 5;
        }
        
        // Special offer for exactly 3 hours
        if ($hours == 3) {
            return 200.00;
        }
        
        // Special offer for exactly 5 hours
        if ($hours == 5) {
            return 350.00;
        }
        
        // Standard rate: 80€/hour for other durations
        $hourlyRate = 80.00;
        
        return $hours * $hourlyRate;
    }
    
    /**
     * Check if the date is a weekend (Saturday or Sunday)
     */
    private function isWeekend(\DateTimeInterface $dateTime): bool
    {
        $dayOfWeek = (int) $dateTime->format('N'); // 1 (Monday) to 7 (Sunday)
        return $dayOfWeek === 6 || $dayOfWeek === 7; // 6 = Saturday, 7 = Sunday
    }
    
    /**
     * Check if the date is a French public holiday
     */
    private function isFrenchHoliday(\DateTimeInterface $dateTime): bool
    {
        $year = (int) $dateTime->format('Y');
        $date = $dateTime->format('Y-m-d');
        
        // Fixed French holidays
        $fixedHolidays = [
            $year . '-01-01', // New Year's Day
            $year . '-05-01', // Labour Day
            $year . '-05-08', // Victory in Europe Day
            $year . '-07-14', // Bastille Day
            $year . '-08-15', // Assumption of Mary
            $year . '-11-01', // All Saints' Day
            $year . '-11-11', // Armistice Day
            $year . '-12-25', // Christmas Day
        ];
        
        // Calculate Easter and movable holidays
        $easter = $this->calculateEaster($year);
        $movableHolidays = [
            $easter->modify('+1 day')->format('Y-m-d'),  // Easter Monday
            $easter->modify('+38 days')->format('Y-m-d'), // Ascension Thursday (39 days after Easter)
            $easter->modify('+11 days')->format('Y-m-d'), // Whit Monday (50 days after Easter)
        ];
        
        $allHolidays = array_merge($fixedHolidays, $movableHolidays);
        
        return in_array($date, $allHolidays);
    }
    
    /**
     * Calculate Easter date for a given year
     */
    private function calculateEaster(int $year): \DateTime
    {
        $easter = new \DateTime();
        $easter->setDate($year, 3, 21);
        $days = easter_days($year);
        $easter->modify("+{$days} days");
        return $easter;
    }

    /**
     * Detect zone from address string
     */
    private function detectZone(string $address): ?Zone
    {
        $addressNormalized = $this->normalizeAddress($address);
        $locations = $this->getLocationsCache();

        // Get zones ordered by priority
        $zones = $this->getZonesCache();

        foreach ($zones as $zone) {
            $zoneCode = $zone->getCode();
            
            if (!isset($locations[$zoneCode])) {
                continue;
            }

            foreach ($locations[$zoneCode] as $location) {
                $valueNormalized = $this->normalizeAddress($location->getValue());
                
                if (strpos($addressNormalized, $valueNormalized) !== false) {
                    return $zone;
                }
            }
        }

        return null; // No zone detected
    }

    /**
     * Normalize address for comparison
     */
    private function normalizeAddress(string $address): string
    {
        $address = strtoupper($address);
        $address = str_replace(['À', 'Â', 'Ä'], 'A', $address);
        $address = str_replace(['É', 'È', 'Ê', 'Ë'], 'E', $address);
        $address = str_replace(['Î', 'Ï'], 'I', $address);
        $address = str_replace(['Ô', 'Ö'], 'O', $address);
        $address = str_replace(['Ù', 'Û', 'Ü'], 'U', $address);
        $address = str_replace(['Ç'], 'C', $address);
        
        // Remove common words that might differ between Google Places and database
        $wordsToRemove = ['DE', 'LE', 'LA', 'LES', 'PARIS-', 'PARIS '];
        foreach ($wordsToRemove as $word) {
            $address = str_replace($word, '', $address);
        }
        
        // Remove extra spaces and trim
        $address = preg_replace('/\s+/', ' ', $address);
        $address = trim($address);
        
        return $address;
    }

    /**
     * Get price for zone combination
     */
    private function getPriceForZones(?Zone $departureZone, ?Zone $arrivalZone, ?float $distance): float
    {
        // If zones are not detected, use distance-based pricing
        if (!$departureZone || !$arrivalZone) {
            return $this->calculateDistanceBasedPrice($distance ?: 0);
        }

        // Look for exact pricing rule
        $pricing = $this->zonePricingRepository->findPriceForZones($departureZone, $arrivalZone);
        
        if ($pricing) {
            if ($pricing->getIsDistanceBased() && $distance) {
                $basePrice = (float) $pricing->getBasePrice();
                $pricePerKm = (float) $pricing->getPricePerKm();
                return $basePrice + ($distance * $pricePerKm);
            }
            return (float) $pricing->getPrice();
        }

        // Try reverse direction
        $pricingReverse = $this->zonePricingRepository->findPriceForZones($arrivalZone, $departureZone);
        
        if ($pricingReverse) {
            if ($pricingReverse->getIsDistanceBased() && $distance) {
                $basePrice = (float) $pricingReverse->getBasePrice();
                $pricePerKm = (float) $pricingReverse->getPricePerKm();
                return $basePrice + ($distance * $pricePerKm);
            }
            return (float) $pricingReverse->getPrice();
        }

        // No pricing rule found, use distance-based
        return $this->calculateDistanceBasedPrice($distance ?: 0);
    }

    /**
     * Calculate price based on distance (per km rate)
     */
    private function calculateDistanceBasedPrice(float $distance): float
    {
        // Get the kilometer rate from the Rate table
        $rate = $this->rateRepository->findOneBy([]);
        $kmRate = $rate ? (float) $rate->getKilometer() : 2.50; // Default 2.50€/km

        $basePrice = 30.00; // Base price
        return $basePrice + ($distance * $kmRate);
    }

    /**
     * Get all zones information
     */
    public function getZonesInfo(): array
    {
        $zones = $this->getZonesCache();
        $locations = $this->getLocationsCache();
        $pricingMatrix = $this->zonePricingRepository->findAllAsMatrix();

        $zonesData = [];
        foreach ($zones as $zone) {
            $zoneCode = $zone->getCode();
            $zoneLocations = $locations[$zoneCode] ?? [];
            
            $cities = [];
            $postalCodes = [];
            
            foreach ($zoneLocations as $location) {
                if ($location->getType() === 'city') {
                    $cities[] = $location->getValue();
                } else {
                    $postalCodes[] = $location->getValue();
                }
            }

            $zonesData[$zoneCode] = [
                'id' => $zone->getId(),
                'name' => $zone->getName(),
                'description' => $zone->getDescription(),
                'cities' => $cities,
                'postal_codes' => $postalCodes,
            ];
        }

        $pricingData = [];
        foreach ($pricingMatrix as $fromCode => $toPricing) {
            foreach ($toPricing as $toCode => $pricing) {
                $key = $fromCode . '_TO_' . $toCode;
                $pricingData[$key] = (float) $pricing->getPrice();
            }
        }

        return [
            'zones' => $zonesData,
            'pricing' => $pricingData,
        ];
    }

    /**
     * Get zones cache
     */
    private function getZonesCache(): array
    {
        if ($this->zonesCache === null) {
            $this->zonesCache = $this->zoneRepository->findAllOrderedByPriority();
        }
        return $this->zonesCache;
    }

    /**
     * Get locations cache
     */
    private function getLocationsCache(): array
    {
        if ($this->locationsCache === null) {
            $this->locationsCache = $this->zoneLocationRepository->findAllGroupedByZone();
        }
        return $this->locationsCache;
    }

    /**
     * Clear cache (call after updating zones/locations/pricing)
     */
    public function clearCache(): void
    {
        $this->zonesCache = null;
        $this->locationsCache = null;
        $this->pricingCache = null;
    }
}
