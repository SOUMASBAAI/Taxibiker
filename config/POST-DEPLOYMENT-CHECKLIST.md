# ✅ Checklist Post-Déploiement

## 🎉 Félicitations ! Votre déploiement a réussi !

Maintenant, vérifions que tout fonctionne correctement.

## 🔍 Vérifications à faire

### 1. Test du Frontend

**URL à tester :** https://taxibikerparis.com

**Vérifications :**

- [ ] Le site se charge correctement
- [ ] Pas d'erreurs dans la console du navigateur (F12)
- [ ] Le design s'affiche correctement
- [ ] Les images et assets se chargent

### 2. Test de l'API Backend

**URL à tester :** https://taxibikerparis.com/api/health

**Vérifications :**

- [ ] La page répond (statut 200)
- [ ] Vous voyez un JSON avec les informations de santé
- [ ] La base de données est connectée (`"status": "ok"`)

**Exemple de réponse attendue :**

```json
{
  "status": "ok",
  "timestamp": "2025-12-03T16:00:00+00:00",
  "version": "1.0.0",
  "environment": "prod",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Database connection successful"
    }
  }
}
```

### 3. Test de l'API complète

**URL à tester :** https://taxibikerparis.com/api

**Vérifications :**

- [ ] La documentation API s'affiche (si configurée)
- [ ] Ou une liste des endpoints disponibles

### 4. Test des fonctionnalités principales

**À tester :**

- [ ] Page d'accueil
- [ ] Page de connexion
- [ ] Page d'inscription
- [ ] Dashboard utilisateur
- [ ] Dashboard admin
- [ ] Fonctions de réservation

## 🔧 Vérifications techniques

### 1. Vérifier les logs

**Via SSH (si disponible) :**

```bash
# Se connecter en SSH
ssh -p 5022 ueeecgbbue@node240-eu.n0c.com

# Voir les logs Symfony
tail -f public_html/api/var/log/prod.log
```

**Ou via le gestionnaire de fichiers PlanetHoster :**

- Naviguez vers `public_html/api/var/log/`
- Ouvrez `prod.log` pour voir les erreurs éventuelles

### 2. Vérifier la base de données

**Via phpMyAdmin :**

1. Accédez à phpMyAdmin depuis votre panneau PlanetHoster
2. Vérifiez que les tables sont créées
3. Vérifiez qu'il n'y a pas d'erreurs

**Ou via SSH :**

```bash
mysql -h mysql.n0c.com -u ueeecgbbue_soumia -p ueeecgbbue_taxibiker_prod
SHOW TABLES;
```

### 3. Vérifier les permissions

**Via SSH :**

```bash
cd public_html/api
ls -la var/
ls -la config/jwt/
```

Les permissions doivent être :

- `var/` : `755` (dossiers)
- `var/log/*` : `644` (fichiers)
- `config/jwt/*.pem` : `644`

## 🚨 Problèmes courants après déploiement

### Erreur 500 - Internal Server Error

**Solution :**

1. Vérifier les logs : `public_html/api/var/log/prod.log`
2. Vérifier les permissions : `chmod -R 755 var/`
3. Vider le cache : `php bin/console cache:clear --env=prod`

### Erreur 404 - Page Not Found

**Solution :**

1. Vérifier que le fichier `.htaccess` est présent dans `public_html/`
2. Vérifier que mod_rewrite est activé sur Apache

### Erreur de connexion à la base de données

**Solution :**

1. Vérifier le fichier `.env` dans `public_html/api/`
2. Vérifier les informations de connexion
3. Tester la connexion manuellement

### Frontend ne se charge pas

**Solution :**

1. Vérifier que les fichiers sont bien uploadés dans `public_html/`
2. Vérifier le fichier `index.html`
3. Vérifier les permissions des fichiers

## 📊 Endpoints de monitoring

### Health Check

- **URL** : https://taxibikerparis.com/api/health
- **Usage** : Vérifier l'état de l'application

### Health Check Simple

- **URL** : https://taxibikerparis.com/api/health/simple
- **Usage** : Test rapide

### Health Check Database

- **URL** : https://taxibikerparis.com/api/health/database
- **Usage** : Vérifier la connexion base de données

## 🎯 Prochaines étapes

### 1. Tester toutes les fonctionnalités

- [ ] Test de connexion utilisateur
- [ ] Test d'inscription
- [ ] Test de réservation
- [ ] Test du dashboard admin
- [ ] Test des fonctionnalités principales

### 2. Configuration finale

- [ ] Configurer les clés API (Google Maps, Twilio, etc.)
- [ ] Configurer les emails SMTP
- [ ] Tester les notifications
- [ ] Vérifier les certificats SSL

### 3. Optimisations

- [ ] Activer le cache Symfony en production
- [ ] Optimiser les performances
- [ ] Configurer les sauvegardes automatiques
- [ ] Configurer le monitoring

## 🔄 Déploiements futurs

Maintenant que tout est configuré, pour déployer à nouveau :

```bash
# Faire vos modifications
git add .
git commit -m "Description des modifications"
git push origin main
```

Le déploiement se fera automatiquement !

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** : `public_html/api/var/log/prod.log`
2. **Consultez** : `TROUBLESHOOTING.md`
3. **Contactez le support** PlanetHoster si nécessaire

---

**🎉 Félicitations ! Votre application TaxiBiker est maintenant en ligne !**
