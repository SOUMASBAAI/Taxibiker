#!/bin/bash

# Script pour démarrer uniquement le frontend React
echo "🚀 Démarrage du frontend React..."

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$PROJECT_ROOT/taxibiker-front"

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
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

if [ ! -f "package.json" ]; then
    log_error "package.json non trouvé"
    exit 1
fi

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    log_warning "Dépendances manquantes, installation..."
    
    if ! npm install; then
        log_error "Échec de l'installation des dépendances"
        exit 1
    fi
    
    log_info "Dépendances installées"
fi

# Vérifier la configuration Vite
if [ ! -f "vite.config.js" ]; then
    log_warning "vite.config.js non trouvé"
fi

# Afficher les informations
echo ""
log_info "Configuration :"
echo "   📁 Répertoire : $(pwd)"
echo "   📦 Node.js    : $(node --version)"
echo "   📦 npm        : $(npm --version)"

# Vérifier si le backend est accessible
echo ""
echo "🔍 Vérification du backend..."
if curl -s http://localhost:8000 > /dev/null 2>&1; then
    log_info "Backend accessible sur http://localhost:8000"
else
    log_warning "Backend non accessible sur http://localhost:8000"
    echo "   Démarrez le backend avec : ./scripts/start-backend.sh"
fi

# Démarrer le serveur de développement
echo ""
echo "🌐 Démarrage du serveur Vite sur http://localhost:3000"
echo ""
log_info "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Démarrer Vite
npm run dev
