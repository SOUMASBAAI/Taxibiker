#!/bin/bash

# Script de déploiement pour PlanetHoster
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🚀 Déploiement de Taxi Biker Paris vers l'environnement: $ENVIRONMENT"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que l'environnement est valide
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Environnement invalide. Utilisez 'staging' ou 'production'"
    exit 1
fi

# Vérifier les prérequis
log_info "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    log_error "Composer n'est pas installé"
    exit 1
fi

# Nettoyer les anciens builds
log_info "Nettoyage des anciens builds..."
rm -rf "$PROJECT_ROOT/deploy"
mkdir -p "$PROJECT_ROOT/deploy/public_html"

# Build du frontend
log_info "Build du frontend React..."
cd "$PROJECT_ROOT/taxibiker-front"

# Installer les dépendances
npm ci

# Copier le fichier d'environnement approprié
if [[ -f "env.$ENVIRONMENT.example" ]]; then
    cp "env.$ENVIRONMENT.example" ".env.production"
    log_warning "Fichier .env.production créé à partir de l'exemple. Veuillez le configurer avec vos vraies valeurs."
fi

# Build de production
npm run build

# Copier le build vers le dossier de déploiement
cp -r dist/* "$PROJECT_ROOT/deploy/public_html/"

log_info "✅ Frontend buildé avec succès"

# Préparation du backend
log_info "Préparation du backend Symfony..."
cd "$PROJECT_ROOT/taxibiker-back"

# Installer les dépendances de production
composer install --no-dev --optimize-autoloader --no-interaction

# Copier le backend vers le dossier de déploiement
mkdir -p "$PROJECT_ROOT/deploy/public_html/api"
cp -r . "$PROJECT_ROOT/deploy/public_html/api/"

# Nettoyer les fichiers non nécessaires en production
cd "$PROJECT_ROOT/deploy/public_html/api"
rm -rf var/cache/* var/log/* .git .env.test

log_info "✅ Backend préparé avec succès"

# Créer les fichiers .htaccess
log_info "Création des fichiers .htaccess..."

# .htaccess principal (frontend)
cat > "$PROJECT_ROOT/deploy/public_html/.htaccess" << 'EOF'
RewriteEngine On

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

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
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

# .htaccess pour l'API
cat > "$PROJECT_ROOT/deploy/public_html/api/public/.htaccess" << 'EOF'
RewriteEngine On

# Security headers for API
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# CORS headers (sera géré par Symfony)
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

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
EOF

log_info "✅ Fichiers .htaccess créés"

# Créer le script de post-déploiement
log_info "Création du script de post-déploiement..."

cat > "$PROJECT_ROOT/deploy/post-deploy.sh" << 'EOF'
#!/bin/bash

# Script à exécuter sur le serveur après le déploiement
set -e

cd public_html/api

echo "🔧 Configuration post-déploiement..."

# Créer les dossiers nécessaires
mkdir -p var/cache var/log config/jwt

# Installer les dépendances Composer si nécessaire
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    echo "📦 Installation des dépendances Composer..."
    composer install --no-dev --optimize-autoloader --no-interaction
fi

# Générer les clés JWT si elles n'existent pas
if [ ! -f "config/jwt/private.pem" ]; then
    echo "🔑 Génération des clés JWT..."
    read -s -p "Entrez la passphrase JWT: " JWT_PASSPHRASE
    echo
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:$JWT_PASSPHRASE
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:$JWT_PASSPHRASE
    chmod 644 config/jwt/*.pem
fi

# Vider le cache Symfony
echo "🧹 Nettoyage du cache..."
php bin/console cache:clear --env=prod --no-debug

# Exécuter les migrations de base de données
echo "🗄️ Exécution des migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --env=prod

# Charger les fixtures seulement si explicitement demandé
if [ "$LOAD_FIXTURES" = "true" ]; then
    echo "📥 Chargement des fixtures..."
    php bin/console doctrine:fixtures:load --no-interaction --env=prod --append 2>&1 || echo "⚠️  Fixtures déjà chargées ou erreur (non bloquant)"
else
    echo "⏭️  Chargement des fixtures désactivé (utilisez LOAD_FIXTURES=true pour les charger)"
fi

# Définir les permissions appropriées
echo "🔒 Configuration des permissions..."
chmod -R 755 var/
find var/ -type f -exec chmod 644 {} \;

echo "✅ Post-déploiement terminé avec succès!"
EOF

chmod +x "$PROJECT_ROOT/deploy/post-deploy.sh"

# Afficher le résumé
log_info "📦 Package de déploiement créé dans: $PROJECT_ROOT/deploy/"
log_info "📁 Contenu du package:"
echo "   - public_html/ (contient le frontend et l'API)"
echo "   - post-deploy.sh (script à exécuter sur le serveur)"

log_warning "⚠️  Actions à effectuer manuellement:"
echo "1. Configurer les variables d'environnement sur PlanetHoster"
echo "2. Créer la base de données PostgreSQL"
echo "3. Uploader le contenu de deploy/public_html/ vers votre hébergement"
echo "4. Exécuter le script post-deploy.sh sur le serveur"
echo "5. Configurer les secrets GitHub pour le déploiement automatique"

log_info "🎉 Déploiement préparé avec succès pour l'environnement: $ENVIRONMENT"
