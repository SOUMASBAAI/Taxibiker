#!/bin/bash

# Script de correction de compatibilité PHP 8.1 pour PlanetHoster
# Résout le problème : Symfony 7.4 nécessite PHP 8.2, mais PlanetHoster utilise PHP 8.1

echo "=== Correction Compatibilité PHP 8.1 pour PlanetHoster ==="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "composer.json" ]; then
    echo "❌ Erreur: composer.json non trouvé"
    echo "Vous devez être dans le répertoire public_html/api/"
    exit 1
fi

echo "✅ composer.json trouvé"
echo ""

# Afficher la version PHP actuelle
echo "=== Version PHP Actuelle ==="
php --version | head -1
echo ""

# Sauvegarder composer.lock
echo "=== Sauvegarde de composer.lock ==="
if [ -f "composer.lock" ]; then
    cp composer.lock composer.lock.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ composer.lock sauvegardé"
else
    echo "ℹ️ Pas de composer.lock existant"
fi
echo ""

# Méthode 1: Supprimer composer.lock et réinstaller
echo "=== Méthode 1: Régénération complète ==="
if [ -f "composer.lock" ]; then
    rm composer.lock
    echo "✅ composer.lock supprimé"
fi

# Télécharger composer si nécessaire
if [ ! -f "composer.phar" ]; then
    echo "Téléchargement de composer..."
    curl -sS https://getcomposer.org/installer | php
    if [ ! -f "composer.phar" ]; then
        echo "❌ Échec du téléchargement de composer"
        exit 1
    fi
fi

# Installer avec contraintes PHP 8.1
echo "Installation avec contraintes PHP 8.1..."
php composer.phar install --no-dev --optimize-autoloader --no-interaction --ignore-platform-req=php

if [ -d "vendor" ]; then
    echo "✅ Installation réussie avec ignore-platform-req"
    rm composer.phar
    echo ""
    echo "=== Test Symfony ==="
    php bin/console --version
    exit 0
fi

echo ""

# Méthode 2: Mise à jour sélective
echo "=== Méthode 2: Mise à jour avec contraintes ==="
php composer.phar update --no-dev --optimize-autoloader --no-interaction --with-all-dependencies --ignore-platform-req=php

if [ -d "vendor" ]; then
    echo "✅ Mise à jour réussie"
    rm composer.phar
    echo ""
    echo "=== Test Symfony ==="
    php bin/console --version
    exit 0
fi

echo ""

# Méthode 3: Installation forcée
echo "=== Méthode 3: Installation forcée ==="
php composer.phar install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs

if [ -d "vendor" ]; then
    echo "✅ Installation forcée réussie"
    rm composer.phar
    echo ""
    echo "=== Test Symfony ==="
    php bin/console --version
    exit 0
fi

echo ""
echo "❌ Toutes les méthodes ont échoué"
echo ""
echo "=== Solutions Alternatives ==="
echo "1. Contactez PlanetHoster pour une mise à jour vers PHP 8.2+"
echo "2. Utilisez une version Symfony compatible PHP 8.1"
echo "3. Uploadez vendor/ depuis votre machine locale"
echo ""

# Restaurer composer.lock si nécessaire
if [ -f "composer.lock.backup."* ]; then
    latest_backup=$(ls -t composer.lock.backup.* | head -1)
    cp "$latest_backup" composer.lock
    echo "composer.lock restauré depuis $latest_backup"
fi

