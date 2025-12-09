# 📝 Guide : Fichier .env pour PlanetHoster

## 📍 Localisation du fichier

Le fichier `.env` doit être créé dans :

```
public_html/api/.env
```

## 📋 Contenu exact du fichier

Copiez-collez ce contenu dans votre fichier `.env` sur PlanetHoster et **remplacez les valeurs** :

```bash
APP_ENV=prod
APP_DEBUG=false

# 1. APP_SECRET : Générer une clé de 32 caractères
APP_SECRET=GENERER_UNE_CLE_SECRETE_32_CARACTERES

# 2. DATABASE_URL : Informations de votre base de données
DATABASE_URL=mysql://ueeecgbbue_soumia:VOTRE_MOT_DE_PASSE_DB@MYSQL_HOST:3306/ueeecgbbue_taxibiker_prod?serverVersion=8.0&charset=utf8mb4

# 3. Configuration JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=taxibiker_jwt_passphrase_2024

# 4. CORS - Votre domaine
CORS_ALLOW_ORIGIN=^https://taxibikerparis\.com$

# 5. Timezone
TIMEZONE=Europe/Paris
```

## 🔧 Informations à remplacer

### 1. APP_SECRET

**Générez une clé secrète unique de 32 caractères :**

```bash
# En ligne de commande (si vous avez accès SSH)
openssl rand -hex 16

# Ou utilisez un générateur en ligne
# https://www.lastpass.com/fr/features/password-generator
```

**Exemple :** `APP_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 2. DATABASE_URL

**Format complet :**

```
mysql://UTILISATEUR:MOT_DE_PASSE@HOST:PORT/NOM_BASE?serverVersion=8.0&charset=utf8mb4
```

**Vos informations connues :**

- ✅ **Utilisateur** : `ueeecgbbue_soumia`
- ✅ **Base de données** : `ueeecgbbue_taxibiker_prod`
- ✅ **Host MySQL** : `localhost` (recommandé par PlanetHoster)
- ❓ **Mot de passe DB** : À récupérer dans votre panneau PlanetHoster

**Où trouver ces informations manquantes :**

1. **Mot de passe DB** : Panneau PlanetHoster > Bases de données MySQL > Cliquez sur votre base > Voir le mot de passe
2. **Host MySQL** : Panneau PlanetHoster > Bases de données MySQL > Informations de connexion

**Exemple complet :**

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:abc123xyz@localhost:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6&charset=utf8mb4
```

### 3. JWT_PASSPHRASE

**Utilisez la même valeur que dans GitHub Secrets :**

```
JWT_PASSPHRASE=taxibiker_jwt_passphrase_2024
```

⚠️ **IMPORTANT** : Utilisez la **même passphrase** dans GitHub Secrets et dans le fichier `.env` !

## ✅ Exemple complet avec vraies valeurs

```bash
APP_ENV=prod
APP_DEBUG=false
APP_SECRET=a1b2c3d4e5f6789abcdef0123456789

DATABASE_URL=mysql://ueeecgbbue_soumia:monpassword123@localhost:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6&charset=utf8mb4

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=taxibiker_jwt_passphrase_2024

CORS_ALLOW_ORIGIN=^https://taxibikerparis\.com$
TIMEZONE=Europe/Paris
```

## 🔍 Vérifications avant déploiement

1. ✅ Le fichier `.env` est dans `public_html/api/.env`
2. ✅ APP_SECRET est une clé de 32 caractères
3. ✅ DATABASE_URL contient toutes les bonnes informations
4. ✅ JWT_PASSPHRASE correspond à celle de GitHub Secrets
5. ✅ CORS_ALLOW_ORIGIN contient votre domaine `taxibikerparis.com`

## 🚀 Après avoir créé le fichier

Le déploiement GitHub Actions utilisera automatiquement ce fichier `.env` pour la configuration !

---

**Besoin d'aide ?** Si vous ne trouvez pas certaines informations, contactez le support PlanetHoster.
