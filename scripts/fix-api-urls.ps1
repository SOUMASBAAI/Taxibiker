# Script PowerShell pour corriger toutes les URLs d'API hardcodées dans le frontend

Write-Host "🔧 Correction des URLs d'API hardcodées..." -ForegroundColor Yellow

# Dossier du frontend
$FRONTEND_DIR = "taxibiker-front\src"

# Trouver tous les fichiers .jsx et .js
$files = Get-ChildItem -Path $FRONTEND_DIR -Recurse -Include "*.jsx", "*.js"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "http://localhost:8000/api") {
        Write-Host "📝 Correction de $($file.Name)" -ForegroundColor Green
        
        # Ajouter l'import si nécessaire et pas déjà présent
        if ($content -notmatch "import.*buildApiUrl" -and $content -match "buildApiUrl") {
            # Trouver la première ligne d'import et ajouter après
            $lines = Get-Content $file.FullName
            $importIndex = -1
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "^import.*from") {
                    $importIndex = $i
                    break
                }
            }
            
            if ($importIndex -ge 0) {
                $newLines = @()
                $newLines += $lines[0..$importIndex]
                $newLines += "import { buildApiUrl } from '../config/api.js';"
                $newLines += $lines[($importIndex + 1)..($lines.Count - 1)]
                $newLines | Set-Content $file.FullName
                $content = Get-Content $file.FullName -Raw
            }
        }
        
        # Remplacer les URLs avec guillemets doubles
        $content = $content -replace '"http://localhost:8000/api/([^"]*)"', "buildApiUrl('`$1')"
        
        # Remplacer les URLs avec backticks (template literals)
        $content = $content -replace '`http://localhost:8000/api/([^`]*)`', "buildApiUrl('`$1')"
        
        # Sauvegarder le fichier modifié
        $content | Set-Content $file.FullName -NoNewline
    }
}

Write-Host "✅ Correction terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Fichiers modifiés :" -ForegroundColor Cyan
$modifiedFiles = Get-ChildItem -Path $FRONTEND_DIR -Recurse -Include "*.jsx", "*.js" | Where-Object { (Get-Content $_.FullName -Raw) -match "buildApiUrl" }
$modifiedFiles | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
