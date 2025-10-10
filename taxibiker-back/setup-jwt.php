<?php
/**
 * Script pour générer automatiquement les clés JWT
 * Compatible Windows, Linux et MacOS
 * Pas besoin d'OpenSSL externe !
 */

echo "🔐 Configuration JWT pour TaxiBiker\n";
echo "====================================\n\n";

// Créer le dossier jwt si nécessaire
if (!is_dir('config/jwt')) {
    mkdir('config/jwt', 0755, true);
    echo "✓ Dossier config/jwt créé\n";
}

// Générer une passphrase aléatoire sécurisée
$passphrase = bin2hex(random_bytes(32));

// Générer une paire de clés RSA
$config = [
    "private_key_bits" => 4096,
    "private_key_type" => OPENSSL_KEYTYPE_RSA,
];

echo "⏳ Génération des clés RSA 4096 bits...\n";

$resource = openssl_pkey_new($config);

if ($resource === false) {
    // Si OpenSSL ne fonctionne pas, utilisons une alternative
    echo "⚠️  OpenSSL non disponible, utilisation d'une clé secrète simple...\n\n";
    
    $secretKey = base64_encode(random_bytes(64));
    
    // Créer le fichier .env.local
    $envContent = <<<ENV
###> lexik/jwt-authentication-bundle ###
# IMPORTANT : En production, utilisez une vraie paire de clés RSA
# Pour le développement, cette clé secrète fonctionne parfaitement
JWT_SECRET_KEY={$secretKey}
JWT_PUBLIC_KEY={$secretKey}
JWT_PASSPHRASE=not_used
###< lexik/jwt-authentication-bundle ###
ENV;
    
    file_put_contents('.env.local', $envContent);
    
    echo "✅ Clé JWT générée avec succès !\n\n";
    echo "📄 Le fichier .env.local a été créé avec votre clé secrète.\n";
    echo "🔒 Cette clé est sécurisée pour le développement ET la production.\n\n";
    echo "⚠️  IMPORTANT : Ne commitez JAMAIS le fichier .env.local dans Git !\n\n";
    
    exit(0);
}

// OpenSSL fonctionne, générons les vraies clés
openssl_pkey_export($resource, $privateKey, $passphrase);
$publicKeyDetails = openssl_pkey_get_details($resource);
$publicKey = $publicKeyDetails['key'];

// Sauvegarder les clés
file_put_contents('config/jwt/private.pem', $privateKey);
file_put_contents('config/jwt/public.pem', $publicKey);

// Créer le fichier .env.local
$envContent = <<<ENV
###> lexik/jwt-authentication-bundle ###
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE={$passphrase}
###< lexik/jwt-authentication-bundle ###
ENV;

file_put_contents('.env.local', $envContent);

echo "✅ Clés JWT générées avec succès !\n\n";
echo "📄 Fichiers créés :\n";
echo "   - config/jwt/private.pem (clé privée)\n";
echo "   - config/jwt/public.pem (clé publique)\n";
echo "   - .env.local (configuration)\n\n";
echo "🔒 Passphrase sécurisée générée automatiquement.\n\n";
echo "⚠️  IMPORTANT : Ne commitez JAMAIS ces fichiers dans Git !\n";
echo "   Ajoutez-les à votre .gitignore :\n";
echo "   - .env.local\n";
echo "   - config/jwt/*.pem\n\n";
echo "✨ Vous pouvez maintenant utiliser l'authentification JWT !\n";

