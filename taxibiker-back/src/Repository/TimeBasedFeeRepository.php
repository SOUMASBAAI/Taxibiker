<?php

namespace App\Repository;

use App\Entity\TimeBasedFee;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TimeBasedFee>
 */
class TimeBasedFeeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TimeBasedFee::class);
    }

    /**
     * Find all active time-based fees
     */
    public function findAllActive(): array
    {
        return $this->createQueryBuilder('tbf')
            ->where('tbf.isActive = :active')
            ->setParameter('active', true)
            ->orderBy('tbf.startTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find applicable fee for a specific time
     */
    public function findFeeForTime(\DateTimeInterface $dateTime): ?TimeBasedFee
    {
        $time = $dateTime->format('H:i');
        
        $fees = $this->findAllActive();
        
        foreach ($fees as $fee) {
            if ($this->isTimeInRange($time, $fee->getStartTime(), $fee->getEndTime())) {
                return $fee;
            }
        }
        
        return null;
    }

    /**
     * Check if time is within range (handles overnight ranges)
     */
    private function isTimeInRange(string $time, string $startTime, string $endTime): bool
    {
        // Convert times to minutes for easier comparison
        $timeMinutes = $this->timeToMinutes($time);
        $startMinutes = $this->timeToMinutes($startTime);
        $endMinutes = $this->timeToMinutes($endTime);
        
        // Handle overnight ranges (e.g., 22:00 to 05:00)
        if ($endMinutes < $startMinutes) {
            // Time range crosses midnight
            return $timeMinutes >= $startMinutes || $timeMinutes < $endMinutes;
        }
        
        // Normal range (e.g., 20:00 to 22:00)
        return $timeMinutes >= $startMinutes && $timeMinutes < $endMinutes;
    }

    /**
     * Convert HH:MM to minutes
     */
    private function timeToMinutes(string $time): int
    {
        list($hours, $minutes) = explode(':', $time);
        return (int)$hours * 60 + (int)$minutes;
    }
}

