# ⚡ Migrations et Fixtures - Guide Rapide

## 🎯 Vous avez changé l'URL de la base de données

Deux méthodes pour exécuter les migrations et les fixtures :

---

## 🚀 Méthode 1 : Automatique via GitHub (Recommandé)

**Le workflow GitHub Actions exécute automatiquement les migrations après chaque déploiement.**

### Pour déclencher les migrations automatiquement :

```bash
# Commit et push (les migrations s'exécuteront automatiquement)
git add .
git commit -m "Update: Nouvelle URL de base de données"
git push origin main
```

Les migrations s'exécuteront automatiquement sur le serveur via SSH après le déploiement.

**Avantages :**

- ✅ Automatique
- ✅ Pas besoin de se connecter en SSH
- ✅ Trace dans les logs GitHub Actions

---

## 🔧 Méthode 2 : Manuellement via SSH

### Sur le serveur de production

1. **Connectez-vous en SSH** :

   ```bash
   ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
   ```

2. **Allez dans le dossier API** :

   ```bash
   cd public_html/api
   ```

3. **Vérifiez que le .env est correct** :

   ```bash
   cat .env | grep DATABASE_URL
   ```

4. **Exécutez les migrations** :

   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction --env=prod
   ```

5. **Charger les fixtures** (⚠️ Supprime toutes les données) :
   ```bash
   php bin/console doctrine:fixtures:load --no-interaction --env=prod
   ```

---

## 💻 En Local (pour tester)

```bash
# Aller dans le dossier backend
cd taxibiker-back

# Vérifier le .env.local
cat .env.local | grep DATABASE_URL

# Exécuter les migrations
php bin/console doctrine:migrations:migrate --no-interaction

# Charger les fixtures (optionnel)
php bin/console doctrine:fixtures:load --no-interaction
```

---

## ⚠️ Important : Fixtures en Production

**ATTENTION** : Les fixtures vont **SUPPRIMER TOUTES LES DONNÉES** existantes !

### En production :

```bash
# ✅ Faites seulement les migrations (sauf si vous voulez réinitialiser)
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

### En local (pour tester) :

```bash
# ✅ C'est OK de charger les fixtures en local
php bin/console doctrine:fixtures:load --no-interaction
```

---

## 📋 Commandes Utiles

### Vérifier le statut des migrations

```bash
php bin/console doctrine:migrations:status
```

### Voir les migrations disponibles

```bash
php bin/console doctrine:migrations:list
```

---

## ✅ Vérification

Après avoir exécuté les migrations :

1. **Vérifiez les logs** : Les migrations indiquent ce qui a été fait
2. **Testez l'application** : Vérifiez que tout fonctionne
3. **Vérifiez la base de données** : Via phpMyAdmin ou en ligne de commande

---

## 🎯 Recommandation

**Pour une nouvelle URL de base de données en production :**

1. ✅ **Vérifiez** que le `.env` sur PlanetHoster contient la nouvelle URL
2. ✅ **Commitez et poussez** pour déclencher le déploiement automatique
3. ✅ Les migrations s'exécuteront automatiquement

**C'est la méthode la plus sûre et la plus simple !** 🚀
