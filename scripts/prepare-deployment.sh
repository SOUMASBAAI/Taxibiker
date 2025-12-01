#!/bin/bash

# Script de préparation au déploiement PlanetHoster
echo "🚀 Préparation du déploiement PlanetHoster"

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

# Vérifications préalables
log_section "Vérifications préalables"

# Vérifier que l'environnement local fonctionne
cd "$PROJECT_ROOT/taxibiker-back"

if php bin/console --version > /dev/null 2>&1; then
    log_info "Backend Symfony fonctionnel"
else
    log_error "Problème avec le backend Symfony"
    exit 1
fi

cd "$PROJECT_ROOT/taxibiker-front"

if [ -f "package.json" ] && [ -d "node_modules" ]; then
    log_info "Frontend React configuré"
else
    log_error "Problème avec le frontend React"
    exit 1
fi

# Vérifier Git
log_section "Configuration Git"

cd "$PROJECT_ROOT"

if git rev-parse --git-dir > /dev/null 2>&1; then
    log_info "Repository Git initialisé"
    
    # Vérifier les branches
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "Branche actuelle : $CURRENT_BRANCH"
    
    # Vérifier s'il y a des changements non commités
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Changements non commités détectés"
        echo "Commitez vos changements avant le déploiement :"
        git status --short
        echo ""
        read -p "Voulez-vous commiter maintenant ? (y/n) : " commit_now
        
        if [ "$commit_now" = "y" ] || [ "$commit_now" = "Y" ]; then
            git add .
            read -p "Message de commit : " commit_message
            git commit -m "$commit_message"
            log_info "Changements commités"
        fi
    else
        log_info "Aucun changement non commité"
    fi
    
    # Créer la branche production si elle n'existe pas
    if ! git branch -r | grep -q "origin/production"; then
        log_warning "Branche production n'existe pas"
        read -p "Créer la branche production ? (y/n) : " create_prod
        
        if [ "$create_prod" = "y" ] || [ "$create_prod" = "Y" ]; then
            git checkout -b production
            git push -u origin production
            git checkout main
            log_info "Branche production créée"
        fi
    else
        log_info "Branche production existe"
    fi
    
else
    log_error "Repository Git non initialisé"
    exit 1
fi

# Vérifier la configuration PlanetHoster
log_section "Configuration PlanetHoster"

echo "📋 Informations nécessaires pour PlanetHoster :"
echo ""
echo "1. 🌐 Informations de connexion :"
echo "   - Nom de domaine"
echo "   - Username FTP/SFTP"
echo "   - Password FTP/SFTP"
echo ""
echo "2. 🗄️ Informations base de données :"
echo "   - Host MySQL"
echo "   - Nom de la base de données"
echo "   - Username base de données"
echo "   - Password base de données"
echo ""

read -p "Avez-vous toutes ces informations ? (y/n) : " has_info

if [ "$has_info" != "y" ] && [ "$has_info" != "Y" ]; then
    log_warning "Récupérez ces informations dans votre panneau PlanetHoster"
    echo ""
    echo "📚 Guides utiles :"
    echo "   - config/planethoster-setup.md"
    echo "   - config/github-secrets-setup.md"
    exit 1
fi

# Test de build de production
log_section "Test de build de production"

cd "$PROJECT_ROOT/taxibiker-front"

log_info "Test du build frontend..."
if npm run build > /dev/null 2>&1; then
    log_info "Build frontend réussi"
    rm -rf dist/  # Nettoyer le build de test
else
    log_error "Échec du build frontend"
    exit 1
fi

cd "$PROJECT_ROOT/taxibiker-back"

log_info "Test de la configuration Symfony..."
if php bin/console cache:clear --env=prod > /dev/null 2>&1; then
    log_info "Configuration Symfony valide"
else
    log_error "Problème avec la configuration Symfony"
    exit 1
fi

# Créer le package de déploiement de test
log_section "Test du package de déploiement"

cd "$PROJECT_ROOT"

log_info "Création d'un package de test..."
if ./scripts/deploy.sh staging --dry-run > /dev/null 2>&1; then
    log_info "Package de déploiement créé avec succès"
else
    log_warning "Problème avec le script de déploiement"
    echo "Vérifiez le script : ./scripts/deploy.sh"
fi

# Résumé et prochaines étapes
log_section "Résumé et prochaines étapes"

echo ""
log_info "✅ Préparation terminée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1. 🔐 Configurer les secrets GitHub :"
echo "   - Aller sur GitHub > Settings > Secrets and variables > Actions"
echo "   - Ajouter les secrets listés dans config/github-secrets-setup.md"
echo ""
echo "2. 🗄️ Créer le fichier .env sur PlanetHoster :"
echo "   - Se connecter via FTP/SFTP"
echo "   - Créer le dossier public_html/api/"
echo "   - Copier config/planethoster.env.example vers public_html/api/.env"
echo "   - Adapter avec vos vraies informations"
echo ""
echo "3. 🚀 Premier déploiement :"
echo "   - Push vers main : git push origin main (déploiement staging)"
echo "   - Push vers production : git push origin production (déploiement prod)"
echo ""
echo "4. 📊 Vérification :"
echo "   - Consulter les logs GitHub Actions"
echo "   - Tester l'application sur votre domaine"
echo ""

echo "🎯 Commandes utiles :"
echo "   ./scripts/pre-deploy-check.sh    # Vérifications avant déploiement"
echo "   ./scripts/deploy.sh production   # Déploiement manuel"
echo ""

log_info "Prêt pour le déploiement ! 🎉"
