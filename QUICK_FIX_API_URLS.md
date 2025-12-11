# 🚨 CORRECTION RAPIDE - Erreur ERR_CONNECTION_REFUSED

## Problème identifié

Votre frontend déployé essaie de se connecter à `localhost:8000/api` au lieu de l'API déployée.

## ✅ Solutions appliquées

### 1. Configuration d'API centralisée

- Créé `taxibiker-front/src/config/api.js` avec gestion automatique des URLs
- En développement : `http://localhost:8000/api`
- En production : `/api` (URL relative)

### 2. Correction des URLs hardcodées

- Remplacé les URLs hardcodées par `buildApiUrl()`
- Fichiers corrigés :
  - `src/services/authService.js`
  - `src/pages/ReservationPage.jsx`
  - `src/pages/UserDashboard.jsx`

## 🚀 Actions à effectuer

### 1. Rebuild du frontend

```bash
cd taxibiker-front
npm run build
```

### 2. Redéploiement

Redéployez le dossier `dist/` généré vers votre serveur de production.

### 3. Vérification de la configuration serveur

Assurez-vous que votre serveur web redirige `/api/*` vers votre backend Symfony.

#### Configuration Apache (.htaccess)

```apache
# Dans public_html/.htaccess
RewriteEngine On

# Rediriger /api vers le backend
RewriteRule ^api/(.*)$ api/public/index.php [L]

# Rediriger tout le reste vers index.html (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Configuration Nginx

```nginx
location /api/ {
    try_files $uri $uri/ /api/public/index.php$is_args$args;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔍 Vérification

Après redéploiement, l'erreur `ERR_CONNECTION_REFUSED` devrait être résolue car :

- En production : les appels vont vers `/api/pricing/calculate` (même domaine)
- En développement : les appels vont vers `http://localhost:8000/api/pricing/calculate`

## 📝 Fichiers restants à corriger (si nécessaire)

Si vous rencontrez encore des erreurs, corrigez manuellement ces fichiers :

- `src/pages/AdminDashboard.jsx`
- `src/pages/UserSettings.jsx`
- `src/pages/AdminReservations.jsx`
- `src/pages/AdminClients.jsx`
- `src/components/user/CreditHistoryModal.jsx`
- `src/components/admin/ClientTable.jsx`
- `src/components/admin/ClientCreditHistoryModal.jsx`

Remplacez `"http://localhost:8000/api/..."` par `buildApiUrl('...')` et ajoutez l'import :

```javascript
import { buildApiUrl } from "../config/api.js";
```
