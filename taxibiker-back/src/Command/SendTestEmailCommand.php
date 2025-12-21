<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[AsCommand(
    name: 'app:send-test-email',
    description: 'Envoie un email de test simple'
)]
class SendTestEmailCommand extends Command
{
    public function __construct(
        private MailerInterface $mailer
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Adresse email de destination')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $toEmail = $input->getArgument('email');

        $io->title('Test d\'envoi email direct avec Hostinger');

        try {
            $email = (new Email())
                ->from('contact@taxibikerparis.com')
                ->to($toEmail)
                ->subject('🚕 Test TaxiBiker - Configuration Email')
                ->html('
                    <h1>Test de configuration email</h1>
                    <p>Bonjour,</p>
                    <p>Ceci est un email de test pour vérifier la configuration Hostinger de TaxiBiker.</p>
                    <p>Si vous recevez cet email, la configuration fonctionne parfaitement !</p>
                    <hr>
                    <p><strong>TaxiBiker Paris</strong><br>
                    Service de transport professionnel</p>
                ')
                ->text('
Test de configuration email TaxiBiker

Bonjour,

Ceci est un email de test pour vérifier la configuration Hostinger de TaxiBiker.
Si vous recevez cet email, la configuration fonctionne parfaitement !

TaxiBiker Paris
Service de transport professionnel
                ');

            $io->info('📧 Envoi de l\'email en cours...');
            
            $this->mailer->send($email);
            
            $io->success('✅ Email envoyé avec succès !');
            $io->note([
                'Email envoyé de : contact@taxibikerparis.com',
                'Email envoyé vers : ' . $toEmail,
                'Vérifiez votre boîte email (y compris les spams)'
            ]);

        } catch (\Exception $e) {
            $io->error('❌ Erreur lors de l\'envoi : ' . $e->getMessage());
            
            $io->section('Détails de l\'erreur');
            $io->text([
                'Type d\'erreur : ' . get_class($e),
                'Message : ' . $e->getMessage(),
                'Fichier : ' . $e->getFile() . ':' . $e->getLine()
            ]);
            
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}

