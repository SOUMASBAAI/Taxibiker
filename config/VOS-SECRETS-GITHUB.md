# 🔐 Vos Secrets GitHub - Configuration Exacte

## 📋 Informations de votre serveur PlanetHoster

- **IP** : `146.88.232.214`
- **Hostname** : `node240-eu.n0c.com`
- **Port SSH** : `5022`
- **Username FTP** : `ueeecgbbue`
- **Domaine** : `taxibikerparis.com`

## ✅ Secrets à créer dans GitHub

**Allez sur :** GitHub > Votre repository > Settings > Secrets and variables > Actions > Repository secrets

### 1. PLANETHOSTER_PROD_HOST

**Nom :** `PLANETHOSTER_PROD_HOST`

**Valeur :** `node240-eu.n0c.com`

_(Vous pouvez aussi utiliser `146.88.232.214` si le hostname ne fonctionne pas)_

---

### 2. PLANETHOSTER_PROD_USERNAME

**Nom :** `PLANETHOSTER_PROD_USERNAME`

**Valeur :** `ueeecgbbue`

---

### 3. PLANETHOSTER_PROD_PASSWORD

**Nom :** `PLANETHOSTER_PROD_PASSWORD`

**Valeur :** [Votre mot de passe FTP PlanetHoster]

_(Le mot de passe de votre compte utilisateur PlanetHoster)_

---

### 4. JWT_PASSPHRASE

**Nom :** `JWT_PASSPHRASE`

**Valeur :** `taxibiker_jwt_passphrase_2024`

_(Utilisez la même valeur dans votre fichier .env sur PlanetHoster)_

## 📝 Résumé rapide

| Secret                       | Valeur                          |
| ---------------------------- | ------------------------------- |
| `PLANETHOSTER_PROD_HOST`     | `node240-eu.n0c.com`            |
| `PLANETHOSTER_PROD_USERNAME` | `ueeecgbbue`                    |
| `PLANETHOSTER_PROD_PASSWORD` | [Votre mot de passe]            |
| `JWT_PASSPHRASE`             | `taxibiker_jwt_passphrase_2024` |

## ⚠️ Points importants

1. **Noms exacts** : Copiez-collez les noms exactement (sensible à la casse)
2. **Pas d'espaces** : Pas d'espaces avant/après les valeurs
3. **Repository secrets** : Créez dans "Repository secrets", pas "Environment secrets"
4. **Port FTP** : Le port FTP est généralement 21 (par défaut, pas besoin de le spécifier)

## 🧪 Tester après configuration

1. **GitHub** → **Actions**
2. **"Test Secrets Configuration"** → **Run workflow**
3. Vérifiez que tous les secrets sont détectés

## 🚀 Après avoir créé les 4 secrets

```bash
git push origin main
```

Le déploiement devrait maintenant fonctionner !
