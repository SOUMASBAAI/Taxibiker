#!/bin/bash

# Script pour démarrer uniquement le backend Symfony
echo "🚀 Démarrage du backend Symfony..."

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$PROJECT_ROOT/taxibiker-back"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Vérifications préalables
if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé"
    exit 1
fi

if [ ! -d "vendor" ]; then
    log_warning "Dépendances manquantes, installation..."
    
    if ! composer install; then
        log_error "Échec de l'installation des dépendances"
        exit 1
    fi
fi

# Vérifier la configuration
if ! php bin/console --version > /dev/null 2>&1; then
    log_error "Configuration Symfony invalide"
    exit 1
fi

# Vérifier la connexion à la base de données
echo "🔍 Vérification de la connexion à la base de données..."
if php bin/console doctrine:database:create --if-not-exists --no-interaction > /dev/null 2>&1; then
    log_info "Connexion à la base de données OK"
else
    log_warning "Problème de connexion à la base de données"
    echo "Assurez-vous que MySQL est démarré : ./scripts/start-db.sh"
fi

# Exécuter les migrations
echo "🗄️  Exécution des migrations..."
if php bin/console doctrine:migrations:migrate --no-interaction > /dev/null 2>&1; then
    log_info "Migrations exécutées"
else
    log_warning "Problème avec les migrations (peut-être déjà à jour)"
fi

# Charger les fixtures si demandé
if [ "$1" = "--fixtures" ]; then
    echo "📊 Chargement des fixtures..."
    if php bin/console doctrine:fixtures:load --no-interaction; then
        log_info "Fixtures chargées"
    else
        log_warning "Problème avec les fixtures"
    fi
fi

# Générer les clés JWT si nécessaires
if [ ! -f "config/jwt/private.pem" ]; then
    echo "🔑 Génération des clés JWT..."
    mkdir -p config/jwt
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:dev_passphrase > /dev/null 2>&1
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:dev_passphrase > /dev/null 2>&1
    chmod 644 config/jwt/*.pem
    log_info "Clés JWT générées"
fi

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
php bin/console cache:clear > /dev/null 2>&1

# Démarrer le serveur
echo "🌐 Démarrage du serveur Symfony sur http://localhost:8000"

# Utiliser Symfony CLI si disponible, sinon PHP built-in server
if command -v symfony &> /dev/null; then
    log_info "Utilisation de Symfony CLI"
    symfony serve --port=8000 --no-tls
else
    log_info "Utilisation du serveur PHP intégré"
    php -S localhost:8000 -t public/
fi
