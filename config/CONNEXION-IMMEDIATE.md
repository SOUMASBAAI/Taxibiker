# 🚀 Connexion Immédiate - Configuration Prête

## 📋 Fichier .env à créer sur PlanetHoster

**Emplacement :** `public_html/api/.env`

**Contenu exact à copier-coller :**

```bash
APP_ENV=prod
APP_DEBUG=false
APP_SECRET=a1b2c3d4e5f6789abcdef0123456789

DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%23@localhost:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6&charset=utf8mb4

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=taxibiker_jwt_passphrase_2024

CORS_ALLOW_ORIGIN=^https://taxibikerparis\.com$
TIMEZONE=Europe/Paris
```

## 🔍 Test de Connexion Immédiat

**Commandes à exécuter sur PlanetHoster :**

```bash
# Se connecter en SSH
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com

# Aller dans le dossier API
cd public_html/api

# Tester la connexion MySQL directement
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
# Mot de passe à saisir : Soumia123#

# Tester avec PHP
php scripts/test-db-connection.php

# Tester Symfony
php bin/console doctrine:database:create --if-not-exists --env=prod
php bin/console doctrine:migrations:status --env=prod
```

## ✅ Vérifications

### 1. Connexion MySQL

```bash
mysql -h localhost -u ueeecgbbue_soumia -p -e "SELECT VERSION();" ueeecgbbue_taxibiker_prod
```

**Résultat attendu :** Version de MariaDB affichée

### 2. Test PHP PDO

```bash
php -r "
try {
    \$pdo = new PDO('mysql:host=localhost;dbname=ueeecgbbue_taxibiker_prod', 'ueeecgbbue_soumia', 'Soumia123#');
    echo 'Connexion PDO: OK\n';
} catch(Exception \$e) {
    echo 'Erreur: ' . \$e->getMessage() . '\n';
}
"
```

### 3. Test Symfony

```bash
php bin/console debug:config doctrine --env=prod
```

## 🎯 DATABASE_URL Finale

**Pour votre fichier .env :**

```
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%23@localhost:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6&charset=utf8mb4
```

**Explication de l'encodage :**

- Mot de passe réel : `Soumia123#`
- Mot de passe encodé URL : `Soumia123%23` (le `#` devient `%23`)

## 🚀 Déploiement

Une fois le fichier `.env` créé sur PlanetHoster :

```bash
# Sur votre machine locale
git add .
git commit -m "Update database configuration with real password"
git push origin main
```

Le déploiement GitHub Actions devrait maintenant fonctionner !

## 📞 Support

Si ça ne marche toujours pas, exécutez ces commandes et partagez les résultats :

```bash
cd public_html/api
echo "=== Test MySQL ==="
mysql -h localhost -u ueeecgbbue_soumia -p -e "SELECT 1;" ueeecgbbue_taxibiker_prod

echo "=== Test PHP ==="
php scripts/test-db-connection.php

echo "=== Test Symfony ==="
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1
```

---

**🎯 Configuration prête à utiliser ! Copiez le fichier .env et testez !**
