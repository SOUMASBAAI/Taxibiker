# ⚡ Activer HTTPS Rapidement - Guide Express

## 🎯 Solution en 3 étapes simples

### Étape 1 : Activer SSL dans PlanetHoster (5 minutes)

1. **Connectez-vous** au panneau PlanetHoster
2. **Allez dans** : **Domaines** ou **SSL/TLS**
3. **Trouvez** `taxibikerparis.com`
4. **Cliquez** sur **"Activer SSL"** ou **"Installer certificat SSL"**
5. **Choisissez** **"Let's Encrypt"** (gratuit)
6. **Validez**

⏱️ **Attendez 5-15 minutes** que le certificat soit installé.

---

### Étape 2 : Ajouter la redirection HTTPS

**Option A : Via le gestionnaire de fichiers PlanetHoster (le plus rapide)**

1. **Connectez-vous** au panneau PlanetHoster
2. **Allez dans** : **Gestionnaire de fichiers** (ou **FTP**)
3. **Naviguez** vers : `public_html/`
4. **Ouvrez** le fichier `.htaccess`
5. **Ajoutez ces lignes AU DÉBUT** du fichier :

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

6. **Sauvegardez**

**Option B : Attendre le prochain déploiement**

Le workflow GitHub Actions a été mis à jour pour inclure automatiquement la redirection HTTPS. Au prochain déploiement, ça sera automatique.

```bash
git push origin main
```

---

### Étape 3 : Tester

1. **Testez** : https://taxibikerparis.com
2. **Vérifiez** le cadenas vert 🔒
3. **Testez** que http:// redirige vers https://

---

## ✅ C'est tout !

Une fois SSL activé et la redirection ajoutée, votre site sera en HTTPS.

---

## 🚨 Si ça ne fonctionne pas

### Vérifier que les DNS sont propagés

- https://www.whatsmydns.net/
- Le domaine doit pointer vers PlanetHoster depuis au moins 24h

### Contacter le support PlanetHoster

Ils peuvent activer SSL manuellement si nécessaire.

---

**Temps total : ~15-30 minutes** ⏱️
