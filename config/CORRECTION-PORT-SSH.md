# 🔧 Correction : Port SSH PlanetHoster

## ❌ Problème rencontré

```
dial tcp 146.88.232.214:22: connect: connection refused
```

**Cause :** L'action SSH essayait de se connecter au port 22 (standard), mais PlanetHoster utilise le port **5022** pour SSH.

## ✅ Solution appliquée

J'ai ajouté le port SSH dans le workflow :

```yaml
port: 5022
```

## 📋 Configuration SSH PlanetHoster

- **Host** : `node240-eu.n0c.com` (ou `146.88.232.214`)
- **Port SSH** : `5022` ← **Important !**
- **Port FTP** : `21` (par défaut, pas besoin de le spécifier)

## 🎯 Prochaine étape

**Commiter et redéployer :**

```bash
git add .
git commit -m "Fix: Ajout port SSH 5022 pour PlanetHoster"
git push origin main
```

Le déploiement devrait maintenant fonctionner avec le bon port SSH !

---

**Note :** Le port 5022 est spécifique à PlanetHoster pour SSH. Le port FTP (21) reste standard et fonctionne automatiquement.
