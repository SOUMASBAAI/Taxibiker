#!/bin/bash

# Script d'installation manuelle de vendor/ sur PlanetHoster
# Utilisation: bash install-vendor-manual.sh

echo "=== Installation Manuelle de Vendor sur PlanetHoster ==="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "composer.json" ]; then
    echo "❌ Erreur: composer.json non trouvé"
    echo "Vous devez être dans le répertoire public_html/api/"
    exit 1
fi

echo "✅ composer.json trouvé"
echo ""

# Méthode 1: Vérifier si composer est disponible
echo "=== Méthode 1: Vérification de Composer ==="
if command -v composer &> /dev/null; then
    echo "✅ Composer est disponible sur ce serveur"
    echo "Exécution de: composer install --no-dev --optimize-autoloader --no-interaction"
    composer install --no-dev --optimize-autoloader --no-interaction
    
    if [ -d "vendor" ]; then
        echo "✅ Vendor installé avec succès via composer"
        exit 0
    else
        echo "❌ Échec de l'installation via composer"
    fi
else
    echo "❌ Composer n'est pas disponible sur ce serveur"
fi

echo ""

# Méthode 2: Télécharger et installer composer
echo "=== Méthode 2: Installation de Composer ==="
echo "Téléchargement de composer..."

# Télécharger composer
curl -sS https://getcomposer.org/installer | php

if [ -f "composer.phar" ]; then
    echo "✅ Composer téléchargé"
    echo "Installation des dépendances..."
    
    php composer.phar install --no-dev --optimize-autoloader --no-interaction
    
    if [ -d "vendor" ]; then
        echo "✅ Vendor installé avec succès via composer.phar"
        echo "Nettoyage..."
        rm composer.phar
        exit 0
    else
        echo "❌ Échec de l'installation via composer.phar"
    fi
else
    echo "❌ Impossible de télécharger composer"
fi

echo ""

# Méthode 3: Installation manuelle via wget (si curl ne fonctionne pas)
echo "=== Méthode 3: Installation via wget ==="
if command -v wget &> /dev/null; then
    echo "Téléchargement de composer via wget..."
    wget -O composer-setup.php https://getcomposer.org/installer
    
    if [ -f "composer-setup.php" ]; then
        php composer-setup.php
        rm composer-setup.php
        
        if [ -f "composer.phar" ]; then
            echo "✅ Composer téléchargé via wget"
            php composer.phar install --no-dev --optimize-autoloader --no-interaction
            
            if [ -d "vendor" ]; then
                echo "✅ Vendor installé avec succès"
                rm composer.phar
                exit 0
            fi
        fi
    fi
fi

echo ""
echo "❌ Toutes les méthodes automatiques ont échoué"
echo ""
echo "=== Solution Alternative ==="
echo "1. Téléchargez le projet complet depuis GitHub sur votre machine locale"
echo "2. Exécutez 'composer install' localement"
echo "3. Uploadez le dossier vendor/ via FTP"
echo ""
echo "Ou contactez le support PlanetHoster pour installer composer"

