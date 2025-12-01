# Guide de Déploiement TaxiBiker sur PlanetHoster

Ce guide vous explique comment déployer votre application TaxiBiker sur PlanetHoster en utilisant GitHub et le déploiement continu.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration initiale](#configuration-initiale)
3. [Configuration GitHub](#configuration-github)
4. [Configuration PlanetHoster](#configuration-planethoster)
5. [Déploiement manuel](#déploiement-manuel)
6. [Déploiement automatique](#déploiement-automatique)
7. [Maintenance](#maintenance)
8. [Dépannage](#dépannage)

## 🔧 Prérequis

### Outils requis

- Node.js 18+
- PHP 8.2+
- Composer
- Git
- Compte GitHub
- Hébergement PlanetHoster avec:
  - Accès SSH
  - Base de données PostgreSQL
  - Support PHP 8.2+

### Structure du projet

```
TaxiBiker/
├── taxibiker-back/     # Backend Symfony
├── taxibiker-front/    # Frontend React
├── scripts/           # Scripts de déploiement
├── .github/workflows/ # GitHub Actions
└── config/           # Configurations
```

## ⚙️ Configuration initiale

### 1. Configuration de l'environnement de développement

Exécutez le script de configuration :

```bash
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

Ce script va :

- Installer les dépendances
- Créer les fichiers de configuration locaux
- Générer les clés JWT
- Créer les scripts de développement

### 2. Démarrage de l'environnement local

```bash
# Démarrer tout l'environnement
./scripts/start-all.sh

# Ou démarrer individuellement
./scripts/start-db.sh      # Base de données
./scripts/start-backend.sh # Backend Symfony
./scripts/start-frontend.sh # Frontend React
```

URLs locales :

- Frontend : http://localhost:3000
- Backend : http://localhost:8000
- API : http://localhost:8000/api

## 🐙 Configuration GitHub

### 1. Secrets GitHub

Dans votre repository GitHub, allez dans `Settings > Secrets and variables > Actions` et ajoutez :

#### Secrets pour Staging

```
PLANETHOSTER_STAGING_HOST=your-staging-domain.com
PLANETHOSTER_STAGING_USERNAME=your-staging-username
PLANETHOSTER_STAGING_PASSWORD=your-staging-password
```

#### Secrets pour Production

```
PLANETHOSTER_PROD_HOST=your-production-domain.com
PLANETHOSTER_PROD_USERNAME=your-production-username
PLANETHOSTER_PROD_PASSWORD=your-production-password
```

#### Secrets communs

```
JWT_PASSPHRASE=your-secure-jwt-passphrase
```

### 2. Branches de déploiement

- `main` → Déploiement automatique vers **staging**
- `production` → Déploiement automatique vers **production**

### 3. Workflow GitHub Actions

Le fichier `.github/workflows/deploy.yml` gère :

- Tests automatiques (frontend et backend)
- Build de production
- Déploiement FTP
- Commandes post-déploiement

## 🌐 Configuration PlanetHoster

### 1. Base de données PostgreSQL

1. Créez une base de données PostgreSQL dans votre panneau PlanetHoster
2. Notez les informations de connexion :
   - Host
   - Port (généralement 5432)
   - Nom de la base
   - Utilisateur
   - Mot de passe

### 2. Configuration des variables d'environnement

Créez un fichier `.env` dans le dossier `api/` sur votre serveur :

```bash
# Copiez le contenu de config/production.env.example
# Et adaptez avec vos vraies valeurs

APP_ENV=prod
APP_DEBUG=false
APP_SECRET=your-production-secret-key
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_PASSPHRASE=your-jwt-passphrase
# ... autres variables
```

### 3. Structure des fichiers sur le serveur

```
public_html/
├── index.html          # Frontend React
├── assets/            # Assets du frontend
├── .htaccess          # Redirection vers API
└── api/               # Backend Symfony
    ├── public/
    │   ├── index.php
    │   └── .htaccess
    ├── src/
    ├── config/
    └── ...
```

## 🚀 Déploiement manuel

### 1. Préparation du package

```bash
# Créer le package de déploiement
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### 2. Upload vers PlanetHoster

```bash
# Via FTP/SFTP, uploadez le contenu de deploy/public_html/
# vers votre dossier public_html/ sur PlanetHoster
```

### 3. Configuration post-déploiement

Connectez-vous en SSH à votre serveur et exécutez :

```bash
cd public_html
chmod +x post-deploy.sh
./post-deploy.sh
```

Ce script va :

- Installer les dépendances Composer
- Générer les clés JWT
- Exécuter les migrations
- Configurer les permissions

## 🤖 Déploiement automatique

### 1. Push vers staging

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

→ Déploiement automatique vers l'environnement de staging

### 2. Déploiement en production

```bash
# Créer une pull request de main vers production
# Ou merger directement
git checkout production
git merge main
git push origin production
```

→ Déploiement automatique vers la production

### 3. Surveillance des déploiements

- Consultez l'onglet `Actions` de votre repository GitHub
- Vérifiez les logs en cas d'erreur
- Testez votre application après chaque déploiement

## 🔧 Maintenance

### 1. Mise à jour des dépendances

```bash
# Backend
cd taxibiker-back
composer update

# Frontend
cd taxibiker-front
npm update
```

### 2. Migrations de base de données

Les migrations sont automatiquement exécutées lors du déploiement.

Pour les exécuter manuellement :

```bash
cd public_html/api
php bin/console doctrine:migrations:migrate --env=prod
```

### 3. Nettoyage du cache

```bash
cd public_html/api
php bin/console cache:clear --env=prod
```

### 4. Sauvegarde de la base de données

```bash
# Sur le serveur PlanetHoster
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d).sql
```

## 🐛 Dépannage

### Erreurs courantes

#### 1. Erreur 500 - Internal Server Error

**Causes possibles :**

- Fichier `.env` manquant ou mal configuré
- Permissions incorrectes
- Erreur PHP

**Solutions :**

```bash
# Vérifier les logs
tail -f public_html/api/var/log/prod.log

# Vérifier les permissions
chmod -R 755 public_html/api/var/

# Vérifier la configuration
cd public_html/api
php bin/console debug:config --env=prod
```

#### 2. Erreur de connexion à la base de données

**Vérifications :**

- URL de connexion dans `.env`
- Accessibilité de la base depuis le serveur
- Credentials corrects

```bash
# Test de connexion
cd public_html/api
php bin/console doctrine:database:create --if-not-exists --env=prod
```

#### 3. Erreurs JWT

**Solutions :**

```bash
# Régénérer les clés JWT
cd public_html/api
rm -rf config/jwt/*
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:your_passphrase
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:your_passphrase
chmod 644 config/jwt/*.pem
```

#### 4. Frontend ne se charge pas

**Vérifications :**

- Fichier `.htaccess` présent et correct
- Assets buildés correctement
- Pas d'erreurs dans la console du navigateur

### Logs utiles

```bash
# Logs Symfony
tail -f public_html/api/var/log/prod.log

# Logs Apache/Nginx (selon PlanetHoster)
tail -f /var/log/apache2/error.log

# Logs de déploiement GitHub Actions
# Consultez l'onglet Actions de votre repository
```

### Support

- **Documentation Symfony :** https://symfony.com/doc
- **Documentation React :** https://react.dev
- **Support PlanetHoster :** https://planethoster.com/support
- **GitHub Actions :** https://docs.github.com/actions

## 📚 Ressources supplémentaires

- [Guide de sécurité Symfony](https://symfony.com/doc/current/security.html)
- [Optimisation des performances React](https://react.dev/learn/render-and-commit)
- [Bonnes pratiques CI/CD](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)

---

**Note :** Ce guide suppose une configuration standard de PlanetHoster. Adaptez les chemins et commandes selon votre configuration spécifique.
