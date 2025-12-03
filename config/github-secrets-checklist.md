# ✅ Checklist des Secrets GitHub

## 🔐 Secrets à configurer dans GitHub

Allez dans : **Votre repository GitHub > Settings > Secrets and variables > Actions**

### Secrets de Production (REQUIS)

Ajoutez ces secrets avec les valeurs de PlanetHoster :

```
✅ PLANETHOSTER_PROD_HOST
   Valeur : taxibikerparis.com

✅ PLANETHOSTER_PROD_USERNAME
   Valeur : ueeecgbbue

✅ PLANETHOSTER_PROD_PASSWORD
   Valeur : [votre mot de passe PlanetHoster FTP]

✅ JWT_PASSPHRASE
   Valeur : taxibiker_jwt_passphrase_2024
   (ou la passphrase que vous avez mise dans votre .env sur le serveur)
```

## 📋 Comment vérifier

1. **Allez sur GitHub** : https://github.com/votre-username/votre-repo/settings/secrets/actions
2. **Vérifiez** que les 4 secrets ci-dessus sont présents
3. **Vérifiez** que les noms sont exactement comme indiqué (respect de la casse)

## ⚠️ Important

- Les noms doivent être **exactement** comme indiqué (sensible à la casse)
- Les valeurs ne doivent pas avoir d'espaces avant/après
- Le mot de passe doit être celui de votre compte FTP PlanetHoster

## 🚀 Une fois configurés

Le déploiement fonctionnera automatiquement sur `git push origin main`
