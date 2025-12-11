<?php
/**
 * Script de debug Doctrine pour diagnostiquer les problèmes de migrations silencieuses
 */

echo "=== Debug Doctrine - Migrations Silencieuses ===\n\n";

// Vérifier que nous sommes dans le bon répertoire
if (!file_exists('bin/console')) {
    echo "❌ Erreur: Vous devez être dans le répertoire racine de Symfony (taxibiker-back)\n";
    echo "Exécutez: cd public_html/api\n";
    exit(1);
}

echo "✅ Répertoire Symfony détecté\n\n";

// Test 1: Vérifier les permissions
echo "=== Test 1: Permissions ===\n";
$console_perms = fileperms('bin/console');
$is_executable = is_executable('bin/console');
echo "bin/console permissions: " . substr(sprintf('%o', $console_perms), -4) . "\n";
echo "bin/console executable: " . ($is_executable ? "✅ Oui" : "❌ Non") . "\n";

if (!$is_executable) {
    echo "🔧 Correction: chmod +x bin/console\n";
}
echo "\n";

// Test 2: Vérifier PHP et extensions
echo "=== Test 2: PHP et Extensions ===\n";
echo "Version PHP: " . PHP_VERSION . "\n";

$required_extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($required_extensions as $ext) {
    $loaded = extension_loaded($ext);
    echo "Extension $ext: " . ($loaded ? "✅" : "❌") . "\n";
}
echo "\n";

// Test 3: Vérifier le fichier .env
echo "=== Test 3: Configuration .env ===\n";
if (file_exists('.env')) {
    echo "✅ Fichier .env trouvé\n";
    $env_content = file_get_contents('.env');
    
    // Vérifier DATABASE_URL
    if (preg_match('/DATABASE_URL=(.+)/', $env_content, $matches)) {
        $database_url = trim($matches[1]);
        echo "✅ DATABASE_URL trouvée\n";
        
        // Masquer le mot de passe pour l'affichage
        $safe_url = preg_replace('/:([^@]+)@/', ':****@', $database_url);
        echo "DATABASE_URL: $safe_url\n";
        
        // Vérifier le format
        if (strpos($database_url, 'mysql://') === 0) {
            echo "✅ Format MySQL correct\n";
        } else {
            echo "❌ Format DATABASE_URL incorrect\n";
        }
    } else {
        echo "❌ DATABASE_URL non trouvée dans .env\n";
    }
    
    // Vérifier APP_ENV
    if (preg_match('/APP_ENV=(.+)/', $env_content, $matches)) {
        $app_env = trim($matches[1]);
        echo "APP_ENV: $app_env\n";
    }
} else {
    echo "❌ Fichier .env non trouvé\n";
}
echo "\n";

// Test 4: Tester la connexion Doctrine
echo "=== Test 4: Connexion Doctrine ===\n";
try {
    // Simuler une connexion Doctrine basique
    if (file_exists('.env')) {
        $env_content = file_get_contents('.env');
        if (preg_match('/DATABASE_URL=mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/', $env_content, $matches)) {
            $user = $matches[1];
            $password = urldecode($matches[2]); // Décoder le mot de passe
            $host = $matches[3];
            $port = $matches[4];
            $database = $matches[5];
            
            echo "Tentative de connexion...\n";
            echo "Host: $host\n";
            echo "Database: $database\n";
            echo "User: $user\n";
            
            $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database", $user, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo "✅ Connexion PDO réussie\n";
            
            // Vérifier si la table doctrine_migration_versions existe
            $stmt = $pdo->query("SHOW TABLES LIKE 'doctrine_migration_versions'");
            $migration_table_exists = $stmt->rowCount() > 0;
            echo "Table migrations: " . ($migration_table_exists ? "✅ Existe" : "❌ N'existe pas") . "\n";
            
            if ($migration_table_exists) {
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM doctrine_migration_versions");
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                echo "Migrations exécutées: " . $result['count'] . "\n";
            }
            
        } else {
            echo "❌ Impossible de parser DATABASE_URL\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 5: Vérifier les fichiers de migration
echo "=== Test 5: Fichiers de Migration ===\n";
if (is_dir('migrations')) {
    $migrations = glob('migrations/Version*.php');
    echo "Fichiers de migration trouvés: " . count($migrations) . "\n";
    
    if (count($migrations) > 0) {
        echo "Dernière migration: " . basename(end($migrations)) . "\n";
        foreach ($migrations as $migration) {
            echo "- " . basename($migration) . "\n";
        }
    } else {
        echo "❌ Aucun fichier de migration trouvé\n";
    }
} else {
    echo "❌ Dossier migrations non trouvé\n";
}
echo "\n";

// Test 6: Vérifier vendor et autoload
echo "=== Test 6: Vendor et Autoload ===\n";
if (file_exists('vendor/autoload.php')) {
    echo "✅ vendor/autoload.php trouvé\n";
    
    // Vérifier quelques packages clés
    $packages = [
        'vendor/symfony/console',
        'vendor/doctrine/orm',
        'vendor/doctrine/migrations'
    ];
    
    foreach ($packages as $package) {
        echo basename($package) . ": " . (is_dir($package) ? "✅" : "❌") . "\n";
    }
} else {
    echo "❌ vendor/autoload.php non trouvé\n";
    echo "🔧 Exécutez: composer install --no-dev --optimize-autoloader\n";
}
echo "\n";

// Commandes de diagnostic recommandées
echo "=== Commandes de Diagnostic Recommandées ===\n";
echo "1. Vérifier les permissions:\n";
echo "   chmod +x bin/console\n\n";

echo "2. Tester les commandes avec verbose:\n";
echo "   php bin/console doctrine:migrations:status -v --env=prod\n";
echo "   php bin/console doctrine:migrations:migrate -v --env=prod\n\n";

echo "3. Forcer l'affichage des erreurs:\n";
echo "   php -d display_errors=1 bin/console doctrine:migrations:status --env=prod\n\n";

echo "4. Vérifier les logs:\n";
echo "   tail -n 20 var/log/prod.log\n\n";

echo "5. Tester en mode dev (plus verbeux):\n";
echo "   php bin/console doctrine:migrations:status --env=dev\n\n";

echo "6. Créer la base si elle n'existe pas:\n";
echo "   php bin/console doctrine:database:create --if-not-exists --env=prod\n\n";

echo "7. Vérifier la configuration Doctrine:\n";
echo "   php bin/console debug:config doctrine --env=prod\n\n";

echo "=== Résumé ===\n";
echo "Si tous les tests sont ✅, le problème vient probablement de:\n";
echo "1. Migrations déjà exécutées (normal, pas de sortie)\n";
echo "2. Permissions insuffisantes\n";
echo "3. Erreurs silencieuses (utilisez -v pour verbose)\n";
echo "4. Cache Symfony (videz avec: php bin/console cache:clear --env=prod)\n";
?>

