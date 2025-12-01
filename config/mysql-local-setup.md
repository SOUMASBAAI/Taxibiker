# Configuration MySQL Local (Sans Docker)

## 🎯 Options d'installation MySQL

### 1. XAMPP (Recommandé pour Windows)

#### Installation

1. Télécharger XAMPP : https://www.apachefriends.org/
2. Installer XAMPP
3. Démarrer le panneau de contrôle XAMPP
4. Cliquer sur "Start" pour Apache et MySQL

#### Configuration

- **Host** : `localhost` ou `127.0.0.1`
- **Port** : `3306`
- **Username** : `root`
- **Password** : _(vide par défaut)_
- **Database** : `taxibiker_dev` (à créer)

#### URL de connexion

```
DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4
```

### 2. WAMP (Windows)

#### Installation

1. Télécharger WAMP : https://www.wampserver.com/
2. Installer WampServer
3. Démarrer WampServer (icône verte dans la barre des tâches)

#### Configuration

- **Host** : `localhost`
- **Port** : `3306`
- **Username** : `root`
- **Password** : _(vide par défaut)_

### 3. MAMP (macOS)

#### Installation

1. Télécharger MAMP : https://www.mamp.info/
2. Installer MAMP
3. Démarrer MAMP et cliquer sur "Start Servers"

#### Configuration

- **Host** : `localhost`
- **Port** : `3306` (ou `8889` selon la version)
- **Username** : `root`
- **Password** : `root`

#### URL de connexion

```
DATABASE_URL=mysql://root:root@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4
```

### 4. Installation Native

#### Windows (avec Chocolatey)

```bash
# Installer Chocolatey si pas déjà fait
# Puis installer MySQL
choco install mysql

# Démarrer le service
net start mysql80
```

#### macOS (avec Homebrew)

```bash
# Installer MySQL
brew install mysql

# Démarrer MySQL
brew services start mysql

# Sécuriser l'installation
mysql_secure_installation
```

#### Ubuntu/Debian

```bash
# Installer MySQL
sudo apt update
sudo apt install mysql-server

# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Sécuriser l'installation
sudo mysql_secure_installation
```

## 🗄️ Création de la base de données

### Via phpMyAdmin (XAMPP/WAMP)

1. Ouvrir http://localhost/phpmyadmin
2. Cliquer sur "Nouvelle base de données"
3. Nom : `taxibiker_dev`
4. Interclassement : `utf8mb4_unicode_ci`
5. Cliquer sur "Créer"

### Via ligne de commande

```sql
-- Se connecter à MySQL
mysql -u root -p

-- Créer la base de données
CREATE DATABASE taxibiker_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur dédié (optionnel)
CREATE USER 'taxibiker'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON taxibiker_dev.* TO 'taxibiker'@'localhost';
FLUSH PRIVILEGES;

-- Quitter
EXIT;
```

### Via Symfony (Recommandé)

```bash
cd taxibiker-back
php bin/console doctrine:database:create
```

## ⚙️ Configuration TaxiBiker

### 1. Fichier .env.local

Créer le fichier `taxibiker-back/.env.local` :

```bash
# Configuration locale MySQL
APP_ENV=dev
APP_DEBUG=true
APP_SECRET=dev_secret_key_change_in_production

# Base de données MySQL locale
# XAMPP/WAMP (sans mot de passe)
DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4

# Ou avec mot de passe
# DATABASE_URL=mysql://root:password@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4

# Ou utilisateur dédié
# DATABASE_URL=mysql://taxibiker:password@127.0.0.1:3306/taxibiker_dev?serverVersion=8.0&charset=utf8mb4

# Configuration JWT
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=dev_passphrase

# CORS pour le développement
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
```

### 2. Test de connexion

```bash
cd taxibiker-back

# Tester la connexion
php bin/console doctrine:database:create --if-not-exists

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les données de test
php bin/console doctrine:fixtures:load
```

## 🔧 Dépannage

### ⚠️ XAMPP utilise MariaDB (pas MySQL)

**Erreur typique :**

```
SQLSTATE[42000]: Syntax error or access violation: 1064 You have an error in your SQL syntax
```

**Solution :**

```bash
# Exécuter le script de correction MariaDB
./scripts/fix-mariadb-syntax.sh
```

**Configuration .env.local pour MariaDB :**

```bash
# XAMPP utilise MariaDB, pas MySQL
DATABASE_URL=mysql://root:@127.0.0.1:3306/taxibiker_dev?serverVersion=mariadb-10.6.0&charset=utf8mb4
```

### Erreur de connexion

```
SQLSTATE[HY000] [2002] Connection refused
```

**Solutions :**

1. Vérifier que MySQL/MariaDB est démarré
2. Vérifier le port (3306 par défaut)
3. Vérifier les credentials dans .env.local

### Erreur d'authentification

```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'
```

**Solutions :**

1. Vérifier le mot de passe
2. Réinitialiser le mot de passe root :
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_password';
   ```

### Base de données inexistante

```
SQLSTATE[HY000] [1049] Unknown database 'taxibiker_dev'
```

**Solution :**

```bash
php bin/console doctrine:database:create
```

### Port déjà utilisé

Si le port 3306 est occupé, changer le port dans MySQL et dans .env.local :

```
DATABASE_URL=mysql://root:@127.0.0.1:3307/taxibiker_dev?serverVersion=8.0&charset=utf8mb4
```

## 📊 Outils de gestion

### phpMyAdmin (Interface web)

- **XAMPP** : http://localhost/phpmyadmin
- **WAMP** : http://localhost/phpmyadmin
- **Installation séparée** : https://www.phpmyadmin.net/

### MySQL Workbench (Application desktop)

- Télécharger : https://www.mysql.com/products/workbench/
- Interface graphique complète pour MySQL

### Ligne de commande

```bash
# Se connecter
mysql -u root -p

# Lister les bases
SHOW DATABASES;

# Utiliser une base
USE taxibiker_dev;

# Lister les tables
SHOW TABLES;
```

## 🚀 Démarrage rapide

1. **Installer MySQL** (XAMPP recommandé)
2. **Démarrer MySQL**
3. **Configurer .env.local**
4. **Créer la base** : `php bin/console doctrine:database:create`
5. **Démarrer l'app** : `./scripts/start-all.sh`

---

**Besoin d'aide ?** Consultez [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) 📚
