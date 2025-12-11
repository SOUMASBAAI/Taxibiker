# 🔧 Installation Manuelle de Vendor sur PlanetHoster

## 🎯 Problème

Le dossier `vendor/` n'existe pas, ce qui empêche Symfony de fonctionner.

## 🚀 Solutions (par ordre de préférence)

---

### **Méthode 1 : Script Automatique (Recommandé)**

```bash
cd public_html/api

# Rendre le script exécutable
chmod +x scripts/install-vendor-manual.sh

# Exécuter le script
bash scripts/install-vendor-manual.sh
```

Ce script teste automatiquement toutes les méthodes disponibles.

---

### **Méthode 2 : Composer Direct (Si disponible)**

```bash
cd public_html/api

# Tester si composer est disponible
composer --version

# Si oui, installer les dépendances
composer install --no-dev --optimize-autoloader --no-interaction
```

---

### **Méthode 3 : Télécharger Composer**

```bash
cd public_html/api

# Télécharger composer
curl -sS https://getcomposer.org/installer | php

# Installer les dépendances
php composer.phar install --no-dev --optimize-autoloader --no-interaction

# Nettoyer
rm composer.phar
```

---

### **Méthode 4 : Via wget (Alternative)**

```bash
cd public_html/api

# Télécharger composer
wget -O composer-setup.php https://getcomposer.org/installer
php composer-setup.php
rm composer-setup.php

# Installer
php composer.phar install --no-dev --optimize-autoloader --no-interaction
rm composer.phar
```

---

### **Méthode 5 : Upload Manuel (Dernier recours)**

Si aucune méthode automatique ne fonctionne :

#### **Sur votre machine locale :**

```bash
# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/taxibiker.git
cd taxibiker/taxibiker-back

# Installer les dépendances
composer install --no-dev --optimize-autoloader

# Le dossier vendor/ est maintenant créé
```

#### **Upload via FTP :**

1. **Compresser vendor/** :

   ```bash
   tar -czf vendor.tar.gz vendor/
   ```

2. **Uploader `vendor.tar.gz`** via FTP dans `public_html/api/`

3. **Décompresser sur le serveur** :
   ```bash
   cd public_html/api
   tar -xzf vendor.tar.gz
   rm vendor.tar.gz
   ```

---

## ✅ Vérification de l'Installation

Après l'installation, vérifiez que tout fonctionne :

```bash
cd public_html/api

echo "=== 1. VENDOR EXISTS ==="
ls -la vendor/ | head -5

echo "=== 2. AUTOLOAD TEST ==="
php -r "
require 'vendor/autoload.php';
echo 'Autoload fonctionne !\n';
"

echo "=== 3. SYMFONY VERSION ==="
php bin/console --version

echo "=== 4. DOCTRINE STATUS ==="
php bin/console doctrine:migrations:status -v --env=prod
```

**Résultat attendu :**

- ✅ Dossier `vendor/` avec de nombreux sous-dossiers
- ✅ "Autoload fonctionne !"
- ✅ Version Symfony affichée
- ✅ Statut des migrations affiché

---

## 🎯 Après Installation Réussie

Une fois `vendor/` installé, vous pourrez enfin exécuter les migrations :

```bash
cd public_html/api

# Créer la base si nécessaire
php bin/console doctrine:database:create --if-not-exists --env=prod

# Vérifier les migrations
php bin/console doctrine:migrations:status -v --env=prod

# Exécuter les migrations
php bin/console doctrine:migrations:migrate -v --env=prod

# Charger les fixtures (optionnel)
php bin/console doctrine:fixtures:load --env=prod --no-interaction
```

---

## 🚨 Dépannage

### **Erreur : "curl: command not found"**

```bash
# Utiliser wget à la place
wget -O composer-setup.php https://getcomposer.org/installer
```

### **Erreur : "Permission denied"**

```bash
# Corriger les permissions
chmod +x scripts/install-vendor-manual.sh
```

### **Erreur : "Memory limit exceeded"**

```bash
# Augmenter la limite mémoire PHP temporairement
php -d memory_limit=512M composer.phar install --no-dev --optimize-autoloader
```

### **Erreur : "proc_open(): fork failed"**

```bash
# Désactiver les processus parallèles
php composer.phar install --no-dev --optimize-autoloader --no-plugins --no-scripts
```

---

## 📞 Support

Si toutes les méthodes échouent :

1. **Contactez PlanetHoster** pour demander l'installation de Composer
2. **Utilisez la méthode d'upload manuel** (Méthode 5)
3. **Vérifiez les logs d'erreur** : `tail -n 20 /var/log/apache2/error.log`

---

## 🎯 Commande Rapide

**Pour tester rapidement toutes les méthodes :**

```bash
cd public_html/api
bash scripts/install-vendor-manual.sh
```

**Si ça marche, vous verrez :**

```
✅ Vendor installé avec succès
```

**Puis testez Symfony :**

```bash
php bin/console --version
```

---

**Une fois vendor/ installé, votre application Symfony fonctionnera enfin !** 🚀

