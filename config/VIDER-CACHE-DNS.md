# 🔄 Vider le Cache DNS (Windows)

## 📋 Problème

Votre site fonctionne sur d'autres appareils mais pas sur votre ordinateur portable. C'est un problème de **cache DNS local**.

## 🔧 Solution : Vider le cache DNS Windows

### Méthode 1 : Via PowerShell (Administrateur)

1. **Ouvrez PowerShell en tant qu'administrateur**

   - Cliquez droit sur le menu Démarrer
   - Sélectionnez **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**

2. **Exécutez cette commande :**

   ```powershell
   ipconfig /flushdns
   ```

3. **Redémarrez votre navigateur**

### Méthode 2 : Via Invite de commande (Administrateur)

1. **Ouvrez l'Invite de commande en tant qu'administrateur**

   - Appuyez sur `Win + X`
   - Sélectionnez **"Invite de commandes (Admin)"** ou **"Windows Terminal (Admin)"**

2. **Exécutez ces commandes :**

   ```cmd
   ipconfig /flushdns
   ipconfig /release
   ipconfig /renew
   ```

3. **Redémarrez votre navigateur**

### Méthode 3 : Vider le cache du navigateur

**Pour Chrome/Edge :**

1. Appuyez sur `Ctrl + Shift + Delete`
2. Sélectionnez **"Images et fichiers en cache"**
3. Choisissez **"Tout le temps"**
4. Cliquez sur **"Effacer les données"**

**Ou utilisez la navigation privée :**

- Appuyez sur `Ctrl + Shift + N` (Chrome) ou `Ctrl + Shift + P` (Firefox)
- Testez votre site en navigation privée

## 🔍 Vérifier la résolution DNS

### Tester manuellement la résolution DNS

**Dans PowerShell ou Invite de commande :**

```powershell
nslookup taxibikerparis.com
```

**Vous devriez voir :**

```
Nom:    taxibikerparis.com
Address: 146.88.232.214
```

Si vous voyez une autre IP, le cache DNS n'est pas encore vidé.

### Forcer la résolution DNS

```powershell
# Vérifier avec Google DNS
nslookup taxibikerparis.com 8.8.8.8

# Vérifier avec Cloudflare DNS
nslookup taxibikerparis.com 1.1.1.1
```

## 🚀 Solutions rapides

### Solution 1 : Redémarrer le service DNS

```powershell
# Arrêter le service DNS
net stop dnscache

# Redémarrer le service DNS
net start dnscache
```

### Solution 2 : Redémarrer votre ordinateur

Parfois, un simple redémarrage résout le problème.

### Solution 3 : Utiliser un autre DNS temporairement

1. **Ouvrez les paramètres réseau**

   - `Win + I` > **Réseau et Internet** > **Wi-Fi** ou **Ethernet**
   - Cliquez sur votre connexion
   - **Modifier les options d'adaptateur**

2. **Clic droit sur votre connexion** > **Propriétés**
3. **Sélectionnez "Protocole Internet version 4 (TCP/IPv4)"** > **Propriétés**
4. **Choisissez "Utiliser l'adresse des serveurs DNS suivante"**
5. **Entrez :**
   - DNS préféré : `8.8.8.8` (Google)
   - DNS alternatif : `8.8.4.4` (Google)
6. **Cliquez OK**

### Solution 4 : Accéder directement par IP

**Temporairement**, vous pouvez modifier votre fichier `hosts` :

1. **Ouvrez Notepad en tant qu'administrateur**
2. **Ouvrez le fichier :** `C:\Windows\System32\drivers\etc\hosts`
3. **Ajoutez cette ligne :**
   ```
   146.88.232.214 taxibikerparis.com
   146.88.232.214 www.taxibikerparis.com
   ```
4. **Sauvegardez**

⚠️ **N'oubliez pas de retirer ces lignes plus tard !**

## ✅ Vérification

Après avoir vidé le cache :

1. **Videz le cache du navigateur** (Ctrl + Shift + Delete)
2. **Testez en navigation privée** (Ctrl + Shift + N)
3. **Ou redémarrez votre ordinateur**

Puis testez : https://taxibikerparis.com

## 🔍 Vérifier que ça fonctionne

**Test rapide :**

- Ouvrez : https://taxibikerparis.com
- Vous devriez voir votre application TaxiBiker, pas la page Hostinger

---

**Après avoir vidé le cache DNS, votre site devrait fonctionner sur votre ordinateur aussi !** 🎉
