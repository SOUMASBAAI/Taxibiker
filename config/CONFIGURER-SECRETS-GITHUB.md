# 🔐 Configuration des Secrets GitHub - Guide Complet

## 📍 Accès aux secrets

1. **Allez sur GitHub** : https://github.com/votre-username/votre-repo
2. **Cliquez sur "Settings"** (en haut du repository)
3. **Menu de gauche** : **Secrets and variables** → **Actions**
4. **Onglet "Repository secrets"** (pas Environment secrets)

## ✅ Les 4 secrets à créer

### 1. PLANETHOSTER_PROD_HOST

**Nom exact :** `PLANETHOSTER_PROD_HOST`

**Valeur :** L'adresse du serveur FTP (pas le domaine web)

**Pour trouver cette valeur :**

- Panneau PlanetHoster > Informations de connexion
- Ou utilisez : `node240-eu.n0c.com` (votre serveur que vous avez vu)
- **OU** : `ftp.taxibikerparis.com` si configuré
- **OU** : L'adresse IP si fournie

**Exemple :** `node240-eu.n0c.com`

---

### 2. PLANETHOSTER_PROD_USERNAME

**Nom exact :** `PLANETHOSTER_PROD_USERNAME`

**Valeur :** `ueeecgbbue`

---

### 3. PLANETHOSTER_PROD_PASSWORD

**Nom exact :** `PLANETHOSTER_PROD_PASSWORD`

**Valeur :** Votre mot de passe FTP PlanetHoster

**Pour trouver :**

- Panneau PlanetHoster > Informations de connexion
- Section "Accès sFTP/SSH"
- Le mot de passe de votre compte utilisateur

---

### 4. JWT_PASSPHRASE

**Nom exact :** `JWT_PASSPHRASE`

**Valeur :** Une passphrase sécurisée (utilisez la même que dans votre .env)

**Exemple :** `taxibiker_jwt_passphrase_2024`

⚠️ **IMPORTANT :** Utilisez la **même valeur** dans GitHub Secrets et dans le fichier `.env` sur PlanetHoster !

## 📋 Checklist de création

Pour chaque secret :

- [ ] Cliquez sur **"New repository secret"**
- [ ] **Nom** : Copiez-collez exactement le nom (sensible à la casse)
- [ ] **Secret** : Entrez la valeur
- [ ] Cliquez sur **"Add secret"**
- [ ] Vérifiez qu'il apparaît dans la liste

## 🔍 Vérification

Après avoir créé les 4 secrets, vous devriez voir :

```
Repository secrets (4)
├── PLANETHOSTER_PROD_HOST
├── PLANETHOSTER_PROD_USERNAME
├── PLANETHOSTER_PROD_PASSWORD
└── JWT_PASSPHRASE
```

## 🧪 Tester les secrets

J'ai créé un workflow de test pour vous. Pour l'utiliser :

1. **Allez dans GitHub** → Onglet **Actions**
2. **Dans le menu de gauche**, cherchez **"Test Secrets Configuration"**
3. **Cliquez dessus** → **Run workflow** → **Run workflow**
4. Vous verrez quels secrets manquent

## ❌ Erreur courante

**Erreur :** `Error: Input required and not supplied: server`

**Causes possibles :**

1. ❌ Le secret `PLANETHOSTER_PROD_HOST` n'existe pas
2. ❌ Le secret est vide
3. ❌ Faute de frappe dans le nom (majuscules/minuscules)
4. ❌ Secret dans "Environment secrets" au lieu de "Repository secrets"

**Solution :**

1. Vérifiez que le secret existe dans "Repository secrets"
2. Vérifiez que le nom est exactement : `PLANETHOSTER_PROD_HOST`
3. Cliquez sur le secret pour vérifier qu'il n'est pas vide
4. Si nécessaire, supprimez-le et recréez-le

## 🚀 Après configuration

Une fois les 4 secrets créés :

```bash
git add .
git commit -m "Test: Vérification secrets GitHub"
git push origin main
```

Le déploiement devrait maintenant fonctionner !
