# 🗄️ Guide : Migrations et Fixtures

## 📋 Situation

Vous avez changé l'URL de la base de données et vous voulez :

1. **Exécuter les migrations** (créer/mettre à jour les tables)
2. **Charger les fixtures** (données de test)

## 🔧 Sur le Serveur de Production (PlanetHoster)

### Via SSH

1. **Connectez-vous en SSH** :

   ```bash
   ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
   ```

2. **Allez dans le dossier de l'API** :

   ```bash
   cd public_html/api
   ```

3. **Vérifiez le fichier .env** :

   ```bash
   cat .env | grep DATABASE_URL
   ```

   Vous devriez voir votre nouvelle URL de base de données.

4. **Exécutez les migrations** :

   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction --env=prod
   ```

5. **Charger les fixtures** (⚠️ Attention : cela supprime toutes les données) :
   ```bash
   php bin/console doctrine:fixtures:load --no-interaction --env=prod
   ```

### Via le Workflow GitHub Actions (Recommandé)

Le workflow de déploiement exécute déjà automatiquement les migrations après le déploiement.

Si vous voulez forcer une nouvelle migration :

```bash
# Faire un commit vide pour déclencher le déploiement
git commit --allow-empty -m "Trigger: Re-run migrations"
git push origin main
```

Les migrations s'exécuteront automatiquement via SSH après le déploiement.

## 💻 En Local

### Méthode 1 : Via les scripts

**Utilisez le script créé :**

```bash
# Windows PowerShell
bash scripts/run-migrations-and-fixtures.sh

# Linux/Mac
chmod +x scripts/run-migrations-and-fixtures.sh
./scripts/run-migrations-and-fixtures.sh
```

### Méthode 2 : Manuellement

1. **Allez dans le dossier backend** :

   ```bash
   cd taxibiker-back
   ```

2. **Vérifiez votre .env.local** :

   ```bash
   # Vérifiez que DATABASE_URL est correct
   cat .env.local | grep DATABASE_URL
   ```

3. **Exécutez les migrations** :

   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction
   ```

4. **Charger les fixtures** :
   ```bash
   php bin/console doctrine:fixtures:load --no-interaction
   ```

## 📝 Commandes Utiles

### Vérifier le statut des migrations

```bash
php bin/console doctrine:migrations:status
```

### Voir les migrations disponibles

```bash
php bin/console doctrine:migrations:list
```

### Annuler la dernière migration

```bash
php bin/console doctrine:migrations:migrate prev
```

### Créer une nouvelle migration

```bash
php bin/console make:migration
```

### Vider la base de données (avant les fixtures)

```bash
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --no-interaction
```

## ⚠️ Important : Fixtures en Production

**ATTENTION** : Les fixtures vont **supprimer toutes les données existantes** et les remplacer par des données de test !

### En production, généralement on NE fait PAS :

```bash
# ❌ NE FAITES PAS CECI en production si vous avez des données réelles !
php bin/console doctrine:fixtures:load --env=prod
```

### En production, on fait seulement :

```bash
# ✅ Seulement les migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

## 🔍 Vérification

### Vérifier que les tables sont créées

**Via phpMyAdmin :**

1. Connectez-vous à phpMyAdmin
2. Sélectionnez votre base de données
3. Vérifiez que toutes les tables sont présentes

**Via ligne de commande :**

```bash
# Se connecter à MySQL
mysql -h mysql.n0c.com -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod

# Lister les tables
SHOW TABLES;

# Quitter
exit;
```

## 🚨 Problèmes Courants

### Erreur : "Database connection failed"

**Solution :**

1. Vérifiez que l'URL de la base de données est correcte dans `.env`
2. Vérifiez que la base de données existe
3. Vérifiez les identifiants (utilisateur, mot de passe)

### Erreur : "Migration already executed"

**Solution :**

- C'est normal si la migration a déjà été exécutée
- Vérifiez le statut : `php bin/console doctrine:migrations:status`

### Erreur : "Table already exists"

**Solution :**

- Les tables existent déjà
- Si vous voulez tout réinitialiser :
  ```bash
  php bin/console doctrine:database:drop --force
  php bin/console doctrine:database:create
  php bin/console doctrine:migrations:migrate --no-interaction
  ```

## 📋 Checklist

**Avant d'exécuter :**

- [ ] L'URL de la base de données est correcte dans `.env`
- [ ] La base de données existe
- [ ] Les identifiants sont corrects
- [ ] Vous avez sauvegardé vos données (si en production)

**Après exécution :**

- [ ] Les migrations ont été exécutées avec succès
- [ ] Les tables sont créées dans la base de données
- [ ] Les fixtures sont chargées (si nécessaire)
- [ ] L'application fonctionne correctement

---

**Une fois les migrations et fixtures exécutées, votre base de données sera à jour !** ✅
