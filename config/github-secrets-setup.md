# Configuration des Secrets GitHub

## 🔐 Secrets à ajouter dans GitHub

Allez dans votre repository GitHub : `Settings > Secrets and variables > Actions`

### Secrets pour Staging (Environnement de test)

```
PLANETHOSTER_STAGING_HOST=votre-domaine-staging.com
PLANETHOSTER_STAGING_USERNAME=votre_username_planethoster
PLANETHOSTER_STAGING_PASSWORD=votre_password_planethoster
```

### Secrets pour Production

```
PLANETHOSTER_PROD_HOST=votre-domaine-production.com
PLANETHOSTER_PROD_USERNAME=votre_username_planethoster
PLANETHOSTER_PROD_PASSWORD=votre_password_planethoster
```

### Secrets communs

```
JWT_PASSPHRASE=votre_passphrase_jwt_securisee
```

## 📋 Informations PlanetHoster nécessaires

### 1. Informations FTP/SFTP

- **Host** : Votre domaine ou l'IP fournie par PlanetHoster
- **Username** : Votre nom d'utilisateur PlanetHoster
- **Password** : Votre mot de passe PlanetHoster

### 2. Informations Base de Données

- **Host** : L'adresse de votre serveur MySQL
- **Port** : 3306 (généralement)
- **Database** : Le nom de votre base de données
- **Username** : L'utilisateur de la base de données
- **Password** : Le mot de passe de la base de données

## 🔧 Comment trouver ces informations

### Dans votre panneau PlanetHoster :

1. **Connexion FTP/SFTP** :

   - Section "Comptes FTP" ou "Gestionnaire de fichiers"
   - Utilisez vos identifiants principaux

2. **Base de données** :

   - Section "Bases de données MySQL"
   - Cliquez sur votre base de données
   - Notez : Host, Port, Nom de la base, Utilisateur

3. **Domaine** :
   - Section "Domaines"
   - Votre nom de domaine principal

## 🎯 Exemple de configuration

Si vos informations PlanetHoster sont :

- Domaine : `monsite.com`
- Username : `monuser`
- Password : `monpassword`
- DB Host : `mysql.planethoster.com`
- DB Name : `monuser_taxibiker`
- DB User : `monuser_db`
- DB Pass : `dbpassword123`

Alors vos secrets GitHub seraient :

```
PLANETHOSTER_PROD_HOST=monsite.com
PLANETHOSTER_PROD_USERNAME=monuser
PLANETHOSTER_PROD_PASSWORD=monpassword
JWT_PASSPHRASE=ma_passphrase_jwt_securisee_123
```

Et votre fichier `.env` sur le serveur :

```
DATABASE_URL=mysql://monuser_db:dbpassword123@mysql.planethoster.com:3306/monuser_taxibiker?serverVersion=8.0&charset=utf8mb4
```
