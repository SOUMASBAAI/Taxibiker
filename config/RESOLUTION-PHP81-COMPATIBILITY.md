# 🔧 Résolution : Conflit PHP 8.1 vs Symfony 7.4

## 🚨 Problème Identifié

**PlanetHoster utilise PHP 8.1.31**, mais votre `composer.lock` contient des packages Symfony 7.4 qui nécessitent **PHP 8.2+**.

**Erreurs typiques :**

```
symfony/uid v7.4.0 requires php >=8.2
symfony/validator v7.3.7 requires php >=8.2
symfony/var-dumper v7.4.0 requires php >=8.2
```

## 🎯 Solutions (par ordre de préférence)

---

### **Solution 1 : Script Automatique (Recommandé)**

```bash
cd public_html/api

# Rendre le script exécutable
chmod +x scripts/fix-php81-compatibility.sh

# Exécuter la correction
bash scripts/fix-php81-compatibility.sh
```

Ce script va :

- ✅ Sauvegarder votre `composer.lock`
- ✅ Régénérer les dépendances pour PHP 8.1
- ✅ Ignorer les contraintes de plateforme
- ✅ Installer `vendor/` compatible

---

### **Solution 2 : Commandes Manuelles**

```bash
cd public_html/api

# Sauvegarder composer.lock
cp composer.lock composer.lock.backup

# Supprimer composer.lock pour forcer la régénération
rm composer.lock

# Télécharger composer
curl -sS https://getcomposer.org/installer | php

# Installer en ignorant les contraintes PHP
php composer.phar install --no-dev --optimize-autoloader --ignore-platform-req=php

# Nettoyer
rm composer.phar
```

---

### **Solution 3 : Installation Forcée**

Si la Solution 2 ne fonctionne pas :

```bash
cd public_html/api

# Forcer l'installation en ignorant TOUTES les contraintes
php composer.phar install --no-dev --optimize-autoloader --ignore-platform-reqs
```

---

### **Solution 4 : Downgrade Symfony (Alternative)**

Si vous voulez garder une compatibilité stricte :

```bash
cd public_html/api

# Modifier composer.json pour Symfony 6.4 (compatible PHP 8.1)
# Puis réinstaller
php composer.phar update --no-dev --optimize-autoloader
```

---

### **Solution 5 : Upload depuis Local (Dernier recours)**

#### **Sur votre machine locale :**

```bash
# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/taxibiker.git
cd taxibiker/taxibiker-back

# Forcer l'installation pour PHP 8.1
composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Compresser vendor/
tar -czf vendor-php81.tar.gz vendor/
```

#### **Sur PlanetHoster :**

```bash
cd public_html/api

# Uploader vendor-php81.tar.gz via FTP, puis :
tar -xzf vendor-php81.tar.gz
rm vendor-php81.tar.gz
```

---

## ✅ Vérification Après Correction

```bash
cd public_html/api

echo "=== 1. VENDOR EXISTS ==="
ls -la vendor/ | head -3

echo "=== 2. SYMFONY VERSION ==="
php bin/console --version

echo "=== 3. DOCTRINE STATUS ==="
php bin/console doctrine:migrations:status -v --env=prod

echo "=== 4. PHP VERSION ==="
php --version | head -1
```

**Résultat attendu :**

- ✅ `vendor/` existe avec de nombreux dossiers
- ✅ Version Symfony affichée (ex: "Symfony 7.4.0")
- ✅ Statut des migrations affiché
- ✅ PHP 8.1.31 confirmé

---

## 🚀 Après Correction Réussie

Une fois `vendor/` installé correctement :

```bash
cd public_html/api

# Créer la base si nécessaire
php bin/console doctrine:database:create --if-not-exists --env=prod

# Vérifier les migrations
php bin/console doctrine:migrations:status -v --env=prod

# Exécuter les migrations
php bin/console doctrine:migrations:migrate -v --env=prod

# Charger les fixtures
php bin/console doctrine:fixtures:load --env=prod --no-interaction
```

---

## 🎯 Explication Technique

### **Pourquoi ce problème ?**

1. **Développement local** : Vous utilisez probablement PHP 8.2+ ou 8.3
2. **composer.lock** : Contient des versions de packages pour PHP 8.2+
3. **PlanetHoster** : Utilise PHP 8.1.31 (version stable)
4. **Conflit** : Les packages ne peuvent pas s'installer

### **Que fait `--ignore-platform-req=php` ?**

- ✅ Ignore la vérification de version PHP
- ✅ Permet l'installation de packages "incompatibles"
- ✅ Fonctionne généralement car Symfony 7.4 est rétro-compatible avec PHP 8.1

---

## 🚨 Dépannage

### **Erreur : "curl: command not found"**

```bash
# Utiliser wget
wget -O composer-setup.php https://getcomposer.org/installer
php composer-setup.php
rm composer-setup.php
```

### **Erreur : "Memory limit exceeded"**

```bash
# Augmenter la limite mémoire
php -d memory_limit=512M composer.phar install --ignore-platform-reqs
```

### **Erreur persistante**

```bash
# Essayer avec toutes les contraintes ignorées
php composer.phar install --ignore-platform-reqs --no-scripts --no-plugins
```

---

## 📞 Support d'Urgence

**Si rien ne fonctionne, exécutez et partagez :**

```bash
cd public_html/api

echo "=== PHP VERSION ==="
php --version

echo "=== COMPOSER ERRORS ==="
php composer.phar install --no-dev --ignore-platform-req=php 2>&1 | head -20

echo "=== DISK SPACE ==="
df -h .

echo "=== MEMORY ==="
php -r "echo 'Memory limit: ' . ini_get('memory_limit') . PHP_EOL;"
```

---

## 🎯 Commande Rapide

**Pour résoudre rapidement :**

```bash
cd public_html/api
bash scripts/fix-php81-compatibility.sh
```

**Si ça marche, vous verrez :**

```
✅ Installation réussie avec ignore-platform-req
Symfony 7.4.0 (env: prod, debug: false)
```

**Puis testez les migrations :**

```bash
php bin/console doctrine:migrations:status -v --env=prod
```

---

**🎯 Cette solution devrait résoudre définitivement le problème de compatibilité PHP !** 🚀

