# 🚫 Désactiver les fixtures lors du déploiement

## Problème

Vous ne voulez pas que les fixtures soient rechargées à chaque déploiement car les données sont déjà en place en production.

## ✅ Solutions disponibles

### 1. Configuration GitHub Actions (Recommandée)

#### Désactiver les fixtures globalement

Dans votre repository GitHub, allez dans `Settings > Secrets and variables > Actions > Variables` et :

**Option A: Supprimer la variable**

- Supprimez la variable `LOAD_FIXTURES` (si elle existe)
- Les fixtures ne seront plus chargées automatiquement

**Option B: Définir la variable à false**

- Créez/modifiez la variable `LOAD_FIXTURES` avec la valeur `false`
- Les fixtures seront explicitement désactivées

#### Activer les fixtures ponctuellement

Si vous voulez charger les fixtures pour un déploiement spécifique :

1. Allez dans `Settings > Secrets and variables > Actions > Variables`
2. Définissez `LOAD_FIXTURES` à `true`
3. Faites votre déploiement
4. Remettez `LOAD_FIXTURES` à `false` ou supprimez la variable

### 2. Déploiement local sans fixtures

#### Utiliser le script dédié

```bash
# Déploiement sans fixtures
./scripts/deploy-no-fixtures.sh production

# Ou avec variable d'environnement
LOAD_FIXTURES=false ./scripts/deploy.sh production
```

#### Déploiement normal (avec fixtures si configuré)

```bash
# Déploiement avec fixtures (si LOAD_FIXTURES=true)
./scripts/deploy.sh production

# Forcer le chargement des fixtures
LOAD_FIXTURES=true ./scripts/deploy.sh production
```

### 3. Vérification de l'état actuel

#### Vérifier la configuration GitHub

1. Allez dans votre repository GitHub
2. `Settings > Secrets and variables > Actions > Variables`
3. Vérifiez si `LOAD_FIXTURES` existe et sa valeur

#### Vérifier les logs de déploiement

Dans les logs GitHub Actions, vous verrez :

- `📥 Chargement automatique des fixtures...` (si activé)
- `⏭️ Chargement des fixtures désactivé` (si désactivé)

## 🔧 Configuration recommandée pour la production

### Variables GitHub à configurer

```
# Variables (Settings > Secrets and variables > Actions > Variables)
LOAD_FIXTURES=false  # ou ne pas définir la variable du tout
```

### Secrets GitHub (gardez ceux existants)

```
# Secrets (Settings > Secrets and variables > Actions > Secrets)
PLANETHOSTER_PROD_HOST=votre-domaine.com
PLANETHOSTER_PROD_USERNAME=votre-username
PLANETHOSTER_PROD_PASSWORD=votre-password
JWT_PASSPHRASE=votre-jwt-passphrase
```

## 📋 Workflow de déploiement recommandé

### Déploiement normal (sans fixtures)

1. Poussez votre code sur la branche `main` ou `production`
2. GitHub Actions se déclenche automatiquement
3. Les migrations sont exécutées (mise à jour de la structure)
4. Les fixtures sont ignorées (données préservées)

### Déploiement avec fixtures (cas exceptionnel)

1. Activez temporairement `LOAD_FIXTURES=true` dans GitHub
2. Poussez votre code
3. Les fixtures sont rechargées (⚠️ données écrasées)
4. Désactivez `LOAD_FIXTURES` après le déploiement

## ⚠️ Avertissements

### Attention aux fixtures en production

- Les fixtures **écrasent** les données existantes
- Utilisez `--append` pour ajouter sans écraser (déjà configuré)
- Testez toujours en staging avant la production

### Sauvegarde recommandée

Avant tout déploiement avec fixtures :

```bash
# Sur le serveur de production
cd public_html/api
php bin/console app:backup-database  # Si vous avez cette commande
# Ou sauvegarde manuelle de la base
```

## 🔍 Dépannage

### Les fixtures se chargent encore

1. Vérifiez la variable `LOAD_FIXTURES` dans GitHub
2. Consultez les logs de déploiement
3. Vérifiez que vous utilisez la bonne branche

### Les migrations échouent

Les migrations continuent de s'exécuter même sans fixtures :

```bash
# Sur le serveur, vérifiez l'état
cd public_html/api
php bin/console doctrine:migrations:status --env=prod
```

### Forcer un déploiement sans fixtures

```bash
# Localement
LOAD_FIXTURES=false ./scripts/deploy.sh production

# Ou utilisez le script dédié
./scripts/deploy-no-fixtures.sh production
```
