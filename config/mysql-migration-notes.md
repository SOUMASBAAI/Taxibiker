# Notes de Migration PostgreSQL vers MySQL

## Différences importantes entre PostgreSQL et MySQL

### Types de données

- **PostgreSQL `SERIAL`** → **MySQL `AUTO_INCREMENT`**
- **PostgreSQL `TEXT`** → **MySQL `LONGTEXT`**
- **PostgreSQL `BOOLEAN`** → **MySQL `TINYINT(1)`**
- **PostgreSQL `TIMESTAMP`** → **MySQL `DATETIME`**
- **PostgreSQL `JSON`** → **MySQL `JSON`** (MySQL 5.7+)

### Modifications potentielles nécessaires

#### 1. Clés primaires auto-incrémentées

```sql
-- PostgreSQL
id SERIAL PRIMARY KEY

-- MySQL
id INT AUTO_INCREMENT PRIMARY KEY
```

#### 2. Types booléens

```sql
-- PostgreSQL
is_active BOOLEAN DEFAULT TRUE

-- MySQL
is_active TINYINT(1) DEFAULT 1
```

#### 3. Champs texte longs

```sql
-- PostgreSQL
description TEXT

-- MySQL
description LONGTEXT
```

#### 4. Timestamps avec timezone

```sql
-- PostgreSQL
created_at TIMESTAMP WITH TIME ZONE

-- MySQL
created_at DATETIME
```

### Configuration Doctrine pour MySQL

Dans `config/packages/doctrine.yaml`, assurez-vous d'avoir :

```yaml
doctrine:
  dbal:
    url: "%env(resolve:DATABASE_URL)%"
    charset: utf8mb4
    default_table_options:
      charset: utf8mb4
      collate: utf8mb4_unicode_ci
```

### Commandes utiles pour la migration

```bash
# Générer une nouvelle migration après changement de base
php bin/console doctrine:migrations:diff

# Vérifier le schéma
php bin/console doctrine:schema:validate

# Voir les requêtes SQL qui seraient exécutées
php bin/console doctrine:schema:update --dump-sql

# Forcer la mise à jour du schéma (attention en production!)
php bin/console doctrine:schema:update --force
```

### Optimisations MySQL recommandées

#### 1. Configuration my.cnf

```ini
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
max_connections = 100
query_cache_size = 32M
```

#### 2. Index recommandés

```sql
-- Index sur les colonnes fréquemment utilisées dans les WHERE
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_reservation_date ON classic_reservation(reservation_date);
CREATE INDEX idx_reservation_status ON classic_reservation(status);
```

#### 3. Partitioning (pour de gros volumes)

```sql
-- Partitioning par date pour les réservations
ALTER TABLE classic_reservation
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### Vérifications post-migration

1. **Tester toutes les fonctionnalités** de l'application
2. **Vérifier les performances** des requêtes complexes
3. **Contrôler l'intégrité** des données migrées
4. **Tester les sauvegardes** et restaurations

### Commandes de vérification

```bash
# Vérifier la connexion
php bin/console doctrine:database:create --if-not-exists

# Lister les migrations
php bin/console doctrine:migrations:list

# Statut des migrations
php bin/console doctrine:migrations:status

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les fixtures (données de test)
php bin/console doctrine:fixtures:load
```
