# 📊 Accéder à phpMyAdmin sur PlanetHoster

## 🎯 Accès via le Panneau PlanetHoster

### Méthode 1 : Via le Panneau de Contrôle (Recommandé)

1. **Connectez-vous** au panneau PlanetHoster

   - URL : https://secure.planethoster.com/ (ou votre URL de connexion)
   - Utilisez vos identifiants PlanetHoster

2. **Trouvez la section Bases de données**

   - Cherchez **"Bases de données"** ou **"MySQL"** dans le menu
   - Ou cherchez **"phpMyAdmin"** directement

3. **Cliquez sur phpMyAdmin**

   - Généralement, il y a un bouton **"Ouvrir phpMyAdmin"** ou **"Accéder à phpMyAdmin"**
   - Ou un lien **"phpMyAdmin"** à côté de votre base de données

4. **Vous serez connecté automatiquement**
   - phpMyAdmin s'ouvrira avec vos identifiants de base de données
   - Vous pourrez voir vos bases de données

### Méthode 2 : Via l'URL Directe (si disponible)

PlanetHoster peut fournir une URL directe, généralement :

- `https://votre-domaine.com/phpmyadmin`
- `https://phpmyadmin.planethoster.com`
- Ou une URL spécifique dans votre panneau

## 🔐 Identifiants de Connexion

### Identifiants pour phpMyAdmin

Lorsque vous accédez via le panneau PlanetHoster, vous êtes généralement connecté automatiquement.

Si vous devez vous connecter manuellement, utilisez :

- **Utilisateur** : `ueeecgbbue_soumia`
- **Mot de passe** : `Soumia123!`
- **Serveur** : `127.0.0.1` ou `localhost`

## 📋 Dans phpMyAdmin : Vérifier votre Base de Données

1. **Sélectionnez votre base de données** dans le menu de gauche :

   - `ueeecgbbue_taxibiker_prod`

2. **Vérifiez les tables** :

   - Vous devriez voir toutes les tables de votre application
   - Exemple : `user`, `classic_reservation`, `zone`, etc.

3. **Vérifiez les données** :
   - Cliquez sur une table pour voir son contenu
   - Vérifiez que les migrations ont créé les bonnes structures

## 🔍 Si vous ne trouvez pas phpMyAdmin

### Option 1 : Chercher dans le panneau

1. **Allez dans** : **Bases de données > MySQL**
2. **Trouvez** votre base de données `ueeecgbbue_taxibiker_prod`
3. **Cherchez** un bouton ou lien **"phpMyAdmin"** à côté

### Option 2 : Chercher dans le menu

- **Outils** > **phpMyAdmin**
- **Applications** > **phpMyAdmin**
- **Services** > **phpMyAdmin**

### Option 3 : Contactez le support

Si vous ne trouvez pas phpMyAdmin :

- **Support PlanetHoster** : Via le panneau ou par email
- Ils peuvent vous donner l'URL exacte ou l'activer si nécessaire

## 📊 Utiliser phpMyAdmin

### Vérifier les tables

1. **Sélectionnez** la base `ueeecgbbue_taxibiker_prod`
2. **Regardez** la liste des tables
3. **Vérifiez** que toutes les tables sont présentes

### Exécuter une requête SQL

1. **Cliquez sur** **"SQL"** en haut
2. **Écrivez** votre requête :
   ```sql
   SHOW TABLES;
   ```
3. **Cliquez sur** **"Exécuter"**

### Voir le contenu d'une table

1. **Cliquez** sur le nom d'une table (ex: `user`)
2. **Regardez** les données dans la table

### Exporter/Importer des données

- **Exporter** : Sélectionnez la base ou une table > **"Exporter"**
- **Importer** : Sélectionnez la base > **"Importer"** > Choisissez votre fichier SQL

## 🔒 Sécurité

⚠️ **Important** : phpMyAdmin est un outil puissant qui donne accès à votre base de données.

- ✅ Utilisez-le uniquement quand nécessaire
- ✅ Déconnectez-vous après utilisation
- ✅ Ne partagez jamais vos identifiants
- ✅ Changez régulièrement les mots de passe

## 📞 Si vous avez des problèmes

### Erreur : "Access denied"

**Solutions :**

1. Vérifiez vos identifiants dans le panneau PlanetHoster
2. Assurez-vous que l'utilisateur MySQL a les bonnes permissions
3. Contactez le support PlanetHoster

### phpMyAdmin ne se charge pas

**Solutions :**

1. Videz le cache de votre navigateur
2. Essayez un autre navigateur
3. Vérifiez que vous êtes bien connecté au panneau PlanetHoster
4. Contactez le support PlanetHoster

### Je ne trouve pas phpMyAdmin

**Solutions :**

1. Vérifiez que votre plan PlanetHoster inclut phpMyAdmin
2. Cherchez dans différentes sections du panneau
3. Contactez le support PlanetHoster pour l'activer

---

**Une fois dans phpMyAdmin, vous pourrez vérifier que vos migrations ont bien créé les tables !** ✅
