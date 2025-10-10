<?php

namespace App\Command;

use App\Service\ZonePricingService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-pricing',
    description: 'Test the zone-based pricing system',
)]
class TestPricingCommand extends Command
{
    private ZonePricingService $zonePricingService;

    public function __construct(ZonePricingService $zonePricingService)
    {
        parent::__construct();
        $this->zonePricingService = $zonePricingService;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Zone-Based Pricing System Test');

        // Test cases
        $testCases = [
            [
                'name' => 'Paris to Paris',
                'departure' => 'Champs-Élysées, 75008 Paris',
                'arrival' => 'Tour Eiffel, 75007 Paris',
                'expected' => 50.00
            ],
            [
                'name' => 'Paris to Premium Banlieue',
                'departure' => 'Gare de Lyon, 75012 Paris',
                'arrival' => 'Vincennes, 94300',
                'expected' => 65.00
            ],
            [
                'name' => 'Paris to Standard Banlieue',
                'departure' => 'Nation, 75012 Paris',
                'arrival' => 'Montreuil, 93100',
                'expected' => 55.00
            ],
            [
                'name' => 'Premium to Premium Banlieue',
                'departure' => 'Neuilly-sur-Seine, 92200',
                'arrival' => 'Levallois-Perret, 92300',
                'expected' => 45.00
            ],
            [
                'name' => 'Standard to Standard Banlieue',
                'departure' => 'Montreuil, 93100',
                'arrival' => 'Saint-Denis, 93200',
                'expected' => 40.00
            ],
            [
                'name' => 'Premium to Standard Banlieue',
                'departure' => 'Vincennes, 94300',
                'arrival' => 'Créteil, 94000',
                'expected' => 50.00
            ],
            [
                'name' => 'Distance-based (Other zones)',
                'departure' => 'Paris 75001',
                'arrival' => 'Versailles, 78000',
                'distance' => 18.0,
                'expected' => 75.00 // 30 + (18 * 2.50)
            ],
        ];

        $io->section('Running Test Cases');

        $passed = 0;
        $failed = 0;

        foreach ($testCases as $test) {
            $result = $this->zonePricingService->calculatePrice(
                $test['departure'],
                $test['arrival'],
                $test['distance'] ?? null
            );

            $price = $result['price'];
            $success = abs($price - $test['expected']) < 0.01;

            if ($success) {
                $io->success(sprintf(
                    '✓ %s: %.2f€ (Expected: %.2f€) - Zones: %s → %s',
                    $test['name'],
                    $price,
                    $test['expected'],
                    $result['departureZone'],
                    $result['arrivalZone']
                ));
                $passed++;
            } else {
                $io->error(sprintf(
                    '✗ %s: %.2f€ (Expected: %.2f€) - Zones: %s → %s',
                    $test['name'],
                    $price,
                    $test['expected'],
                    $result['departureZone'],
                    $result['arrivalZone']
                ));
                $failed++;
            }
        }

        $io->section('Test Summary');
        $io->text([
            sprintf('Total tests: %d', count($testCases)),
            sprintf('Passed: %d', $passed),
            sprintf('Failed: %d', $failed),
        ]);

        // Display zones info
        $io->section('Zone Configuration');
        $zonesInfo = $this->zonePricingService->getZonesInfo();
        
        $io->text('Available Zones:');
        foreach ($zonesInfo['zones'] as $zoneKey => $zone) {
            $io->text(sprintf('  - %s: %s', $zoneKey, $zone['name']));
        }

        $io->text('');
        $io->text('Pricing Table:');
        foreach ($zonesInfo['pricing'] as $route => $price) {
            $io->text(sprintf('  - %s: %.2f€', str_replace('_', ' ', $route), $price));
        }

        return $failed === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}

