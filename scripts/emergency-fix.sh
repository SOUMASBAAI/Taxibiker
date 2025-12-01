#!/bin/bash

# Solution d'urgence pour le conflit JWT
echo "🚨 Solution d'urgence pour le conflit JWT/Clock"

cd taxibiker-back

echo "1. Nettoyage complet..."
rm -f composer.lock
rm -rf vendor/

echo "2. Installation de la version compatible..."
composer require lexik/jwt-authentication-bundle:^2.20 --no-interaction

echo "3. Installation des autres dépendances..."
composer install --no-interaction

if [ $? -eq 0 ]; then
    echo "✅ Problème résolu !"
    echo "Vous pouvez maintenant continuer avec :"
    echo "./scripts/start-all.sh"
else
    echo "❌ Problème persistant"
    echo "Essayez : ./scripts/fix-jwt-compatibility.sh"
fi
