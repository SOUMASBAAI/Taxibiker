#!/bin/bash

# Script de déploiement SANS fixtures pour PlanetHoster
# Usage: ./scripts/deploy-no-fixtures.sh [staging|production]

set -e

export LOAD_FIXTURES=false

ENVIRONMENT=${1:-production}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🚀 Déploiement de TaxiBiker SANS fixtures vers l'environnement: $ENVIRONMENT"

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

log_warning "⚠️  ATTENTION: Les fixtures ne seront PAS chargées lors de ce déploiement"
log_info "Les données existantes en base seront préservées"

# Exécuter le script de déploiement principal avec la variable d'environnement
exec "$PROJECT_ROOT/scripts/deploy.sh" "$ENVIRONMENT"
