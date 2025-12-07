# 🗄️ Configuration MySQL PlanetHoster : 127.0.0.1 vs Hostname

## 📋 Distinction importante

Sur PlanetHoster, il y a **deux types d'adresses** différentes :

### 1. Serveur Web (SSH/FTP)

- **Adresse** : `146.88.232.214` ou `node240-eu.n0c.com`
- **Port SSH** : `5022`
- **Port FTP** : `21`
- **Usage** : Pour se connecter au serveur, déployer des fichiers

### 2. Serveur MySQL (Base de données)

- **Adresse** : Peut être `127.0.0.1` (localhost) **OU** un nom d'hôte MySQL spécifique
- **Port** : `3306`
- **Usage** : Pour se connecter à la base de données MySQL

## 🎯 Trouver le bon hôte MySQL

### Option 1 : 127.0.0.1 (localhost)

**Si votre MySQL est sur le même serveur que votre application**, utilisez :

```
DATABASE_URL=mysql://ueeecgbbue_soumia:VOTRE_PASSWORD@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=8.0&charset=utf8mb4
```

**Avantages :**

- ✅ Plus rapide (connexion locale)
- ✅ Pas besoin de passer par le réseau externe
- ✅ Généralement recommandé par PlanetHoster si MySQL est sur le même serveur

### Option 2 : Nom d'hôte MySQL spécifique

PlanetHoster peut aussi fournir un nom d'hôte MySQL, par exemple :

- `mysql.n0c.com`
- `localhost`
- Un nom d'hôte spécifique à votre compte

## 🔍 Comment trouver la bonne adresse MySQL

### Méthode 1 : Dans le panneau PlanetHoster

1. **Connectez-vous** au panneau PlanetHoster
2. **Allez dans** : **Bases de données > MySQL**
3. **Trouvez** votre base de données `ueeecgbbue_taxibiker_prod`
4. **Regardez** les informations de connexion :
   - **Hôte** : `127.0.0.1` ou `localhost` ou un nom d'hôte spécifique
   - **Port** : Généralement `3306`
   - **Base de données** : `ueeecgbbue_taxibiker_prod`
   - **Utilisateur** : `ueeecgbbue_soumia`
   - **Mot de passe** : Votre mot de passe

### Méthode 2 : Via phpMyAdmin

1. **Connectez-vous** à phpMyAdmin dans le panneau PlanetHoster
2. **Regardez l'URL** ou les informations de connexion
3. L'hôte y est généralement affiché

### Méthode 3 : Test de connexion

Testez avec les deux options :

**Test 1 : Avec 127.0.0.1**

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

**Test 2 : Avec localhost**

```bash
mysql -h localhost -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

Celle qui fonctionne est la bonne !

## ✅ Configuration recommandée

### Si PlanetHoster indique 127.0.0.1 :

Dans `public_html/api/.env` sur PlanetHoster :

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:VOTRE_PASSWORD@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=8.0&charset=utf8mb4
```

### Si PlanetHoster indique un nom d'hôte :

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:VOTRE_PASSWORD@mysql.n0c.com:3306/ueeecgbbue_taxibiker_prod?serverVersion=8.0&charset=utf8mb4
```

## 🔄 Après avoir mis à jour l'URL

1. **Sauvegardez** le fichier `.env`
2. **Exécutez les migrations** :
   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction --env=prod
   ```

## 📋 Résumé

| Type              | Adresse                                        | Usage                     |
| ----------------- | ---------------------------------------------- | ------------------------- |
| **Serveur Web**   | `146.88.232.214` ou `node240-eu.n0c.com`       | SSH, FTP, déploiement     |
| **Serveur MySQL** | `127.0.0.1` ou `localhost` ou nom d'hôte MySQL | Connexion base de données |

**Important :** Pour la connexion MySQL dans votre `.env`, utilisez **l'hôte MySQL** (généralement `127.0.0.1` ou `localhost`), pas l'adresse du serveur web !

---

**Si la documentation PlanetHoster indique 127.0.0.1, utilisez 127.0.0.1 pour MySQL !** ✅
