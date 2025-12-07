# 🤖 Charger les Fixtures Automatiquement

## 🎯 Méthode 1 : Via GitHub Actions (Recommandé)

Le workflow GitHub Actions peut charger les fixtures automatiquement lors du déploiement.

### Configuration

1. **Allez sur GitHub** : Votre repository > **Settings** > **Secrets and variables** > **Actions**

2. **Onglet "Variables"** (pas "Secrets")

3. **Créez une variable** :
   - **Nom** : `LOAD_FIXTURES`
   - **Valeur** : `true`
   - **Cliquez** sur "Add variable"

4. **Déployez** :
   ```bash
   git push origin main
   ```

Les fixtures seront chargées automatiquement après chaque déploiement.

### Désactiver le chargement automatique

Pour désactiver :
1. **Modifiez la variable** `LOAD_FIXTURES` : mettez `false`
2. **Ou supprimez** la variable

---

## 🚀 Méthode 2 : Script Automatique

### Utilisation du script

**Sur le serveur via SSH :**

```bash
# Se connecter au serveur
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com

# Aller dans le dossier API
cd public_html/api

# Exécuter le script (avec confirmation)
bash /path/to/load-fixtures-auto.sh --env=prod

# Ou sans confirmation (force)
bash /path/to/load-fixtures-auto.sh --env=prod --force
```

### Script disponible

Le script `scripts/load-fixtures-auto.sh` peut être :
1. **Uploadé sur le serveur**
2. **Exécuté automatiquement** après le déploiement
3. **Ajouté au workflow GitHub Actions**

---

## 🔄 Méthode 3 : Workflow GitHub Actions (Déjà configuré)

Le workflow a été mis à jour pour charger automatiquement les fixtures si la variable `LOAD_FIXTURES` est définie à `true`.

### Étapes

1. **Créez la variable** `LOAD_FIXTURES=true` dans GitHub (voir ci-dessus)

2. **Déclenchez un déploiement** :
   ```bash
   git push origin main
   ```

3. **Les fixtures seront chargées automatiquement** après les migrations

---

## 📋 Résumé des méthodes

| Méthode | Automatique | Recommandé |
|---------|-------------|------------|
| **GitHub Variables** | ✅ Oui | ⭐⭐⭐ |
| **Script SSH** | ⚠️ Manuel | ⭐⭐ |
| **Workflow Actions** | ✅ Oui | ⭐⭐⭐ |

---

## ✅ Vérification

Après le chargement automatique :

1. **Testez l'API** : https://taxibikerparis.com/api/health
2. **Connexion Admin** :
   - Email : `soumiaasbaai@gmail.com`
   - Password : `adminpass`
3. **Vérifiez dans phpMyAdmin** que les données sont présentes

---

## 🎯 Recommandation

**Utilisez la Méthode 1 (GitHub Variables)** : C'est la plus simple et la plus automatique.

1. Créez `LOAD_FIXTURES=true` dans GitHub Variables
2. Déployez : `git push origin main`
3. Les fixtures seront chargées automatiquement ! 🚀

---

**Une fois configuré, les fixtures seront chargées automatiquement à chaque déploiement !** ✨
