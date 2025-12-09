# 🔧 Correction du Format DATABASE_URL

## ⚠️ Problème

Le format de `DATABASE_URL` peut être incorrect, notamment si le mot de passe contient des caractères spéciaux.

## ✅ Format Correct

### Format Général

```
mysql://[user]:[password]@[host]:[port]/[database]?serverVersion=[version]&charset=[charset]
```

### Votre Configuration Actuelle

```
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123!@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

## 🔍 Problèmes Potentiels

### 1. Caractères Spéciaux dans le Mot de Passe

Le mot de passe `Soumia123!` contient un `!` qui doit être encodé dans l'URL.

**Encodage URL :**

- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `'` → `%27`
- `(` → `%28`
- `)` → `%29`
- `*` → `%2A`
- `+` → `%2B`
- `,` → `%2C`
- `/` → `%2F`
- `:` → `%3A`
- `;` → `%3B`
- `=` → `%3D`
- `?` → `%3F`

### 2. Format Corrigé

**Si votre mot de passe est `Soumia123!` :**

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%21@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

**Note :** Le `!` devient `%21`

## 📝 Format Recommandé pour PlanetHoster

### Option 1 : Avec Encodage URL

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%21@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

### Option 2 : Sans serverVersion (Doctrine détecte automatiquement)

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%21@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?charset=utf8mb4
```

### Option 3 : Format Minimal

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%21@127.0.0.1:3306/ueeecgbbue_taxibiker_prod
```

## 🔧 Comment Encoder le Mot de Passe

### Méthode 1 : En ligne de commande (Linux/Mac)

```bash
# Encodez votre mot de passe
php -r "echo urlencode('Soumia123!');"
```

**Résultat :** `Soumia123%21`

### Méthode 2 : En ligne de commande (PowerShell Windows)

```powershell
[System.Web.HttpUtility]::UrlEncode('Soumia123!')
```

### Méthode 3 : En ligne de commande (Windows CMD)

Utilisez un outil en ligne ou PHP.

### Méthode 4 : Outils en ligne

Utilisez un encodeur URL en ligne :

- https://www.urlencoder.org/
- Entrez : `Soumia123!`
- Résultat : `Soumia123%21`

## ✅ Correction sur PlanetHoster

### Via SSH

```bash
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com
cd public_html/api
nano .env
```

**Modifiez la ligne `DATABASE_URL` :**

```bash
# Avant (si mot de passe contient !)
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123!@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4

# Après (avec encodage)
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%21@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

**Sauvegardez :** `Ctrl + X`, puis `Y`, puis `Enter`

### Via Gestionnaire de Fichiers PlanetHoster

1. Connectez-vous au gestionnaire de fichiers
2. Allez dans `public_html/api/`
3. Ouvrez `.env`
4. Modifiez la ligne `DATABASE_URL` avec l'encodage correct
5. Sauvegardez

## 🧪 Test de Connexion

Après avoir corrigé le format :

```bash
# Via SSH
cd public_html/api
php bin/console doctrine:database:create --if-not-exists --env=prod 2>&1
php bin/console doctrine:migrations:status --env=prod 2>&1
```

**Si ça fonctionne :** ✅ Format correct !

## 📋 Format Complet avec Tous les Paramètres

```bash
DATABASE_URL=mysql://[user]:[password_encoded]@[host]:[port]/[database]?serverVersion=[version]&charset=[charset]
```

**Exemple complet :**

```bash
DATABASE_URL=mysql://ueeecgbbue_soumia:Soumia123%21@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

## 🚨 Vérifications

### Si votre mot de passe contient :

- `!` → Utilisez `%21`
- `@` → Utilisez `%40`
- `#` → Utilisez `%23`
- `$` → Utilisez `%24`
- `%` → Utilisez `%25`
- `&` → Utilisez `%26`
- Autres caractères spéciaux → Encodez-les

### Si votre mot de passe ne contient PAS de caractères spéciaux :

```bash
# Format simple (si mot de passe = "password123")
DATABASE_URL=mysql://ueeecgbbue_soumia:password123@127.0.0.1:3306/ueeecgbbue_taxibiker_prod?serverVersion=mariadb-10.6.21&charset=utf8mb4
```

## 🔍 Vérifier le Format

Pour vérifier que le format est correct :

```bash
# En PHP
php -r "echo parse_url('mysql://user:pass@host:3306/db', PHP_URL_SCHEME);"
# Devrait afficher: mysql
```

---

**Corrigez le format DATABASE_URL avec l'encodage correct du mot de passe !** ✅

