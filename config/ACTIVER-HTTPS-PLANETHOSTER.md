# 🔒 Activer HTTPS/SSL sur PlanetHoster

## 📋 Situation

Votre site est accessible en HTTP mais pas en HTTPS. Il faut activer le certificat SSL.

## 🎯 Solution : Activer SSL sur PlanetHoster

PlanetHoster propose généralement des certificats SSL gratuits (Let's Encrypt).

## 🔧 Étape 1 : Activer SSL dans le panneau PlanetHoster

### Option A : Via le panneau de contrôle

1. **Connectez-vous** au panneau PlanetHoster
2. **Allez dans** : **Domaines** ou **SSL/TLS**
3. **Sélectionnez** votre domaine `taxibikerparis.com`
4. **Cherchez** l'option **"SSL"** ou **"Certificat SSL"**
5. **Activez SSL** ou cliquez sur **"Installer un certificat SSL"**
6. **Choisissez** **"Let's Encrypt"** (gratuit)
7. **Validez** l'installation

### Option B : Attendre la configuration automatique

Parfois, PlanetHoster configure automatiquement SSL après 24-48h de propagation DNS.

## 🔧 Étape 2 : Forcer la redirection HTTPS

Une fois SSL activé, vous devez forcer la redirection HTTP vers HTTPS.

### Modification du fichier .htaccess

**Sur PlanetHoster**, modifiez le fichier `public_html/.htaccess` :

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# API routes
RewriteRule ^api/(.*)$ api/public/index.php [QSA,L]

# Frontend routes (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

## 🔧 Étape 3 : Mettre à jour le workflow GitHub Actions

Je vais modifier le workflow pour inclure automatiquement la redirection HTTPS dans le fichier .htaccess.

## ⏱️ Durée de configuration

- **Certificat Let's Encrypt** : 5-15 minutes
- **Propagation** : Jusqu'à 1 heure

## ✅ Vérification

Après activation :

1. **Testez** : https://taxibikerparis.com
2. **Vérifiez** le cadenas vert dans la barre d'adresse
3. **Testez** que HTTP redirige vers HTTPS

## 🚨 Si SSL ne s'active pas automatiquement

### Vérifications

1. **Les DNS sont-ils bien propagés ?**

   - Vérifiez avec : https://www.whatsmydns.net/
   - Le domaine doit pointer vers PlanetHoster

2. **Le domaine est-il bien configuré dans PlanetHoster ?**

   - Vérifiez dans le panneau PlanetHoster
   - Le domaine doit être actif

3. **Contactez le support PlanetHoster**
   - Ils peuvent activer SSL manuellement
   - Support généralement très réactif

## 🔄 Mettre à jour l'application pour HTTPS

### Mettre à jour CORS dans .env

Dans `public_html/api/.env` sur PlanetHoster :

```bash
CORS_ALLOW_ORIGIN=^https://taxibikerparis\.com$
```

### Redéployer pour appliquer les changements

```bash
git push origin main
```

## 📋 Checklist SSL

- [ ] SSL activé dans le panneau PlanetHoster
- [ ] Certificat installé (Let's Encrypt)
- [ ] Redirection HTTPS configurée dans .htaccess
- [ ] Test de https://taxibikerparis.com fonctionne
- [ ] Cadenas vert visible dans le navigateur
- [ ] CORS mis à jour pour HTTPS

---

**Une fois SSL activé, votre site sera accessible en HTTPS avec un cadenas vert !** 🔒
