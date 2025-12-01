# Configuration PlanetHoster pour TaxiBiker

Ce guide détaille la configuration spécifique à PlanetHoster pour déployer TaxiBiker.

## 📋 Prérequis PlanetHoster

### Plan d'hébergement requis

- **Plan recommandé** : World Lite ou supérieur
- **PHP** : Version 8.2 ou supérieure
- **Base de données** : MySQL 8.0 ou supérieure
- **Espace disque** : Minimum 1 GB
- **Accès SSH** : Requis pour les scripts de déploiement

### Extensions PHP requises

Vérifiez que ces extensions sont activées dans votre panneau de contrôle :

- `ctype`
- `iconv`
- `pdo`
- `pdo_mysql`
- `mysql`
- `json`
- `mbstring`
- `xml`
- `curl`
- `openssl`

## 🗄️ Configuration de la base de données

### 1. Création de la base MySQL

1. Connectez-vous à votre panneau PlanetHoster
2. Allez dans **Bases de données > MySQL**
3. Créez une nouvelle base de données :
   - **Nom** : `taxibiker_prod` (ou `taxibiker_staging`)
   - **Utilisateur** : Créez un utilisateur dédié
   - **Mot de passe** : Générez un mot de passe sécurisé

### 2. Configuration de l'accès

Notez les informations suivantes :

```
Host: your-database-host.planethoster.com
Port: 3306
Database: taxibiker_prod
Username: your_db_user
Password: your_secure_password
```

### 3. URL de connexion

Format de l'URL pour le fichier `.env` :

```
DATABASE_URL=mysql://username:password@host:3306/database_name?serverVersion=8.0&charset=utf8mb4
```

## 🌐 Configuration du domaine

### 1. Configuration DNS

Si vous utilisez un domaine personnalisé :

1. Pointez votre domaine vers les serveurs PlanetHoster
2. Configurez les enregistrements A/CNAME selon les instructions PlanetHoster

### 2. SSL/TLS

PlanetHoster fournit automatiquement des certificats Let's Encrypt :

- Activez le SSL dans votre panneau de contrôle
- Forcez la redirection HTTPS

## 📁 Structure des fichiers sur le serveur

```
/home/username/public_html/
├── index.html              # Page d'accueil React
├── assets/                 # Assets statiques du frontend
├── .htaccess              # Redirections et configuration Apache
└── api/                   # Backend Symfony
    ├── public/
    │   ├── index.php      # Point d'entrée Symfony
    │   └── .htaccess      # Configuration API
    ├── src/               # Code source Symfony
    ├── config/            # Configuration Symfony
    ├── var/               # Cache et logs
    ├── vendor/            # Dépendances Composer
    ├── .env               # Variables d'environnement PRODUCTION
    └── composer.json      # Dépendances PHP
```

## ⚙️ Variables d'environnement

### Fichier `.env` à créer dans `/public_html/api/`

```bash
# Configuration de production
APP_ENV=prod
APP_DEBUG=false

# Clé secrète (générez une clé unique)
APP_SECRET=your_unique_32_character_secret_key

# Base de données MySQL
DATABASE_URL=mysql://your_db_user:your_db_password@your_db_host:3306/your_db_name?serverVersion=8.0&charset=utf8mb4

# Configuration JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_secure_jwt_passphrase

# CORS (remplacez par votre domaine)
CORS_ALLOW_ORIGIN=^https://your-domain\.com$

# Configuration Twilio (optionnel)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Configuration email (utilisez les paramètres SMTP de PlanetHoster)
MAILER_DSN=smtp://your_email:your_password@mail.planethoster.com:587

# Timezone
TIMEZONE=Europe/Paris
```

## 🔐 Configuration SSH

### 1. Accès SSH

PlanetHoster fournit un accès SSH pour les plans World :

- **Host** : Votre domaine ou l'IP fournie
- **Port** : 22 (par défaut)
- **Username** : Votre nom d'utilisateur PlanetHoster
- **Password** : Votre mot de passe PlanetHoster

### 2. Clés SSH (recommandé)

Pour une sécurité renforcée, configurez des clés SSH :

```bash
# Générer une paire de clés
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copier la clé publique sur le serveur
ssh-copy-id username@your-server.com
```

## 🚀 Déploiement initial

### 1. Upload des fichiers

Utilisez FTP, SFTP ou rsync pour uploader les fichiers :

```bash
# Exemple avec rsync
rsync -avz --delete deploy/public_html/ username@your-server.com:public_html/
```

### 2. Configuration post-upload

Connectez-vous en SSH et exécutez :

```bash
cd public_html/api

# Installer les dépendances Composer
composer install --no-dev --optimize-autoloader

# Créer les dossiers nécessaires
mkdir -p var/cache var/log config/jwt

# Générer les clés JWT
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:your_jwt_passphrase
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:your_jwt_passphrase

# Configurer les permissions
chmod -R 755 var/
chmod 644 config/jwt/*.pem

# Vider le cache
php bin/console cache:clear --env=prod

# Exécuter les migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

## 🔧 Configuration Apache (.htaccess)

### Fichier principal `/public_html/.htaccess`

```apache
RewriteEngine On

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API routes
RewriteRule ^api/(.*)$ api/public/index.php [QSA,L]

# Frontend routes (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header append Cache-Control "public, immutable"
</FilesMatch>

# Compress text files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript application/x-javascript
</IfModule>
```

### Fichier API `/public_html/api/public/.htaccess`

```apache
RewriteEngine On

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY

# Symfony routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]

# Deny access to sensitive files
<FilesMatch "\.(env|yml|yaml|json|lock|md)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Deny access to directories
RedirectMatch 404 /\..*$
```

## 📊 Monitoring et logs

### 1. Logs d'application

Les logs Symfony sont dans `/public_html/api/var/log/` :

- `prod.log` : Logs de production
- `dev.log` : Logs de développement (si activé)

### 2. Logs Apache

Les logs Apache sont généralement dans `/var/log/apache2/` ou accessibles via le panneau PlanetHoster.

### 3. Monitoring de santé

L'endpoint `/api/health` fournit des informations sur l'état de l'application :

- Status général
- Connexion base de données
- Utilisation mémoire
- Permissions fichiers

## 🔄 Mise à jour et maintenance

### 1. Déploiement automatique

Avec GitHub Actions configuré, les déploiements se font automatiquement :

- Push sur `main` → Staging
- Push sur `production` → Production

### 2. Maintenance manuelle

```bash
# Mise à jour des dépendances
composer update --no-dev

# Nettoyage du cache
php bin/console cache:clear --env=prod

# Nouvelles migrations
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

### 3. Sauvegarde

Configurez des sauvegardes régulières :

- Base de données PostgreSQL
- Fichiers uploadés
- Configuration

## 🆘 Dépannage

### Erreurs courantes

1. **Erreur 500** : Vérifiez les logs dans `var/log/prod.log`
2. **Connexion DB** : Vérifiez l'URL dans `.env`
3. **Permissions** : `chmod -R 755 var/`
4. **Cache** : `php bin/console cache:clear --env=prod`

### Support PlanetHoster

- **Documentation** : https://planethoster.com/support
- **Ticket support** : Via le panneau de contrôle
- **Chat en direct** : Disponible aux heures ouvrables

## 📞 Contact

Pour toute question spécifique à ce déploiement :

- Email : support@taxibiker.com
- Documentation : [DEPLOYMENT.md](../DEPLOYMENT.md)
