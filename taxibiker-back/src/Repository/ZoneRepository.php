<?php

namespace App\Repository;

use App\Entity\Zone;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Zone>
 */
class ZoneRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Zone::class);
    }

    /**
     * Find all zones ordered by priority (higher priority first)
     */
    public function findAllOrderedByPriority(): array
    {
        return $this->createQueryBuilder('z')
            ->orderBy('z.priority', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Find zone by code
     */
    public function findByCode(string $code): ?Zone
    {
        return $this->findOneBy(['code' => $code]);
    }
}

