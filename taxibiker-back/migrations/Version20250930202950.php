<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250930202950 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE classic_reservation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, client_id INTEGER NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, excess_baggage BOOLEAN NOT NULL, price NUMERIC(5, 2) NOT NULL, stop VARCHAR(255) DEFAULT NULL, statut VARCHAR(255) NOT NULL, CONSTRAINT FK_A3EB4EE19EB6921 FOREIGN KEY (client_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_A3EB4EE19EB6921 ON classic_reservation (client_id)');
        $this->addSql('CREATE TABLE flat_rate_booking (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, client_id INTEGER NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, number_of_hours INTEGER NOT NULL, excess_baggage BOOLEAN NOT NULL, price NUMERIC(5, 2) NOT NULL, statut VARCHAR(255) NOT NULL, CONSTRAINT FK_E4BA6BB519EB6921 FOREIGN KEY (client_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_E4BA6BB519EB6921 ON flat_rate_booking (client_id)');
        $this->addSql('CREATE TABLE notification (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, message VARCHAR(255) NOT NULL, statut VARCHAR(255) NOT NULL)');
        $this->addSql('CREATE TABLE predefined_reservation (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, client_id INTEGER NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, price NUMERIC(5, 2) NOT NULL, excess_baggage BOOLEAN NOT NULL, statut VARCHAR(255) NOT NULL, stop VARCHAR(255) DEFAULT NULL, CONSTRAINT FK_346F7DF719EB6921 FOREIGN KEY (client_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_346F7DF719EB6921 ON predefined_reservation (client_id)');
        $this->addSql('CREATE TABLE predefined_route (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, price NUMERIC(5, 2) NOT NULL)');
        $this->addSql('CREATE TABLE rate (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, night_rate NUMERIC(5, 2) NOT NULL, weekend_rate NUMERIC(5, 2) NOT NULL, excess_baggage NUMERIC(5, 2) NOT NULL, holyday NUMERIC(5, 2) NOT NULL, tds NUMERIC(5, 2) NOT NULL, stop NUMERIC(5, 2) NOT NULL, kilometer NUMERIC(5, 2) NOT NULL)');
        $this->addSql('CREATE TABLE "user" (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, phone_number VARCHAR(100) NOT NULL, password VARCHAR(255) NOT NULL, roles CLOB NOT NULL --(DC2Type:json)
        )');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE classic_reservation');
        $this->addSql('DROP TABLE flat_rate_booking');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE predefined_reservation');
        $this->addSql('DROP TABLE predefined_route');
        $this->addSql('DROP TABLE rate');
        $this->addSql('DROP TABLE "user"');
    }
}
