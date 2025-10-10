<?php

namespace App\Repository;

use App\Entity\ZoneLocation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ZoneLocation>
 */
class ZoneLocationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ZoneLocation::class);
    }

    /**
     * Find all locations grouped by zone
     */
    public function findAllGroupedByZone(): array
    {
        $locations = $this->createQueryBuilder('zl')
            ->join('zl.zone', 'z')
            ->orderBy('z.priority', 'DESC')
            ->addOrderBy('zl.type', 'ASC')
            ->getQuery()
            ->getResult();

        $grouped = [];
        foreach ($locations as $location) {
            $zoneCode = $location->getZone()->getCode();
            if (!isset($grouped[$zoneCode])) {
                $grouped[$zoneCode] = [];
            }
            $grouped[$zoneCode][] = $location;
        }

        return $grouped;
    }
}

