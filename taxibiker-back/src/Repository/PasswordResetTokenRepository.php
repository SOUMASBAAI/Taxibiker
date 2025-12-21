<?php

namespace App\Repository;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PasswordResetToken>
 */
class PasswordResetTokenRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PasswordResetToken::class);
    }

    /**
     * Trouve un token valide par sa valeur
     */
    public function findValidToken(string $token): ?PasswordResetToken
    {
        return $this->createQueryBuilder('prt')
            ->where('prt.token = :token')
            ->andWhere('prt.used = false')
            ->andWhere('prt.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Supprime les tokens expirés ou utilisés
     */
    public function cleanupExpiredTokens(): int
    {
        return $this->createQueryBuilder('prt')
            ->delete()
            ->where('prt.expiresAt < :now OR prt.used = true')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }

    /**
     * Supprime tous les tokens existants pour un utilisateur
     */
    public function deleteUserTokens(User $user): int
    {
        return $this->createQueryBuilder('prt')
            ->delete()
            ->where('prt.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->execute();
    }

    /**
     * Compte les tokens actifs pour un utilisateur
     */
    public function countActiveTokensForUser(User $user): int
    {
        return $this->createQueryBuilder('prt')
            ->select('COUNT(prt.id)')
            ->where('prt.user = :user')
            ->andWhere('prt.used = false')
            ->andWhere('prt.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getSingleScalarResult();
    }
}

