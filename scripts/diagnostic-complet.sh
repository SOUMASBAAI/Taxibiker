#!/bin/bash

# Script de diagnostic complet pour identifier les problèmes
# Usage: bash scripts/diagnostic-complet.sh

echo "🔍 DIAGNOSTIC COMPLET - Base de Données"
echo "========================================"
echo ""

# Aller dans le dossier API
cd public_html/api 2>/dev/null || cd api 2>/dev/null || {
    echo "❌ Erreur: Dossier api non trouvé"
    echo "Exécutez depuis le dossier racine ou le dossier api"
    exit 1
}

echo "📁 Dossier actuel: $(pwd)"
echo ""

# 1. Vérifier que .env existe
echo "1️⃣  Vérification du fichier .env"
echo "--------------------------------"
if [ -f ".env" ]; then
    echo "   ✅ Fichier .env trouvé"
    
    # Afficher DATABASE_URL (masquer le mot de passe)
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$DB_URL" ]; then
        # Masquer le mot de passe dans l'affichage
        DB_URL_DISPLAY=$(echo "$DB_URL" | sed 's/:[^@]*@/:****@/')
        echo "   DATABASE_URL: $DB_URL_DISPLAY"
        
        # Extraire les composants
        DB_USER=$(echo $DB_URL | sed -n 's|mysql://\([^:]*\):.*|\1|p')
        DB_PASS=$(echo $DB_URL | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
        DB_HOST=$(echo $DB_URL | sed -n 's|mysql://[^@]*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo $DB_URL | sed -n 's|mysql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p' || echo "3306")
        DB_NAME=$(echo $DB_URL | sed -n 's|mysql://[^@]*@[^/]*/\([^?]*\).*|\1|p')
        
        echo "   User: $DB_USER"
        echo "   Host: $DB_HOST"
        echo "   Port: ${DB_PORT:-3306}"
        echo "   Database: $DB_NAME"
    else
        echo "   ❌ DATABASE_URL non trouvé dans .env"
    fi
else
    echo "   ❌ Fichier .env non trouvé"
fi
echo ""

# 2. Test de connexion MySQL directe
echo "2️⃣  Test de connexion MySQL directe"
echo "-----------------------------------"
if command -v mysql &> /dev/null; then
    if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
        mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 1 as test, DATABASE() as db, USER() as user;" 2>&1
        if [ $? -eq 0 ]; then
            echo "   ✅ Connexion MySQL réussie"
        else
            echo "   ❌ Échec de connexion MySQL"
            echo "   Vérifiez:"
            echo "   - L'adresse host: $DB_HOST"
            echo "   - Le nom d'utilisateur: $DB_USER"
            echo "   - Le mot de passe (caractères spéciaux encodés?)"
            echo "   - Le nom de la base: $DB_NAME"
        fi
    else
        echo "   ⚠️  Impossible d'extraire les informations de connexion"
    fi
else
    echo "   ⚠️  mysql client non installé"
fi
echo ""

# 3. Vérifier PHP
echo "3️⃣  Vérification PHP"
echo "-------------------"
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    echo "   PHP Version: $PHP_VERSION"
    
    # Vérifier extensions
    php -m | grep -q pdo_mysql && echo "   ✅ Extension pdo_mysql: OK" || echo "   ❌ Extension pdo_mysql: MANQUANTE"
    php -m | grep -q mysqli && echo "   ✅ Extension mysqli: OK" || echo "   ⚠️  Extension mysqli: Non disponible"
else
    echo "   ❌ PHP non trouvé"
fi
echo ""

# 4. Vérifier Symfony
echo "4️⃣  Vérification Symfony"
echo "----------------------"
if [ -f "bin/console" ]; then
    echo "   ✅ bin/console trouvé"
    
    # Test de version
    php bin/console --version 2>&1 | head -1
    
    # Test de connexion via Doctrine
    echo ""
    echo "   Test de connexion Doctrine:"
    php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1 | head -5
    
else
    echo "   ❌ bin/console non trouvé"
fi
echo ""

# 5. Vérifier les migrations
echo "5️⃣  Vérification des migrations"
echo "-------------------------------"
if [ -d "migrations" ]; then
    MIGRATIONS_COUNT=$(ls -1 migrations/*.php 2>/dev/null | wc -l)
    echo "   Nombre de fichiers de migration: $MIGRATIONS_COUNT"
    
    if [ "$MIGRATIONS_COUNT" -gt 0 ]; then
        echo "   Dernières migrations:"
        ls -1t migrations/*.php | head -3 | xargs -I {} basename {}
    else
        echo "   ⚠️  Aucune migration trouvée"
    fi
else
    echo "   ❌ Dossier migrations non trouvé"
fi
echo ""

# 6. Statut des migrations
echo "6️⃣  Statut des migrations"
echo "------------------------"
if [ -f "bin/console" ]; then
    php bin/console doctrine:migrations:status --env=prod 2>&1 | head -20
else
    echo "   ⚠️  bin/console non disponible"
fi
echo ""

# 7. Vérifier les tables
echo "7️⃣  Vérification des tables"
echo "--------------------------"
if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
    if command -v mysql &> /dev/null; then
        TABLES_COUNT=$(mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | wc -l)
        if [ "$TABLES_COUNT" -gt 0 ]; then
            echo "   Nombre de tables: $((TABLES_COUNT - 1))"  # -1 pour la ligne d'en-tête
            echo "   Tables trouvées:"
            mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;" 2>/dev/null | tail -n +2 | head -10
        else
            echo "   ⚠️  Aucune table trouvée (base vide)"
        fi
    fi
fi
echo ""

# 8. Vérifier les logs
echo "8️⃣  Vérification des logs"
echo "------------------------"
if [ -f "var/log/prod.log" ]; then
    echo "   ✅ Log prod.log trouvé"
    echo "   Dernières erreurs:"
    tail -n 20 var/log/prod.log | grep -i error | tail -5 || echo "   Aucune erreur récente"
else
    echo "   ⚠️  Fichier prod.log non trouvé"
    echo "   Vérifiez que var/log/ existe"
    ls -la var/log/ 2>/dev/null || echo "   Dossier var/log/ n'existe pas"
fi
echo ""

# Résumé
echo "========================================"
echo "📋 RÉSUMÉ DU DIAGNOSTIC"
echo "========================================"
echo ""
echo "Prochaines étapes suggérées:"
echo ""
echo "1. Si connexion MySQL échoue:"
echo "   - Vérifiez le format DATABASE_URL"
echo "   - Encodez les caractères spéciaux dans le mot de passe"
echo "   - Testez: mysql -h $DB_HOST -u $DB_USER -p"
echo ""
echo "2. Si les migrations ne s'exécutent pas:"
echo "   - Vérifiez que migrations/ contient des fichiers"
echo "   - Exécutez: php bin/console doctrine:migrations:migrate --env=prod --verbose"
echo ""
echo "3. Si les tables sont vides:"
echo "   - Chargez les fixtures: php bin/console doctrine:fixtures:load --env=prod"
echo "   - Ou utilisez LOAD_FIXTURES=true dans GitHub Variables"
echo ""
echo "✨ Diagnostic terminé !"



