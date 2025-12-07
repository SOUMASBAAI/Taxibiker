# 🔧 Résolution : Commandes Doctrine Silencieuses

## ❌ Problème détecté

- Les commandes Doctrine ne produisent **aucune sortie**
- Le fichier de log `var/log/prod.log` n'existe pas
- Les migrations ne semblent pas s'exécuter

## ✅ Solution : Vérifier et créer l'environnement

### Étape 1 : Créer les dossiers nécessaires

```bash
cd public_html/api
mkdir -p var/cache var/log
chmod -R 755 var/
```

### Étape 2 : Vérifier que Symfony fonctionne

```bash
php bin/console --version
php bin/console list doctrine
```

**Question :** Voyez-vous une sortie ou des erreurs ?

### Étape 3 : Vérifier la configuration Doctrine

```bash
php bin/console debug:container doctrine
```

### Étape 4 : Tester avec un mode interactif

```bash
php bin/console doctrine:migrations:status --env=prod
```

Sans le `2>&1`, pour voir s'il y a une erreur PHP.

### Étape 5 : Vérifier les permissions PHP

```bash
php -r "echo 'PHP Version: ' . PHP_VERSION . PHP_EOL;"
php -r "var_dump(function_exists('mysqli_connect'));"
```

### Étape 6 : Vérifier que le .env est lu

```bash
php bin/console debug:dotenv
```

## 🚀 Solution Alternative : Exécuter via phpMyAdmin

Si les commandes Doctrine ne fonctionnent pas, exécutez le SQL directement dans phpMyAdmin :

### Dans phpMyAdmin

1. **Sélectionnez** la base `ueeecgbbue_taxibiker_prod`
2. **Cliquez** sur l'onglet **SQL**
3. **Copiez-collez** le SQL suivant et exécutez :

```sql
-- D'abord créer la table user (requise pour les foreign keys)
CREATE TABLE `user` (
    id INT AUTO_INCREMENT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone_number VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    roles JSON NOT NULL COMMENT '(DC2Type:json)',
    monthly_credit_enabled TINYINT(1) DEFAULT 0 NOT NULL,
    current_credit NUMERIC(10, 2) DEFAULT '0.00' NOT NULL,
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

-- Ensuite les autres tables
CREATE TABLE classic_reservation (
    id INT AUTO_INCREMENT NOT NULL,
    client_id INT NOT NULL,
    date DATETIME NOT NULL,
    departure VARCHAR(255) NOT NULL,
    arrival VARCHAR(255) NOT NULL,
    excess_baggage TINYINT(1) NOT NULL,
    price NUMERIC(5, 2) NOT NULL,
    stop VARCHAR(255) DEFAULT NULL,
    statut VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'immediate' NOT NULL,
    INDEX IDX_A3EB4EE19EB6921 (client_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE credit_regularization (
    id INT AUTO_INCREMENT NOT NULL,
    user_id INT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    regularized_at DATETIME NOT NULL,
    month VARCHAR(7) NOT NULL,
    notes LONGTEXT DEFAULT NULL,
    INDEX IDX_786A069FA76ED395 (user_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE flat_rate_booking (
    id INT AUTO_INCREMENT NOT NULL,
    client_id INT NOT NULL,
    date DATETIME NOT NULL,
    departure VARCHAR(255) NOT NULL,
    arrival VARCHAR(255) NOT NULL,
    number_of_hours INT NOT NULL,
    excess_baggage TINYINT(1) NOT NULL,
    price NUMERIC(5, 2) NOT NULL,
    statut VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'immediate' NOT NULL,
    INDEX IDX_E4BA6BB519EB6921 (client_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE notification (
    id INT AUTO_INCREMENT NOT NULL,
    message VARCHAR(255) NOT NULL,
    statut VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE predefined_reservation (
    id INT AUTO_INCREMENT NOT NULL,
    client_id INT NOT NULL,
    date DATETIME NOT NULL,
    departure VARCHAR(255) NOT NULL,
    arrival VARCHAR(255) NOT NULL,
    price NUMERIC(5, 2) NOT NULL,
    excess_baggage TINYINT(1) NOT NULL,
    statut VARCHAR(255) NOT NULL,
    stop VARCHAR(255) DEFAULT NULL,
    INDEX IDX_346F7DF719EB6921 (client_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE predefined_route (
    id INT AUTO_INCREMENT NOT NULL,
    departure VARCHAR(255) NOT NULL,
    arrival VARCHAR(255) NOT NULL,
    price NUMERIC(5, 2) NOT NULL,
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE rate (
    id INT AUTO_INCREMENT NOT NULL,
    night_rate NUMERIC(5, 2) NOT NULL,
    weekend_rate NUMERIC(5, 2) NOT NULL,
    excess_baggage NUMERIC(5, 2) NOT NULL,
    holyday NUMERIC(5, 2) NOT NULL,
    tds NUMERIC(5, 2) NOT NULL,
    stop NUMERIC(5, 2) NOT NULL,
    kilometer NUMERIC(5, 2) NOT NULL,
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE time_based_fee (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL,
    is_active TINYINT(1) NOT NULL,
    description VARCHAR(500) DEFAULT NULL,
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE zone (
    id INT AUTO_INCREMENT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500) DEFAULT NULL,
    priority INT NOT NULL,
    UNIQUE INDEX UNIQ_A0EBC00777153098 (code),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE zone_location (
    id INT AUTO_INCREMENT NOT NULL,
    zone_id INT NOT NULL,
    value VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    INDEX IDX_762205569F2C3FAB (zone_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

CREATE TABLE zone_pricing (
    id INT AUTO_INCREMENT NOT NULL,
    from_zone_id INT NOT NULL,
    to_zone_id INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    base_price NUMERIC(10, 2) DEFAULT NULL,
    price_per_km NUMERIC(10, 2) DEFAULT NULL,
    is_distance_based TINYINT(1) NOT NULL,
    INDEX IDX_5BC5AF0B1972DC04 (from_zone_id),
    INDEX IDX_5BC5AF0B11B4025E (to_zone_id),
    PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;

-- Créer la table de suivi des migrations
CREATE TABLE doctrine_migration_versions (
    version VARCHAR(1024) NOT NULL,
    executed_at DATETIME NOT NULL,
    execution_time INT NOT NULL,
    PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ajouter les contraintes de clés étrangères
ALTER TABLE classic_reservation ADD CONSTRAINT FK_A3EB4EE19EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id);
ALTER TABLE credit_regularization ADD CONSTRAINT FK_786A069FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id);
ALTER TABLE flat_rate_booking ADD CONSTRAINT FK_E4BA6BB519EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id);
ALTER TABLE predefined_reservation ADD CONSTRAINT FK_346F7DF719EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id);
ALTER TABLE zone_location ADD CONSTRAINT FK_762205569F2C3FAB FOREIGN KEY (zone_id) REFERENCES zone (id);
ALTER TABLE zone_pricing ADD CONSTRAINT FK_5BC5AF0B1972DC04 FOREIGN KEY (from_zone_id) REFERENCES zone (id);
ALTER TABLE zone_pricing ADD CONSTRAINT FK_5BC5AF0B11B4025E FOREIGN KEY (to_zone_id) REFERENCES zone (id);

-- Marquer la migration comme exécutée
INSERT INTO doctrine_migration_versions (version, executed_at, execution_time)
VALUES ('DoctrineMigrations\\\\Version20251201160018', NOW(), 0);
```

## ✅ Après avoir exécuté le SQL

1. **Actualisez phpMyAdmin** (F5)
2. **Vérifiez** que toutes les tables sont créées
3. **Testez votre API** : https://taxibikerparis.com/api/health

---

**La solution la plus rapide est d'exécuter le SQL directement dans phpMyAdmin !** 🚀
