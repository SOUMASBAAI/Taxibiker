<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Mailer\MailerInterface;

#[AsCommand(
    name: 'app:debug-email',
    description: 'Debug de la configuration email'
)]
class DebugEmailCommand extends Command
{
    public function __construct(
        private ?MailerInterface $mailer,
        private ParameterBagInterface $parameterBag
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Debug Configuration Email TaxiBiker');

        // Vérifier si le mailer est disponible
        $io->section('Service Mailer');
        if ($this->mailer) {
            $io->success('✅ MailerInterface est disponible');
        } else {
            $io->error('❌ MailerInterface n\'est pas disponible');
        }

        // Vérifier les paramètres
        $io->section('Configuration MAILER_DSN');
        
        try {
            $mailerDsn = $this->parameterBag->get('mailer.dsn');
            $io->info('Configuration trouvée : ' . $mailerDsn);
            
            if (str_contains($mailerDsn, 'hostinger')) {
                $io->success('✅ Configuration Hostinger détectée');
            } else {
                $io->warning('⚠️ Configuration non-Hostinger : ' . $mailerDsn);
            }
        } catch (\Exception $e) {
            $io->error('❌ Erreur récupération paramètre mailer.dsn : ' . $e->getMessage());
        }

        // Vérifier les variables d'environnement
        $io->section('Variables d\'environnement');
        
        $envVars = [
            'APP_ENV' => $_ENV['APP_ENV'] ?? 'non défini',
            'MAILER_DSN' => $_ENV['MAILER_DSN'] ?? 'non défini'
        ];
        
        $io->table(['Variable', 'Valeur'], array_map(
            fn($key, $value) => [$key, $value],
            array_keys($envVars),
            array_values($envVars)
        ));

        // Test de création d'email simple
        $io->section('Test création Email');
        
        try {
            $email = (new \Symfony\Component\Mime\Email())
                ->from('contact@taxibikerparis.com')
                ->to('test@example.com')
                ->subject('Test TaxiBiker')
                ->text('Ceci est un test');
                
            $io->success('✅ Création d\'email réussie');
            $io->info('From: ' . $email->getFrom()[0]->toString());
            $io->info('To: ' . $email->getTo()[0]->toString());
            $io->info('Subject: ' . $email->getSubject());
        } catch (\Exception $e) {
            $io->error('❌ Erreur création email : ' . $e->getMessage());
        }

        return Command::SUCCESS;
    }
}

