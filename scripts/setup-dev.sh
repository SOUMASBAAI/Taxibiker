#!/bin/bash

# Script de configuration de l'environnement de développement
set -e

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🛠️  Configuration de l'environnement de développement TaxiBiker"

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
log_info "Vérification des prérequis..."

if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé. Version requise: 8.2+"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    log_error "Composer n'est pas installé. Veuillez l'installer depuis https://getcomposer.org/"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    log_warning "Docker n'est pas installé. Il est recommandé pour la base de données locale."
fi

# Configuration du backend
log_info "Configuration du backend Symfony..."
cd "$PROJECT_ROOT/taxibiker-back"

# Installation des dépendances
log_info "Installation des dépendances Composer..."

# Vérifier s'il y a des problèmes de compatibilité
if ! composer install --dry-run > /dev/null 2>&1; then
    log_warning "Problème de compatibilité détecté, résolution automatique..."
    
    # Sauvegarder composer.lock
    if [ -f "composer.lock" ]; then
        cp composer.lock composer.lock.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Supprimer composer.lock et réinstaller
    rm -f composer.lock
    composer install --no-interaction
else
    composer install
fi

# Création du fichier .env local s'il n'existe pas
if [ ! -f ".env.local" ]; then
    log_info "Création du fichier .env.local..."
    cat > .env.local << 'EOF'
# Configuration locale de développement
APP_ENV=dev
APP_DEBUG=true
APP_SECRET=dev_secret_key_change_in_production

# Base de données locale (MySQL avec Docker)
# Base de données MySQL locale (XAMPP/WAMP/MAMP ou installation native)
# Adaptez selon votre configuration :
# XAMPP/WAMP : DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4
# Avec mot de passe : DATABASE_URL=mysql://root:password@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4
DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4

# Configuration JWT pour le développement
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=dev_passphrase

# Configuration CORS pour le développement
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$

# Configuration Twilio (optionnel en dev)
# TWILIO_ACCOUNT_SID=your_dev_account_sid
# TWILIO_AUTH_TOKEN=your_dev_auth_token
# TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
EOF
    log_info "✅ Fichier .env.local créé"
else
    log_info "Fichier .env.local existe déjà"
fi

# Génération des clés JWT
if [ ! -f "config/jwt/private.pem" ]; then
    log_info "Génération des clés JWT pour le développement..."
    mkdir -p config/jwt
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:dev_passphrase
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:dev_passphrase
    log_info "✅ Clés JWT générées"
else
    log_info "Clés JWT existent déjà"
fi

# Configuration du frontend
log_info "Configuration du frontend React..."
cd "$PROJECT_ROOT/taxibiker-front"

# Installation des dépendances
log_info "Installation des dépendances npm..."
npm install

# Création du fichier .env.local s'il n'existe pas
if [ ! -f ".env.local" ]; then
    log_info "Création du fichier .env.local pour le frontend..."
    cat > .env.local << 'EOF'
# Configuration locale de développement pour React
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=TaxiBiker (Dev)
VITE_APP_VERSION=1.0.0-dev

# Configuration Google Maps (optionnel)
# VITE_GOOGLE_MAPS_API_KEY=your_dev_google_maps_api_key

# Configuration de l'environnement
VITE_NODE_ENV=development
EOF
    log_info "✅ Fichier .env.local créé pour le frontend"
else
    log_info "Fichier .env.local existe déjà pour le frontend"
fi

# Retour au répertoire racine
cd "$PROJECT_ROOT"

# Création des scripts de développement
log_info "Création des scripts de développement..."

# Script pour démarrer la base de données
cat > scripts/start-db.sh << 'EOF'
#!/bin/bash
echo "🗄️  Démarrage de la base de données MySQL..."
cd taxibiker-back
docker-compose up -d database
echo "✅ Base de données démarrée sur le port 3306"
EOF

# Script pour arrêter la base de données
cat > scripts/stop-db.sh << 'EOF'
#!/bin/bash
echo "🛑 Arrêt de la base de données MySQL..."
cd taxibiker-back
docker-compose down
echo "✅ Base de données arrêtée"
EOF

# Script pour démarrer le backend
cat > scripts/start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage du backend Symfony..."
cd taxibiker-back

# Vérifier si la base de données est accessible
echo "🔍 Vérification de la connexion à la base de données..."
php bin/console doctrine:database:create --if-not-exists --no-interaction

# Exécuter les migrations
echo "🗄️  Exécution des migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

# Charger les fixtures (optionnel)
if [ "$1" = "--fixtures" ]; then
    echo "📊 Chargement des fixtures..."
    php bin/console doctrine:fixtures:load --no-interaction
fi

# Démarrer le serveur de développement
echo "🌐 Démarrage du serveur Symfony sur http://localhost:8000"
symfony serve --port=8000 --no-tls || php -S localhost:8000 -t public/
EOF

# Script pour démarrer le frontend
cat > scripts/start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage du frontend React..."
cd taxibiker-front
echo "🌐 Démarrage du serveur Vite sur http://localhost:3000"
npm run dev
EOF

# Script pour démarrer tout l'environnement
cat > scripts/start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Démarrage de l'environnement de développement complet..."

# Fonction pour gérer l'arrêt propre
cleanup() {
    echo "🛑 Arrêt de l'environnement de développement..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Démarrer la base de données
./scripts/start-db.sh

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 5

# Démarrer le backend en arrière-plan
echo "🚀 Démarrage du backend..."
./scripts/start-backend.sh &

# Attendre que le backend soit prêt
echo "⏳ Attente du backend..."
sleep 10

# Démarrer le frontend
echo "🚀 Démarrage du frontend..."
./scripts/start-frontend.sh

# Garder le script actif
wait
EOF

# Rendre les scripts exécutables
chmod +x scripts/*.sh

log_info "✅ Scripts de développement créés"

# Affichage du résumé
echo ""
log_info "🎉 Configuration terminée avec succès!"
echo ""
echo "📋 Commandes disponibles:"
echo "   ./scripts/start-db.sh      - Démarrer uniquement la base de données"
echo "   ./scripts/stop-db.sh       - Arrêter la base de données"
echo "   ./scripts/start-backend.sh - Démarrer uniquement le backend"
echo "   ./scripts/start-frontend.sh- Démarrer uniquement le frontend"
echo "   ./scripts/start-all.sh     - Démarrer tout l'environnement"
echo ""
echo "🌐 URLs de développement:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API:      http://localhost:8000/api"
echo ""
log_warning "⚠️  N'oubliez pas de:"
echo "1. Configurer vos vraies clés API dans les fichiers .env.local"
echo "2. Démarrer Docker si vous utilisez la base de données locale"
echo "3. Vérifier que les ports 3000 et 8000 sont libres"
