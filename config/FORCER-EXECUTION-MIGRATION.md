# 🔧 Forcer l'Exécution de la Migration

## 📋 Problème

La migration `Version20251201160018.php` contient toutes les tables mais ne s'exécute pas automatiquement.

## ✅ Solution : Forcer l'exécution

### Étape 1 : Vérifier les erreurs PHP

Exécutez cette commande pour voir les erreurs :

```bash
cd public_html/api
php -r "echo 'PHP Version: ' . PHP_VERSION . PHP_EOL;"
php bin/console --version
```

### Étape 2 : Vérifier la connexion à la base de données

```bash
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1
```

### Étape 3 : Vérifier le statut avec affichage des erreurs

```bash
php bin/console doctrine:migrations:status --env=prod 2>&1 | head -20
```

### Étape 4 : Forcer l'exécution avec affichage complet

```bash
php bin/console doctrine:migrations:migrate --no-interaction --env=prod --verbose 2>&1
```

### Étape 5 : Si ça ne fonctionne toujours pas, exécutez la migration manuellement

**Option A : Créer la table de suivi manuellement**

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

Entrez le mot de passe : `Soumia123!`

Puis dans MySQL :

```sql
CREATE TABLE IF NOT EXISTS doctrine_migration_versions (
    version VARCHAR(1024) NOT NULL,
    executed_at DATETIME NOT NULL,
    execution_time INT NOT NULL,
    PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Quittez : `exit`

**Option B : Exécuter le SQL directement**

Récupérez le SQL de la migration et exécutez-le directement :

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod < migration.sql
```

Ou exécutez ligne par ligne dans MySQL.

### Étape 6 : Vérifier les logs

```bash
tail -n 50 var/log/prod.log
cat var/log/prod.log | grep -i error | tail -20
```

## 🔧 Solution Alternative : Exécuter le SQL manuellement

Si Doctrine ne fonctionne pas, vous pouvez exécuter le SQL directement.

### Créer un fichier SQL temporaire

```bash
cat > /tmp/migration.sql << 'EOF'
CREATE TABLE classic_reservation (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, excess_baggage TINYINT(1) NOT NULL, price NUMERIC(5, 2) NOT NULL, stop VARCHAR(255) DEFAULT NULL, statut VARCHAR(255) NOT NULL, payment_method VARCHAR(50) DEFAULT 'immediate' NOT NULL, INDEX IDX_A3EB4EE19EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE credit_regularization (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, amount NUMERIC(10, 2) NOT NULL, regularized_at DATETIME NOT NULL, month VARCHAR(7) NOT NULL, notes LONGTEXT DEFAULT NULL, INDEX IDX_786A069FA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE flat_rate_booking (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, number_of_hours INT NOT NULL, excess_baggage TINYINT(1) NOT NULL, price NUMERIC(5, 2) NOT NULL, statut VARCHAR(255) NOT NULL, payment_method VARCHAR(50) DEFAULT 'immediate' NOT NULL, INDEX IDX_E4BA6BB519EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE notification (id INT AUTO_INCREMENT NOT NULL, message VARCHAR(255) NOT NULL, statut VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE predefined_reservation (id INT AUTO_INCREMENT NOT NULL, client_id INT NOT NULL, date DATETIME NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, price NUMERIC(5, 2) NOT NULL, excess_baggage TINYINT(1) NOT NULL, statut VARCHAR(255) NOT NULL, stop VARCHAR(255) DEFAULT NULL, INDEX IDX_346F7DF719EB6921 (client_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE predefined_route (id INT AUTO_INCREMENT NOT NULL, departure VARCHAR(255) NOT NULL, arrival VARCHAR(255) NOT NULL, price NUMERIC(5, 2) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE rate (id INT AUTO_INCREMENT NOT NULL, night_rate NUMERIC(5, 2) NOT NULL, weekend_rate NUMERIC(5, 2) NOT NULL, excess_baggage NUMERIC(5, 2) NOT NULL, holyday NUMERIC(5, 2) NOT NULL, tds NUMERIC(5, 2) NOT NULL, stop NUMERIC(5, 2) NOT NULL, kilometer NUMERIC(5, 2) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE time_based_fee (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, start_time VARCHAR(5) NOT NULL, end_time VARCHAR(5) NOT NULL, fee NUMERIC(10, 2) NOT NULL, is_active TINYINT(1) NOT NULL, description VARCHAR(500) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, phone_number VARCHAR(100) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL COMMENT '(DC2Type:json)', monthly_credit_enabled TINYINT(1) DEFAULT 0 NOT NULL, current_credit NUMERIC(10, 2) DEFAULT '0.00' NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE zone (id INT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(500) DEFAULT NULL, priority INT NOT NULL, UNIQUE INDEX UNIQ_A0EBC00777153098 (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE zone_location (id INT AUTO_INCREMENT NOT NULL, zone_id INT NOT NULL, value VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, INDEX IDX_762205569F2C3FAB (zone_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE zone_pricing (id INT AUTO_INCREMENT NOT NULL, from_zone_id INT NOT NULL, to_zone_id INT NOT NULL, price NUMERIC(10, 2) NOT NULL, base_price NUMERIC(10, 2) DEFAULT NULL, price_per_km NUMERIC(10, 2) DEFAULT NULL, is_distance_based TINYINT(1) NOT NULL, INDEX IDX_5BC5AF0B1972DC04 (from_zone_id), INDEX IDX_5BC5AF0B11B4025E (to_zone_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
CREATE TABLE doctrine_migration_versions (version VARCHAR(1024) NOT NULL, executed_at DATETIME NOT NULL, execution_time INT NOT NULL, PRIMARY KEY (version)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
ALTER TABLE classic_reservation ADD CONSTRAINT FK_A3EB4EE19EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id);
ALTER TABLE credit_regularization ADD CONSTRAINT FK_786A069FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id);
ALTER TABLE flat_rate_booking ADD CONSTRAINT FK_E4BA6BB519EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id);
ALTER TABLE predefined_reservation ADD CONSTRAINT FK_346F7DF719EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id);
ALTER TABLE zone_location ADD CONSTRAINT FK_762205569F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id);
ALTER TABLE zone_pricing ADD CONSTRAINT FK_5BC5AF0B1972DC04 FOREIGN KEY (from_zone_id) REFERENCES zone (id);
ALTER TABLE zone_pricing ADD CONSTRAINT FK_5BC5AF0B11B4025E FOREIGN KEY (to_zone_id) REFERENCES zone (id);
INSERT INTO doctrine_migration_versions (version, executed_at, execution_time) VALUES ('DoctrineMigrations\\Version20251201160018', NOW(), 0);
EOF
```

Puis exécutez :

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod < /tmp/migration.sql
```

Entrez le mot de passe : `Soumia123!`

## ✅ Vérification

Après avoir exécuté le SQL :

1. **Dans phpMyAdmin** : Actualisez (F5)
2. **Vous devriez voir** toutes les tables créées
3. **Vérifiez** la table `doctrine_migration_versions` : elle devrait contenir une entrée pour la migration

---

**Essayez d'abord les commandes de diagnostic, puis si ça ne fonctionne pas, exécutez le SQL manuellement !** 🔧
