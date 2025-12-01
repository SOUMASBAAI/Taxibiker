#!/bin/bash

# Script de migration de PostgreSQL vers MySQL
set -e

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🔄 Migration de PostgreSQL vers MySQL pour TaxiBiker"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Vérification des prérequis
log_section "Vérification des prérequis"

if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    log_error "Composer n'est pas installé"
    exit 1
fi

# Vérifier que l'extension MySQL est disponible
if ! php -m | grep -q "mysql"; then
    log_error "Extension PHP MySQL non disponible"
    echo "Installez l'extension avec: sudo apt-get install php-mysql (Ubuntu/Debian)"
    exit 1
fi

if ! php -m | grep -q "pdo_mysql"; then
    log_error "Extension PHP PDO MySQL non disponible"
    echo "Installez l'extension avec: sudo apt-get install php-mysql (Ubuntu/Debian)"
    exit 1
fi

log_info "Extensions MySQL disponibles"

# Sauvegarde de l'ancienne configuration
log_section "Sauvegarde de la configuration"

cd "$PROJECT_ROOT/taxibiker-back"

if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Sauvegarde de .env.local créée"
fi

if [ -f "config/packages/doctrine.yaml" ]; then
    cp config/packages/doctrine.yaml config/packages/doctrine.yaml.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Sauvegarde de doctrine.yaml créée"
fi

# Mise à jour du composer.json si nécessaire
log_section "Vérification des dépendances"

# Vérifier si doctrine/dbal supporte MySQL (normalement oui)
if composer show doctrine/dbal | grep -q "doctrine/dbal"; then
    log_info "Doctrine DBAL est installé et supporte MySQL"
else
    log_warning "Doctrine DBAL non trouvé, installation..."
    composer require doctrine/dbal
fi

# Mise à jour de la configuration .env.local
log_section "Mise à jour de la configuration"

if [ -f ".env.local" ]; then
    # Remplacer PostgreSQL par MySQL dans .env.local
    sed -i.bak 's|postgresql://|mysql://|g' .env.local
    sed -i.bak 's|:5432/|:3306/|g' .env.local
    sed -i.bak 's|serverVersion=16|serverVersion=8.0|g' .env.local
    sed -i.bak 's|charset=utf8|charset=utf8mb4|g' .env.local
    
    log_info "Configuration .env.local mise à jour"
else
    log_warning "Fichier .env.local non trouvé, création..."
    cat > .env.local << 'EOF'
# Configuration locale MySQL
APP_ENV=dev
APP_DEBUG=true
APP_SECRET=dev_secret_key_change_in_production

# Base de données MySQL locale
DATABASE_URL=mysql://app:!ChangeMe!@127.0.0.1:3306/app?serverVersion=8.0&charset=utf8mb4

# Configuration JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=dev_passphrase

# CORS pour le développement
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
EOF
    log_info "Fichier .env.local créé avec configuration MySQL"
fi

# Nettoyage du cache
log_section "Nettoyage du cache"

if [ -d "var/cache" ]; then
    rm -rf var/cache/*
    log_info "Cache Symfony nettoyé"
fi

# Vérification de la configuration Doctrine
log_section "Vérification de la configuration Doctrine"

# Tester la configuration
if php bin/console debug:config doctrine > /dev/null 2>&1; then
    log_info "Configuration Doctrine valide"
else
    log_error "Erreur dans la configuration Doctrine"
    echo "Vérifiez le fichier config/packages/doctrine.yaml"
    exit 1
fi

# Instructions pour la suite
log_section "Prochaines étapes"

echo ""
log_info "Migration de la configuration terminée !"
echo ""
echo "📋 Étapes suivantes à effectuer manuellement :"
echo ""
echo "1. 🗄️  Démarrer MySQL :"
echo "   ./scripts/start-db.sh"
echo ""
echo "2. 🔧 Créer la base de données :"
echo "   cd taxibiker-back"
echo "   php bin/console doctrine:database:create"
echo ""
echo "3. 📊 Exporter les données de PostgreSQL (si applicable) :"
echo "   pg_dump -h localhost -U user -d database > backup.sql"
echo ""
echo "4. 🔄 Générer les nouvelles migrations :"
echo "   php bin/console doctrine:migrations:diff"
echo ""
echo "5. ⚡ Exécuter les migrations :"
echo "   php bin/console doctrine:migrations:migrate"
echo ""
echo "6. 🧪 Charger les fixtures (données de test) :"
echo "   php bin/console doctrine:fixtures:load"
echo ""
echo "7. ✅ Tester l'application :"
echo "   ./scripts/start-backend.sh"
echo ""

log_warning "⚠️  Important :"
echo "- Sauvegardez vos données PostgreSQL avant de les supprimer"
echo "- Testez toutes les fonctionnalités après la migration"
echo "- Vérifiez que tous les types de données sont correctement mappés"

echo ""
log_info "📚 Documentation :"
echo "- Consultez config/mysql-migration-notes.md pour plus de détails"
echo "- En cas de problème, restaurez les fichiers .backup"

echo ""
echo -e "${GREEN}🎉 Configuration MySQL prête !${NC}"
