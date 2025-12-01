#!/bin/bash

# Script pour résoudre les problèmes de syntaxe MariaDB
echo "🔧 Résolution des problèmes de syntaxe MariaDB"

cd taxibiker-back

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

echo "🔍 Détection : MariaDB au lieu de MySQL"
echo "L'erreur de syntaxe est causée par des différences entre MariaDB et MySQL"
echo ""

# Vérifier la version de MariaDB
log_info "Adaptation de la configuration pour MariaDB..."

# Mettre à jour le .env.local pour MariaDB
if [ -f ".env.local" ]; then
    # Sauvegarder
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    
    # Adapter pour MariaDB
    sed -i.bak 's/serverVersion=8\.0/serverVersion=mariadb-10.6.0/g' .env.local
    
    log_info "Configuration .env.local adaptée pour MariaDB"
else
    log_warning "Fichier .env.local non trouvé, création..."
    
    cat > .env.local << 'EOF'
# Configuration locale MariaDB
APP_ENV=dev
APP_DEBUG=true
APP_SECRET=dev_secret_key_change_in_production

# Base de données MariaDB locale (XAMPP utilise MariaDB)
DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=mariadb-10.6.0&charset=utf8mb4

# Configuration JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=dev_passphrase

# CORS pour le développement
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
EOF
    
    log_info "Fichier .env.local créé pour MariaDB"
fi

# Nettoyer les migrations existantes qui posent problème
log_warning "Nettoyage des migrations problématiques..."

# Supprimer le cache Doctrine
rm -rf var/cache/dev/doctrine/

# Vérifier s'il y a des migrations
if [ -d "migrations" ] && [ "$(ls -A migrations/)" ]; then
    log_warning "Migrations existantes détectées"
    
    # Créer une sauvegarde des migrations
    cp -r migrations migrations.backup.$(date +%Y%m%d_%H%M%S)
    
    echo ""
    echo "🔄 Options pour résoudre le problème :"
    echo "1. Régénérer toutes les migrations (recommandé)"
    echo "2. Corriger manuellement les migrations existantes"
    echo ""
    
    read -p "Choisir l'option (1 ou 2) : " choice
    
    case $choice in
        1)
            log_info "Régénération des migrations..."
            
            # Supprimer toutes les migrations
            rm -f migrations/Version*.php
            
            # Créer la base de données
            php bin/console doctrine:database:drop --force --if-exists
            php bin/console doctrine:database:create
            
            # Générer de nouvelles migrations
            php bin/console doctrine:migrations:diff
            
            log_info "Nouvelles migrations générées pour MariaDB"
            ;;
        2)
            log_info "Correction manuelle requise"
            echo "Éditez les fichiers de migration dans le dossier migrations/"
            echo "Remplacez les syntaxes MySQL par des syntaxes MariaDB compatibles"
            ;;
        *)
            log_warning "Option invalide, passage en mode automatique"
            # Option 1 par défaut
            rm -f migrations/Version*.php
            php bin/console doctrine:database:drop --force --if-exists
            php bin/console doctrine:database:create
            php bin/console doctrine:migrations:diff
            ;;
    esac
else
    log_info "Aucune migration existante, création de la base..."
    php bin/console doctrine:database:create --if-not-exists
    php bin/console doctrine:migrations:diff
fi

# Test de la configuration
echo ""
log_info "Test de la configuration MariaDB..."

if php bin/console doctrine:schema:validate > /dev/null 2>&1; then
    log_info "✅ Configuration Doctrine valide pour MariaDB"
    
    # Exécuter les migrations
    if php bin/console doctrine:migrations:migrate --no-interaction; then
        log_info "✅ Migrations exécutées avec succès"
        
        echo ""
        echo "🎉 Problème MariaDB résolu !"
        echo ""
        echo "📋 Prochaines étapes :"
        echo "1. Charger les fixtures : php bin/console doctrine:fixtures:load"
        echo "2. Démarrer l'application : ./scripts/start-all.sh"
        
    else
        log_error "❌ Problème lors de l'exécution des migrations"
        echo ""
        echo "💡 Solutions :"
        echo "1. Vérifier les logs d'erreur"
        echo "2. Corriger manuellement les migrations"
        echo "3. Utiliser MySQL au lieu de MariaDB"
    fi
else
    log_error "❌ Configuration Doctrine invalide"
    echo ""
    echo "💡 Vérifiez :"
    echo "1. La connexion à MariaDB"
    echo "2. Les entités Doctrine"
    echo "3. Le fichier .env.local"
fi
