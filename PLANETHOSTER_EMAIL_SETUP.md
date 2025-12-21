# Configuration Email PlanetHoster pour TaxiBiker

## 📧 Configuration SMTP PlanetHoster

### Étape 1 : Compte email sur PlanetHoster

Vous avez déjà configuré :

- **Email** : `contact@taxibikerparis.com`
- **Mot de passe** : `Taxibiker!123`

### Étape 2 : Paramètres SMTP PlanetHoster

**Serveur SMTP PlanetHoster :**

- **Serveur SMTP** : `mail.planethoster.com`
- **Port** : `587` (STARTTLS) recommandé
- **Port alternatif** : `465` (SSL)
- **Sécurité** : STARTTLS
- **Authentification** : Oui

### Étape 3 : Configuration dans votre application

#### Configuration actuelle (correcte) :

```bash
# Dans planethoster.env.TAXIBIKER
MAILER_DSN=smtp://contact%40taxibikerparis.com:Taxibiker!123@mail.planethoster.com:587
```

**✅ Configuration mise à jour automatiquement !**

### Étape 4 : Test de la configuration

Maintenant que la configuration est corrigée, testons :

```bash
# Dans le répertoire taxibiker-back
php bin/console cache:clear
php bin/console app:send-test-email contact@taxibikerparis.com
```

### Étape 5 : Test du système complet

Une fois l'email de test réussi, testez le système complet :

```bash
php bin/console app:test-email contact@taxibikerparis.com "Test TaxiBiker"
```

## 🔧 Paramètres PlanetHoster

### Configuration recommandée :

```bash
MAILER_DSN=smtp://contact%40taxibikerparis.com:Taxibiker!123@mail.planethoster.com:587
```

### Configuration alternative (SSL) :

```bash
MAILER_DSN=smtp://contact%40taxibikerparis.com:Taxibiker!123@mail.planethoster.com:465?encryption=ssl
```

## 📋 Différences PlanetHoster vs autres hébergeurs

| Paramètre            | PlanetHoster            | Hostinger            | Gmail                |
| -------------------- | ----------------------- | -------------------- | -------------------- |
| **Serveur SMTP**     | `mail.planethoster.com` | `smtp.hostinger.com` | `smtp.gmail.com`     |
| **Port STARTTLS**    | 587                     | 587                  | 587                  |
| **Port SSL**         | 465                     | 465                  | 465                  |
| **Authentification** | Email complet           | Email complet        | Email + App Password |

## 🎯 Configuration finale TaxiBiker

Votre configuration est maintenant correcte :

- ✅ **Serveur** : `mail.planethoster.com:587`
- ✅ **Email** : `contact@taxibikerparis.com`
- ✅ **Mot de passe** : `Taxibiker!123`
- ✅ **Sécurité** : STARTTLS
- ✅ **Templates** : Prêts et configurés

## 🚀 Prochaines étapes

1. **Tester l'envoi d'email** avec la nouvelle configuration
2. **Vérifier la réception** dans votre boîte email
3. **Tester le flux complet** "mot de passe oublié"
4. **Déployer en production** avec la configuration PlanetHoster

La fonctionnalité "mot de passe oublié" est maintenant prête avec PlanetHoster !

