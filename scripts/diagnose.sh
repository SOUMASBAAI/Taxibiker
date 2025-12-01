#!/bin/bash

# Script de diagnostic pour TaxiBiker
echo "🔍 Diagnostic de l'environnement TaxiBiker"
echo "=========================================="

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

# Informations système
log_section "SYSTÈME"

echo "OS: $(uname -s) $(uname -r)"
echo "Architecture: $(uname -m)"

# PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    log_info "PHP: $PHP_VERSION"
    
    # Extensions critiques
    REQUIRED_EXTENSIONS=("pdo" "pdo_mysql" "mysql" "json" "mbstring" "xml" "ctype" "iconv")
    for ext in "${REQUIRED_EXTENSIONS[@]}"; do
        if php -m | grep -q "^$ext$"; then
            log_info "Extension PHP $ext: disponible"
        else
            log_error "Extension PHP $ext: MANQUANTE"
        fi
    done
else
    log_error "PHP: NON INSTALLÉ"
fi

# Composer
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version 2>/dev/null | head -n1)
    log_info "Composer: $COMPOSER_VERSION"
else
    log_error "Composer: NON INSTALLÉ"
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_info "Node.js: $NODE_VERSION"
else
    log_error "Node.js: NON INSTALLÉ"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_info "npm: $NPM_VERSION"
else
    log_error "npm: NON INSTALLÉ"
fi

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null)
    log_info "Docker: $DOCKER_VERSION"
else
    log_warning "Docker: NON INSTALLÉ (optionnel)"
fi

# Diagnostic du projet
log_section "PROJET"

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
echo "Répertoire: $PROJECT_ROOT"

# Structure des dossiers
if [ -d "$PROJECT_ROOT/taxibiker-back" ]; then
    log_info "Dossier backend: présent"
else
    log_error "Dossier backend: MANQUANT"
fi

if [ -d "$PROJECT_ROOT/taxibiker-front" ]; then
    log_info "Dossier frontend: présent"
else
    log_error "Dossier frontend: MANQUANT"
fi

# Backend
log_section "BACKEND (Symfony)"

if [ -d "$PROJECT_ROOT/taxibiker-back" ]; then
    cd "$PROJECT_ROOT/taxibiker-back"
    
    # composer.json
    if [ -f "composer.json" ]; then
        log_info "composer.json: présent"
    else
        log_error "composer.json: MANQUANT"
    fi
    
    # vendor
    if [ -d "vendor" ]; then
        log_info "Dossier vendor: présent"
    else
        log_warning "Dossier vendor: manquant (exécutez composer install)"
    fi
    
    # Configuration Symfony
    if [ -f "bin/console" ]; then
        if php bin/console --version > /dev/null 2>&1; then
            SYMFONY_VERSION=$(php bin/console --version 2>/dev/null | head -n1)
            log_info "Symfony: $SYMFONY_VERSION"
        else
            log_error "Symfony: erreur de configuration"
        fi
    else
        log_error "bin/console: MANQUANT"
    fi
    
    # Configuration .env
    if [ -f ".env.local" ]; then
        log_info "Configuration .env.local: présente"
    else
        log_warning "Configuration .env.local: manquante"
    fi
    
    # Clés JWT
    if [ -f "config/jwt/private.pem" ] && [ -f "config/jwt/public.pem" ]; then
        log_info "Clés JWT: présentes"
    else
        log_warning "Clés JWT: manquantes"
    fi
    
    # Permissions
    if [ -w "var" ] 2>/dev/null; then
        log_info "Permissions var/: OK"
    else
        log_warning "Permissions var/: problème possible"
    fi
fi

# Frontend
log_section "FRONTEND (React)"

if [ -d "$PROJECT_ROOT/taxibiker-front" ]; then
    cd "$PROJECT_ROOT/taxibiker-front"
    
    # package.json
    if [ -f "package.json" ]; then
        log_info "package.json: présent"
        
        # Version React
        if [ -f "node_modules/react/package.json" ]; then
            REACT_VERSION=$(node -p "require('./node_modules/react/package.json').version" 2>/dev/null)
            log_info "React: $REACT_VERSION"
        fi
    else
        log_error "package.json: MANQUANT"
    fi
    
    # node_modules
    if [ -d "node_modules" ]; then
        log_info "Dossier node_modules: présent"
    else
        log_warning "Dossier node_modules: manquant (exécutez npm install)"
    fi
    
    # Configuration Vite
    if [ -f "vite.config.js" ]; then
        log_info "Configuration Vite: présente"
    else
        log_error "vite.config.js: MANQUANT"
    fi
fi

# Base de données
log_section "BASE DE DONNÉES"

if [ -d "$PROJECT_ROOT/taxibiker-back" ]; then
    cd "$PROJECT_ROOT/taxibiker-back"
    
    # Test de connexion (si possible)
    if [ -f "bin/console" ] && [ -d "vendor" ]; then
        if php bin/console doctrine:database:create --if-not-exists --dry-run > /dev/null 2>&1; then
            log_info "Configuration base de données: OK"
        else
            log_warning "Configuration base de données: problème possible"
        fi
    fi
fi

# Docker
log_section "DOCKER"

if command -v docker &> /dev/null; then
    if docker ps > /dev/null 2>&1; then
        log_info "Docker daemon: actif"
        
        # Conteneurs TaxiBiker
        if docker ps --format "table {{.Names}}" | grep -q "taxibiker"; then
            log_info "Conteneurs TaxiBiker: actifs"
        else
            log_warning "Conteneurs TaxiBiker: inactifs"
        fi
    else
        log_warning "Docker daemon: inactif"
    fi
fi

# Résumé et recommandations
log_section "RECOMMANDATIONS"

echo ""
if command -v php &> /dev/null && command -v composer &> /dev/null && command -v node &> /dev/null && command -v npm &> /dev/null; then
    log_info "Tous les outils requis sont installés"
    
    if [ -d "$PROJECT_ROOT/taxibiker-back/vendor" ] && [ -d "$PROJECT_ROOT/taxibiker-front/node_modules" ]; then
        log_info "Dépendances installées"
        echo ""
        echo "🚀 Vous pouvez démarrer l'application avec:"
        echo "   ./scripts/start-all.sh"
    else
        log_warning "Dépendances manquantes"
        echo ""
        echo "🔧 Exécutez d'abord:"
        echo "   ./scripts/setup-dev.sh"
    fi
else
    log_error "Outils manquants détectés"
    echo ""
    echo "📚 Consultez le guide d'installation:"
    echo "   README.md"
fi

echo ""
echo "📋 Pour plus d'aide:"
echo "   - Guide de dépannage: TROUBLESHOOTING.md"
echo "   - Documentation: DEPLOYMENT.md"
