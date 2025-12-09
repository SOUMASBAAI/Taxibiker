# 📥 Charger les Données dans une Base Vide

## 📋 Situation

- ✅ Base de données fonctionne
- ✅ Tables créées
- ❌ Base vide (pas de données)

## 🎯 Solutions pour charger les données

### Solution 1 : Via GitHub Actions (Automatique) ⭐⭐⭐

**Le plus simple et automatique :**

1. **Créez la variable GitHub** :

   - GitHub → Settings → Secrets and variables → Actions
   - Onglet "Variables"
   - Créez : `LOAD_FIXTURES` = `true`

2. **Déclenchez un déploiement** :

   ```bash
   git commit --allow-empty -m "Load fixtures"
   git push origin main
   ```

3. **Les fixtures seront chargées automatiquement** après le déploiement

---

### Solution 2 : Exporter depuis Local puis Importer

**Si vous avez les données en local :**

#### Étape 1 : En local, charger les fixtures

```bash
cd taxibiker-back
php bin/console doctrine:fixtures:load --no-interaction
```

#### Étape 2 : Exporter les données

```bash
# Exporter uniquement les données (INSERT)
mysqldump -h 127.0.0.1 -u root -p --no-create-info --skip-triggers taxibiker_dev > fixtures-data.sql
```

Ou exporter toutes les données :

```bash
mysqldump -h 127.0.0.1 -u root -p taxibiker_dev > fixtures-complete.sql
```

#### Étape 3 : Importer sur PlanetHoster

**Via phpMyAdmin :**

1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base `ueeecgbbue_taxibiker_prod`
3. Onglet **"Importer"**
4. Choisissez le fichier `fixtures-data.sql`
5. Cliquez sur **"Exécuter"**

**Via SSH :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod < fixtures-data.sql
```

---

### Solution 3 : Essayer Doctrine directement (si ça fonctionne)

**Sur le serveur via SSH :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api

# Vérifier que Doctrine fonctionne
php bin/console --version

# Essayer de charger les fixtures
php bin/console doctrine:fixtures:load --no-interaction --env=prod --append 2>&1
```

**Si ça fonctionne :** ✅ C'est fait !

**Si ça ne fonctionne pas :** Utilisez une autre solution

---

### Solution 4 : Script SQL Direct (Données Minimales)

**Créer au moins les données essentielles directement dans phpMyAdmin :**

```sql
-- 1. Créer un utilisateur admin
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

-- 2. Créer la configuration de tarifs (Rate)
INSERT INTO rate (night_rate, weekend_rate, excess_baggage, holyday, tds, stop, kilometer)
VALUES (10.00, 15.00, 15.00, 15.00, 8.00, 20.00, 2.50);

-- 3. Créer les zones de base
INSERT INTO zone (code, name, description, priority) VALUES
('PARIS', 'Paris', 'Paris intra-muros (all arrondissements)', 3),
('PREMIUM_BANLIEUE', 'Proche Banlieue', 'Close suburbs - 55€ from Paris', 2),
('STANDARD_BANLIEUE', 'Banlieue Standard', 'Other suburbs', 1),
('OTHER', 'Autres zones', 'All other locations (distance-based pricing)', 0);

-- Récupérer les IDs des zones créées
SET @zone_paris = LAST_INSERT_ID() - 3;
SET @zone_premium = LAST_INSERT_ID() - 2;
SET @zone_standard = LAST_INSERT_ID() - 1;
SET @zone_other = LAST_INSERT_ID();

-- 4. Créer quelques locations pour Paris (exemples)
INSERT INTO zone_location (zone_id, value, type) VALUES
(@zone_paris, '75001', 'postal_code'),
(@zone_paris, '75008', 'postal_code'),
(@zone_paris, '75015', 'postal_code'),
(@zone_paris, 'Paris', 'city');
```

⚠️ **Note** : Les hashs de mot de passe doivent être générés par Symfony pour être corrects.

---

## 🎯 Recommandation : Solution 1 (GitHub Actions)

**C'est la plus simple :**

1. Créez `LOAD_FIXTURES=true` dans GitHub Variables
2. Déployez : `git push origin main`
3. Les fixtures seront chargées automatiquement

---

## ✅ Vérification après chargement

**Vérifiez dans phpMyAdmin :**

```sql
-- Vérifier les utilisateurs
SELECT COUNT(*) FROM `user`;

-- Vérifier les zones
SELECT COUNT(*) FROM zone;

-- Vérifier les tarifs
SELECT COUNT(*) FROM rate;
```

**Testez la connexion :**

- Email : `soumiaasbaai@gmail.com`
- Password : `adminpass`

---

**Utilisez la Solution 1 (GitHub Actions) pour charger automatiquement toutes les fixtures !** 🚀

