#!/bin/bash

# Script de résolution rapide des problèmes de compatibilité
echo "🔧 Résolution rapide du problème PHP..."

cd taxibiker-back

# Supprimer le composer.lock pour forcer la résolution
echo "Suppression du composer.lock..."
rm -f composer.lock

# Mettre à jour les dépendances
echo "Mise à jour des dépendances..."
composer update --no-interaction

echo "✅ Résolution terminée. Vous pouvez maintenant exécuter:"
echo "./scripts/setup-dev.sh"
