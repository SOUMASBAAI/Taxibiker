<?php

namespace App\Repository;

use App\Entity\CreditRegularization;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CreditRegularization>
 */
class CreditRegularizationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CreditRegularization::class);
    }

    /**
     * Trouve toutes les régularisations pour un utilisateur
     */
    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('cr')
            ->andWhere('cr.user = :user')
            ->setParameter('user', $user)
            ->orderBy('cr.regularizedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Vérifie si un mois spécifique a été régularisé pour un utilisateur
     */
    public function isMonthRegularized(User $user, string $month): bool
    {
        $result = $this->createQueryBuilder('cr')
            ->select('COUNT(cr.id)')
            ->andWhere('cr.user = :user')
            ->andWhere('cr.month = :month')
            ->setParameter('user', $user)
            ->setParameter('month', $month)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Trouve les mois régularisés pour un utilisateur
     */
    public function getRegularizedMonths(User $user): array
    {
        return $this->createQueryBuilder('cr')
            ->select('cr.month')
            ->andWhere('cr.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getArrayResult();
    }
}
