<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251007221745 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE time_based_fee (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(255) NOT NULL, start_time VARCHAR(5) NOT NULL, end_time VARCHAR(5) NOT NULL, fee NUMERIC(10, 2) NOT NULL, is_active BOOLEAN NOT NULL, description VARCHAR(500) DEFAULT NULL)');
        $this->addSql('CREATE TABLE zone (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(500) DEFAULT NULL, priority INTEGER NOT NULL)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_A0EBC00777153098 ON zone (code)');
        $this->addSql('CREATE TABLE zone_location (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, zone_id INTEGER NOT NULL, value VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, CONSTRAINT FK_762205569F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_762205569F2C3FAB ON zone_location (zone_id)');
        $this->addSql('CREATE TABLE zone_pricing (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, from_zone_id INTEGER NOT NULL, to_zone_id INTEGER NOT NULL, price NUMERIC(10, 2) NOT NULL, base_price NUMERIC(10, 2) DEFAULT NULL, price_per_km NUMERIC(10, 2) DEFAULT NULL, is_distance_based BOOLEAN NOT NULL, CONSTRAINT FK_5BC5AF0B1972DC04 FOREIGN KEY (from_zone_id) REFERENCES zone (id) NOT DEFERRABLE INITIALLY IMMEDIATE, CONSTRAINT FK_5BC5AF0B11B4025E FOREIGN KEY (to_zone_id) REFERENCES zone (id) NOT DEFERRABLE INITIALLY IMMEDIATE)');
        $this->addSql('CREATE INDEX IDX_5BC5AF0B1972DC04 ON zone_pricing (from_zone_id)');
        $this->addSql('CREATE INDEX IDX_5BC5AF0B11B4025E ON zone_pricing (to_zone_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE time_based_fee');
        $this->addSql('DROP TABLE zone');
        $this->addSql('DROP TABLE zone_location');
        $this->addSql('DROP TABLE zone_pricing');
    }
}
