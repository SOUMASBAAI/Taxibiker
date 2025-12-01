<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251116154806 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE classic_reservation ADD COLUMN payment_method VARCHAR(50) DEFAULT \'immediate\' NOT NULL');
        $this->addSql('ALTER TABLE flat_rate_booking ADD COLUMN payment_method VARCHAR(50) DEFAULT \'immediate\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__classic_reservation AS SELECT id, client_id, date, departure, arrival, excess_baggage, price, stop, statut FROM classic_reservation');
        $this->addSql('DROP TABLE classic_reservation');
        $this->addSql('CREATE TABLE classic_reservation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, client_id INTEGER NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, excess_baggage BOOLEAN NOT NULL, price NUMERIC(5, 2) NOT NULL, stop VARCHAR(255) DEFAULT NULL, statut VARCHAR(255) NOT NULL, CONSTRAINT FK_A3EB4EE19EB6921 FOREIGN KEY (client_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO classic_reservation (id, client_id, date, departure, arrival, excess_baggage, price, stop, statut) SELECT id, client_id, date, departure, arrival, excess_baggage, price, stop, statut FROM __temp__classic_reservation');
        $this->addSql('DROP TABLE __temp__classic_reservation');
        $this->addSql('CREATE INDEX IDX_A3EB4EE19EB6921 ON classic_reservation (client_id)');
        $this->addSql('CREATE TEMPORARY TABLE __temp__flat_rate_booking AS SELECT id, client_id, date, departure, arrival, number_of_hours, excess_baggage, price, statut FROM flat_rate_booking');
        $this->addSql('DROP TABLE flat_rate_booking');
        $this->addSql('CREATE TABLE flat_rate_booking (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, client_id INTEGER NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, number_of_hours INTEGER NOT NULL, excess_baggage BOOLEAN NOT NULL, price NUMERIC(5, 2) NOT NULL, statut VARCHAR(255) NOT NULL, CONSTRAINT FK_E4BA6BB519EB6921 FOREIGN KEY (client_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('INSERT INTO flat_rate_booking (id, client_id, date, departure, arrival, number_of_hours, excess_baggage, price, statut) SELECT id, client_id, date, departure, arrival, number_of_hours, excess_baggage, price, statut FROM __temp__flat_rate_booking');
        $this->addSql('DROP TABLE __temp__flat_rate_booking');
        $this->addSql('CREATE INDEX IDX_E4BA6BB519EB6921 ON flat_rate_booking (client_id)');
    }
}
