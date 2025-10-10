<?php

namespace App\Repository;

use App\Entity\Zone;
use App\Entity\ZonePricing;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ZonePricing>
 */
class ZonePricingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ZonePricing::class);
    }

    /**
     * Find price for a specific zone combination
     */
    public function findPriceForZones(Zone $fromZone, Zone $toZone): ?ZonePricing
    {
        return $this->createQueryBuilder('zp')
            ->where('zp.fromZone = :fromZone')
            ->andWhere('zp.toZone = :toZone')
            ->setParameter('fromZone', $fromZone)
            ->setParameter('toZone', $toZone)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Find all pricing rules as a matrix
     */
    public function findAllAsMatrix(): array
    {
        $pricings = $this->createQueryBuilder('zp')
            ->join('zp.fromZone', 'fz')
            ->join('zp.toZone', 'tz')
            ->getQuery()
            ->getResult();

        $matrix = [];
        foreach ($pricings as $pricing) {
            $fromCode = $pricing->getFromZone()->getCode();
            $toCode = $pricing->getToZone()->getCode();
            
            if (!isset($matrix[$fromCode])) {
                $matrix[$fromCode] = [];
            }
            $matrix[$fromCode][$toCode] = $pricing;
        }

        return $matrix;
    }
}

