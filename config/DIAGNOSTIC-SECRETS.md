# 🔍 Diagnostic : Secrets GitHub manquants

## ❌ Erreur

```
Error: Input required and not supplied: server
```

Cela signifie que le secret `PLANETHOSTER_PROD_HOST` n'est **pas trouvé** ou **pas accessible**.

## 🔍 Vérifications étape par étape

### 1. Vérifier que les secrets existent

**Allez sur GitHub :**

1. Votre repository → **Settings** (en haut)
2. Dans le menu de gauche : **Secrets and variables** → **Actions**
3. **Onglet "Secrets"** (pas "Variables")

**Vous devriez voir ces 4 secrets :**

- ✅ `PLANETHOSTER_PROD_HOST`
- ✅ `PLANETHOSTER_PROD_USERNAME`
- ✅ `PLANETHOSTER_PROD_PASSWORD`
- ✅ `JWT_PASSPHRASE`

### 2. Vérifier les noms EXACTEMENT

⚠️ **Les noms doivent être EXACTEMENT comme ci-dessus :**

- ✅ `PLANETHOSTER_PROD_HOST` (pas `PLANETHOSTER_PROD_HOST_` ou `planethoster_prod_host`)
- ✅ Majuscules/minuscules respectées
- ✅ Pas d'espaces avant/après

### 3. Vérifier les valeurs

**Cliquez sur chaque secret pour vérifier la valeur :**

#### `PLANETHOSTER_PROD_HOST`

- **Valeur attendue** : `taxibikerparis.com`
- **OU** : L'adresse FTP de PlanetHoster (ex: `node240-eu.n0c.com` ou `ftp.planethoster.com`)

#### `PLANETHOSTER_PROD_USERNAME`

- **Valeur attendue** : `ueeecgbbue`

#### `PLANETHOSTER_PROD_PASSWORD`

- **Valeur** : Votre mot de passe FTP PlanetHoster

#### `JWT_PASSPHRASE`

- **Valeur** : Par exemple `taxibiker_jwt_passphrase_2024`

## 🔧 Solutions

### Solution 1 : Vérifier que le secret n'est pas vide

1. **Cliquez sur `PLANETHOSTER_PROD_HOST`**
2. **Vérifiez que la valeur n'est pas vide**
3. Si vide → **Mettez à jour** avec la bonne valeur

### Solution 2 : Re-créer les secrets

Si les secrets existent mais ne fonctionnent pas :

1. **Supprimez** le secret problématique
2. **Recréez-le** avec "New repository secret"
3. **Nom exact** : `PLANETHOSTER_PROD_HOST`
4. **Valeur** : `taxibikerparis.com` (ou votre host FTP)

### Solution 3 : Vérifier le repository

Assurez-vous d'être dans le **bon repository** :

- Vérifiez l'URL : `https://github.com/VOTRE-USERNAME/VOTRE-REPO/settings/secrets/actions`
- Les secrets sont **spécifiques à chaque repository**

## 📋 Checklist de vérification

Cochez chaque point :

- [ ] Je suis dans le bon repository GitHub
- [ ] J'ai bien 4 secrets dans "Repository secrets"
- [ ] Le nom `PLANETHOSTER_PROD_HOST` existe exactement comme ça
- [ ] La valeur de `PLANETHOSTER_PROD_HOST` n'est pas vide
- [ ] J'ai sauvegardé chaque secret après l'avoir créé/modifié
- [ ] Les secrets sont dans "Repository secrets" (pas "Environment secrets")

## 🚀 Test rapide

**Créez un workflow de test temporaire :**

```yaml
name: Test Secrets

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test secrets
        run: |
          echo "Host: ${{ secrets.PLANETHOSTER_PROD_HOST }}"
          echo "Username: ${{ secrets.PLANETHOSTER_PROD_USERNAME }}"
          if [ -z "${{ secrets.PLANETHOSTER_PROD_HOST }}" ]; then
            echo "❌ PLANETHOSTER_PROD_HOST est vide ou n'existe pas"
            exit 1
          else
            echo "✅ PLANETHOSTER_PROD_HOST existe"
          fi
```

Si le secret est vide, vous verrez un message d'erreur.

## ⚠️ Problèmes courants

### 1. Secrets dans le mauvais repository

**Solution** : Vérifiez que vous êtes dans le bon repository

### 2. Secrets dans "Environment secrets" au lieu de "Repository secrets"

**Solution** : Utilisez "Repository secrets" pour plus de simplicité

### 3. Faute de frappe dans le nom

**Solution** : Copiez-collez exactement : `PLANETHOSTER_PROD_HOST`

### 4. Secret créé mais pas sauvegardé

**Solution** : Cliquez bien sur "Add secret" après avoir entré la valeur

---

**Après avoir vérifié tout ça, relancez le déploiement !**
