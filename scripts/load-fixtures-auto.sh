#!/bin/bash

# Script automatique pour charger les fixtures
# Usage: bash scripts/load-fixtures-auto.sh [--env=prod|dev]

ENV=${1:-"--env=prod"}
SKIP_CONFIRMATION=${2:-""}

echo "📥 Chargement automatique des fixtures"
echo "Environnement: $ENV"
echo ""

# Aller dans le dossier backend
cd taxibiker-back 2>/dev/null || cd api 2>/dev/null || {
    echo "❌ Erreur: Dossier backend non trouvé"
    echo "Exécutez depuis le dossier racine ou le dossier api"
    exit 1
}

# Vérifier que le fichier .env existe
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo "❌ Erreur: Fichier .env ou .env.local non trouvé"
    exit 1
fi

# Vérifier que vendor existe
if [ ! -d "vendor" ]; then
    echo "📦 Installation des dépendances..."
    composer install --no-interaction --no-scripts
fi

# Vérifier que les tables existent
echo "🔍 Vérification de la base de données..."
php bin/console doctrine:database:create --if-not-exists --no-interaction $ENV 2>&1

# Vérifier que les migrations sont à jour
echo "🔄 Vérification des migrations..."
php bin/console doctrine:migrations:status --no-interaction $ENV 2>&1

# Si confirmation nécessaire (sauf si --force)
if [[ "$SKIP_CONFIRMATION" != "--force" && "$ENV" == *"prod"* ]]; then
    echo ""
    echo "⚠️  ATTENTION: Vous êtes en mode PRODUCTION"
    echo "Les fixtures vont réinitialiser toutes les données !"
    echo ""
    echo "Voulez-vous continuer ? (tapez 'OUI' pour confirmer)"
    read -r confirm
    if [ "$confirm" != "OUI" ]; then
        echo "❌ Annulé par l'utilisateur"
        exit 0
    fi
fi

echo ""
echo "📥 Chargement des fixtures..."

# Exécuter les fixtures
php bin/console doctrine:fixtures:load --no-interaction $ENV --append 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Fixtures chargées avec succès !"
    echo ""
    echo "📋 Utilisateurs créés :"
    echo "   - Admin: soumiaasbaai@gmail.com / adminpass"
    echo "   - User: soumya.ould@gmail.com / userpass"
    echo ""
    echo "✨ Terminé !"
    exit 0
else
    echo ""
    echo "❌ Erreur lors du chargement des fixtures"
    echo ""
    echo "🔍 Vérification des erreurs..."
    php bin/console doctrine:fixtures:load --no-interaction $ENV --verbose 2>&1
    exit 1
fi

