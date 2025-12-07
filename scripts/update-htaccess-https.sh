#!/bin/bash

# Script pour mettre à jour .htaccess avec redirection HTTPS
# À exécuter sur le serveur PlanetHoster via SSH

echo "🔒 Mise à jour de .htaccess pour HTTPS"

HTACCESS_FILE="public_html/.htaccess"

# Vérifier si le fichier existe
if [ ! -f "$HTACCESS_FILE" ]; then
    echo "❌ Fichier .htaccess non trouvé dans public_html/"
    echo "Création du fichier..."
    mkdir -p public_html
fi

# Créer/Mettre à jour le fichier .htaccess
cat > "$HTACCESS_FILE" << 'EOF'
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# API routes
RewriteRule ^api/(.*)$ api/public/index.php [QSA,L]

# Frontend routes (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header append Cache-Control "public, immutable"
</FilesMatch>
EOF

echo "✅ Fichier .htaccess mis à jour avec redirection HTTPS"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Activez SSL dans le panneau PlanetHoster"
echo "2. Testez : https://taxibikerparis.com"
