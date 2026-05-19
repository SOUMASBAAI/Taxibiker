# Configuration Email PlanetHoster pour Taxi Biker Paris

## 📧 Configuration SMTP PlanetHoster

### Étape 1 : Créer un compte email sur Hostinger

1. **Connectez-vous à votre panel Hostinger**
2. **Allez dans "Email" → "Comptes email"**
3. **Créez un nouveau compte email** :
   ```
   Email: noreply@taxibikerparis.com
   Mot de passe: [créez un mot de passe fort]
   ```

### Étape 2 : Paramètres SMTP Hostinger

**Serveur SMTP Hostinger :**

- **Serveur SMTP** : `smtp.hostinger.com`
- **Port** : `587` (STARTTLS) ou `465` (SSL)
- **Sécurité** : STARTTLS ou SSL/TLS
- **Authentification** : Oui

### Étape 3 : Configuration dans votre application

#### Pour la production (taxibikerparis.com)

Modifiez votre fichier `planethoster.env.TAXI BIKER PARIS` :

```bash
# Configuration email SMTP Hostinger
MAILER_DSN=smtp://noreply%40taxibikerparis.com:VOTRE_MOT_DE_PASSE@smtp.hostinger.com:587
```

**⚠️ Important :**

- Remplacez `@` par `%40` dans l'email
- Remplacez `VOTRE_MOT_DE_PASSE` par le vrai mot de passe

#### Exemple complet :

```bash
# Si votre email est : noreply@taxibikerparis.com
# Et votre mot de passe : MonMotDePasse123!
MAILER_DSN=smtp://noreply%40taxibikerparis.com:MonMotDePasse123!@smtp.hostinger.com:587
```

### Étape 4 : Configuration alternative avec SSL (port 465)

Si le port 587 ne fonctionne pas, essayez avec SSL :

```bash
MAILER_DSN=smtp://noreply%40taxibikerparis.com:VOTRE_MOT_DE_PASSE@smtp.hostinger.com:465?encryption=ssl
```

### Étape 5 : Mise à jour du service Email

Modifiez le service EmailService pour utiliser votre domaine :

```php
// Dans EmailService.php, ligne ~15
private string $fromEmail = 'noreply@taxibikerparis.com',
private string $fromName = 'Taxi Biker Paris'
```

### Étape 6 : Test de la configuration

1. **Démarrez votre application**
2. **Allez sur la page "Mot de passe oublié"**
3. **Entrez un email valide**
4. **Vérifiez les logs** pour voir si l'email est envoyé

#### Vérification des logs :

```bash
# Dans le répertoire backend
tail -f var/log/dev.log | grep -i email
```

## 🔧 Dépannage

### Problème 1 : "Authentication failed"

**Solution :**

- Vérifiez que l'email et le mot de passe sont corrects
- Assurez-vous que l'email existe dans votre panel Hostinger

### Problème 2 : "Connection refused"

**Solutions :**

1. Essayez le port 465 avec SSL :

   ```bash
   MAILER_DSN=smtp://email%40domain.com:password@smtp.hostinger.com:465?encryption=ssl
   ```

2. Vérifiez que votre serveur autorise les connexions SMTP sortantes

### Problème 3 : "Could not authenticate"

**Solutions :**

- Vérifiez l'encodage du mot de passe (caractères spéciaux)
- Essayez de recréer le compte email
- Contactez le support Hostinger si nécessaire

## 📋 Checklist de configuration

- [ ] ✅ Compte email créé sur Hostinger
- [ ] ✅ MAILER_DSN configuré avec les bons paramètres
- [ ] ✅ Email d'expéditeur mis à jour dans EmailService.php
- [ ] ✅ Test effectué sur la page "Mot de passe oublié"
- [ ] ✅ Email reçu et lien fonctionnel

## 🎯 Configuration recommandée pour Taxi Biker Paris

```bash
# Configuration finale recommandée
MAILER_DSN=smtp://noreply%40taxibikerparis.com:VOTRE_MOT_DE_PASSE@smtp.hostinger.com:587

# Ou avec SSL si 587 ne fonctionne pas
MAILER_DSN=smtp://noreply%40taxibikerparis.com:VOTRE_MOT_DE_PASSE@smtp.hostinger.com:465?encryption=ssl
```

## 📧 Template d'email personnalisé

Les emails utilisent votre domaine et sont déjà configurés avec :

- **Expéditeur** : noreply@taxibikerparis.com
- **Nom** : Taxi Biker Paris
- **Design** : Templates HTML professionnels
- **Liens** : Pointent vers taxibikerparis.com

## 🔒 Sécurité

- Utilisez un mot de passe fort pour le compte email
- Ne partagez jamais les identifiants SMTP
- Surveillez les logs d'envoi d'emails
- Limitez l'accès au fichier de configuration

Une fois configuré, vos utilisateurs recevront des emails professionnels pour la réinitialisation de mot de passe !
