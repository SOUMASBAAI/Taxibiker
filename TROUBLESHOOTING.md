# Guide de Dépannage TaxiBiker

## 🚨 Problèmes Courants et Solutions

### 1. Erreur de Compatibilité PHP avec Composer

#### Symptôme

```
Problem 1
- lcobucci/clock is locked to version 3.4.0 and an update of this package was not requested.
- lcobucci/clock 3.4.0 requires php ~8.3.0 || ~8.4.0 -> your php version (8.2.0) does not satisfy that requirement.
```

#### Cause

Le fichier `composer.lock` contient des versions de packages qui nécessitent PHP 8.3+, mais votre système utilise PHP 8.2.

#### Solutions

##### Solution 1 : Résolution automatique (Recommandée)

```bash
# Exécuter le script de correction
chmod +x scripts/fix-php-compatibility.sh
./scripts/fix-php-compatibility.sh
```

##### Solution 2 : Résolution manuelle rapide

```bash
cd taxibiker-back
rm composer.lock
composer update --no-interaction
```

##### Solution 3 : Mise à jour PHP (Si possible)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php8.3 php8.3-cli php8.3-mysql php8.3-xml php8.3-mbstring

# Windows (avec XAMPP)
# Télécharger PHP 8.3+ depuis https://www.php.net/downloads

# macOS (avec Homebrew)
brew install php@8.3
```

### 2. Erreur de Syntaxe MariaDB (XAMPP)

#### Symptôme

```
SQLSTATE[42000]: Syntax error or access violation: 1064 You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'NOT NULL, client_id INTEGER NOT NULL, date DATETIME NOT NULL, departure VARCHAR...' at line 1
```

#### Cause

XAMPP utilise MariaDB au lieu de MySQL, ce qui cause des différences de syntaxe dans les migrations Doctrine.

#### Solution Automatique

```bash
# Détecter le type de base de données
./scripts/detect-database.sh

# Corriger automatiquement pour MariaDB
./scripts/fix-mariadb-syntax.sh
```

#### Solution Manuelle

```bash
# Mettre à jour .env.local
DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=mariadb-10.6.0&charset=utf8mb4

# Régénérer les migrations
cd taxibiker-back
rm -f migrations/Version*.php
php bin/console doctrine:database:drop --force --if-exists
php bin/console doctrine:database:create
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

### 3. Erreur de Connexion à la Base de Données

#### Symptôme

```
SQLSTATE[HY000] [2002] Connection refused
```

#### Solutions

```bash
# Vérifier que MySQL est démarré
./scripts/start-db.sh

# Vérifier la configuration
cd taxibiker-back
php bin/console debug:config doctrine

# Tester la connexion
php bin/console doctrine:database:create --if-not-exists
```

### 3. Erreur de Permissions (Linux/macOS)

#### Symptôme

```
Permission denied: ./scripts/setup-dev.sh
```

#### Solution

```bash
# Rendre tous les scripts exécutables
chmod +x scripts/*.sh

# Ou individuellement
chmod +x scripts/setup-dev.sh
```

### 4. Erreur de Cache Symfony

#### Symptôme

```
Unable to write in the cache directory
```

#### Solutions

```bash
cd taxibiker-back

# Nettoyer le cache
rm -rf var/cache/*

# Recréer les dossiers avec bonnes permissions
mkdir -p var/cache var/log
chmod -R 755 var/
```

### 5. Erreur JWT - Clés Manquantes

#### Symptôme

```
Unable to load key "config/jwt/private.pem"
```

#### Solution

```bash
cd taxibiker-back

# Générer les clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096 -pass pass:dev_passphrase
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:dev_passphrase
chmod 644 config/jwt/*.pem
```

### 6. Erreur Frontend - Modules Manquants

#### Symptôme

```
Module not found: Error: Can't resolve 'react'
```

#### Solution

```bash
cd taxibiker-front

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Ou forcer la résolution
npm ci --force
```

### 7. Port Déjà Utilisé

#### Symptôme

```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solutions

```bash
# Trouver le processus utilisant le port
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Tuer le processus
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# Ou utiliser un autre port
cd taxibiker-front
npm run dev -- --port 3001
```

### 8. Erreur de Migration Doctrine

#### Symptôme

```
Migration DoctrineMigrations\VersionXXXX was not found
```

#### Solutions

```bash
cd taxibiker-back

# Vérifier le statut des migrations
php bin/console doctrine:migrations:status

# Marquer toutes les migrations comme exécutées
php bin/console doctrine:migrations:version --add --all

# Ou générer une nouvelle migration
php bin/console doctrine:migrations:diff
```

## 🔧 Commandes de Diagnostic

### Vérifications Système

```bash
# Version PHP
php --version

# Extensions PHP
php -m

# Version Node.js
node --version

# Version npm
npm --version

# Version Composer
composer --version
```

### Vérifications Projet

```bash
# Backend Symfony
cd taxibiker-back
php bin/console about
php bin/console debug:config doctrine

# Frontend React
cd taxibiker-front
npm list react
npm run build --dry-run
```

### Logs Utiles

```bash
# Logs Symfony
tail -f taxibiker-back/var/log/dev.log

# Logs Docker
docker-compose logs -f database

# Logs npm
npm run dev --verbose
```

## 🆘 Support

### Avant de Demander de l'Aide

1. **Vérifiez ce guide** pour votre problème spécifique
2. **Consultez les logs** pour plus de détails
3. **Testez avec une installation propre** si possible
4. **Notez votre environnement** (OS, versions PHP/Node, etc.)

### Informations à Fournir

```bash
# Collecte d'informations système
echo "=== SYSTÈME ==="
uname -a
php --version
node --version
composer --version

echo "=== PROJET ==="
cd taxibiker-back
php bin/console --version
composer show | head -10

cd ../taxibiker-front
npm --version
cat package.json | grep '"version"'
```

### Contacts

- **Issues GitHub** : [Créer un ticket](https://github.com/votre-username/taxibiker/issues)
- **Documentation** : [DEPLOYMENT.md](DEPLOYMENT.md)
- **Email** : support@taxibiker.com

---

**Conseil** : Gardez ce guide à portée de main lors du développement ! 📚
