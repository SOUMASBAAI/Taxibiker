# 🗄️ Créer les Tables : Exécuter les Migrations

## ❌ Problème : "No tables found"

C'est normal ! Les tables n'existent pas encore car les migrations n'ont pas été exécutées.

## ✅ Solution : Exécuter les migrations

### Option 1 : Automatique via GitHub (Recommandé)

**Déclenchez un déploiement pour exécuter automatiquement les migrations :**

```bash
git commit --allow-empty -m "Run migrations to create database tables"
git push origin main
```

Les migrations s'exécuteront automatiquement après le déploiement.

**Avantages :**

- ✅ Automatique
- ✅ Traçable dans GitHub Actions
- ✅ Pas besoin de se connecter en SSH

### Option 2 : Manuellement via SSH (Plus rapide)

**Exécutez les migrations maintenant :**

1. **Connectez-vous en SSH** :

   ```bash
   ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
   ```

2. **Allez dans le dossier API** :

   ```bash
   cd public_html/api
   ```

3. **Vérifiez que le .env est correct** :

   ```bash
   cat .env | grep DATABASE_URL
   ```

   Vous devriez voir :

   ```
   DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123!@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=8.0&charset=utf8mb4
   ```

4. **Testez la connexion à la base de données** :

   ```bash
   php bin/console doctrine:database:create --if-not-exists --env=prod
   ```

5. **Vérifiez le statut des migrations** :

   ```bash
   php bin/console doctrine:migrations:status --env=prod
   ```

6. **Exécutez les migrations** :

   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction --env=prod
   ```

   Vous devriez voir quelque chose comme :

   ```
   [OK] Already at the latest version ("20251116154806")
   ```

   Ou si c'est la première fois :

   ```
   [OK] Migrated to version 20251116154806
   ```

7. **Vérifiez que les tables sont créées** :
   ```bash
   php bin/console doctrine:migrations:status --env=prod
   ```

## 🔍 Vérification dans phpMyAdmin

Après avoir exécuté les migrations :

1. **Actualisez phpMyAdmin** (F5)
2. **Sélectionnez** la base `ueeecgbbue_taxibiker_prod`
3. **Vous devriez voir** toutes les tables :
   - `user`
   - `classic_reservation`
   - `flat_rate_booking`
   - `predefined_reservation`
   - `predefined_route`
   - `zone`
   - `zone_location`
   - `zone_pricing`
   - `rate`
   - `time_based_fee`
   - `notification`
   - `credit_regularization`
   - `doctrine_migration_versions`
   - Et d'autres...

## 🚨 Problèmes possibles

### Erreur : "Connection refused" ou "Access denied"

**Solutions :**

1. **Vérifiez le fichier .env** :

   ```bash
   cat .env | grep DATABASE_URL
   ```

2. **Testez la connexion MySQL directement** :

   ```bash
   mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
   ```

   Entrez le mot de passe : `Soumia123!`

   Si ça fonctionne, la connexion est bonne.

3. **Vérifiez les permissions de l'utilisateur MySQL** :
   - Dans le panneau PlanetHoster
   - L'utilisateur doit avoir tous les droits sur la base

### Erreur : "Database does not exist"

**Solution :**

Créez la base de données dans le panneau PlanetHoster :

1. **Allez dans** : **Bases de données > MySQL**
2. **Créez** une nouvelle base de données : `ueeecgbbue_taxibiker_prod`
3. **Associez** l'utilisateur `ueeecgbbue_soumia` à cette base
4. **Réessayez** les migrations

### Erreur : "No migrations found"

**Solution :**

Vérifiez que les fichiers de migration existent :

```bash
ls -la migrations/
```

Vous devriez voir des fichiers comme :

- `Version20250930202950.php`
- `Version20251007221745.php`
- etc.

## 📋 Checklist

- [ ] Connecté en SSH au serveur PlanetHoster
- [ ] Dans le dossier `public_html/api`
- [ ] Le fichier `.env` contient la bonne `DATABASE_URL`
- [ ] Les migrations sont exécutées avec succès
- [ ] Les tables sont visibles dans phpMyAdmin

## 🎯 Après les migrations

Une fois les tables créées :

1. **Testez votre API** :

   - https://taxibikerparis.com/api/health
   - Devrait fonctionner sans erreur de base de données

2. **Optionnel : Charger les fixtures** (données de test) :

   ```bash
   php bin/console doctrine:fixtures:load --no-interaction --env=prod
   ```

   ⚠️ **Attention** : Cela supprime toutes les données existantes !

---

**Exécutez les migrations maintenant pour créer les tables !** 🚀
