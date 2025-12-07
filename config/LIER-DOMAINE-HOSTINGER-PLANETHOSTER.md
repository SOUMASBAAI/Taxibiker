# 🌐 Relier votre domaine Hostinger à PlanetHoster

## 📋 Situation

- **Domaine** : `taxibikerparis.com` (acheté sur Hostinger)
- **Hébergement** : PlanetHoster
- **Action** : Configurer les DNS pour que le domaine pointe vers PlanetHoster

## 🎯 Solution : Configuration des DNS

Vous avez **2 options** :

### Option 1 : Utiliser les DNS de PlanetHoster (Recommandé)

**Avantages :**

- ✅ Configuration automatique
- ✅ Gestion centralisée
- ✅ Meilleures performances

### Option 2 : Configurer les DNS manuellement dans Hostinger

**Avantages :**

- ✅ Contrôle total
- ✅ Plus flexible

## 🔧 Option 1 : Utiliser les DNS de PlanetHoster (Recommandé)

### Étape 1 : Récupérer les Nameservers de PlanetHoster

Dans votre panneau PlanetHoster, vous avez vu :

- **DNS 1** : `nsa.n0c.com`
- **DNS 2** : `nsb.n0c.com`
- **DNS 3** : `nsc.n0c.com`

### Étape 2 : Configurer dans Hostinger

1. **Connectez-vous à Hostinger** : https://www.hostinger.fr/
2. **Allez dans** : **Domaines** > **Gestion DNS** ou **Nameservers**
3. **Sélectionnez** votre domaine `taxibikerparis.com`
4. **Changez les Nameservers** pour :

```
nsa.n0c.com
nsb.n0c.com
nsc.n0c.com
```

5. **Sauvegardez** les modifications

### Étape 3 : Attendre la propagation DNS

**Durée :** 24-48 heures (parfois quelques minutes)

**Vérification :**

- Utilisez : https://www.whatsmydns.net/
- Cherchez votre domaine
- Vérifiez que les DNS pointent vers PlanetHoster

## 🔧 Option 2 : Configurer les DNS manuellement dans Hostinger

Si vous préférez garder les DNS de Hostinger, configurez les enregistrements A :

### Étape 1 : Récupérer l'IP de votre serveur PlanetHoster

Dans votre panneau PlanetHoster, vous avez :

- **Adresse IP** : `146.88.232.214`

### Étape 2 : Configurer dans Hostinger

1. **Connectez-vous à Hostinger**
2. **Allez dans** : **Domaines** > **Gestion DNS**
3. **Sélectionnez** votre domaine `taxibikerparis.com`
4. **Ajoutez/modifiez** ces enregistrements :

#### Enregistrement A (Principal)

| Type | Nom | Valeur         | TTL  |
| ---- | --- | -------------- | ---- |
| A    | @   | 146.88.232.214 | 3600 |
| A    | www | 146.88.232.214 | 3600 |

#### Enregistrements CNAME (optionnel)

| Type  | Nom | Valeur             | TTL  |
| ----- | --- | ------------------ | ---- |
| CNAME | www | taxibikerparis.com | 3600 |

### Étape 3 : Sauvegarder

- Cliquez sur **"Sauvegarder"** ou **"Appliquer"**
- Les changements prennent effet en quelques minutes

## ⏱️ Propagation DNS

### Durée normale

- **Minimum** : 15-30 minutes
- **Moyenne** : 2-4 heures
- **Maximum** : 24-48 heures

### Vérification de la propagation

**Outils en ligne :**

1. https://www.whatsmydns.net/
2. https://dnschecker.org/
3. https://www.yougetsignal.com/tools/open-ports/

**Commandes en ligne de commande :**

```bash
# Vérifier les DNS
nslookup taxibikerparis.com

# Vérifier les nameservers
nslookup -type=NS taxibikerparis.com

# Vérifier l'IP
dig taxibikerparis.com +short
```

## ✅ Vérifications après configuration

### 1. Vérifier que le domaine pointe vers PlanetHoster

**Test rapide :**

- Allez sur : https://taxibikerparis.com
- Si ça charge, c'est bon !

### 2. Vérifier le SSL/HTTPS

PlanetHoster devrait configurer automatiquement un certificat SSL (Let's Encrypt).

**Vérification :**

- https://taxibikerparis.com (avec le cadenas vert)

### 3. Tester l'application

- **Frontend** : https://taxibikerparis.com
- **API** : https://taxibikerparis.com/api/health

## 🔧 Configuration du domaine dans PlanetHoster

### Si le domaine n'est pas encore configuré dans PlanetHoster :

1. **Connectez-vous** au panneau PlanetHoster
2. **Allez dans** : **Domaines**
3. **Ajoutez votre domaine** `taxibikerparis.com`
4. **Sélectionnez** le compte d'hébergement approprié
5. **Attendez** que PlanetHoster configure le domaine

## ⚠️ Problèmes courants

### Le site ne charge pas après configuration DNS

**Solutions :**

1. Attendez 24-48h pour la propagation complète
2. Vérifiez les DNS avec un outil en ligne
3. Videz le cache de votre navigateur
4. Essayez en navigation privée

### Erreur "Ce site ne peut pas être atteint"

**Solutions :**

1. Vérifiez que l'IP est correcte dans les DNS
2. Vérifiez que le domaine est bien ajouté dans PlanetHoster
3. Contactez le support PlanetHoster

### Le certificat SSL ne fonctionne pas

**Solutions :**

1. PlanetHoster configure généralement SSL automatiquement
2. Attendez 24-48h après la propagation DNS
3. Vérifiez dans le panneau PlanetHoster si SSL est activé
4. Si nécessaire, activez-le manuellement

## 📞 Support

### Hostinger

- **Support** : Via le panneau Hostinger
- **Documentation** : https://support.hostinger.com/

### PlanetHoster

- **Support** : Via le panneau PlanetHoster
- **Documentation** : https://planethoster.com/support

## 🎯 Résumé rapide

**Pour relier rapidement :**

1. ✅ **Option simple** : Changez les Nameservers dans Hostinger vers ceux de PlanetHoster
2. ✅ **Option avancée** : Configurez les enregistrements A dans Hostinger
3. ✅ **Attendez** 24-48h pour la propagation
4. ✅ **Vérifiez** que le site fonctionne

---

**Une fois les DNS configurés, votre site sera accessible sur https://taxibikerparis.com !** 🎉
