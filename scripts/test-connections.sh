#!/bin/bash

# Script pour tester toutes les connexions
# Usage: bash scripts/test-connections.sh [local|remote]

MODE=${1:-"local"}

echo "🔍 Test des Connexions - Mode: $MODE"
echo "=================================="
echo ""

if [ "$MODE" = "remote" ]; then
    echo "⚠️  Mode remote : Exécutez ce script sur le serveur PlanetHoster"
    echo ""
fi

# Test 1: Connexion à la base de données
echo "1️⃣  Test de connexion à la base de données MySQL/MariaDB"
echo "---------------------------------------------------"

if [ "$MODE" = "local" ]; then
    if [ -f "taxibiker-back/.env.local" ]; then
        DB_URL=$(grep DATABASE_URL taxibiker-back/.env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    elif [ -f "taxibiker-back/.env" ]; then
        DB_URL=$(grep DATABASE_URL taxibiker-back/.env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    else
        echo "❌ Fichier .env non trouvé"
        DB_URL=""
    fi
else
    if [ -f ".env" ]; then
        DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    else
        echo "❌ Fichier .env non trouvé"
        DB_URL=""
    fi
fi

if [ -n "$DB_URL" ]; then
    # Extraire les informations de connexion
    # Format: mysql://user:password@host:port/database
    DB_USER=$(echo $DB_URL | sed -n 's|mysql://\([^:]*\):.*|\1|p')
    DB_PASS=$(echo $DB_URL | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
    DB_HOST=$(echo $DB_URL | sed -n 's|mysql://[^@]*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo $DB_URL | sed -n 's|mysql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
    DB_NAME=$(echo $DB_URL | sed -n 's|mysql://[^@]*@[^/]*/\([^?]*\).*|\1|p')
    
    echo "   Host: $DB_HOST"
    echo "   Port: ${DB_PORT:-3306}"
    echo "   User: $DB_USER"
    echo "   Database: $DB_NAME"
    echo ""
    
    # Test de connexion
    if command -v mysql &> /dev/null; then
        mysql -h "$DB_HOST" -P "${DB_PORT:-3306}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 1;" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ Connexion MySQL réussie"
        else
            echo "   ❌ Échec de connexion MySQL"
        fi
    else
        echo "   ⚠️  mysql client non installé, test de connexion impossible"
    fi
else
    echo "   ⚠️  DATABASE_URL non trouvé dans .env"
fi

echo ""
echo ""

# Test 2: Test via Symfony
if [ "$MODE" = "local" ]; then
    echo "2️⃣  Test via Symfony (local)"
    echo "---------------------------------------------------"
    if [ -d "taxibiker-back" ]; then
        cd taxibiker-back
        php bin/console doctrine:database:create --if-not-exists 2>&1 | head -5
        php bin/console doctrine:migrations:status 2>&1 | head -10
        cd ..
    else
        echo "   ⚠️  Dossier taxibiker-back non trouvé"
    fi
else
    echo "2️⃣  Test via Symfony (remote)"
    echo "---------------------------------------------------"
    if [ -f "bin/console" ]; then
        php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1 | head -5
        php bin/console doctrine:migrations:status --env=prod 2>&1 | head -10
    else
        echo "   ⚠️  bin/console non trouvé"
    fi
fi

echo ""
echo ""

# Test 3: Test SSH (si mode remote)
if [ "$MODE" = "remote" ]; then
    echo "3️⃣  Test SSH"
    echo "---------------------------------------------------"
    echo "   ✅ Connecté via SSH"
    echo "   Hostname: $(hostname)"
    echo "   User: $(whoami)"
    echo "   Directory: $(pwd)"
fi

echo ""
echo ""

# Test 4: Test API Health Check
if [ "$MODE" = "remote" ]; then
    echo "4️⃣  Test API Health Check"
    echo "---------------------------------------------------"
    if [ -f "public/index.php" ] || [ -f "public_html/api/public/index.php" ]; then
        echo "   ✅ Fichiers API présents"
    else
        echo "   ⚠️  Fichiers API non trouvés"
    fi
fi

echo ""
echo "=================================="
echo "✨ Tests terminés !"
echo ""
echo "📋 Commandes utiles :"
echo ""
if [ "$MODE" = "local" ]; then
    echo "   Test connexion DB: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME"
    echo "   Test Symfony: cd taxibiker-back && php bin/console doctrine:database:create --if-not-exists"
else
    echo "   Test connexion DB: mysql -h $DB_HOST -u $DB_USER -p $DB_NAME"
    echo "   Test Symfony: php bin/console doctrine:migrations:status --env=prod"
    echo "   Test API: curl http://localhost/api/health"
fi


