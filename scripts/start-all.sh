#!/bin/bash

# Script pour démarrer l'environnement de développement complet TaxiBiker
set -e

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🚀 Démarrage de l'environnement de développement TaxiBiker"

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

# Fonction pour gérer l'arrêt propre
cleanup() {
    echo ""
    log_warning "🛑 Arrêt de l'environnement de développement..."
    
    # Tuer tous les processus enfants
    jobs -p | xargs -r kill 2>/dev/null || true
    
    # Attendre un peu pour l'arrêt propre
    sleep 2
    
    # Forcer l'arrêt si nécessaire
    jobs -p | xargs -r kill -9 2>/dev/null || true
    
    echo "✅ Environnement arrêté"
    exit 0
}

# Capturer les signaux d'interruption
trap cleanup SIGINT SIGTERM

# Vérifications préalables
log_section "Vérifications préalables"

# Vérifier que les outils sont installés
if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    log_error "Composer n'est pas installé"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

log_info "Tous les outils requis sont disponibles"

# Vérifier la structure du projet
if [ ! -d "$PROJECT_ROOT/taxibiker-back" ]; then
    log_error "Dossier backend manquant"
    exit 1
fi

if [ ! -d "$PROJECT_ROOT/taxibiker-front" ]; then
    log_error "Dossier frontend manquant"
    exit 1
fi

log_info "Structure du projet OK"

# Vérifier les dépendances
log_section "Vérification des dépendances"

# Backend
if [ ! -d "$PROJECT_ROOT/taxibiker-back/vendor" ]; then
    log_warning "Dépendances backend manquantes, installation..."
    cd "$PROJECT_ROOT/taxibiker-back"
    
    # Résoudre les problèmes de compatibilité si nécessaire
    if ! composer install --dry-run > /dev/null 2>&1; then
        log_warning "Problème de compatibilité détecté, résolution..."
        rm -f composer.lock
    fi
    
    composer install --no-interaction
    log_info "Dépendances backend installées"
else
    log_info "Dépendances backend OK"
fi

# Frontend
if [ ! -d "$PROJECT_ROOT/taxibiker-front/node_modules" ]; then
    log_warning "Dépendances frontend manquantes, installation..."
    cd "$PROJECT_ROOT/taxibiker-front"
    npm install
    log_info "Dépendances frontend installées"
else
    log_info "Dépendances frontend OK"
fi

# Vérification de la base de données
log_section "Base de données"

cd "$PROJECT_ROOT/taxibiker-back"

log_info "Vérification de la connexion MySQL..."
log_warning "Assurez-vous que MySQL est démarré et accessible"
echo "   - Localement (XAMPP, WAMP, MAMP, etc.)"
echo "   - Ou sur un serveur distant"
echo "   - Configuration dans le fichier .env.local"

# Configuration de la base de données
log_section "Configuration de la base de données"

cd "$PROJECT_ROOT/taxibiker-back"

# Créer la base de données si elle n'existe pas
if php bin/console doctrine:database:create --if-not-exists --no-interaction > /dev/null 2>&1; then
    log_info "Base de données créée/vérifiée"
else
    log_warning "Impossible de créer la base de données (peut-être existe-t-elle déjà)"
fi

# Exécuter les migrations
if php bin/console doctrine:migrations:migrate --no-interaction > /dev/null 2>&1; then
    log_info "Migrations exécutées"
else
    log_warning "Problème avec les migrations (peut-être déjà à jour)"
fi

# Générer les clés JWT si nécessaires
if [ ! -f "config/jwt/private.pem" ]; then
    log_info "Génération des clés JWT..."
    mkdir -p config/jwt
    openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:dev_passphrase > /dev/null 2>&1
    openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:dev_passphrase > /dev/null 2>&1
    chmod 644 config/jwt/*.pem
    log_info "Clés JWT générées"
fi

# Charger les fixtures si demandé
if [ "$1" = "--with-fixtures" ]; then
    log_info "Chargement des données de test..."
    php bin/console doctrine:fixtures:load --no-interaction
    log_info "Données de test chargées"
fi

# Démarrage du backend
log_section "Démarrage du backend Symfony"

cd "$PROJECT_ROOT/taxibiker-back"

log_info "Démarrage du serveur Symfony sur http://localhost:8000"

# Démarrer Symfony en arrière-plan
if command -v symfony &> /dev/null; then
    symfony serve --port=8000 --no-tls --daemon > /dev/null 2>&1 &
else
    php -S localhost:8000 -t public/ > /dev/null 2>&1 &
fi

BACKEND_PID=$!

# Attendre que le backend soit prêt
log_info "Attente du backend..."
for i in {1..30}; do
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        log_info "Backend Symfony prêt"
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "Backend non accessible après 30 secondes"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    sleep 1
done

# Démarrage du frontend
log_section "Démarrage du frontend React"

cd "$PROJECT_ROOT/taxibiker-front"

log_info "Démarrage du serveur Vite sur http://localhost:3000"

# Démarrer Vite en arrière-plan
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
log_info "Attente du frontend..."
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend React prêt"
        break
    fi
    
    if [ $i -eq 60 ]; then
        log_error "Frontend non accessible après 60 secondes"
        kill $FRONTEND_PID 2>/dev/null || true
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    sleep 1
done

# Affichage des informations
log_section "🎉 Environnement démarré avec succès !"

echo ""
echo "📱 Application TaxiBiker disponible :"
echo "   🌐 Frontend : http://localhost:3000"
echo "   🔧 Backend  : http://localhost:8000"
echo "   📊 API      : http://localhost:8000/api"
echo ""
echo "🔍 Endpoints utiles :"
echo "   📋 Health   : http://localhost:8000/api/health"
echo "   📚 API Docs : http://localhost:8000/api/docs (si configuré)"
echo ""
echo "⌨️  Commandes utiles :"
echo "   Ctrl+C      : Arrêter l'environnement"
echo "   ./scripts/diagnose.sh : Diagnostic complet"
echo ""

log_info "Appuyez sur Ctrl+C pour arrêter l'environnement"

# Garder le script actif et surveiller les processus
while true; do
    # Vérifier que les processus sont toujours actifs
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log_error "Le backend s'est arrêté de manière inattendue"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        log_error "Le frontend s'est arrêté de manière inattendue"
        cleanup
    fi
    
    sleep 5
done
