# 📥 Charger les Fixtures après Création Manuelle des Tables

## 📋 Situation

Vous avez créé les tables manuellement via SQL. Maintenant, vous voulez charger les données de test (fixtures).

## 🎯 Deux méthodes

### Méthode 1 : Via Doctrine (Si ça fonctionne)

**Essayez d'abord cette méthode :**

```bash
cd public_html/api

# Essayer de charger les fixtures
php bin/console doctrine:fixtures:load --no-interaction --env=prod 2>&1
```

**Si ça fonctionne :** C'est fait ! ✅

**Si ça ne fonctionne pas :** Passez à la méthode 2.

### Méthode 2 : Via SQL Direct (Alternative)

Si Doctrine ne fonctionne pas, vous pouvez charger les données de base via SQL.

## 📥 Charger les Fixtures via SQL

### Étape 1 : Données de Base (AppFixtures)

Exécutez ce SQL dans phpMyAdmin pour charger les données de configuration (zones, tarifs, routes) :

**Fichier SQL complet disponible dans :** `scripts/fixtures-data.sql`

### Étape 2 : Utilisateurs (UserFixtures)

⚠️ **Attention** : Les mots de passe doivent être hashés avec Symfony. 

**Option A : Exécuter via Symfony** (Recommandé)

```bash
cd public_html/api
php bin/console doctrine:fixtures:load --no-interaction --env=prod --group=UserFixtures 2>&1
```

**Option B : Créer les utilisateurs manuellement**

Dans phpMyAdmin, exécutez ce SQL pour créer l'admin :

```sql
-- Admin user
-- Email: soumiaasbaai@gmail.com
-- Password: adminpass (hashé avec Symfony)

INSERT INTO `user` (first_name, last_name, email, phone_number, password, roles, monthly_credit_enabled, current_credit) 
VALUES (
    'Admin',
    'User',
    'soumiaasbaai@gmail.com',
    '+33612345678',
    '$2y$13$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- hash de 'adminpass'
    '["ROLE_ADMIN"]',
    0,
    0.00
);

-- Utilisateur test
-- Email: soumya.ould@gmail.com
-- Password: userpass

INSERT INTO `user` (first_name, last_name, email, phone_number, password, roles, monthly_credit_enabled, current_credit) 
VALUES (
    'soumia',
    'asbaai',
    'soumya.ould@gmail.com',
    '0123456789',
    '$2y$13$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- hash de 'userpass'
    '["ROLE_USER"]',
    0,
    0.00
);
```

⚠️ **Note** : Les hashs de mot de passe ci-dessus sont des exemples. Il faut les générer avec Symfony.

## 🔧 Solution Recommandée : Script PHP Simple

Créez un script PHP pour charger les fixtures :

```bash
cd public_html/api
nano load-fixtures.php
```

Copiez ce contenu (à adapter selon vos besoins) :

```php
<?php
// Script simple pour charger les fixtures
require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

// Charger .env
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

// Connexion à la base de données
$dsn = $_ENV['DATABASE_URL'];
// ... (script à compléter selon vos besoins)
```

## 🎯 Solution Plus Simple : Exécuter via Symfony en Local puis Exporter

1. **En local**, exécutez les fixtures :
   ```bash
   cd taxibiker-back
   php bin/console doctrine:fixtures:load --no-interaction
   ```

2. **Exportez les données** via phpMyAdmin ou mysqldump :
   ```bash
   mysqldump -h localhost -u root -p taxibiker_dev > fixtures-export.sql
   ```

3. **Importez sur PlanetHoster** via phpMyAdmin ou :
   ```bash
   mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod < fixtures-export.sql
   ```

## 📋 Checklist

- [ ] Tables créées ✅
- [ ] Fixtures AppFixtures chargées (zones, tarifs, routes)
- [ ] Utilisateurs créés (au moins admin)
- [ ] Application testée

## 🚀 Après avoir chargé les fixtures

**Testez votre application :**

1. **API Health Check** : https://taxibikerparis.com/api/health
2. **Connexion Admin** :
   - Email : `soumiaasbaai@gmail.com`
   - Password : `adminpass`
3. **Connexion User** :
   - Email : `soumya.ould@gmail.com`
   - Password : `userpass`

---

**La méthode la plus simple : Essayer d'abord Doctrine, puis exporter depuis local si ça ne fonctionne pas !** 🚀
