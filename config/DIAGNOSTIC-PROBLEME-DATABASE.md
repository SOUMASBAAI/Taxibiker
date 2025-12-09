# 🔍 Diagnostic : Problème avec la Base de Données

## 🚨 Ça ne marche pas - Diagnostic Complet

### Étape 1 : Exécuter le Script de Diagnostic

**Sur le serveur (via SSH) :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api
bash scripts/diagnostic-complet.sh
```

**Ou créez le script directement :**

```bash
cd public_html/api
cat > diagnostic.sh << 'EOF'
# Copiez le contenu du script diagnostic-complet.sh
EOF
chmod +x diagnostic.sh
./diagnostic.sh
```

### Étape 2 : Vérifications Manuelles

#### A. Vérifier le Format DATABASE_URL

```bash
cat .env | grep DATABASE_URL
```

**Format attendu :**

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%23@localhost:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6&charset=utf8mb4
```

**Points à vérifier :**

- ✅ Mot de passe encodé (`#` → `%23`)
- ✅ Host : `localhost` (recommandé par PlanetHoster)
- ✅ Port : `3306`
- ✅ Database : `ueeecgbbue_taxibiker_prod`

#### B. Tester la Connexion MySQL Directement

```bash
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

Entrez le mot de passe : `Soumia123#` (sans encodage)

**Si ça fonctionne :** La connexion MySQL est bonne  
**Si erreur :** Le problème vient de MySQL (identifiants, permissions, base inexistante)

#### C. Tester via Symfony

```bash
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1
php bin/console doctrine:migrations:status --env=prod 2>&1
```

**Si aucune sortie :** Problème avec Doctrine/Symfony  
**Si erreur :** Notez le message d'erreur exact

#### D. Vérifier les Logs

```bash
tail -n 50 var/log/prod.log 2>&1
```

Cherchez les erreurs liées à la base de données.

---

## 🔧 Solutions selon le Problème

### Problème 1 : "Connection refused" ou "Access denied"

**Solutions :**

1. **Vérifiez le mot de passe** :

   ```bash
   # Testez avec le mot de passe réel
   mysql -h localhost -u ueeecgbbue_soumia -p
   ```

2. **Vérifiez que la base existe** :

   ```bash
   mysql -h localhost -u ueeecgbbue_soumia -p -e "SHOW DATABASES;"
   ```

3. **Vérifiez les permissions** :
   - Dans le panneau PlanetHoster
   - L'utilisateur doit avoir tous les droits sur la base

### Problème 2 : "Unknown database"

**Solution :**

La base n'existe pas. Créez-la dans le panneau PlanetHoster ou :

```bash
mysql -h localhost -u ueeecgbbue_soumia -p -e "CREATE DATABASE IF NOT EXISTS ueeecgbbue_taxibiker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Problème 3 : Les commandes Doctrine ne produisent aucune sortie

**Solutions :**

1. **Vérifiez les permissions** :

   ```bash
   chmod +x bin/console
   ```

2. **Vérifiez que vendor existe** :

   ```bash
   ls -la vendor/
   ```

3. **Réinstallez les dépendances** :

   ```bash
   composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
   ```

4. **Videz le cache** :
   ```bash
   php bin/console cache:clear --env=prod --no-debug
   ```

### Problème 4 : Format DATABASE_URL incorrect

**Solution :**

Encodez correctement le mot de passe :

```bash
# Si mot de passe = "Soumia123#"
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%23@localhost:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6&charset=utf8mb4
```

---

## 📋 Checklist de Vérification

Exécutez ces commandes et notez les résultats :

```bash
cd public_html/api

# 1. Vérifier .env
echo "=== .env ==="
cat .env | grep DATABASE_URL

# 2. Tester MySQL
echo "=== MySQL ==="
mysql -h localhost -u ueeecgbbue_soumia -p -e "SELECT 1;" ueeecgbbue_taxibiker_prod

# 3. Vérifier PHP
echo "=== PHP ==="
php -v
php -m | grep pdo_mysql

# 4. Vérifier Symfony
echo "=== Symfony ==="
php bin/console --version

# 5. Tester Doctrine
echo "=== Doctrine ==="
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1

# 6. Vérifier migrations
echo "=== Migrations ==="
ls -la migrations/
php bin/console doctrine:migrations:status --env=prod 2>&1

# 7. Vérifier les tables
echo "=== Tables ==="
mysql -h localhost -u ueeecgbbue_soumia -p -e "SHOW TABLES;" ueeecgbbue_taxibiker_prod
```

---

## 🎯 Action Immédiate

**Exécutez ces commandes et partagez les résultats :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api

# Afficher DATABASE_URL
cat .env | grep DATABASE_URL

# Tester MySQL
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod

# Tester Symfony
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1
```

**Partagez :**

1. Le contenu de `DATABASE_URL`
2. Le résultat de la connexion MySQL
3. Les erreurs (s'il y en a)

---

**Avec ces informations, on pourra identifier le problème exact !** 🔍
