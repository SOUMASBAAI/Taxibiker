#!/bin/bash

# Script pour détecter le type de base de données (MySQL vs MariaDB)
echo "🔍 Détection du type de base de données"

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

# Test de connexion et détection
log_section "Détection automatique"

# Tenter de se connecter et détecter la version
if command -v mysql &> /dev/null; then
    log_info "Client MySQL/MariaDB trouvé"
    
    # Tester la connexion sans mot de passe
    if mysql -u root -e "SELECT VERSION();" 2>/dev/null; then
        VERSION=$(mysql -u root -e "SELECT VERSION();" 2>/dev/null | tail -n 1)
        
        if echo "$VERSION" | grep -qi "mariadb"; then
            log_warning "🔍 MariaDB détecté : $VERSION"
            DB_TYPE="mariadb"
            
            # Extraire la version MariaDB
            MARIADB_VERSION=$(echo "$VERSION" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
            log_info "Version MariaDB : $MARIADB_VERSION"
            
            # Recommander la configuration
            echo ""
            echo "📋 Configuration recommandée pour .env.local :"
            echo "DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=mariadb-$MARIADB_VERSION&charset=utf8mb4"
            
        else
            log_info "🔍 MySQL détecté : $VERSION"
            DB_TYPE="mysql"
            
            # Extraire la version MySQL
            MYSQL_VERSION=$(echo "$VERSION" | grep -oE '[0-9]+\.[0-9]+')
            log_info "Version MySQL : $MYSQL_VERSION"
            
            # Recommander la configuration
            echo ""
            echo "📋 Configuration recommandée pour .env.local :"
            echo "DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=$MYSQL_VERSION&charset=utf8mb4"
        fi
        
    else
        log_warning "Connexion nécessite un mot de passe ou base non démarrée"
        
        # Vérifier si c'est XAMPP (qui utilise MariaDB)
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            if [ -d "/c/xampp" ] || [ -d "C:/xampp" ]; then
                log_warning "XAMPP détecté - utilise probablement MariaDB"
                DB_TYPE="mariadb"
                
                echo ""
                echo "📋 Configuration probable pour XAMPP :"
                echo "DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=mariadb-10.6.0&charset=utf8mb4"
            fi
        fi
    fi
else
    log_error "Client MySQL/MariaDB non trouvé"
    echo "Installez MySQL/MariaDB ou XAMPP"
fi

# Vérification de la configuration actuelle
log_section "Configuration actuelle"

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$PROJECT_ROOT/taxibiker-back"

if [ -f ".env.local" ]; then
    log_info "Fichier .env.local trouvé"
    
    if grep -q "DATABASE_URL" .env.local; then
        CURRENT_URL=$(grep "DATABASE_URL" .env.local | cut -d'=' -f2-)
        echo "   URL actuelle : $CURRENT_URL"
        
        if echo "$CURRENT_URL" | grep -q "mariadb"; then
            log_info "Configuration actuelle : MariaDB"
        elif echo "$CURRENT_URL" | grep -q "mysql"; then
            log_info "Configuration actuelle : MySQL"
        else
            log_warning "Type de base non spécifié dans l'URL"
        fi
    else
        log_error "DATABASE_URL non trouvé dans .env.local"
    fi
else
    log_warning "Fichier .env.local non trouvé"
fi

# Recommandations
log_section "Recommandations"

echo ""
if [ "$DB_TYPE" = "mariadb" ]; then
    echo "🔧 Pour MariaDB (XAMPP) :"
    echo "   1. Exécuter : ./scripts/fix-mariadb-syntax.sh"
    echo "   2. Ou mettre à jour .env.local avec serverVersion=mariadb-X.X.X"
    echo ""
elif [ "$DB_TYPE" = "mysql" ]; then
    echo "🔧 Pour MySQL :"
    echo "   1. Configuration standard avec serverVersion=8.0"
    echo "   2. Pas de modification spéciale nécessaire"
    echo ""
else
    echo "🔧 Type non détecté :"
    echo "   1. Vérifier que MySQL/MariaDB est démarré"
    echo "   2. Tester la connexion manuellement"
    echo "   3. Consulter config/mysql-local-setup.md"
    echo ""
fi

echo "📚 Guides disponibles :"
echo "   - Configuration générale : config/mysql-local-setup.md"
echo "   - Dépannage : TROUBLESHOOTING.md"
echo "   - Vérification MySQL : ./scripts/check-mysql.sh"
