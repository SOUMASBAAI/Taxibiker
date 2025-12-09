<?php
/**
 * Script de test de connexion à la base de données PlanetHoster
 * Utilise la méthode recommandée par PlanetHoster avec localhost
 */

echo "=== Test de Connexion Base de Données PlanetHoster ===\n\n";

// Configuration selon les recommandations PlanetHoster
$host = 'localhost'; // Sur quel serveur la BDD est enregistrée
$nom_bdd = 'ueeecgbbue_taxibiker_prod'; // Nom de la Base de données
$user_bdd = 'ueeecgbbue_soumia'; // Utilisateur de la base de données
$password_bdd = 'Soumia123#'; // Mot de passe de l'utilisateur de la bdd

echo "Configuration utilisée :\n";
echo "- Host: $host\n";
echo "- Database: $nom_bdd\n";
echo "- User: $user_bdd\n";
echo "- Password: " . str_repeat('*', strlen($password_bdd)) . "\n\n";

// Test 1: Connexion PDO (Recommandé pour Symfony)
echo "=== Test 1: Connexion PDO ===\n";
try {
    $dsn = "mysql:host=$host;dbname=$nom_bdd;charset=utf8mb4";
    $bdd = new PDO($dsn, $user_bdd, $password_bdd);
    $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connexion PDO réussie !\n";
    
    // Test de requête simple
    $stmt = $bdd->query("SELECT VERSION() as version");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Version MySQL/MariaDB: " . $result['version'] . "\n";
    
    // Test des tables existantes
    $stmt = $bdd->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "✅ Nombre de tables: " . count($tables) . "\n";
    if (count($tables) > 0) {
        echo "   Tables: " . implode(', ', array_slice($tables, 0, 5));
        if (count($tables) > 5) echo " (et " . (count($tables) - 5) . " autres)";
        echo "\n";
    }
    
    $bdd = null; // Fermer la connexion
    
} catch (PDOException $e) {
    echo "❌ Erreur PDO: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Connexion MySQLi (Alternative)
echo "=== Test 2: Connexion MySQLi ===\n";
try {
    $mysqli = new mysqli($host, $user_bdd, $password_bdd, $nom_bdd);
    
    if ($mysqli->connect_error) {
        throw new Exception("Erreur de connexion: " . $mysqli->connect_error);
    }
    
    echo "✅ Connexion MySQLi réussie !\n";
    
    // Test de requête
    $result = $mysqli->query("SELECT CONNECTION_ID() as id");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "✅ ID de connexion: " . $row['id'] . "\n";
    }
    
    $mysqli->close();
    
} catch (Exception $e) {
    echo "❌ Erreur MySQLi: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Format DATABASE_URL pour Symfony
echo "=== Test 3: Format DATABASE_URL pour Symfony ===\n";
$encoded_password = urlencode($password_bdd);
$database_url = "mysql://$user_bdd:$encoded_password@$host:3306/$nom_bdd?serverVersion=mariadb-10.6&charset=utf8mb4";

echo "DATABASE_URL à utiliser dans votre fichier .env :\n";
echo "$database_url\n\n";

// Test 4: Vérification des extensions PHP
echo "=== Test 4: Extensions PHP ===\n";
$required_extensions = ['pdo', 'pdo_mysql', 'mysqli'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ Extension $ext: disponible\n";
    } else {
        echo "❌ Extension $ext: MANQUANTE\n";
    }
}

echo "\n=== Résumé ===\n";
echo "Si tous les tests sont ✅, votre configuration est correcte !\n";
echo "Copiez la DATABASE_URL générée dans votre fichier .env sur PlanetHoster.\n";
echo "\nPour utiliser ce script :\n";
echo "1. Remplacez 'VOTRE_MOT_DE_PASSE_ICI' par votre vrai mot de passe\n";
echo "2. Uploadez ce fichier sur votre serveur PlanetHoster\n";
echo "3. Exécutez: php test-db-connection.php\n";
?>
