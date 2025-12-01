#!/bin/bash

# Script pour résoudre le conflit de versions JWT/Clock
echo "🔧 Résolution du conflit lexik/jwt-authentication-bundle"

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

# Sauvegarde
if [ -f "composer.json" ]; then
    cp composer.json composer.json.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Sauvegarde de composer.json créée"
fi

# Nettoyer complètement
log_warning "Nettoyage complet des dépendances..."
rm -f composer.lock
rm -rf vendor/

# Utiliser une version compatible
log_info "Configuration de lexik/jwt-authentication-bundle version 2.20 (compatible PHP 8.2)"

# Créer un composer.json temporaire avec la bonne version
cat > composer.json.tmp << 'EOF'
{
    "type": "project",
    "license": "proprietary",
    "minimum-stability": "stable",
    "prefer-stable": true,
    "require": {
        "php": ">=8.2",
        "ext-ctype": "*",
        "ext-iconv": "*",
        "api-platform/doctrine-orm": "^4.1",
        "api-platform/symfony": "^4.1",
        "doctrine/dbal": "^3",
        "doctrine/doctrine-bundle": "^2.16",
        "doctrine/doctrine-migrations-bundle": "^3.4",
        "doctrine/orm": "^3.5",
        "lexik/jwt-authentication-bundle": "^2.20",
        "nelmio/cors-bundle": "^2.5",
        "phpdocumentor/reflection-docblock": "^5.6",
        "phpstan/phpdoc-parser": "^2.3",
        "symfony/asset": "7.3.*",
        "symfony/console": "7.3.*",
        "symfony/dotenv": "7.3.*",
        "symfony/expression-language": "7.3.*",
        "symfony/flex": "^2",
        "symfony/framework-bundle": "7.3.*",
        "symfony/maker-bundle": "^1.64",
        "symfony/property-access": "7.3.*",
        "symfony/property-info": "7.3.*",
        "symfony/runtime": "7.3.*",
        "symfony/security-bundle": "7.3.*",
        "symfony/serializer": "7.3.*",
        "symfony/twig-bundle": "7.3.*",
        "symfony/validator": "7.3.*",
        "symfony/yaml": "7.3.*",
        "twilio/sdk": "^8.8"
    },
    "config": {
        "allow-plugins": {
            "php-http/discovery": true,
            "symfony/flex": true,
            "symfony/runtime": true
        },
        "bump-after-update": true,
        "sort-packages": true
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "App\\Tests\\": "tests/"
        }
    },
    "replace": {
        "symfony/polyfill-ctype": "*",
        "symfony/polyfill-iconv": "*",
        "symfony/polyfill-php72": "*",
        "symfony/polyfill-php73": "*",
        "symfony/polyfill-php74": "*",
        "symfony/polyfill-php80": "*",
        "symfony/polyfill-php81": "*",
        "symfony/polyfill-php82": "*"
    },
    "scripts": {
        "auto-scripts": {
            "cache:clear": "symfony-cmd",
            "assets:install %PUBLIC_DIR%": "symfony-cmd"
        },
        "post-install-cmd": [
            "@auto-scripts"
        ],
        "post-update-cmd": [
            "@auto-scripts"
        ]
    },
    "conflict": {
        "symfony/symfony": "*"
    },
    "extra": {
        "symfony": {
            "allow-contrib": false,
            "require": "7.3.*"
        }
    },
    "require-dev": {
        "doctrine/doctrine-fixtures-bundle": "^4.1",
        "fakerphp/faker": "^1.24"
    }
}
EOF

# Remplacer le composer.json
mv composer.json.tmp composer.json
log_info "composer.json mis à jour avec lexik/jwt-authentication-bundle v2.20"

# Installation
log_info "Installation des dépendances..."
if composer install --no-interaction; then
    log_info "✅ Dépendances installées avec succès!"
    
    # Test de la configuration
    if php bin/console --version > /dev/null 2>&1; then
        log_info "✅ Symfony fonctionne correctement"
        
        echo ""
        echo "🎉 Problème résolu !"
        echo ""
        echo "📋 Prochaines étapes :"
        echo "1. Continuer avec : ./scripts/setup-dev.sh"
        echo "2. Ou démarrer : ./scripts/start-all.sh"
        
    else
        log_error "❌ Problème avec la configuration Symfony"
        exit 1
    fi
else
    log_error "❌ Échec de l'installation"
    
    # Restaurer la sauvegarde
    if [ -f "composer.json.backup.$(date +%Y%m%d)_"* ]; then
        cp composer.json.backup.* composer.json
        log_warning "Composer.json restauré depuis la sauvegarde"
    fi
    
    echo ""
    echo "💡 Solutions alternatives :"
    echo "1. Mettre à jour PHP vers 8.3+ si possible"
    echo "2. Utiliser une version plus ancienne de Symfony"
    echo "3. Consulter TROUBLESHOOTING.md"
    
    exit 1
fi
