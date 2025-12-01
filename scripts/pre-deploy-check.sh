#!/bin/bash

# Script de vérification pré-déploiement
set -e

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
ENVIRONMENT=${1:-staging}

echo "🔍 Vérification pré-déploiement pour l'environnement: $ENVIRONMENT"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Compteurs
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((CHECKS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
    ((CHECKS_WARNING++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((CHECKS_FAILED++))
}

log_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Vérification des prérequis
log_section "Vérification des outils"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_info "Node.js installé: $NODE_VERSION"
else
    log_error "Node.js n'est pas installé"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_info "npm installé: $NPM_VERSION"
else
    log_error "npm n'est pas installé"
fi

if command -v php &> /dev/null; then
    PHP_VERSION=$(php --version | head -n 1)
    log_info "PHP installé: $PHP_VERSION"
else
    log_error "PHP n'est pas installé"
fi

if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version)
    log_info "Composer installé: $COMPOSER_VERSION"
else
    log_error "Composer n'est pas installé"
fi

# Vérification de la structure du projet
log_section "Structure du projet"

if [ -d "$PROJECT_ROOT/taxibiker-back" ]; then
    log_info "Dossier backend trouvé"
else
    log_error "Dossier backend manquant"
fi

if [ -d "$PROJECT_ROOT/taxibiker-front" ]; then
    log_info "Dossier frontend trouvé"
else
    log_error "Dossier frontend manquant"
fi

if [ -f "$PROJECT_ROOT/taxibiker-back/composer.json" ]; then
    log_info "composer.json trouvé"
else
    log_error "composer.json manquant"
fi

if [ -f "$PROJECT_ROOT/taxibiker-front/package.json" ]; then
    log_info "package.json trouvé"
else
    log_error "package.json manquant"
fi

# Vérification des dépendances backend
log_section "Dépendances Backend"

cd "$PROJECT_ROOT/taxibiker-back"

if [ -d "vendor" ]; then
    log_info "Dossier vendor existe"
else
    log_warning "Dossier vendor manquant - installation requise"
fi

# Vérifier les extensions PHP requises
REQUIRED_EXTENSIONS=("ctype" "iconv" "pdo" "mysql" "json" "mbstring" "xml")

for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if php -m | grep -q "^$ext$"; then
        log_info "Extension PHP $ext disponible"
    else
        log_error "Extension PHP $ext manquante"
    fi
done

# Vérification des dépendances frontend
log_section "Dépendances Frontend"

cd "$PROJECT_ROOT/taxibiker-front"

if [ -d "node_modules" ]; then
    log_info "Dossier node_modules existe"
else
    log_warning "Dossier node_modules manquant - installation requise"
fi

# Vérification des fichiers de configuration
log_section "Configuration"

# Backend
cd "$PROJECT_ROOT/taxibiker-back"

if [ -f "composer.lock" ]; then
    log_info "composer.lock présent"
else
    log_warning "composer.lock manquant"
fi

# Frontend
cd "$PROJECT_ROOT/taxibiker-front"

if [ -f "package-lock.json" ]; then
    log_info "package-lock.json présent"
else
    log_warning "package-lock.json manquant"
fi

if [ -f "vite.config.js" ]; then
    log_info "Configuration Vite présente"
else
    log_error "Configuration Vite manquante"
fi

# Vérification des fichiers d'environnement
log_section "Variables d'environnement"

if [ -f "$PROJECT_ROOT/config/production.env.example" ]; then
    log_info "Exemple de configuration production trouvé"
else
    log_warning "Exemple de configuration production manquant"
fi

if [ -f "$PROJECT_ROOT/taxibiker-front/env.production.example" ]; then
    log_info "Exemple de configuration frontend trouvé"
else
    log_warning "Exemple de configuration frontend manquant"
fi

# Tests de build
log_section "Tests de build"

# Test du build frontend
cd "$PROJECT_ROOT/taxibiker-front"

if [ "$ENVIRONMENT" = "production" ] || [ "$2" = "--full-check" ]; then
    echo "🔨 Test du build frontend..."
    if npm run build > /dev/null 2>&1; then
        log_info "Build frontend réussi"
        # Nettoyer le build de test
        rm -rf dist/
    else
        log_error "Échec du build frontend"
    fi
fi

# Vérification de la syntaxe PHP
cd "$PROJECT_ROOT/taxibiker-back"

echo "🔍 Vérification de la syntaxe PHP..."
if find src/ -name "*.php" -exec php -l {} \; | grep -q "Parse error"; then
    log_error "Erreurs de syntaxe PHP détectées"
else
    log_info "Syntaxe PHP correcte"
fi

# Vérification des migrations
if [ -d "migrations" ]; then
    MIGRATION_COUNT=$(find migrations/ -name "*.php" | wc -l)
    log_info "$MIGRATION_COUNT migrations trouvées"
else
    log_warning "Dossier migrations manquant"
fi

# Vérification de la configuration Symfony
if [ -f "config/services.yaml" ]; then
    log_info "Configuration Symfony présente"
else
    log_error "Configuration Symfony manquante"
fi

# Vérification des workflows GitHub Actions
log_section "CI/CD"

if [ -f "$PROJECT_ROOT/.github/workflows/deploy.yml" ]; then
    log_info "Workflow GitHub Actions présent"
else
    log_warning "Workflow GitHub Actions manquant"
fi

# Vérification Git
log_section "Contrôle de version"

cd "$PROJECT_ROOT"

if git rev-parse --git-dir > /dev/null 2>&1; then
    log_info "Repository Git initialisé"
    
    # Vérifier s'il y a des changements non commités
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Changements non commités détectés"
        git status --short
    else
        log_info "Aucun changement non commité"
    fi
    
    # Vérifier la branche actuelle
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Branche actuelle: $CURRENT_BRANCH"
    
    if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "production" ]; then
        log_warning "Déploiement production depuis la branche $CURRENT_BRANCH"
    fi
    
else
    log_error "Repository Git non initialisé"
fi

# Vérification de sécurité basique
log_section "Sécurité"

# Vérifier les fichiers sensibles
SENSITIVE_FILES=(".env" ".env.local" ".env.prod" "config/jwt/private.pem")

for file in "${SENSITIVE_FILES[@]}"; do
    if find "$PROJECT_ROOT" -name "$file" -type f 2>/dev/null | grep -q .; then
        log_warning "Fichier sensible détecté: $file (vérifiez qu'il n'est pas versionné)"
    fi
done

# Vérifier le .gitignore
if [ -f "$PROJECT_ROOT/.gitignore" ]; then
    if grep -q ".env" "$PROJECT_ROOT/.gitignore"; then
        log_info "Fichiers .env ignorés par Git"
    else
        log_warning "Fichiers .env non ignorés par Git"
    fi
else
    log_warning "Fichier .gitignore manquant"
fi

# Résumé final
log_section "Résumé"

echo -e "✅ Vérifications réussies: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "⚠️  Avertissements: ${YELLOW}$CHECKS_WARNING${NC}"
echo -e "❌ Erreurs: ${RED}$CHECKS_FAILED${NC}"

if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ Le déploiement n'est pas recommandé${NC}"
    echo "Corrigez les erreurs avant de déployer."
    exit 1
elif [ $CHECKS_WARNING -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Le déploiement est possible avec des avertissements${NC}"
    echo "Vérifiez les avertissements avant de continuer."
    exit 2
else
    echo -e "\n${GREEN}✅ Prêt pour le déploiement${NC}"
    echo "Tous les contrôles sont passés avec succès."
    exit 0
fi
