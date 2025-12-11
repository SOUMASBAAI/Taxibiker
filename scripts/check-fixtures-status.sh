#!/bin/bash

# Script pour vérifier l'état de la configuration des fixtures
# Usage: ./scripts/check-fixtures-status.sh

echo "🔍 Vérification de la configuration des fixtures"
echo "================================================"

# Vérifier la variable d'environnement locale
if [ "$LOAD_FIXTURES" = "true" ]; then
    echo "📍 Variable locale LOAD_FIXTURES: ✅ ACTIVÉE (true)"
elif [ "$LOAD_FIXTURES" = "false" ]; then
    echo "📍 Variable locale LOAD_FIXTURES: ❌ DÉSACTIVÉE (false)"
else
    echo "📍 Variable locale LOAD_FIXTURES: ⚪ NON DÉFINIE (fixtures désactivées par défaut)"
fi

echo ""
echo "🔧 Configuration recommandée pour la production:"
echo "   - Variable GitHub LOAD_FIXTURES: false ou non définie"
echo "   - Variable locale LOAD_FIXTURES: false ou non définie"

echo ""
echo "📋 Actions disponibles:"
echo "   1. Déploiement SANS fixtures:"
echo "      ./scripts/deploy-no-fixtures.sh production"
echo ""
echo "   2. Déploiement AVEC fixtures (attention!):"
echo "      LOAD_FIXTURES=true ./scripts/deploy.sh production"
echo ""
echo "   3. Vérifier l'état sur le serveur:"
echo "      ssh votre-serveur 'cd public_html/api && php bin/console doctrine:migrations:status --env=prod'"

echo ""
echo "⚠️  RAPPEL: Les fixtures écrasent les données existantes!"
echo "   Utilisez-les uniquement pour l'initialisation ou les tests."
