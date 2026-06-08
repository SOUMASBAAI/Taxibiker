<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260608212800 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute le champ notes sur les réservations classiques et horaires';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE classic_reservation ADD notes LONGTEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE flat_rate_booking ADD notes LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE classic_reservation DROP notes');
        $this->addSql('ALTER TABLE flat_rate_booking DROP notes');
    }
}
