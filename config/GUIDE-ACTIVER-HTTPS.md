# 🔒 Guide Complet : Activer HTTPS sur PlanetHoster

## 📋 Étape 1 : Activer SSL dans PlanetHoster

### Dans votre panneau PlanetHoster

1. **Connectez-vous** au panneau PlanetHoster
2. **Allez dans** : **Domaines** (ou **SSL/TLS** ou **Certificats SSL**)
3. **Trouvez** votre domaine `taxibikerparis.com`
4. **Cherchez** l'option :

   - **"Activer SSL"**
   - **"Installer un certificat SSL"**
   - **"Gérer SSL"**
   - Ou un bouton **"SSL"** ou **"HTTPS"**

5. **Sélectionnez** **"Let's Encrypt"** (gratuit et automatique)
6. **Cliquez** sur **"Installer"** ou **"Activer"**
7. **Attendez** 5-15 minutes que le certificat soit installé

## 📝 Étape 2 : Mettre à jour le fichier .htaccess

### Option A : Via le gestionnaire de fichiers PlanetHoster

1. **Connectez-vous** via FTP/Gestionnaire de fichiers
2. **Allez dans** : `public_html/`
3. **Ouvrez** le fichier `.htaccess` (ou créez-le s'il n'existe pas)
4. **Ajoutez** ces lignes **au début** du fichier :

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Option B : Via SSH

1. **Connectez-vous en SSH** :

   ```bash
   ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
   ```

2. **Allez dans le dossier web** :

   ```bash
   cd public_html
   ```

3. **Éditez le fichier .htaccess** :

   ```bash
   nano .htaccess
   ```

4. **Ajoutez** les lignes de redirection HTTPS au début

5. **Sauvegardez** : `Ctrl + X`, puis `Y`, puis `Enter`

## 🔄 Étape 3 : Mettre à jour la configuration

### Mettre à jour CORS pour HTTPS

Dans `public_html/api/.env`, modifiez :

```bash
# De :
CORS_ALLOW_ORIGIN=^https://taxibikerparis\.com$

# Déjà correct si vous avez mis HTTPS !
```

### Redéployer pour mettre à jour

Une fois SSL activé, redéployez pour mettre à jour le .htaccess :

```bash
git push origin main
```

Le nouveau déploiement inclura automatiquement la redirection HTTPS.

## ⏱️ Durée d'activation

- **Installation Let's Encrypt** : 5-15 minutes
- **Propagation** : Jusqu'à 1 heure
- **Total** : Généralement moins de 30 minutes

## ✅ Vérification

### 1. Test de HTTPS

**Testez dans votre navigateur :**

- https://taxibikerparis.com

**Vous devriez voir :**

- ✅ Un **cadenas vert** 🔒 dans la barre d'adresse
- ✅ Le texte **"Connexion sécurisée"**
- ✅ L'URL commence par `https://`

### 2. Test de redirection

**Testez HTTP (devrait rediriger) :**

- http://taxibikerparis.com

**Vous devriez être automatiquement redirigé vers :**

- https://taxibikerparis.com

### 3. Test de l'API

- https://taxibikerparis.com/api/health

## 🚨 Si SSL ne s'active pas

### Vérifications

1. **Les DNS sont-ils propagés ?**

   - Vérifiez avec : https://www.whatsmydns.net/
   - Le domaine doit pointer vers PlanetHoster depuis au moins 24h

2. **Le domaine est-il actif dans PlanetHoster ?**

   - Vérifiez dans le panneau PlanetHoster
   - Le domaine doit être lié à votre compte

3. **Contactez le support PlanetHoster**
   - Ils peuvent activer SSL manuellement
   - Support très réactif

### Solution temporaire : Certificat SSL externe

Si Let's Encrypt ne fonctionne pas, vous pouvez :

- Utiliser Cloudflare (gratuit) : https://www.cloudflare.com/
- Installer un certificat SSL payant

## 🔄 Après activation HTTPS

### Mettre à jour vos configurations

1. **CORS** : Déjà configuré pour HTTPS ✅
2. **URLs API** : Vérifiez qu'elles utilisent HTTPS
3. **Redéployer** : Pour appliquer tous les changements

### Redéployer avec HTTPS

```bash
git add .
git commit -m "Config: Ajout redirection HTTPS"
git push origin main
```

## 📋 Checklist finale

- [ ] SSL activé dans le panneau PlanetHoster
- [ ] Certificat Let's Encrypt installé
- [ ] Redirection HTTPS ajoutée dans .htaccess
- [ ] Test de https://taxibikerparis.com fonctionne
- [ ] Cadenas vert visible
- [ ] Redirection HTTP → HTTPS fonctionne
- [ ] API accessible en HTTPS

---

**Une fois SSL activé, votre site sera sécurisé avec HTTPS !** 🔒🔒🔒
