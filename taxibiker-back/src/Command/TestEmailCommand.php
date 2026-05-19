<?php

namespace App\Command;

use App\Service\EmailService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-email',
    description: 'Test l\'envoi d\'email de réinitialisation de mot de passe'
)]
class TestEmailCommand extends Command
{
    public function __construct(
        private EmailService $emailService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Adresse email de test')
            ->addArgument('firstname', InputArgument::OPTIONAL, 'Prénom de test', 'Test')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $firstname = $input->getArgument('firstname');

        $io->title('Test d\'envoi d\'email Taxi Biker Paris');

        // Générer un token de test
        $testToken = bin2hex(random_bytes(32));

        $io->section('Informations du test');
        $io->table(
            ['Paramètre', 'Valeur'],
            [
                ['Email destinataire', $email],
                ['Prénom', $firstname],
                ['Token de test', substr($testToken, 0, 20) . '...'],
                ['Environnement', $_ENV['APP_ENV'] ?? 'dev']
            ]
        );

        $io->section('Envoi de l\'email de réinitialisation');

        try {
            $result = $this->emailService->sendPasswordResetEmail($email, $firstname, $testToken);

            if ($result) {
                $io->success('✅ Email envoyé avec succès !');
                $io->note([
                    'Vérifiez votre boîte email (y compris les spams)',
                    'Le lien de test pointe vers : ' . ($_ENV['APP_ENV'] === 'prod' ? 'https://taxibikerparis.com' : 'http://localhost:5173') . '/reset-password?token=' . $testToken
                ]);
            } else {
                $io->error('❌ Échec de l\'envoi de l\'email');
                $io->note('Vérifiez les logs pour plus de détails');
            }

        } catch (\Exception $e) {
            $io->error('❌ Erreur lors de l\'envoi : ' . $e->getMessage());
            return Command::FAILURE;
        }

        $io->section('Test de confirmation de changement de mot de passe');

        try {
            $result = $this->emailService->sendPasswordChangedConfirmation($email, $firstname);

            if ($result) {
                $io->success('✅ Email de confirmation envoyé avec succès !');
            } else {
                $io->error('❌ Échec de l\'envoi de l\'email de confirmation');
            }

        } catch (\Exception $e) {
            $io->error('❌ Erreur lors de l\'envoi de confirmation : ' . $e->getMessage());
        }

        $io->section('Configuration SMTP détectée');
        
        $mailerDsn = $_ENV['MAILER_DSN'] ?? 'Non configuré';
        if (str_contains($mailerDsn, 'hostinger')) {
            $io->info('🏢 Configuration Hostinger détectée');
        } elseif (str_contains($mailerDsn, 'gmail')) {
            $io->info('📧 Configuration Gmail détectée');
        } else {
            $io->warning('⚠️  Configuration SMTP : ' . $mailerDsn);
        }

        return Command::SUCCESS;
    }
}

