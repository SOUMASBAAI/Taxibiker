# 🔐 Liste Complète des Secrets et Variables GitHub

## 📍 Accès

**GitHub** → Votre repository → **Settings** → **Secrets and variables** → **Actions**

Il y a **2 onglets** :

- **Secrets** : Pour les informations sensibles (mots de passe, tokens)
- **Variables** : Pour les configurations (options)

---

## 🔒 SECRETS (Onglet "Secrets")

### 1. PLANETHOSTER_PROD_HOST

**Type** : Secret  
**Onglet** : Secrets  
**Valeur** : `node240-eu.n0c.com`

**Description** : Adresse du serveur PlanetHoster pour FTP et SSH

---

### 2. PLANETHOSTER_PROD_USERNAME

**Type** : Secret  
**Onglet** : Secrets  
**Valeur** : `ueeecgbbue`

**Description** : Nom d'utilisateur FTP/SSH PlanetHoster

---

### 3. PLANETHOSTER_PROD_PASSWORD

**Type** : Secret  
**Onglet** : Secrets  
**Valeur** : [Votre mot de passe FTP PlanetHoster]

**Description** : Mot de passe FTP/SSH PlanetHoster

---

### 4. JWT_PASSPHRASE

**Type** : Secret  
**Onglet** : Secrets  
**Valeur** : `taxibiker_jwt_passphrase_2024`

**Description** : Passphrase pour générer les clés JWT (doit être la même que dans `.env` sur PlanetHoster)

---

## 📝 VARIABLES (Onglet "Variables")

### 5. LOAD_FIXTURES (Optionnel)

**Type** : Variable  
**Onglet** : Variables  
**Valeur** : `true` ou `false`

**Description** : Si `true`, les fixtures seront chargées automatiquement à chaque déploiement. Si `false` ou non défini, les fixtures ne seront pas chargées.

**Usage** :

- Mettre à `true` pour charger les fixtures automatiquement
- Mettre à `false` ou supprimer pour désactiver

---

## 📋 Checklist Complète

### Secrets à créer :

- [ ] `PLANETHOSTER_PROD_HOST` = `node240-eu.n0c.com`
- [ ] `PLANETHOSTER_PROD_USERNAME` = `ueeecgbbue`
- [ ] `PLANETHOSTER_PROD_PASSWORD` = [Votre mot de passe FTP]
- [ ] `JWT_PASSPHRASE` = `taxibiker_jwt_passphrase_2024`

### Variables à créer (optionnel) :

- [ ] `LOAD_FIXTURES` = `true` (pour charger les fixtures automatiquement)

---

## 🎯 Tableau Récapitulatif

| Nom                          | Type     | Onglet    | Valeur                          | Obligatoire  |
| ---------------------------- | -------- | --------- | ------------------------------- | ------------ |
| `PLANETHOSTER_PROD_HOST`     | Secret   | Secrets   | `node240-eu.n0c.com`            | ✅ Oui       |
| `PLANETHOSTER_PROD_USERNAME` | Secret   | Secrets   | `ueeecgbbue`                    | ✅ Oui       |
| `PLANETHOSTER_PROD_PASSWORD` | Secret   | Secrets   | [Votre mot de passe]            | ✅ Oui       |
| `JWT_PASSPHRASE`             | Secret   | Secrets   | `taxibiker_jwt_passphrase_2024` | ✅ Oui       |
| `LOAD_FIXTURES`              | Variable | Variables | `true` ou `false`               | ⚠️ Optionnel |

---

## 📝 Instructions de Création

### Pour les Secrets :

1. **Allez sur** : GitHub → Votre repository → **Settings** → **Secrets and variables** → **Actions**
2. **Onglet "Secrets"**
3. **Cliquez** sur **"New repository secret"**
4. **Remplissez** :
   - **Name** : Le nom du secret (ex: `PLANETHOSTER_PROD_HOST`)
   - **Secret** : La valeur
5. **Cliquez** sur **"Add secret"**
6. **Répétez** pour chaque secret

### Pour les Variables :

1. **Allez sur** : GitHub → Votre repository → **Settings** → **Secrets and variables** → **Actions**
2. **Onglet "Variables"**
3. **Cliquez** sur **"New repository variable"**
4. **Remplissez** :
   - **Name** : Le nom de la variable (ex: `LOAD_FIXTURES`)
   - **Value** : La valeur (`true` ou `false`)
5. **Cliquez** sur **"Add variable"**

---

## ✅ Vérification

Après avoir créé tous les secrets et variables :

1. **Vérifiez** que vous avez **4 secrets** dans l'onglet "Secrets"
2. **Vérifiez** que vous avez **1 variable** dans l'onglet "Variables" (si activé)
3. **Vérifiez** que les noms sont **exactement** comme indiqué (sensibles à la casse)

---

## 🔄 Mise à Jour

Pour modifier un secret ou une variable :

1. **Trouvez-le** dans la liste
2. **Cliquez** dessus
3. **Modifiez** la valeur
4. **Sauvegardez**

Pour supprimer :

1. **Cliquez** sur le secret/variable
2. **Cliquez** sur **"Delete"**

---

## 🚨 Important

- ⚠️ **Les secrets sont masqués** : Vous ne pourrez plus voir leur valeur après création
- ⚠️ **Sensibles à la casse** : Les noms doivent être EXACTEMENT comme indiqué
- ⚠️ **Pas d'espaces** : Pas d'espaces avant/après les valeurs
- ⚠️ **JWT_PASSPHRASE** : Doit être identique dans GitHub ET dans le fichier `.env` sur PlanetHoster

---

## 📞 Support

Si vous avez des problèmes :

1. Vérifiez que tous les secrets sont créés
2. Vérifiez que les noms sont exacts (majuscules/minuscules)
3. Vérifiez que les valeurs ne sont pas vides
4. Testez le déploiement : `git push origin main`

---

**Voici la liste complète ! Créez ces 4 secrets et 1 variable optionnelle pour que tout fonctionne !** ✅

