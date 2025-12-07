# 🔧 Correction : Migrations manquantes

## ❌ Problème détecté

- **Seulement 1 migration** : `Version20251201160018.php`
- **Les autres migrations manquent** : Version20250930202950.php, Version20251007221745.php, etc.
- **Les commandes Doctrine ne produisent aucune sortie**

## ✅ Solution : Vérifier et corriger

### Étape 1 : Vérifier si toutes les migrations sont dans le repository GitHub

Les migrations doivent être dans le dossier `taxibiker-back/migrations/` de votre repository GitHub.

### Étape 2 : Vérifier si le code complet a été déployé

```bash
ls -la src/Entity/
```

**Question :** Voyez-vous des fichiers d'entités ?

### Étape 3 : Vérifier le cache

Le cache pourrait bloquer :

```bash
php bin/console cache:clear --env=prod --no-debug
```

### Étape 4 : Vérifier que les migrations sont exécutées

Même si les commandes ne montrent rien, vérifiez dans phpMyAdmin :

1. **Actualisez phpMyAdmin** (F5)
2. **Sélectionnez** la base `ueeecgbbue_taxibiker_prod`
3. **Cherchez** la table `doctrine_migration_versions`

**Si la table existe :**

- Les migrations ont peut-être déjà été exécutées
- Vérifiez quelles migrations sont marquées comme exécutées

### Étape 5 : Forcer l'exécution de la migration

```bash
php bin/console doctrine:migrations:migrate --no-interaction --env=prod --verbose 2>&1
```

Le `2>&1` redirige les erreurs pour les voir.

### Étape 6 : Vérifier les logs

```bash
tail -n 50 var/log/prod.log
```

Regardez s'il y a des erreurs.

## 🚨 Si les migrations manquent dans le déploiement

Les migrations doivent être copiées lors du déploiement. Vérifiez que le workflow GitHub Actions copie bien le dossier `migrations/`.

### Vérifier le déploiement

Le workflow doit avoir une ligne comme :

```yaml
cp -r taxibiker-back/* deploy/public_html/api/
```

Cela devrait copier le dossier `migrations/` avec tous les fichiers.

### Si les migrations ne sont pas déployées

**Option 1 : Redéployer**

```bash
git push origin main
```

**Option 2 : Copier manuellement les migrations**

Si vous avez accès au code local :

```bash
# Depuis votre machine locale
scp -P 5022 taxibiker-back/migrations/*.php ueeecgbbue@node240-eu.n0c.com:/home/ueeecgbbue/public_html/api/migrations/
```

## 🔍 Diagnostic complet

Exécutez ceci pour voir ce qui se passe :

```bash
# 1. Vérifier le cache
php bin/console cache:clear --env=prod --no-debug

# 2. Vérifier la connexion
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1

# 3. Vérifier le statut avec erreurs visibles
php bin/console doctrine:migrations:status --env=prod 2>&1

# 4. Essayer d'exécuter avec toutes les erreurs
php bin/console doctrine:migrations:migrate --no-interaction --env=prod 2>&1

# 5. Vérifier les logs
tail -n 20 var/log/prod.log
```

---

**Exécutez ces commandes et partagez les résultats, surtout les erreurs !** 🔍
