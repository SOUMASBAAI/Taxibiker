#!/bin/bash

# Script pour résoudre les problèmes de compatibilité PHP
set -e

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "🔧 Résolution des problèmes de compatibilité PHP 8.2"

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

# Vérification de la version PHP
log_section "Vérification de PHP"

PHP_VERSION=$(php -r "echo PHP_VERSION;")
log_info "Version PHP détectée: $PHP_VERSION"

if [[ $(php -r "echo version_compare(PHP_VERSION, '8.2.0', '>=') ? 'ok' : 'nok';") == "nok" ]]; then
    log_error "PHP 8.2+ requis, version actuelle: $PHP_VERSION"
    exit 1
fi

# Aller dans le dossier backend
cd "$PROJECT_ROOT/taxibiker-back"

# Sauvegarde du composer.lock
log_section "Sauvegarde des fichiers"

if [ -f "composer.lock" ]; then
    cp composer.lock composer.lock.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Sauvegarde de composer.lock créée"
fi

# Suppression du composer.lock pour forcer la résolution
log_section "Résolution des dépendances"

log_warning "Suppression du composer.lock pour forcer la résolution des dépendances..."
rm -f composer.lock

# Mise à jour du composer.json pour forcer des versions compatibles
log_info "Mise à jour des contraintes de versions..."

# Créer un composer.json temporaire avec des versions compatibles
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
        "lexik/jwt-authentication-bundle": "^3.0",
        "lcobucci/clock": "^2.3",
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
mv composer.json composer.json.original
mv composer.json.tmp composer.json

log_info "Composer.json mis à jour avec des versions compatibles PHP 8.2"

# Installation des dépendances
log_section "Installation des dépendances"

log_info "Installation des dépendances avec résolution automatique..."
composer install --no-interaction

if [ $? -eq 0 ]; then
    log_info "✅ Dépendances installées avec succès!"
else
    log_error "❌ Échec de l'installation des dépendances"
    
    # Restaurer le composer.json original
    mv composer.json.original composer.json
    
    # Essayer une approche alternative
    log_warning "Tentative avec mise à jour forcée..."
    composer update --no-interaction --with-all-dependencies
    
    if [ $? -ne 0 ]; then
        log_error "Impossible de résoudre les dépendances automatiquement"
        echo ""
        echo "Solutions manuelles:"
        echo "1. Mettre à jour PHP vers 8.3+ : https://www.php.net/downloads"
        echo "2. Ou exécuter manuellement :"
        echo "   composer require lexik/jwt-authentication-bundle:^3.0"
        echo "   composer require lcobucci/clock:^2.3"
        exit 1
    fi
fi

# Vérification finale
log_section "Vérification"

if php bin/console --version > /dev/null 2>&1; then
    log_info "✅ Symfony fonctionne correctement"
else
    log_error "❌ Problème avec Symfony"
    exit 1
fi

# Nettoyage
if [ -f "composer.json.original" ]; then
    rm composer.json.original
fi

log_section "Résumé"

echo ""
log_info "🎉 Problème de compatibilité PHP résolu !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Continuer avec : ./scripts/setup-dev.sh"
echo "2. Ou démarrer directement : ./scripts/start-all.sh"
echo ""
log_warning "⚠️  Si vous rencontrez encore des problèmes :"
echo "- Vérifiez votre version PHP : php --version"
echo "- Mettez à jour PHP si possible vers 8.3+"
echo "- Consultez les logs Composer pour plus de détails"
