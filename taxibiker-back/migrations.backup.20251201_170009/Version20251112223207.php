<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251112223207 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user ADD COLUMN current_credit NUMERIC(10, 2) DEFAULT \'0.00\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TEMPORARY TABLE __temp__user AS SELECT id, first_name, last_name, email, phone_number, password, roles, monthly_credit_enabled FROM "user"');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('CREATE TABLE "user" (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, phone_number VARCHAR(100) NOT NULL, password VARCHAR(255) NOT NULL, roles CLOB NOT NULL --(DC2Type:json)
        , monthly_credit_enabled BOOLEAN DEFAULT 0 NOT NULL)');
        $this->addSql('INSERT INTO "user" (id, first_name, last_name, email, phone_number, password, roles, monthly_credit_enabled) SELECT id, first_name, last_name, email, phone_number, password, roles, monthly_credit_enabled FROM __temp__user');
        $this->addSql('DROP TABLE __temp__user');
    }
}
