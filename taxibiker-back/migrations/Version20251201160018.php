<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251201160018 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE classic_reservation (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, excess_baggage TINYINT(1) NOT NULL, price NUMERIC(5, 2) NOT NULL, stop VARCHAR(255) DEFAULT NULL, statut VARCHAR(255) NOT NULL, payment_method VARCHAR(50) DEFAULT \'immediate\' NOT NULL, INDEX IDX_A3EB4EE19EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE credit_regularization (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, amount NUMERIC(10, 2) NOT NULL, regularized_at DATETIME NOT NULL, month VARCHAR(7) NOT NULL, notes LONGTEXT DEFAULT NULL, INDEX IDX_786A069FA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE flat_rate_booking (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, number_of_hours INT NOT NULL, excess_baggage TINYINT(1) NOT NULL, price NUMERIC(5, 2) NOT NULL, statut VARCHAR(255) NOT NULL, payment_method VARCHAR(50) DEFAULT \'immediate\' NOT NULL, INDEX IDX_E4BA6BB519EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, message VARCHAR(255) NOT NULL, statut VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE predefined_reservation (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, price NUMERIC(5, 2) NOT NULL, excess_baggage TINYINT(1) NOT NULL, statut VARCHAR(255) NOT NULL, stop VARCHAR(255) DEFAULT NULL, INDEX IDX_346F7DF719EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE predefined_route (id INT AUTO_INCREMENT NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, price NUMERIC(5, 2) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE rate (id INT AUTO_INCREMENT NOT NULL, night_rate NUMERIC(5, 2) NOT NULL, weekend_rate NUMERIC(5, 2) NOT NULL, excess_baggage NUMERIC(5, 2) NOT NULL, holyday NUMERIC(5, 2) NOT NULL, tds NUMERIC(5, 2) NOT NULL, stop NUMERIC(5, 2) NOT NULL, kilometer NUMERIC(5, 2) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE time_based_fee (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, start_time VARCHAR(5) NOT NULL, end_time VARCHAR(5) NOT NULL, fee NUMERIC(10, 2) NOT NULL, is_active TINYINT(1) NOT NULL, description VARCHAR(500) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, phone_number VARCHAR(100) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL COMMENT \'(DC2Type:json)\', monthly_credit_enabled TINYINT(1) DEFAULT 0 NOT NULL, current_credit NUMERIC(10, 2) DEFAULT \'0.00\' NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE zone (id INT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(500) DEFAULT NULL, priority INT NOT NULL, UNIQUE INDEX UNIQ_A0EBC00777153098 (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE zone_location (id INT AUTO_INCREMENT NOT NULL, zone_id INT NOT NULL, value VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, INDEX IDX_762205569F2C3FAB (zone_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE zone_pricing (id INT AUTO_INCREMENT NOT NULL, from_zone_id INT NOT NULL, to_zone_id INT NOT NULL, price NUMERIC(10, 2) NOT NULL, base_price NUMERIC(10, 2) DEFAULT NULL, price_per_km NUMERIC(10, 2) DEFAULT NULL, is_distance_based TINYINT(1) NOT NULL, INDEX IDX_5BC5AF0B1972DC04 (from_zone_id), INDEX IDX_5BC5AF0B11B4025E (to_zone_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE classic_reservation ADD CONSTRAINT FK_A3EB4EE19EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE credit_regularization ADD CONSTRAINT FK_786A069FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE flat_rate_booking ADD CONSTRAINT FK_E4BA6BB519EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE predefined_reservation ADD CONSTRAINT FK_346F7DF719EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE zone_location ADD CONSTRAINT FK_762205569F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id)');
        $this->addSql('ALTER TABLE zone_pricing ADD CONSTRAINT FK_5BC5AF0B1972DC04 FOREIGN KEY (from_zone_id) REFERENCES zone (id)');
        $this->addSql('ALTER TABLE zone_pricing ADD CONSTRAINT FK_5BC5AF0B11B4025E FOREIGN KEY (to_zone_id) REFERENCES zone (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE classic_reservation DROP FOREIGN KEY FK_A3EB4EE19EB6921');
        $this->addSql('ALTER TABLE credit_regularization DROP FOREIGN KEY FK_786A069FA76ED395');
        $this->addSql('ALTER TABLE flat_rate_booking DROP FOREIGN KEY FK_E4BA6BB519EB6921');
        $this->addSql('ALTER TABLE predefined_reservation DROP FOREIGN KEY FK_346F7DF719EB6921');
        $this->addSql('ALTER TABLE zone_location DROP FOREIGN KEY FK_762205569F2C3FAB');
        $this->addSql('ALTER TABLE zone_pricing DROP FOREIGN KEY FK_5BC5AF0B1972DC04');
        $this->addSql('ALTER TABLE zone_pricing DROP FOREIGN KEY FK_5BC5AF0B11B4025E');
        $this->addSql('DROP TABLE classic_reservation');
        $this->addSql('DROP TABLE credit_regularization');
        $this->addSql('DROP TABLE flat_rate_booking');
        $this->addSql('DROP TABLE notification');
        $this->addSql('DROP TABLE predefined_reservation');
        $this->addSql('DROP TABLE predefined_route');
        $this->addSql('DROP TABLE rate');
        $this->addSql('DROP TABLE time_based_fee');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE zone');
        $this->addSql('DROP TABLE zone_location');
        $this->addSql('DROP TABLE zone_pricing');
    }
}
