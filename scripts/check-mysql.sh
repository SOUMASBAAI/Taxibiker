#!/bin/bash

# Script pour vérifier la configuration MySQL locale
echo "🔍 Vérification de MySQL local (sans Docker)"

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

# Vérification de MySQL
log_section "Vérification de MySQL"

# Test de connexion basique
if command -v mysql &> /dev/null; then
    log_info "Client MySQL installé"
    
    # Tenter une connexion simple
    if mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
        log_info "Connexion MySQL réussie (sans mot de passe)"
        MYSQL_USER="root"
        MYSQL_PASS=""
    elif mysql -u root -p"" -e "SELECT 1;" > /dev/null 2>&1; then
        log_info "Connexion MySQL réussie (mot de passe vide)"
        MYSQL_USER="root"
        MYSQL_PASS=""
    else
        log_warning "Connexion MySQL nécessite un mot de passe"
        echo "Testez manuellement : mysql -u root -p"
        MYSQL_USER="root"
        MYSQL_PASS="password"
    fi
else
    log_error "Client MySQL non installé"
    echo "Installez MySQL ou utilisez XAMPP/WAMP/MAMP"
fi

# Vérification du service MySQL
log_section "Service MySQL"

# Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    if netstat -an | grep -q ":3306"; then
        log_info "MySQL écoute sur le port 3306"
    else
        log_warning "MySQL ne semble pas écouter sur le port 3306"
        echo "Vérifiez XAMPP/WAMP ou démarrez MySQL manuellement"
    fi
    
    # Vérifier les processus MySQL
    if tasklist 2>/dev/null | grep -qi mysql; then
        log_info "Processus MySQL détecté"
    else
        log_warning "Aucun processus MySQL détecté"
    fi
    
# Linux/macOS
else
    if netstat -ln 2>/dev/null | grep -q ":3306" || ss -ln 2>/dev/null | grep -q ":3306"; then
        log_info "MySQL écoute sur le port 3306"
    else
        log_warning "MySQL ne semble pas écouter sur le port 3306"
    fi
    
    # Vérifier les processus MySQL
    if ps aux | grep -v grep | grep -qi mysql; then
        log_info "Processus MySQL détecté"
    else
        log_warning "Aucun processus MySQL détecté"
    fi
fi

# Configuration Symfony
log_section "Configuration Symfony"

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$PROJECT_ROOT/taxibiker-back"

if [ -f ".env.local" ]; then
    log_info "Fichier .env.local trouvé"
    
    # Extraire l'URL de la base de données
    if grep -q "DATABASE_URL" .env.local; then
        DB_URL=$(grep "DATABASE_URL" .env.local | cut -d'=' -f2-)
        echo "   URL: $DB_URL"
        
        # Tester la connexion Symfony
        if php bin/console doctrine:database:create --if-not-exists --dry-run > /dev/null 2>&1; then
            log_info "Configuration Doctrine valide"
        else
            log_warning "Problème avec la configuration Doctrine"
        fi
    else
        log_error "DATABASE_URL non trouvé dans .env.local"
    fi
else
    log_error "Fichier .env.local manquant"
    echo "Créez-le avec : ./scripts/setup-dev.sh"
fi

# Test de création de base de données
log_section "Test de base de données"

if [ -f "bin/console" ]; then
    echo "Test de création de la base de données..."
    
    if php bin/console doctrine:database:create --if-not-exists > /dev/null 2>&1; then
        log_info "Base de données créée/vérifiée avec succès"
        
        # Vérifier les migrations
        if php bin/console doctrine:migrations:status > /dev/null 2>&1; then
            log_info "Système de migrations fonctionnel"
        else
            log_warning "Problème avec les migrations"
        fi
    else
        log_error "Impossible de créer/vérifier la base de données"
        echo ""
        echo "💡 Solutions possibles :"
        echo "1. Vérifier que MySQL est démarré"
        echo "2. Vérifier les credentials dans .env.local"
        echo "3. Créer manuellement la base de données"
    fi
fi

# Recommandations
log_section "Recommandations"

echo ""
echo "📋 Configuration recommandée pour .env.local :"
echo ""
echo "# XAMPP/WAMP (sans mot de passe)"
echo "DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4"
echo ""
echo "# Avec mot de passe"
echo "DATABASE_URL=mysql://root:password@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4"
echo ""
echo "🔧 Commandes utiles :"
echo "   mysql -u root -p                    # Se connecter à MySQL"
echo "   php bin/console doctrine:database:create  # Créer la base"
echo "   php bin/console doctrine:migrations:migrate  # Exécuter migrations"
echo ""
echo "📚 Guide complet : config/mysql-local-setup.md"
