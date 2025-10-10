<?php

namespace App\DataFixtures;

use App\Entity\PredefinedRoute;
use App\Entity\Rate;
use App\Entity\Zone;
use App\Entity\ZoneLocation;
use App\Entity\ZonePricing;
use App\Entity\TimeBasedFee;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Create Rate configuration
        $rate = new Rate();
        $rate->setNightRate('10.00');
        $rate->setWeekendRate('15.00');
        $rate->setExcessBaggage('15.00'); // 15€ for excess baggage
        $rate->setHolyday('15.00');
        $rate->setTds('8.00');
        $rate->setStop('20.00'); // 20€ per additional stop
        $rate->setKilometer('2.50');
        $manager->persist($rate);

        // ========== CREATE ZONES ==========
        
        // Zone 1: Paris
        $zoneParisEntity = new Zone();
        $zoneParisEntity->setCode('PARIS');
        $zoneParisEntity->setName('Paris');
        $zoneParisEntity->setDescription('Paris intra-muros (all arrondissements)');
        $zoneParisEntity->setPriority(3); // Highest priority
        $manager->persist($zoneParisEntity);

        // Zone 2: Premium Banlieue (Proche banlieue - 55€)
        $zonePremium = new Zone();
        $zonePremium->setCode('PREMIUM_BANLIEUE');
        $zonePremium->setName('Proche Banlieue');
        $zonePremium->setDescription('Close suburbs - 55€ from Paris');
        $zonePremium->setPriority(2);
        $manager->persist($zonePremium);

        // Zone 3: Standard Banlieue
        $zoneStandard = new Zone();
        $zoneStandard->setCode('STANDARD_BANLIEUE');
        $zoneStandard->setName('Banlieue Standard');
        $zoneStandard->setDescription('Other suburbs');
        $zoneStandard->setPriority(1);
        $manager->persist($zoneStandard);

        // Zone 4: Other
        $zoneOther = new Zone();
        $zoneOther->setCode('OTHER');
        $zoneOther->setName('Autres zones');
        $zoneOther->setDescription('All other locations (distance-based pricing)');
        $zoneOther->setPriority(0); // Lowest priority (fallback)
        $manager->persist($zoneOther);

        // ========== ADD LOCATIONS TO ZONES ==========

        // Paris postal codes
        $parisPostalCodes = [
            '75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008',
            '75009', '75010', '75011', '75012', '75013', '75014', '75015', '75016',
            '75017', '75018', '75019', '75020'
        ];
        
        foreach ($parisPostalCodes as $code) {
            $location = new ZoneLocation();
            $location->setZone($zoneParisEntity);
            $location->setValue($code);
            $location->setType('postal_code');
            $manager->persist($location);
        }

        // Add "Paris" as a city keyword
        $parisCity = new ZoneLocation();
        $parisCity->setZone($zoneParisEntity);
        $parisCity->setValue('Paris');
        $parisCity->setType('city');
        $manager->persist($parisCity);

        // Premium Banlieue - Cities (55€ from Paris)
        $premiumCities = [
            'Pantin',
            'Les Lilas',
            'Le Pré-Saint-Gervais',
            'Bagnolet',
            'Montreuil',
            'Vincennes',
            'Saint-Mandé',
            'Charenton-le-Pont',
            'Ivry-sur-Seine',
            'Montrouge',
            'Gentilly',
            'Le Kremlin-Bicêtre',
            'Vanves',
            'Malakoff',
            'Issy-les-Moulineaux',
            'Boulogne-Billancourt',
            'Saint-Cloud',
            'Neuilly-sur-Seine',
            'Clichy',
            'Levallois-Perret',
            'Saint-Ouen-sur-Seine'
        ];

        foreach ($premiumCities as $city) {
            $location = new ZoneLocation();
            $location->setZone($zonePremium);
            $location->setValue($city);
            $location->setType('city');
            $manager->persist($location);
        }

        // Premium Banlieue - Postal codes
        $premiumPostalCodes = [
            '92200', '92300', '92100', '92130', '92150', '92400', '92800', '92700', '92110',
            '94300', '94160', '94220', '94200', '94130', '94170',
            '93100', '93400', '93500', '93310', '93170', '93320'
        ];

        foreach ($premiumPostalCodes as $code) {
            $location = new ZoneLocation();
            $location->setZone($zonePremium);
            $location->setValue($code);
            $location->setType('postal_code');
            $manager->persist($location);
        }

        // Standard Banlieue - Cities (65€ from Paris)
        $standardCities = [
            'Saint-Denis',
            'L\'Île-Saint-Denis',
            'Épinay-sur-Seine',
            'Aubervilliers',
            'La Courneuve',
            'Le Bourget',
            'Drancy',
            'Bobigny',
            'Noisy-le-Sec',
            'Rosny-sous-Bois',
            'Gennevilliers',
            'Asnières-sur-Seine',
            'Bois-Colombes',
            'Colombes',
            'La Garenne-Colombes',
            'Nanterre',
            'Suresnes',
            'Rueil-Malmaison',
            'Meudon',
            'Clamart',
            'Fontenay-aux-Roses',
            'Bagneux',
            'Arcueil',
            'Cachan',
            'Villejuif',
            'L\'Haÿ-les-Roses',
            'Chevilly-Larue',
            'Thiais',
            'Vitry-sur-Seine',
            'Choisy-le-Roi',
            'Créteil',
            'Saint-Maur-des-Fossés',
            'Champigny-sur-Marne',
            'Nogent-sur-Marne',
            'Le Perreux-sur-Marne'
        ];

        foreach ($standardCities as $city) {
            $location = new ZoneLocation();
            $location->setZone($zoneStandard);
            $location->setValue($city);
            $location->setType('city');
            $manager->persist($location);
        }

        // Standard Banlieue - Postal codes
        $standardPostalCodes = [
            '92000', '92230', '92240', '92250', '92270', '92600',
            '93200', '93300',
            '94000', '94100', '94120', '94140', '94210', '94230', '94240', '94250', '94270'
        ];

        foreach ($standardPostalCodes as $code) {
            $location = new ZoneLocation();
            $location->setZone($zoneStandard);
            $location->setValue($code);
            $location->setType('postal_code');
            $manager->persist($location);
        }

        // ========== CREATE ZONE PRICING RULES ==========

        // Paris to Paris
        $pricing1 = new ZonePricing();
        $pricing1->setFromZone($zoneParisEntity);
        $pricing1->setToZone($zoneParisEntity);
        $pricing1->setPrice('50.00');
        $pricing1->setIsDistanceBased(false);
        $manager->persist($pricing1);

        // Paris to Premium Banlieue (55€)
        $pricing2 = new ZonePricing();
        $pricing2->setFromZone($zoneParisEntity);
        $pricing2->setToZone($zonePremium);
        $pricing2->setPrice('55.00');
        $pricing2->setIsDistanceBased(false);
        $manager->persist($pricing2);

        // Premium Banlieue to Paris (55€)
        $pricing3 = new ZonePricing();
        $pricing3->setFromZone($zonePremium);
        $pricing3->setToZone($zoneParisEntity);
        $pricing3->setPrice('55.00');
        $pricing3->setIsDistanceBased(false);
        $manager->persist($pricing3);

        // Paris to Standard Banlieue (65€)
        $pricing4 = new ZonePricing();
        $pricing4->setFromZone($zoneParisEntity);
        $pricing4->setToZone($zoneStandard);
        $pricing4->setPrice('65.00');
        $pricing4->setIsDistanceBased(false);
        $manager->persist($pricing4);

        // Standard Banlieue to Paris (65€)
        $pricing5 = new ZonePricing();
        $pricing5->setFromZone($zoneStandard);
        $pricing5->setToZone($zoneParisEntity);
        $pricing5->setPrice('65.00');
        $pricing5->setIsDistanceBased(false);
        $manager->persist($pricing5);

        // Premium to Premium (45€)
        $pricing6 = new ZonePricing();
        $pricing6->setFromZone($zonePremium);
        $pricing6->setToZone($zonePremium);
        $pricing6->setPrice('45.00');
        $pricing6->setIsDistanceBased(false);
        $manager->persist($pricing6);

        // Standard to Standard (55€)
        $pricing7 = new ZonePricing();
        $pricing7->setFromZone($zoneStandard);
        $pricing7->setToZone($zoneStandard);
        $pricing7->setPrice('55.00');
        $pricing7->setIsDistanceBased(false);
        $manager->persist($pricing7);

        // Premium to Standard (55€)
        $pricing8 = new ZonePricing();
        $pricing8->setFromZone($zonePremium);
        $pricing8->setToZone($zoneStandard);
        $pricing8->setPrice('55.00');
        $pricing8->setIsDistanceBased(false);
        $manager->persist($pricing8);

        // Standard to Premium (55€)
        $pricing9 = new ZonePricing();
        $pricing9->setFromZone($zoneStandard);
        $pricing9->setToZone($zonePremium);
        $pricing9->setPrice('55.00');
        $pricing9->setIsDistanceBased(false);
        $manager->persist($pricing9);

        // Any zone to Other (distance-based)
        $pricing10 = new ZonePricing();
        $pricing10->setFromZone($zoneParisEntity);
        $pricing10->setToZone($zoneOther);
        $pricing10->setPrice('0.00'); // Not used for distance-based
        $pricing10->setIsDistanceBased(true);
        $pricing10->setBasePrice('30.00');
        $pricing10->setPricePerKm('2.50');
        $manager->persist($pricing10);

        // ========== CREATE TIME-BASED FEES ==========

        // Evening fee: 20h-22h = +15€
        $eveningFee1 = new TimeBasedFee();
        $eveningFee1->setName('Supplément Soirée (20h-22h)');
        $eveningFee1->setStartTime('20:00');
        $eveningFee1->setEndTime('22:00');
        $eveningFee1->setFee('15.00');
        $eveningFee1->setIsActive(true);
        $eveningFee1->setDescription('Supplément de 15€ pour les courses entre 20h et 22h');
        $manager->persist($eveningFee1);

        // Night fee: 22h-05h = +30€
        $nightFee = new TimeBasedFee();
        $nightFee->setName('Supplément Nuit (22h-05h)');
        $nightFee->setStartTime('22:00');
        $nightFee->setEndTime('05:00');
        $nightFee->setFee('30.00');
        $nightFee->setIsActive(true);
        $nightFee->setDescription('Supplément de 30€ pour les courses entre 22h et 05h');
        $manager->persist($nightFee);

        // Early morning fee: 05h-07h = +15€
        $earlyMorningFee = new TimeBasedFee();
        $earlyMorningFee->setName('Supplément Matin Tôt (05h-07h)');
        $earlyMorningFee->setStartTime('05:00');
        $earlyMorningFee->setEndTime('07:00');
        $earlyMorningFee->setFee('15.00');
        $earlyMorningFee->setIsActive(true);
        $earlyMorningFee->setDescription('Supplément de 15€ pour les courses entre 05h et 07h');
        $manager->persist($earlyMorningFee);

        // ========== CREATE PREDEFINED ROUTES ==========
        
        $predefinedRoutes = [
            // Paris intra-muros
            [
                'departure' => 'Champs-Élysées, 75008 Paris',
                'arrival' => 'Tour Eiffel, 75007 Paris',
                'price' => '50.00'
            ],
            [
                'departure' => 'Gare du Nord, 75010 Paris',
                'arrival' => 'Montmartre, 75018 Paris',
                'price' => '50.00'
            ],
            [
                'departure' => 'Bastille, 75011 Paris',
                'arrival' => 'République, 75003 Paris',
                'price' => '50.00'
            ],

            // Paris to Premium Banlieue (55€)
            [
                'departure' => 'Place de la Concorde, 75008 Paris',
                'arrival' => 'Montreuil, 93100',
                'price' => '55.00'
            ],
            [
                'departure' => 'Gare de Lyon, 75012 Paris',
                'arrival' => 'Vincennes, 94300',
                'price' => '55.00'
            ],
            [
                'departure' => 'Montparnasse, 75014 Paris',
                'arrival' => 'Boulogne-Billancourt, 92100',
                'price' => '55.00'
            ],
            [
                'departure' => 'Opéra, 75009 Paris',
                'arrival' => 'Levallois-Perret, 92300',
                'price' => '55.00'
            ],
            [
                'departure' => 'Saint-Lazare, 75008 Paris',
                'arrival' => 'Neuilly-sur-Seine, 92200',
                'price' => '55.00'
            ],

            // Paris to Standard Banlieue (65€)
            [
                'departure' => 'Nation, 75012 Paris',
                'arrival' => 'Saint-Denis, 93200',
                'price' => '65.00'
            ],
            [
                'departure' => 'Porte de Clignancourt, 75018 Paris',
                'arrival' => 'Aubervilliers, 93300',
                'price' => '65.00'
            ],
            [
                'departure' => 'Bercy, 75012 Paris',
                'arrival' => 'Créteil, 94000',
                'price' => '65.00'
            ],
            [
                'departure' => 'Porte d\'Orléans, 75014 Paris',
                'arrival' => 'Nanterre, 92000',
                'price' => '65.00'
            ],
            [
                'departure' => 'Châtelet, 75001 Paris',
                'arrival' => 'Colombes, 92700',
                'price' => '65.00'
            ],

            // Banlieue to Banlieue
            [
                'departure' => 'Neuilly-sur-Seine, 92200',
                'arrival' => 'Levallois-Perret, 92300',
                'price' => '45.00'
            ],
            [
                'departure' => 'Saint-Denis, 93200',
                'arrival' => 'Aubervilliers, 93300',
                'price' => '55.00'
            ],
            [
                'departure' => 'Vincennes, 94300',
                'arrival' => 'Créteil, 94000',
                'price' => '55.00'
            ],

            // Special predefined routes
            [
                'departure' => 'Paris',
                'arrival' => 'La Défense, 92400',
                'price' => '65.00'
            ],
            [
                'departure' => 'Paris',
                'arrival' => 'Aéroport d\'Orly, 94390 Orly',
                'price' => '80.00'
            ],
            [
                'departure' => 'Paris',
                'arrival' => 'Aéroport du Bourget, 93350 Le Bourget',
                'price' => '90.00'
            ],
            [
                'departure' => 'Paris',
                'arrival' => 'Aéroport Charles de Gaulle, 95700 Roissy-en-France',
                'price' => '100.00'
            ],
            
            // Reverse routes (same price)
            [
                'departure' => 'La Défense, 92400',
                'arrival' => 'Paris',
                'price' => '65.00'
            ],
            [
                'departure' => 'Aéroport d\'Orly, 94390 Orly',
                'arrival' => 'Paris',
                'price' => '80.00'
            ],
            [
                'departure' => 'Aéroport du Bourget, 93350 Le Bourget',
                'arrival' => 'Paris',
                'price' => '90.00'
            ],
            [
                'departure' => 'Aéroport Charles de Gaulle, 95700 Roissy-en-France',
                'arrival' => 'Paris',
                'price' => '100.00'
            ],
            
            // Inter-airport and major hub routes
            [
                'departure' => 'La Défense, 92400',
                'arrival' => 'Aéroport d\'Orly, 94390 Orly',
                'price' => '100.00'
            ],
            [
                'departure' => 'Aéroport d\'Orly, 94390 Orly',
                'arrival' => 'La Défense, 92400',
                'price' => '100.00'
            ],
            [
                'departure' => 'La Défense, 92400',
                'arrival' => 'Aéroport Charles de Gaulle, 95700 Roissy-en-France',
                'price' => '110.00'
            ],
            [
                'departure' => 'Aéroport Charles de Gaulle, 95700 Roissy-en-France',
                'arrival' => 'La Défense, 92400',
                'price' => '110.00'
            ],
            [
                'departure' => 'Aéroport d\'Orly, 94390 Orly',
                'arrival' => 'Aéroport Charles de Gaulle, 95700 Roissy-en-France',
                'price' => '130.00'
            ],
            [
                'departure' => 'Aéroport Charles de Gaulle, 95700 Roissy-en-France',
                'arrival' => 'Aéroport d\'Orly, 94390 Orly',
                'price' => '130.00'
            ],
            [
                'departure' => 'Aéroport du Bourget, 93350 Le Bourget',
                'arrival' => 'Aéroport d\'Orly, 94390 Orly',
                'price' => '120.00'
            ],
            [
                'departure' => 'Aéroport d\'Orly, 94390 Orly',
                'arrival' => 'Aéroport du Bourget, 93350 Le Bourget',
                'price' => '120.00'
            ],
        ];

        foreach ($predefinedRoutes as $routeData) {
            $route = new PredefinedRoute();
            $route->setDeparture($routeData['departure']);
            $route->setArrival($routeData['arrival']);
            $route->setPrice($routeData['price']);
            $manager->persist($route);
        }

        $manager->flush();
    }
}
