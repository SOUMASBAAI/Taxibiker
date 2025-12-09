# 🔍 Tester les Connexions

## 🎯 Tests Rapides

### Test 1 : Connexion à la Base de Données

#### Via MySQL directement

**En local :**

```bash
mysql -h 127.0.0.1 -u root -p
```

**Sur le serveur PlanetHoster (via SSH) :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
```

Entrez le mot de passe : `Soumia123!`

**Si ça fonctionne :** Vous verrez `mysql>`

Testez une requête :

```sql
SHOW TABLES;
SELECT DATABASE();
exit;
```

#### Via Symfony

**En local :**

```bash
cd taxibiker-back
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:status
```

**Sur le serveur (via SSH) :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api
php bin/console doctrine:database:create --if-not-exists --env=prod
php bin/console doctrine:migrations:status --env=prod
```

---

### Test 2 : Connexion SSH

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
```

**Si ça fonctionne :** Vous êtes connecté au serveur

Testez :

```bash
pwd
whoami
ls -la
```

---

### Test 3 : Connexion FTP

**Via un client FTP (FileZilla, WinSCP, etc.) :**

- **Host** : `node240-eu.n0c.com` ou `146.88.232.214`
- **Port** : `21`
- **Username** : `ueeecgbbue`
- **Password** : Votre mot de passe FTP
- **Protocol** : FTP

**Si ça fonctionne :** Vous voyez vos fichiers

---

### Test 4 : API Health Check

**Une fois déployé :**

```bash
curl https://taxibikerparis.com/api/health
```

**Ou dans le navigateur :**

- https://taxibikerparis.com/api/health

**Résultat attendu :**

```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## 🛠️ Script Automatique de Test

### Utiliser le script de test

**En local :**

```bash
chmod +x scripts/test-connections.sh
bash scripts/test-connections.sh local
```

**Sur le serveur (via SSH) :**

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api
bash /path/to/test-connections.sh remote
```

---

## 📋 Checklist de Tests

### Tests Locaux

- [ ] Connexion MySQL locale fonctionne
- [ ] Symfony peut se connecter à la base
- [ ] Les migrations fonctionnent localement
- [ ] L'application fonctionne en local

### Tests Serveur (via SSH)

- [ ] Connexion SSH fonctionne
- [ ] Connexion MySQL sur le serveur fonctionne
- [ ] Symfony peut se connecter à la base de données
- [ ] Les migrations fonctionnent sur le serveur
- [ ] L'API répond

### Tests Production

- [ ] Site web accessible : https://taxibikerparis.com
- [ ] API accessible : https://taxibikerparis.com/api/health
- [ ] SSL fonctionne (cadenas vert)
- [ ] Les données sont accessibles

---

## 🚨 Problèmes Courants

### Erreur : "Connection refused" (MySQL)

**Solutions :**

1. Vérifiez que MySQL est démarré
2. Vérifiez l'adresse : `127.0.0.1` ou `localhost`
3. Vérifiez le port : `3306`
4. Vérifiez les identifiants dans `.env`

### Erreur : "Access denied" (MySQL)

**Solutions :**

1. Vérifiez le nom d'utilisateur et le mot de passe
2. Vérifiez les permissions de l'utilisateur MySQL
3. Vérifiez que l'utilisateur a accès à la base de données

### Erreur : "Could not connect" (SSH)

**Solutions :**

1. Vérifiez le port : `5022`
2. Vérifiez l'adresse : `node240-eu.n0c.com`
3. Vérifiez les identifiants
4. Vérifiez que SSH est activé sur PlanetHoster

### Erreur : "404 Not Found" (API)

**Solutions :**

1. Vérifiez que les fichiers sont bien déployés
2. Vérifiez le fichier `.htaccess`
3. Vérifiez les routes dans Symfony

---

## 🔧 Commandes de Diagnostic

### Tester la connexion MySQL avec détails

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p -e "SELECT VERSION(), DATABASE(), USER();" ueeecgbbue_taxibiker_prod
```

### Vérifier les tables existantes

```bash
mysql -h 127.0.0.1 -u ueeecgbbue_soumia -p -e "SHOW TABLES;" ueeecgbbue_taxibiker_prod
```

### Vérifier la configuration Symfony

```bash
php bin/console debug:container doctrine
php bin/console debug:dotenv
```

---

**Utilisez ces tests pour vérifier que tout fonctionne correctement !** ✅

