#!/bin/bash

# Script pour corriger toutes les URLs d'API hardcodées dans le frontend

echo "🔧 Correction des URLs d'API hardcodées..."

# Dossier du frontend
FRONTEND_DIR="taxibiker-front/src"

# Fonction pour ajouter l'import buildApiUrl si nécessaire
add_import_if_needed() {
    local file="$1"
    if grep -q "buildApiUrl" "$file" && ! grep -q "import.*buildApiUrl" "$file"; then
        # Ajouter l'import après le premier import React
        sed -i '1a import { buildApiUrl } from '\''../config/api.js'\'';' "$file"
    fi
}

# Remplacer toutes les URLs localhost:8000/api
find "$FRONTEND_DIR" -name "*.jsx" -o -name "*.js" | while read -r file; do
    if grep -q "http://localhost:8000/api" "$file"; then
        echo "📝 Correction de $file"
        
        # Ajouter l'import si nécessaire
        if ! grep -q "import.*buildApiUrl" "$file"; then
            # Trouver la ligne du premier import et ajouter après
            sed -i '/^import.*from/a import { buildApiUrl } from '\''../config/api.js'\'';' "$file"
        fi
        
        # Remplacer les URLs
        sed -i 's|"http://localhost:8000/api/\([^"]*\)"|buildApiUrl('\''\1'\'')|g' "$file"
        sed -i 's|`http://localhost:8000/api/\([^`]*\)`|buildApiUrl('\''\1'\'')|g' "$file"
    fi
done

echo "✅ Correction terminée !"
echo ""
echo "📋 Résumé des fichiers modifiés :"
find "$FRONTEND_DIR" -name "*.jsx" -o -name "*.js" | xargs grep -l "buildApiUrl" | head -10
