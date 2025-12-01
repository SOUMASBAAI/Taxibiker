#!/bin/bash

# Script pour rendre tous les scripts exécutables
echo "🔧 Configuration des permissions des scripts..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Liste des scripts à rendre exécutables
SCRIPTS=(
    "setup-dev.sh"
    "deploy.sh"
    "pre-deploy-check.sh"
    "make-executable.sh"
)

# Rendre les scripts exécutables
for script in "${SCRIPTS[@]}"; do
    if [ -f "$SCRIPT_DIR/$script" ]; then
        chmod +x "$SCRIPT_DIR/$script"
        echo "✅ $script est maintenant exécutable"
    else
        echo "⚠️  $script non trouvé"
    fi
done

echo "🎉 Configuration terminée!"
echo ""
echo "Vous pouvez maintenant utiliser:"
echo "  ./scripts/setup-dev.sh        - Configuration de l'environnement de développement"
echo "  ./scripts/pre-deploy-check.sh - Vérification pré-déploiement"
echo "  ./scripts/deploy.sh           - Déploiement manuel"
