# ✅ Configuration MySQL Validée - Exécuter les Migrations

## ✅ Votre configuration est correcte

Votre `DATABASE_URL` est bien configurée :

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123!@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=8.0&charset=utf8mb4
```

**Tous les paramètres sont bons :**

- ✅ Hôte : `127.0.0.1` (localhost)
- ✅ Utilisateur : `ueeecgbbue_soumia`
- ✅ Base de données : `ueeecgbbue_taxibiker_prod`
- ✅ Port : `3306`
- ✅ Charset : `utf8mb4`
- ✅ Version serveur : `8.0`

## 🚀 Maintenant : Exécuter les migrations et fixtures

### Option 1 : Automatique via GitHub (Recommandé)

Si le fichier `.env` est déjà sur PlanetHoster avec cette configuration :

```bash
# Déclencher un redéploiement qui exécutera les migrations automatiquement
git commit --allow-empty -m "Trigger: Run migrations with new database URL"
git push origin main
```

Les migrations s'exécuteront automatiquement après le déploiement.

### Option 2 : Manuellement via SSH

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

   Vous devriez voir votre `DATABASE_URL` avec `127.0.0.1`.

4. **Testez la connexion à la base de données** :

   ```bash
   php bin/console doctrine:database:create --if-not-exists --env=prod
   ```

   Si la base existe déjà, cette commande ne fera rien (normal).

5. **Exécutez les migrations** :

   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction --env=prod
   ```

6. **Charger les fixtures** (⚠️ Supprime toutes les données) :
   ```bash
   php bin/console doctrine:fixtures:load --no-interaction --env=prod
   ```

## 🔍 Vérification

Après avoir exécuté les migrations :

1. **Vérifiez que les tables sont créées** :

   ```bash
   php bin/console doctrine:migrations:status --env=prod
   ```

2. **Ou via phpMyAdmin** :
   - Connectez-vous à phpMyAdmin
   - Sélectionnez `ueeecgbbue_taxibiker_prod`
   - Vérifiez que les tables sont présentes

## ⚠️ Important : Fixtures en Production

**ATTENTION** : Les fixtures vont **supprimer toutes les données existantes** !

Si vous avez déjà des données en production que vous voulez garder, **NE PAS** exécuter les fixtures.

**En production, faites seulement les migrations :**

```bash
php bin/console doctrine:migrations:migrate --no-interaction --env=prod
```

## 🚨 Si vous avez une erreur de connexion

### Erreur : "Connection refused" ou "Access denied"

**Vérifications :**

1. **Le mot de passe est-il correct ?**

   - Vérifiez dans le panneau PlanetHoster
   - Assurez-vous qu'il n'y a pas d'espaces avant/après

2. **L'utilisateur a-t-il les bonnes permissions ?**

   - Vérifiez dans le panneau PlanetHoster
   - L'utilisateur doit avoir tous les droits sur la base de données

3. **La base de données existe-t-elle ?**
   - Vérifiez dans le panneau PlanetHoster
   - Créez-la si nécessaire

### Tester la connexion MySQL directement

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

Entrez le mot de passe : `Soumia123!`

Si la connexion fonctionne, c'est bon !

## 📋 Checklist

- [ ] Le fichier `.env` contient la bonne `DATABASE_URL`
- [ ] Le fichier `.env` est dans `public_html/api/` sur PlanetHoster
- [ ] Les migrations sont exécutées
- [ ] Les tables sont créées dans la base de données
- [ ] L'application fonctionne correctement

---

**Une fois les migrations exécutées, votre application sera connectée à la base de données !** ✅
