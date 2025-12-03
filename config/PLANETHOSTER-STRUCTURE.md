# 📁 Structure des dossiers PlanetHoster

## 🗂️ Dossiers PlanetHoster

Sur PlanetHoster, vous avez généralement :

1. **`local`** → Votre dossier utilisateur (home directory)
2. **`n0c storage`** → Stockage réseau (généralement pas pour les fichiers web)

## 🎯 Où créer le fichier `.env`

### Le dossier correct est probablement :

```
local/public_html/api/.env
```

## 🔍 Comment identifier le bon dossier

### Option 1 : Vérifier dans votre gestionnaire de fichiers

1. **Allez dans le dossier `local`**
2. **Cherchez le dossier `public_html`** ou `www` ou `htdocs`
3. C'est là que vous devez créer :
   ```
   public_html/api/.env
   ```

### Option 2 : Vérifier via FTP

Le dossier web (root) de votre domaine est généralement :

- `local/public_html/`
- `local/www/`
- `local/htdocs/`

## 📋 Structure complète attendue

```
local/
└── public_html/           ← Dossier racine web (votre domaine)
    ├── index.html         ← Frontend React (uploadé par GitHub Actions)
    ├── assets/            ← Assets frontend
    ├── .htaccess          ← Configuration Apache
    └── api/               ← Backend Symfony
        ├── .env           ← ⭐ CRÉEZ LE FICHIER ICI
        ├── src/
        ├── config/
        └── public/
            └── index.php
```

## ✅ Vérification rapide

Pour savoir quel dossier est votre racine web :

1. **Testez votre domaine** : https://taxibikerparis.com
2. **Si vous avez déjà des fichiers** (comme `index.html` ou autres), c'est dans ce dossier
3. **Ou créez un fichier test** : `test.txt` avec "Hello" dedans
4. **Accédez à** : https://taxibikerparis.com/test.txt
5. **Si ça fonctionne**, c'est le bon dossier !

## 🎯 Action à faire

1. **Allez dans `local`**
2. **Cherchez ou créez `public_html`**
3. **Créez le dossier `api`** dans `public_html` si pas déjà fait
4. **Créez le fichier `.env`** dans `public_html/api/.env`

---

**Le dossier `n0c storage` n'est généralement pas utilisé pour les fichiers web actifs.**
