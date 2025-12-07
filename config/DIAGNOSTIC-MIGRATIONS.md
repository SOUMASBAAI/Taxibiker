# 🔍 Diagnostic : Pourquoi les migrations ne fonctionnent pas

## 📋 Vérifications étape par étape

### Étape 1 : Vérifier que vous êtes au bon endroit

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api
pwd
```

Vous devriez voir : `/home/ueeecgbbue/public_html/api`

### Étape 2 : Vérifier que le fichier .env existe et est correct

```bash
cat .env | grep DATABASE_URL
```

**Vous devriez voir :**

```
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123!@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

### Étape 3 : Tester la connexion à la base de données

```bash
php bin/console doctrine:database:create --if-not-exists --env=prod
```

**Si ça fonctionne :** La connexion est bonne ✅
**Si erreur :** Notez le message d'erreur exact

### Étape 4 : Vérifier que les fichiers de migration existent

```bash
ls -la migrations/
```

**Vous devriez voir :**

- `Version20250930202950.php`
- `Version20251007221745.php`
- `Version20251112220750.php`
- etc.

**Si le dossier est vide ou n'existe pas :** Les fichiers de migration n'ont pas été déployés !

### Étape 5 : Vérifier le statut des migrations

```bash
php bin/console doctrine:migrations:status --env=prod
```

**Notez :**

- Combien de migrations sont disponibles
- Combien ont été exécutées
- S'il y a des erreurs

### Étape 6 : Tester la connexion MySQL directement

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

Entrez le mot de passe : `Soumia123!`

**Si ça fonctionne :** Vous verrez `mysql>`
Tapez `exit` pour quitter.

**Si erreur :** Le problème vient de la connexion MySQL.

### Étape 7 : Vérifier que vendor existe

```bash
ls -la vendor/
```

**Si le dossier n'existe pas :**

```bash
composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
```

### Étape 8 : Vérifier les permissions

```bash
ls -la var/
```

**Si le dossier n'existe pas ou a des problèmes de permissions :**

```bash
mkdir -p var/cache var/log
chmod -R 755 var/
```

## 🚨 Problèmes courants et solutions

### Problème 1 : "No migrations found"

**Cause :** Les fichiers de migration n'ont pas été déployés.

**Solution :**

```bash
# Vérifier que migrations/ existe
ls -la migrations/

# Si vide, redéployer depuis GitHub
git clone https://github.com/VOTRE-REPO/Taxibiker.git /tmp/taxibiker
cp -r /tmp/taxibiker/taxibiker-back/migrations/* migrations/
```

### Problème 2 : "Connection refused" ou "Access denied"

**Cause :** Problème de connexion à la base de données.

**Solution :**

1. Vérifier le mot de passe dans `.env`
2. Vérifier que l'utilisateur MySQL a les bonnes permissions
3. Tester avec mysql directement

### Problème 3 : "Class not found" ou erreur PHP

**Cause :** Dépendances manquantes.

**Solution :**

```bash
composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
```

### Problème 4 : "Permission denied" sur var/

**Cause :** Problèmes de permissions.

**Solution :**

```bash
mkdir -p var/cache var/log
chmod -R 755 var/
chown -R ueeecgbbue:ueeecgbbue var/
```

### Problème 5 : Les migrations s'exécutent mais les tables n'apparaissent pas

**Cause :** Base de données incorrecte ou migrations dans une autre base.

**Solution :**

1. Vérifier le nom de la base dans `.env`
2. Vérifier dans quelle base vous regardez dans phpMyAdmin
3. Vider le cache :
   ```bash
   php bin/console cache:clear --env=prod
   ```

## 🔧 Commande complète de diagnostic

Exécutez cette séquence complète :

```bash
# 1. Se connecter
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com

# 2. Aller dans le dossier API
cd public_html/api

# 3. Vérifier .env
echo "=== .env DATABASE_URL ==="
cat .env | grep DATABASE_URL

# 4. Vérifier migrations
echo "=== Fichiers de migration ==="
ls -la migrations/ | head -10

# 5. Vérifier vendor
echo "=== Vendor existe ? ==="
ls -la vendor/ | head -5

# 6. Tester connexion DB
echo "=== Test connexion DB ==="
php bin/console doctrine:database:create --if-not-exists --env=prod

# 7. Statut migrations
echo "=== Statut migrations ==="
php bin/console doctrine:migrations:status --env=prod

# 8. Essayer d'exécuter les migrations
echo "=== Exécution migrations ==="
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

**Copiez-collez la sortie complète** de ces commandes pour diagnostiquer le problème exact.

---

**Exécutez ces commandes et partagez les résultats pour identifier le problème exact !** 🔍
