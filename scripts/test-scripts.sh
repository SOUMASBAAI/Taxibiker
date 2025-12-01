#!/bin/bash

# Script de test pour vérifier que tous les scripts sont fonctionnels
echo "🧪 Test des scripts TaxiBiker"

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

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

# Test de la syntaxe des scripts
log_section "Test de syntaxe des scripts"

SCRIPTS=(
    "setup-dev.sh"
    "start-all.sh"
    "start-db.sh"
    "stop-db.sh"
    "start-backend.sh"
    "start-frontend.sh"
    "diagnose.sh"
    "quick-fix.sh"
    "fix-php-compatibility.sh"
    "migrate-to-mysql.sh"
    "pre-deploy-check.sh"
    "deploy.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "scripts/$script" ]; then
        if bash -n "scripts/$script" 2>/dev/null; then
            log_info "$script : syntaxe OK"
        else
            log_error "$script : erreur de syntaxe"
        fi
    else
        log_error "$script : fichier manquant"
    fi
done

# Test des permissions (sur Linux/macOS)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    log_section "Test des permissions"
    
    for script in "${SCRIPTS[@]}"; do
        if [ -f "scripts/$script" ]; then
            if [ -x "scripts/$script" ]; then
                log_info "$script : exécutable"
            else
                log_warning "$script : non exécutable (chmod +x requis)"
            fi
        fi
    done
fi

# Test de la structure du projet
log_section "Test de la structure du projet"

REQUIRED_DIRS=(
    "taxibiker-back"
    "taxibiker-front"
    "scripts"
    "config"
    ".github/workflows"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_info "Dossier $dir : présent"
    else
        log_error "Dossier $dir : manquant"
    fi
done

REQUIRED_FILES=(
    "taxibiker-back/composer.json"
    "taxibiker-front/package.json"
    "taxibiker-back/compose.yaml"
    ".github/workflows/deploy.yml"
    "README.md"
    "DEPLOYMENT.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_info "Fichier $file : présent"
    else
        log_error "Fichier $file : manquant"
    fi
done

# Test des outils requis
log_section "Test des outils requis"

TOOLS=(
    "php:PHP"
    "composer:Composer"
    "node:Node.js"
    "npm:npm"
)

for tool_info in "${TOOLS[@]}"; do
    IFS=':' read -r cmd name <<< "$tool_info"
    
    if command -v "$cmd" &> /dev/null; then
        version=$($cmd --version 2>/dev/null | head -n1 || echo "version inconnue")
        log_info "$name : disponible ($version)"
    else
        log_error "$name : non installé"
    fi
done

# Test optionnel de Docker
if command -v docker &> /dev/null; then
    if docker --version > /dev/null 2>&1; then
        log_info "Docker : disponible ($(docker --version))"
    else
        log_warning "Docker : installé mais non fonctionnel"
    fi
else
    log_warning "Docker : non installé (optionnel)"
fi

# Test de configuration
log_section "Test de configuration"

# Backend
if [ -f "taxibiker-back/composer.json" ]; then
    if grep -q '"php": ">=8.2"' taxibiker-back/composer.json; then
        log_info "Configuration PHP : OK (>=8.2)"
    else
        log_warning "Configuration PHP : vérifiez la version requise"
    fi
    
    if grep -q '"lcobucci/clock": "^2.3"' taxibiker-back/composer.json; then
        log_info "Configuration lcobucci/clock : OK (compatible PHP 8.2)"
    else
        log_warning "Configuration lcobucci/clock : peut nécessiter une mise à jour"
    fi
fi

# Frontend
if [ -f "taxibiker-front/package.json" ]; then
    if grep -q '"react"' taxibiker-front/package.json; then
        log_info "Configuration React : OK"
    else
        log_warning "Configuration React : vérifiez package.json"
    fi
fi

# Résumé
log_section "Résumé des tests"

echo ""
echo "📋 Scripts disponibles :"
for script in "${SCRIPTS[@]}"; do
    if [ -f "scripts/$script" ]; then
        echo "   ✅ ./scripts/$script"
    else
        echo "   ❌ ./scripts/$script"
    fi
done

echo ""
echo "🚀 Commandes de démarrage :"
echo "   ./scripts/diagnose.sh      # Diagnostic complet"
echo "   ./scripts/setup-dev.sh     # Configuration initiale"
echo "   ./scripts/start-all.sh     # Démarrer tout l'environnement"
echo "   ./scripts/start-db.sh      # Démarrer uniquement MySQL"
echo "   ./scripts/start-backend.sh # Démarrer uniquement le backend"
echo "   ./scripts/start-frontend.sh# Démarrer uniquement le frontend"

echo ""
echo "🔧 Scripts utiles :"
echo "   ./scripts/quick-fix.sh     # Résoudre problèmes de compatibilité"
echo "   ./scripts/deploy.sh        # Déploiement manuel"

echo ""
log_info "Tests terminés ! Consultez les messages ci-dessus pour les actions à effectuer."
