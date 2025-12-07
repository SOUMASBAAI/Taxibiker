# 🤖 Déploiement Automatique Complet

## ✅ Ce qui est déjà automatique

### 1. Migrations Automatiques ✅

Les migrations s'exécutent **automatiquement** à chaque déploiement via GitHub Actions.

**Ligne dans le workflow :**

```yaml
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

**Ce qui se passe :**

- ✅ À chaque `git push origin main`
- ✅ Les migrations sont exécutées automatiquement
- ✅ Les nouvelles tables/modifications sont appliquées
- ✅ Aucune action manuelle requise

### 2. Fixtures Automatiques (Optionnel) ✅

Les fixtures peuvent s'exécuter **automatiquement** si vous activez l'option.

## 🎯 Activer le Chargement Automatique des Fixtures

### Étape 1 : Créer la Variable GitHub

1. **Allez sur GitHub** : Votre repository > **Settings** > **Secrets and variables** > **Actions**

2. **Onglet "Variables"** (pas "Secrets")

3. **Créez une variable** :
   - **Nom** : `LOAD_FIXTURES`
   - **Valeur** : `true`
   - **Cliquez** sur "Add variable"

### Étape 2 : Déployer

```bash
git push origin main
```

**Résultat :**

- ✅ Migrations exécutées automatiquement
- ✅ Fixtures chargées automatiquement (si `LOAD_FIXTURES=true`)

### Désactiver le chargement des fixtures

Pour ne charger les fixtures qu'une seule fois :

1. **Modifiez la variable** `LOAD_FIXTURES` : mettez `false`
2. **Ou supprimez** la variable

## 📋 Flux de Déploiement Automatique

```
git push origin main
  ↓
GitHub Actions démarre
  ↓
Build du frontend (npm run build)
  ↓
Build du backend (composer install)
  ↓
Déploiement FTP vers PlanetHoster
  ↓
Connexion SSH
  ↓
Installation dépendances (composer install)
  ↓
Création dossiers (var/, config/jwt/)
  ↓
Génération clés JWT (si nécessaire)
  ↓
Vidage cache Symfony
  ↓
✨ EXÉCUTION MIGRATIONS (AUTOMATIQUE) ✨
  ↓
✨ CHARGEMENT FIXTURES (si LOAD_FIXTURES=true) ✨
  ↓
Définition permissions
  ↓
✅ Déploiement terminé !
```

## 🔄 Workflow Complet

### À chaque `git push origin main` :

1. **Frontend** : Build et déploiement
2. **Backend** : Déploiement et installation
3. **Base de données** : Migrations automatiques
4. **Données** : Fixtures automatiques (si activé)

### Aucune action manuelle requise ! 🎉

## ⚙️ Configuration

### Variables GitHub Disponibles

| Variable        | Type     | Description                          | Valeur            |
| --------------- | -------- | ------------------------------------ | ----------------- |
| `LOAD_FIXTURES` | Variable | Charger les fixtures automatiquement | `true` ou `false` |

### Secrets GitHub (déjà configurés)

- `PLANETHOSTER_PROD_HOST`
- `PLANETHOSTER_PROD_USERNAME`
- `PLANETHOSTER_PROD_PASSWORD`
- `JWT_PASSPHRASE`

## 🚀 Utilisation

### Déploiement normal (migrations automatiques)

```bash
git add .
git commit -m "Vos modifications"
git push origin main
```

**Résultat :**

- ✅ Migrations exécutées automatiquement
- ✅ Fixtures NON chargées (si `LOAD_FIXTURES` n'est pas défini)

### Déploiement avec fixtures

1. **Créez** `LOAD_FIXTURES=true` dans GitHub Variables
2. **Déployez** :
   ```bash
   git push origin main
   ```

**Résultat :**

- ✅ Migrations exécutées automatiquement
- ✅ Fixtures chargées automatiquement

### Charger les fixtures une seule fois

1. **Créez** `LOAD_FIXTURES=true`
2. **Déployez** : `git push origin main`
3. **Désactivez** : Mettez `LOAD_FIXTURES=false`
4. **Les prochains déploiements** ne chargeront plus les fixtures

## ✅ Vérification

Après un déploiement automatique :

1. **Vérifiez les logs GitHub Actions** :

   - Onglet **Actions** sur GitHub
   - Dernier workflow
   - Vérifiez que les migrations et fixtures sont exécutées

2. **Vérifiez dans phpMyAdmin** :

   - Tables créées/mises à jour
   - Données présentes (si fixtures chargées)

3. **Testez l'API** :
   - https://taxibikerparis.com/api/health

## 🎯 Résumé

| Action         | Automatique        | Configuration Requise   |
| -------------- | ------------------ | ----------------------- |
| **Migrations** | ✅ Oui             | Aucune (déjà configuré) |
| **Fixtures**   | ✅ Oui (optionnel) | `LOAD_FIXTURES=true`    |

---

**Tout est automatique ! Il suffit de faire `git push origin main` et tout se fait automatiquement !** 🚀✨
