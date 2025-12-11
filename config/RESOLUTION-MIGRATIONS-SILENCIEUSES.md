# 🔍 Résolution : Migrations Doctrine Silencieuses

## 🚨 Problème

Vous arrivez à vous connecter à la base de données, mais quand vous exécutez :

```bash
php bin/console doctrine:migrations:migrate
```

**Rien ne se passe** - aucune sortie, aucun message.

## 🎯 Causes Possibles

### 1. **Migrations déjà exécutées** (Normal)

Si les migrations sont déjà appliquées, Doctrine ne fait rien et n'affiche rien.

### 2. **Erreurs silencieuses** (Problème)

Symfony peut masquer les erreurs en mode production.

### 3. **Permissions insuffisantes** (Problème)

Le fichier `bin/console` n'est pas exécutable.

### 4. **Cache corrompu** (Problème)

Le cache Symfony peut causer des dysfonctionnements.

---

## 🔧 Solutions Étape par Étape

### Étape 1 : Diagnostic Complet

```bash
cd public_html/api
php scripts/debug-doctrine.php
```

### Étape 2 : Vérifier les Permissions

```bash
chmod +x bin/console
ls -la bin/console
```

### Étape 3 : Commandes avec Sortie Verbose

```bash
# Vérifier le statut des migrations (VERBOSE)
php bin/console doctrine:migrations:status -v --env=prod

# Exécuter les migrations (VERBOSE)
php bin/console doctrine:migrations:migrate -v --env=prod

# Forcer l'affichage des erreurs PHP
php -d display_errors=1 bin/console doctrine:migrations:status --env=prod
```

### Étape 4 : Vérifier la Configuration

```bash
# Vérifier que Doctrine est bien configuré
php bin/console debug:config doctrine --env=prod

# Vérifier la connexion à la base
php bin/console doctrine:database:create --if-not-exists --env=prod

# Lister toutes les commandes disponibles
php bin/console list doctrine --env=prod
```

### Étape 5 : Vider le Cache

```bash
# Vider le cache de production
php bin/console cache:clear --env=prod --no-debug

# Recréer les dossiers de cache
mkdir -p var/cache var/log
chmod -R 755 var/
```

### Étape 6 : Test en Mode Dev (Plus Verbeux)

```bash
# Créer un .env.local temporaire pour le debug
echo "APP_ENV=dev" > .env.local
echo "APP_DEBUG=true" >> .env.local

# Tester en mode dev
php bin/console doctrine:migrations:status --env=dev
php bin/console doctrine:migrations:migrate --env=dev

# Supprimer le fichier temporaire
rm .env.local
```

---

## 🎯 Commandes de Diagnostic Spécifiques

### A. Vérifier si les migrations existent

```bash
ls -la migrations/
```

### B. Vérifier si la table de migrations existe

```bash
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod -e "SHOW TABLES LIKE 'doctrine_migration_versions';"
```

### C. Voir les migrations déjà exécutées

```bash
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod -e "SELECT * FROM doctrine_migration_versions;"
```

### D. Vérifier les logs Symfony

```bash
tail -n 50 var/log/prod.log
```

---

## 🔍 Interprétation des Résultats

### ✅ **Cas Normal** : Migrations déjà exécutées

```bash
php bin/console doctrine:migrations:status -v --env=prod
```

**Sortie attendue :**

```
>> Already at the latest version ("VersionXXXXXXXXXXXXXX")
```

### ❌ **Cas Problématique** : Aucune sortie du tout

**Causes possibles :**

1. Erreur PHP fatale (vérifiez les logs)
2. Permissions insuffisantes
3. Cache corrompu
4. Configuration Doctrine incorrecte

---

## 🚀 Solution Rapide

**Exécutez ces commandes dans l'ordre :**

```bash
cd public_html/api

# 1. Permissions
chmod +x bin/console

# 2. Vider le cache
rm -rf var/cache/*
php bin/console cache:clear --env=prod

# 3. Test verbose
php bin/console doctrine:migrations:status -v --env=prod

# 4. Si ça marche, migrer
php bin/console doctrine:migrations:migrate -v --env=prod

# 5. Vérifier les tables créées
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod -e "SHOW TABLES;"
```

---

## 🎯 Résultats Attendus

### Si tout va bien :

```bash
php bin/console doctrine:migrations:status -v --env=prod
```

**Devrait afficher :**

- Liste des migrations disponibles
- Statut de chaque migration (exécutée ou non)
- Version actuelle de la base

### Si les migrations sont à jour :

```
>> Already at the latest version ("Version20251201160018")
```

### Si des migrations sont en attente :

```
>> 1 migration to execute
```

---

## 📞 Support d'Urgence

**Si rien ne fonctionne, exécutez et partagez les résultats :**

```bash
cd public_html/api

echo "=== DEBUG COMPLET ==="
php scripts/debug-doctrine.php

echo "=== PERMISSIONS ==="
ls -la bin/console

echo "=== MIGRATIONS FILES ==="
ls -la migrations/

echo "=== DATABASE TABLES ==="
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod -e "SHOW TABLES;"

echo "=== DOCTRINE STATUS ==="
php bin/console doctrine:migrations:status -v --env=prod 2>&1

echo "=== LOGS ==="
tail -n 10 var/log/prod.log 2>/dev/null || echo "Pas de logs"
```

---

**🎯 Avec ces étapes, on va identifier et résoudre le problème !**
