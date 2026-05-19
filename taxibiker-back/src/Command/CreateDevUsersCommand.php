<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-dev-users',
    description: 'Crée un compte admin et un compte client pour le développement local',
)]
class CreateDevUsersCommand extends Command
{
    private const DEV_USERS = [
        [
            'email' => 'admin@taxibikerparis.com',
            'password' => 'Admin@Taxi2026!',
            'firstName' => 'Admin',
            'lastName' => 'Taxi Biker',
            'phone' => '0788268354',
            'roles' => ['ROLE_ADMIN'],
        ],
        [
            'email' => 'client@taxibikerparis.com',
            'password' => 'Client@Taxi2026!',
            'firstName' => 'Client',
            'lastName' => 'Test',
            'phone' => '0612345678',
            'roles' => ['ROLE_USER'],
        ],
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Création des utilisateurs de développement');

        foreach (self::DEV_USERS as $data) {
            $user = $this->userRepository->findOneBy(['email' => $data['email']]);

            if ($user) {
                $user
                    ->setFirstName($data['firstName'])
                    ->setLastName($data['lastName'])
                    ->setPhoneNumber($data['phone'])
                    ->setRoles($data['roles'])
                    ->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
                $action = 'mis à jour';
            } else {
                $user = new User();
                $user
                    ->setEmail($data['email'])
                    ->setFirstName($data['firstName'])
                    ->setLastName($data['lastName'])
                    ->setPhoneNumber($data['phone'])
                    ->setRoles($data['roles'])
                    ->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
                $this->entityManager->persist($user);
                $action = 'créé';
            }

            $io->writeln(sprintf(
                '  • %s (%s) — %s',
                $data['email'],
                in_array('ROLE_ADMIN', $data['roles'], true) ? 'admin' : 'client',
                $action
            ));
        }

        $this->entityManager->flush();

        $io->success('Comptes prêts. Identifiants affichés ci-dessus dans la documentation.');

        return Command::SUCCESS;
    }
}
