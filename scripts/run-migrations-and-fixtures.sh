#!/bin/bash

# Script pour exécuter les migrations et les fixtures
# Utilisation:
#   En local: ./scripts/run-migrations-and-fixtures.sh
#   Sur le serveur: ./scripts/run-migrations-and-fixtures.sh --env=prod

ENV=${1:-"--env=dev"}

echo "🔄 Exécution des migrations et fixtures"
echo "Environnement: $ENV"
echo ""

# Aller dans le dossier backend
cd taxibiker-back || cd api || exit 1

# Vérifier que le fichier .env existe
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "❌ Erreur: Fichier .env ou .env.local non trouvé"
    exit 1
fi

echo "📦 Vérification de Composer..."
if [ ! -d "vendor" ]; then
    echo "Installation des dépendances..."
    composer install --no-interaction
fi

echo ""
echo "🗄️  Exécution des migrations..."
php bin/console doctrine:migrations:migrate --no-interaction $ENV

if [ $? -eq 0 ]; then
    echo "✅ Migrations exécutées avec succès"
else
    echo "❌ Erreur lors des migrations"
    exit 1
fi

echo ""
echo "📥 Voulez-vous charger les fixtures ? (o/n)"
read -r response

if [[ "$response" =~ ^([oO][uU][iI]|[oO]|[yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "📥 Chargement des fixtures..."
    
    # Vérifier si on est en production
    if [[ "$ENV" == *"prod"* ]]; then
        echo "⚠️  ATTENTION: Vous êtes en mode PRODUCTION"
        echo "Les fixtures vont réinitialiser toutes les données !"
        echo "Voulez-vous vraiment continuer ? (tapez 'OUI' en majuscules)"
        read -r confirm
        if [ "$confirm" != "OUI" ]; then
            echo "❌ Annulé"
            exit 0
        fi
    fi
    
    php bin/console doctrine:fixtures:load --no-interaction $ENV
    
    if [ $? -eq 0 ]; then
        echo "✅ Fixtures chargées avec succès"
    else
        echo "❌ Erreur lors du chargement des fixtures"
        exit 1
    fi
else
    echo "⏭️  Fixtures ignorées"
fi

echo ""
echo "✨ Terminé !"
