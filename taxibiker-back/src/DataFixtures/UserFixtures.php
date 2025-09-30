<?php

namespace App\DataFixtures;

use App\Entity\User;
use Faker\Factory;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create('fr_FR');

        // Admin user
        $admin = new User();
        $admin
            ->setEmail('soumiaasbaai@gmail.com')
            ->setPhoneNumber($faker->phoneNumber())
            ->setFirstName('Admin')
            ->setLastName('User')
            ->setPassword($this->hasher->hashPassword($admin, 'adminpass'))
            ->setRoles(['ROLE_ADMIN']);

        $manager->persist($admin);
        $this->addReference('user-admin', $admin);

        // Utilisateur personnalisé "DIDA SKIN"
        $yourUser = new User();
        $yourUser
            ->setFirstName("soumia")
            ->setLastName("asbaai")
            ->setEmail("soumya.ould@gmail.com")
            ->setPhoneNumber("0123456789")
            ->setPassword($this->hasher->hashPassword($yourUser, 'userpass'))
            ->setRoles(['ROLE_USER']);

        $manager->persist($yourUser);
        $this->addReference('user-dida', $yourUser);

        // 69 users simples
        for ($i = 0; $i < 69; $i++) {
            $user = new User();
            $user
                ->setEmail($faker->unique()->safeEmail())
                ->setPhoneNumber($faker->phoneNumber())
                ->setFirstName($faker->firstName())
                ->setLastName($faker->lastName())
                ->setPassword($this->hasher->hashPassword($user, 'userpass'))
                ->setRoles(['ROLE_USER']);

            $manager->persist($user);
            $this->addReference('user-' . $i, $user);
        }

        $manager->flush();
    }
}
